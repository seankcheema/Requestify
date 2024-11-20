from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
import bcrypt
import requests
from spotify import search_song
from stripeFile import create_payment_link, create_tip_payment
from dotenv import load_dotenv
import os
import qrcode
import base64
from io import BytesIO
from mysql.connector import pooling
from flask_socketio import SocketIO, emit
import firebase_admin
from firebase_admin import auth, credentials
#Sets up the required imports for main.py to run

load_dotenv(".env")

#Sets up the Firebase API key and the 
REACT_APP_FIREBASE_API_KEY = os.getenv('REACT_APP_FIREBASE_API_KEY')

stripe = os.getenv("STRIPE_SECRET_KEY")
endpoint_secret = os.getenv("STRIPE_ENDPOINT_SECRET")


IP = os.getenv('REACT_APP_API_IP')


#Sets up connection to Firebase using the Firebase Admin SDK and required credentials
cred = credentials.Certificate("../Firebase-Service-Key.json")
firebase_admin.initialize_app(cred)

#Initializes Flask, Cors, and Socketio for use
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins="*")

#Sets up database pooling
pool = pooling.MySQLConnectionPool(
    pool_name="requestify_pool",
    pool_size=5,
    host="localhost",
    user="root",
    password="root",
    database="Requestify",
    port=3307,
    auth_plugin="mysql_native_password",
    charset='utf8mb4',
    collation='utf8mb4_general_ci'
)

def get_db_connection():
    return pool.get_connection()

#Initialize the tables from the database
with get_db_connection() as conn:
    cursor = conn.cursor()

    cursor.execute("USE Requestify")
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            email VARCHAR(100) UNIQUE PRIMARY KEY,
            djName VARCHAR(100) UNIQUE,
            displayName VARCHAR(100),
            location VARCHAR(100),
            socialMedia VARCHAR(100),
            qrCode TEXT,
            productLink TEXT
        )
    """)
    cursor.execute("DROP TABLE IF EXISTS tracks")
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS tracks (
            djName VARCHAR(100),
            trackName VARCHAR(100),
            artist VARCHAR(100),
            album VARCHAR(100),
            external_url VARCHAR(100),
            album_cover_url VARCHAR(255),
            upvotes INT DEFAULT 0,
            UNIQUE KEY (djName, trackName, artist, album)
        )
    """)
    cursor.execute("""
                CREATE TABLE IF NOT EXISTS payments (
                    dj_name VARCHAR(100) PRIMARY KEY,
                    amount DECIMAL(10, 2),
                    currency VARCHAR(3),
                    timestamp DATETIME
                )
            """)
    print("Tables created or verified successfully")

    cursor.execute("DROP TABLE IF EXISTS track_history")
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS track_history (
            djName VARCHAR(100),
            trackName VARCHAR(100),
            artist VARCHAR(100),
            album VARCHAR(100),
            external_url VARCHAR(100),
            album_cover_url VARCHAR(255)
        )
        """)
    print("Track history table created successfully")
    
    cursor.execute("""
            CREATE TRIGGER track_history_trigger
            AFTER DELETE ON tracks
            FOR EACH ROW
            BEGIN
                INSERT INTO track_history (djName, trackName, artist, album, external_url, album_cover_url)
                VALUES (OLD.djName, OLD.trackName, OLD.artist, OLD.album, OLD.external_url, OLD.album_cover_url);
            END
    """)
    print("Track history trigger created successfully")

#Function to verify the Firebase ID Token with the Firebase REST API
def verify_id_token(id_token):
    """Verify Firebase ID token using Firebase REST API."""
    api_key = REACT_APP_FIREBASE_API_KEY
    url = f'https://identitytoolkit.googleapis.com/v1/accounts:lookup?key={api_key}'

    try:
        response = requests.post(url, json={"idToken": id_token})
        if response.status_code == 200:
            return response.json()
        else:
            print(f"Failed to verify token: {response.text}")
            return None
    except Exception as e:
        print(f"Error verifying token: {e}")
        return None

#Returns the DJName
def get_dj():
    url = request.referrer
    djName = url.split('/')[-1]
    return djName

# Webhook endpoint
@app.route('/webhooks/stripe', methods=['POST'])
def stripe_webhook():
    payload = request.data
    sig_header = request.headers.get('Stripe-Signature')
    event = None

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, endpoint_secret
        )
    except stripe.error.SignatureVerificationError as e:
        print(f"Webhook signature verification failed: {e}")
        return "Webhook error", 400

    # Handle the event
    if event['type'] == 'payment_intent.succeeded':
        payment_intent = event['data']['object']
        dj_name = payment_intent['metadata'].get('djName', 'Unknown DJ')
        amount = payment_intent['amount'] / 100  # Convert cents to dollars
        currency = payment_intent['currency']
        timestamp = payment_intent['created']

        # Save payment in the database
        try:
            conn = mysql.connection
            cursor = conn.cursor()
            
            query = """
                INSERT INTO payments (dj_name, amount, currency, timestamp)
                VALUES (%s, %s, %s, FROM_UNIXTIME(%s))
            """
            cursor.execute(query, (dj_name, amount, currency, timestamp))
            conn.commit()
            print(f"Payment for DJ '{dj_name}' recorded successfully.")
        except Exception as e:
            print(f"Error saving payment to MySQL: {e}")
            return "Database error", 500

    return jsonify({'status': 'success'}), 200

# Endpoint to fetch payments for a specific DJ
@app.route('/api/payments/<dj_name>', methods=['GET'])
def get_payments(dj_name):
    try:
        conn = mysql.connection
        cursor = conn.cursor(dictionary=True)
        query = "SELECT * FROM payments WHERE dj_name = %s"
        cursor.execute(query, (dj_name,))
        payments = cursor.fetchall()
        return jsonify(payments)
    except Exception as e:
        print(f"Error fetching payments: {e}")
        return "Database error", 500
    

#Returns information abouit the current DJ if they exist
@app.route('/api/current-dj', methods=['GET'])
def get_current_dj():
    dj_name = get_dj()
    if dj_name:
        return jsonify(dj_name)
    else:
        return jsonify({"message": "DJ not found"}), 404

#Registers the DJ to the the database and checks for all requried information
@app.route('/register', methods=['POST'])
def register():
    print("Registering user")
    auth_header = request.headers.get('Authorization')

    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"message": "Authorization header missing or malformed"}), 401

    id_token = auth_header.split(' ')[1]
    decoded_token = verify_id_token(id_token)

    if not decoded_token:
        return jsonify({"message": "Invalid Firebase token"}), 401

    data = request.get_json()
    email = data['email']
    dj_name = data.get('djName')
    displayName = data.get('displayName')
    location = data.get('location')
    social_media = data.get('socialMedia')

    #Check for DJ Name
    if not dj_name:
        return jsonify({"message": "DJ name is required"}), 400

    # Check if the user already exists
  
    query_check = "SELECT * FROM users WHERE email = %s"
    with get_db_connection() as conn:
        mycursor = conn.cursor()
        mycursor.execute(query_check, (email,))
        if mycursor.fetchone():
            return jsonify({"message": "User already exists"}), 409

        # Generate the URL for the QR code: http://localhost:3000/search/dj_name
        qr_url = f"http://{IP}:5000/search/{dj_name}"

        #Generates the users QR Code using the URL above
        qr_img = qrcode.make(qr_url)

        #Puts QR Code in appropriate format for storage
        buffered = BytesIO()
        qr_img.save(buffered, format="PNG")
        qr_code_base64 = base64.b64encode(buffered.getvalue()).decode('utf-8')

        #Registers new user into the database
        query = """
            INSERT INTO users (email, djName, displayName, location, socialMedia, qrCode, productLink)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """

        mycursor.execute(query, (email, dj_name, displayName, location, social_media, qr_code_base64, None))
        conn.commit()

    return jsonify({"message": "User registered successfully", "qrCode": qr_code_base64}), 201

#Route for user logging into Requestify
@app.route('/login', methods=['POST'])
def login():
    auth_header = request.headers.get('Authorization')

    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"message": "Authorization header missing or malformed"}), 401

    #Verifys the token authenticates with Firebase (Correct email/password combo)
    id_token = auth_header.split(' ')[1]
    decoded_token = verify_id_token(id_token)

    if not decoded_token:
        return jsonify({"message": "Invalid token"}), 401

    email = decoded_token['users'][0]['email']

    #Check if the user exists in database
    query = "SELECT djName FROM users WHERE email = %s"
    with get_db_connection() as conn:
        mycursor = conn.cursor()
        mycursor.execute(query, (email,))
        result = mycursor.fetchone()

    if result:
        return jsonify({"message": f"Welcome, {email}!"}), 200
    else:
        return jsonify({"message": "User not found"}), 404

#Route to get search for a song and add it to the queue
@app.route('/search', methods=['GET'])
def search():
    djName = get_dj()
    if not djName:
        return jsonify({"message": "User not found"}), 404

    query = request.args.get('query')
    if not query:
        return jsonify({"message": "Search query is required"}), 400

    tracks = search_song(query)

    #Inserts the track into the database
    for track in tracks:
        track_name = track['name']
        artist = track['artist']
        album = track['album']
        external_url = track['external_url']
        album_cover_url = track['album_cover_url']

        sql = """
        INSERT INTO tracks (djName, trackName, artist, album, external_url, album_cover_url)
        VALUES (%s, %s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE
            external_url = %s,
            album_cover_url = %s;
        """

        val = (djName, track_name, artist, album, external_url, album_cover_url, external_url, album_cover_url)
        with get_db_connection() as conn:
            mycursor = conn.cursor()
            mycursor.execute(sql, val)
            conn.commit()

        #Uses socketIO events for realtime updates
        socketio.emit('song_added', {
            "djName": djName,
            "trackName": track_name,
            "artist": artist,
            "album": album,
            "external_url": external_url,
            "album_cover_url": album_cover_url
        })

    return jsonify(tracks)

#Unused Stripe code since Requestify implementation was changed
'''
@app.route('/stripe/create-tip-payment', methods=['POST'])
def create_payment_intent():
    data = request.get_json()
    amount = data.get('amount')
    currency = data.get('currency', 'usd')

    if not amount or not currency:
        return jsonify({"message": "Amount and currency are required"}), 400

    try:
        result = create_tip_payment(amount, currency)
        return jsonify(result)
    except Exception as e:
        return jsonify({"message": str(e)}), 500

#Route to create a payment link
@app.route('/create-payment-link', methods=['POST'])
def create_payment_link_route():
    data = request.get_json()
    amount = data.get('amount')
    currency = data.get('currency', 'usd')

    try:
        url = create_payment_link(amount, currency)
        return jsonify({'url': url}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
'''
        

#Used to retrieve information about the DJ
@app.route('/user/<email>', methods=['GET'])
def get_user_profile(email):
    query = "SELECT email, djName, displayName, location, socialMedia, qrCode FROM users WHERE email = %s"
    with get_db_connection() as conn:
        mycursor = conn.cursor()
        mycursor.execute(query, (email,))
        user = mycursor.fetchone()

    if user:
        user_data = {
            "email": user[0],
            "djName": user[1],
            "displayName": user[2],
            "location": user[3],
            "socialMedia": user[4],
            "qrCode": user[5]
        }
        return jsonify(user_data), 200
    else:
        return jsonify({"message": "User not found"}), 404

#Retrieves tracks from the specific DJ, orders by the number of upvotes
@app.route('/tracks/<djName>', methods=['GET'])
def get_tracks(djName):
    try:
        query = "SELECT trackName, artist, album, external_url, album_cover_url, upvotes FROM tracks WHERE djName = %s ORDER BY upvotes DESC"
        with get_db_connection() as conn:
            mycursor = conn.cursor()
            mycursor.execute(query, (djName,))
            tracks = mycursor.fetchall()
        #add something to remove tracks once we have this working

        if not tracks:
            return jsonify({"message": "No tracks found"}), 404
        
        return jsonify(tracks), 200
    except Exception as e:
        print(f"Error retrieving tracks: {e}")
        return jsonify({"message": "Error retrieving tracks"}), 500
    
#Route to retrieve the track-history for the DJ
@app.route('/track-history/<djName>', methods=['GET'])
def get_track_history(djName):
    try:
        query = "SELECT trackName, artist, album, external_url, album_cover_url FROM track_history WHERE djName = %s"
        with get_db_connection() as conn:
            mycursor = conn.cursor()
            mycursor.execute(query, (djName,))
            tracks = mycursor.fetchall()
        #add something to remove tracks once we have this working

        if not tracks:
            return jsonify({"message": "No tracks found"}), 404
        
        return jsonify(tracks), 200
    except Exception as e:
        print(f"Error retrieving tracks: {e}")
        return jsonify({"message": "Error retrieving tracks"}), 500

#Route to update the DJs profile information
@app.route('/update-profile', methods=['PUT'])
def update_profile():
    data = request.get_json()
    current_email = data.get('email')
    display_name = data.get('displayName')
    location = data.get('location')
    social_media = data.get('socialMedia')
    product_link = data.get('productLink')

#Sends the SQL Query to the database to update it
    try:
        query = """
            UPDATE users 
            SET displayName = %s, location = %s, socialMedia = %s, productLink = %s 
            WHERE email = %s
        """
        values = (display_name, location, social_media, product_link, current_email)
        with get_db_connection() as conn:
            mycursor = conn.cursor()
            mycursor.execute(query, values)
            conn.commit()
        
        return jsonify({"message": "Profile updated successfully"}), 200
    except Exception as e:
        print(f"Error updating profile: {e}")
        return jsonify({"error": str(e)}), 500

#Route to query the database for the product link (Used for tipping)
@app.route('/dj/productLink/<djName>', methods=['GET'])
def get_product_link(djName):
    query = "SELECT productLink FROM users WHERE djName = %s"
    with get_db_connection() as conn:
        mycursor = conn.cursor()
        mycursor.execute(query, (djName,))
        result = mycursor.fetchone()
    
    if result:
        return jsonify({"productLink": result[0]}), 200
    else:
        return jsonify({"message": "Product link not found"}), 404
    
#Route to remove track from queue
@app.route('/tracks/delete', methods=['DELETE'])
#Function that handles different possible scenarios
def delete_track():
    djName = request.json.get('djName')
    if not djName:
        return jsonify({"message": "DJ name is required"}), 400
    trackName = request.json.get('trackName')
    if not trackName:
        return jsonify({"message": "Track name is required"}), 400
    
    artist = request.json.get('artist')
    if not artist:
        return jsonify({"message": "Artist name is required"}),
    
    #SQL to delete the track from the database
    sql = "DELETE FROM tracks WHERE djName = %s AND trackName = %s AND artist = %s"
    val = (djName, trackName, artist)
    with get_db_connection() as conn:
        mycursor = conn.cursor()
        mycursor.execute(sql, val)
        conn.commit()

        if mycursor.rowcount == 0:
            return jsonify({"message": "Track not found"}), 404
    
    #SocketIO event for realtime updates
    socketio.emit('song_removed', {"djName": djName, "trackName": trackName, "artist": artist})
    
    return jsonify({"message": "Track deleted successfully"}), 200

#Route to remove all tracks from the queue for a specific DJ
@app.route('/tracks/delete-all', methods=['DELETE'])
def delete_all_tracks():
    djName = request.json.get('djName')
    if not djName:
        return jsonify({"message": "DJ name is required"}), 400
    
    #SQL to delete the tracks from the DJ
    sql = "DELETE FROM tracks WHERE djName = %s"
    val = (djName,)
    with get_db_connection() as conn:
        mycursor = conn.cursor()
        mycursor.execute(sql, val)
        conn.commit()

        if mycursor.rowcount == 0:
            return jsonify({"message": "No tracks found"}), 404
    
    #SocketIO event for realtime updates
    socketio.emit('all_songs_removed', {"djName": djName})
    
    return jsonify({"message": "All tracks deleted successfully"}), 200

#Deletes track history when DJ logs out of Requestify
@app.route('/track-history/delete-all', methods=['DELETE'])
def delete_all_track_history():
    djName = request.json.get('djName')
    if not djName:
        return jsonify({"message": "DJ name is required"}), 400
    
    #SQL to delete tracks
    sql = "DELETE FROM track_history WHERE djName = %s"
    val = (djName,)
    with get_db_connection() as conn:
        mycursor = conn.cursor()
        mycursor.execute(sql, val)
        conn.commit()

        if mycursor.rowcount == 0:
            return jsonify({"message": "No tracks found"}), 404
    
    return jsonify({"message": "All tracks deleted successfully"}), 200

#Route to upvote a requested track
@app.route('/tracks/upvote', methods=['POST'])
def upvote():
    data = request.get_json()
    djName = data.get('djName')
    if not djName:
        return jsonify({"message": "DJ name is required"}), 400
    trackName = data.get('trackName')
    if not trackName:
        return jsonify({"message": "Track name is required"}), 400
    artist = data.get('artist')
    if not artist:
        return jsonify({"message": "Artist name is required"}), 400
    
    #SQL to upvote the track
    sql = """
    UPDATE tracks
    SET upvotes = upvotes + 1
    WHERE djName = %s AND trackName = %s AND artist = %s
    """

    val = (djName, trackName, artist)
    with get_db_connection() as conn:
        mycursor = conn.cursor()
        mycursor.execute(sql, val)
        conn.commit()
    
        mycursor.execute("SELECT upvotes FROM tracks WHERE djName = %s AND trackName = %s AND artist = %s", val)
        updated_upvotes = mycursor.fetchone()[0]

    #SocketIO event for realtime upvotes
    socketio.emit('upvote_updated', {
        'djName': djName,
        'trackName': trackName,
        'artist': artist,
        'upvotes': updated_upvotes
    })

    return jsonify({"message": "Track upvoted successfully", "upvotes": updated_upvotes}), 200

#Route to downvote a requested track
@app.route('/tracks/downvote', methods=['POST'])
def downvote():
    data = request.get_json()
    djName = data.get('djName')
    if not djName:
        return jsonify({"message": "DJ name is required"}), 400
    trackName = data.get('trackName')
    if not trackName:
        return jsonify({"message": "Track name is required"}), 400
    artist = data.get('artist')
    if not artist:
        return jsonify({"message": "Artist name is required"}), 400
    
    #SQL to update the downvote
    sql = """
    UPDATE tracks
    SET upvotes = upvotes - 1
    WHERE djName = %s AND trackName = %s AND artist = %s
    """

    val = (djName, trackName, artist)
    with get_db_connection() as conn:
        mycursor = conn.cursor()
        mycursor.execute(sql, val)
        conn.commit()

        mycursor.execute("SELECT upvotes FROM tracks WHERE djName = %s AND trackName = %s AND artist = %s", val)
        updated_upvotes = mycursor.fetchone()[0]

    #SocketIO event for realtime upvotes
    socketio.emit('upvote_updated', {
        'djName': djName,
        'trackName': trackName,
        'artist': artist,
        'upvotes': updated_upvotes
    })

    return jsonify({"message": "Track downvoted successfully", "upvotes": updated_upvotes}), 200

#Returns the DJ's displayname to be used on mobile pages
@app.route('/dj/displayName/<djName>', methods=['GET'])
def get_display_name(djName):
    query = "SELECT displayName FROM users WHERE djName = %s"
    with get_db_connection() as conn:
        mycursor = conn.cursor()
        mycursor.execute(query, (djName,))
        result = mycursor.fetchone()
    
    if result:
        return jsonify({"displayName": result[0]}), 200
    else:
        return jsonify({"message": "Display name not found"}), 404
    
#Delete user function
def delete_user(uid: str):
    try:
        auth.delete_user(uid)
        print(f"Successfully deleted user with UID: {uid}")
        return {"message": f"User with UID {uid} deleted successfully"}
    except auth.AuthError as e:
        print(f"Error deleting user: {e}")
        return {"error": f"Error deleting user: {e}"}  
    
#Delete Account route, removes the user from the database
@app.route('/delete-account', methods=['DELETE'])
def delete_account():
    data = request.get_json()
    email = data.get('email')
    if not email:
        return jsonify({"message": "Email is required"}), 400

    #Deletes the user from Firebase Authentication
    try:
        user = auth.get_user_by_email(email)
        auth.delete_user(user.uid)
        print(f"Successfully deleted user with UID: {user.uid}")
    except firebase_admin._auth_utils.UserNotFoundError:
        print("User not found in Firebase. Proceeding with database cleanup.")
    except Exception as e:
        print(f"Error deleting user from Firebase: {e}")
        return jsonify({"message": f"Error deleting user from Firebase: {str(e)}"}), 500

    #Removes users from the database
    try:
        query = "DELETE FROM users WHERE email = %s"
        with get_db_connection() as conn:
            mycursor = conn.cursor()
            mycursor.execute(query, (email,))
            conn.commit()

            if mycursor.rowcount == 0:
                return jsonify({"message": "User not found in database"}), 404

        #Removes deleted users tracks
        query = "DELETE FROM tracks WHERE djName = %s"
        with get_db_connection() as conn:
            mycursor = conn.cursor()
            mycursor.execute(query, (email,))
            conn.commit()

        #Removes the deleted users track history
        query = "DELETE FROM track_history WHERE djName = %s"
        with get_db_connection() as conn:
            mycursor = conn.cursor()
            mycursor.execute(query, (email,))
            conn.commit()

        return jsonify({"message": "User deleted successfully from Firebase and database"}), 200

    except mysql.connector.Error as e:
        print(f"Database error: {e}")
        return jsonify({"message": f"Database error: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)