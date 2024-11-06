from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
import bcrypt
import requests  # For REST API calls to Firebase
from spotify import search_song
from stripeFile import create_payment_link, create_tip_payment
from dotenv import load_dotenv
import os
import qrcode
import base64
from io import BytesIO

load_dotenv(".env")

#Sets up the stripe api key from the env var
REACT_APP_FIREBASE_API_KEY = os.getenv('REACT_APP_FIREBASE_API_KEY')

IP = os.getenv('REACT_APP_API_IP')

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# MySQL Connection
mydb = mysql.connector.connect(
    host="localhost",
    user="kylemcclelland",
    password="password1",
    database="requestifyAccount",
    charset='utf8mb4',
    collation='utf8mb4_general_ci'
)
mycursor = mydb.cursor()
mycursor.execute("USE requestifyAccount")

mycursor.execute("DROP TABLE IF EXISTS users")
# Create users table if it doesn't exist
mycursor.execute("""
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
print("Table created successfully or already exists")

mycursor.execute("DROP TABLE IF EXISTS tracks")
# Create users table with additional fields
mycursor.execute("""
    CREATE TABLE IF NOT EXISTS tracks (
        djName VARCHAR(100),
        trackName VARCHAR(100),
        artist VARCHAR(100),
        album VARCHAR(100),
        external_url VARCHAR(100),
        album_cover_url VARCHAR(255),
        UNIQUE KEY (djName, trackName, artist, album)
    )
""")

def verify_id_token(id_token):
    """Verify Firebase ID token using Firebase REST API."""
    api_key = REACT_APP_FIREBASE_API_KEY  # Replace with your actual API key
    url = f'https://identitytoolkit.googleapis.com/v1/accounts:lookup?key={api_key}'

    try:
        # Make a POST request to verify the token
        response = requests.post(url, json={"idToken": id_token})

        # Check if the response is successful
        if response.status_code == 200:
            return response.json()  # Return the decoded token data
        else:
            print(f"Failed to verify token: {response.text}")
            return None
    except Exception as e:
        print(f"Error verifying token: {e}")
        return None

def get_dj():
    url = request.referrer
    djName = url.split('/')[-1]
    return djName

#def get_dj_name(djName):
#    query = "SELECT displayName FROM users WHERE djName = %s"
#    mycursor.execute(query, (djName,))
#    result = mycursor.fetchone()
#    json_result = jsonify(result)
#    if result:
#        return json_result
#    else:
#        return None
    
@app.route('/api/current-dj', methods=['GET'])
def get_current_dj():
    dj_name = get_dj()
    if dj_name:
        return jsonify(dj_name)
    else:
        return jsonify({"message": "DJ not found"}), 404

@app.route('/register', methods=['POST'])
def register():
    auth_header = request.headers.get('Authorization')

    # Check for a valid Authorization header
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

    # Validate DJ name is provided
    if not dj_name:
        return jsonify({"message": "DJ name is required"}), 400

    # Check if the user already exists
    query_check = "SELECT * FROM users WHERE email = %s"
    mycursor.execute(query_check, (email,))
    if mycursor.fetchone():
        return jsonify({"message": "User already exists"}), 409

    # Generate the URL for the QR code: http://localhost:3000/search/dj_name
    qr_url = f"http://{IP}:3000/search/{dj_name}"

    # Generate the QR Code with the above URL
    qr_img = qrcode.make(qr_url)

    # Convert QR Code to Base64 string
    buffered = BytesIO()
    qr_img.save(buffered, format="PNG")
    qr_code_base64 = base64.b64encode(buffered.getvalue()).decode('utf-8')

    # Insert the user data along with the QR code and link into the database
    query = """
        INSERT INTO users (email, djName, displayName, location, socialMedia, qrCode, productLink)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
    """

    #Doesn't need to store the link to the DJ search page, only the generated QR code (hence None at the end)
    mycursor.execute(query, (email, dj_name, displayName, location, social_media, qr_code_base64, None))
    mydb.commit()

    return jsonify({"message": "User registered successfully", "qrCode": qr_code_base64}), 201


@app.route('/login', methods=['POST'])
def login():
    auth_header = request.headers.get('Authorization')

    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"message": "Authorization header missing or malformed"}), 401

    id_token = auth_header.split(' ')[1]  # Extract the Firebase ID token
    decoded_token = verify_id_token(id_token)  # Verify the token

    if not decoded_token:
        return jsonify({"message": "Invalid token"}), 401

    email = decoded_token['users'][0]['email']  # Extract email from decoded token

    # Check if the user exists in the MySQL database
    query = "SELECT djName FROM users WHERE email = %s"
    mycursor.execute(query, (email,))
    result = mycursor.fetchone()

    if result:
        return jsonify({"message": f"Welcome, {email}!"}), 200
    else:
        return jsonify({"message": "User not found"}), 404

@app.route('/search', methods=['GET'])
def search():
    djName = get_dj()
    if not djName:
        return jsonify({"message": "User not found"}), 404

    query = request.args.get('query')
    if not query:
        return jsonify({"message": "Search query is required"}), 400

    tracks = search_song(query)

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
        mycursor.execute(sql, val)
        mydb.commit()

    return jsonify(tracks)


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

#Used to get information about the DJ
@app.route('/user/<email>', methods=['GET'])
def get_user_profile(email):
    query = "SELECT email, djName, displayName, location, socialMedia, qrCode FROM users WHERE email = %s"
    mycursor.execute(query, (email,))
    user = mycursor.fetchone()

    if user:
        user_data = {
            "email": user[0],
            "djName": user[1],
            "displayName": user[2],
            "location": user[3],
            "socialMedia": user[4],
            "qrCode": user[5]  # Base64 QR code
        }
        return jsonify(user_data), 200
    else:
        return jsonify({"message": "User not found"}), 404

@app.route('/tracks/<djName>', methods=['GET'])
def get_tracks(djName):
    try:
        query = "SELECT trackName, artist, album, external_url, album_cover_url FROM tracks WHERE djName = %s"
        mycursor.execute(query, (djName,))
        tracks = mycursor.fetchall()
        #add something to remove tracks once we have this working

        if not tracks:
            return jsonify({"message": "No tracks found"}), 404
        
        return jsonify(tracks), 200
    except Exception as e:
        print(f"Error retrieving tracks: {e}")
        return jsonify({"message": "Error retrieving tracks"}), 500
    


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
