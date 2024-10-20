#Back End code for Login and Register
from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
import bcrypt
# from spotify import search_song  # Commented out Spotify import
# from stripeFile import create_tip_payment  # Commented out Stripe import

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

#Does this need to be the user we make for mariadb? If so we can use this user I have now but we should change it later
#MySQL Connection
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

# Create users table
mycursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
    username VARCHAR(100) UNIQUE PRIMARY KEY,
    password VARCHAR(100)
    )
""")
print("Table created successfully or already exists")

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data['username']
    password = data['password']

    #Testing if user already exists stuff
    #---------------------------------------------------------------
    # Check if the user already exists in the database
    query_check = "SELECT * FROM users WHERE username = %s"
    mycursor.execute(query_check, (username,))
    existing_user = mycursor.fetchone()
    if existing_user:
        # If the user already exists, return a 409 Conflict status
        return jsonify({"message": "User already exists"}), 409
    #---------------------------------------------------------------

    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    query = "INSERT INTO users (username, password) VALUES (%s, %s)"
    mycursor.execute(query, (username, hashed_password))
    mydb.commit()

    return jsonify({"message": "User registered successfully from main"}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data['username']
    password = data['password']

    query = "SELECT password FROM users WHERE username = %s"
    mycursor.execute(query, (username,))
    result = mycursor.fetchone()

    if result:
        stored_hash_password = result[0].encode('utf-8') if isinstance(result[0], str) else result[0]

        if bcrypt.checkpw(password.encode('utf-8'), stored_hash_password):
            return jsonify({"message": "Login successful"}), 200
        else:
            return jsonify({"message": "Invalid username or password"}), 401
    else:
        return jsonify({"message": "Invalid username or password"}), 401
    
# Commented out Spotify search functionality
# @app.route('/search', methods=['GET'])
# def search():
#     query = request.args.get('query')
#     if not query:
#         return jsonify({"message": "Search query is required"}), 400
#     tracks = search_song(query)
#     return jsonify(tracks)

# Commented out Stripe tip payment functionality
# @app.route('/stripe/create-tip-payment', methods=['POST'])
# def create_payment_intent():
#     data = request.get_json()
#     amount = data.get('amount')
#     currency = data.get('currency')

#     if not amount or not currency:
#         return jsonify({"message": "Amount and currency are required"}), 400

#     try:
#         # Calls to the imported function to create the payment intent
#         result = create_tip_payment(amount, currency)
#         return jsonify(result)
#     except Exception as e:
#         return jsonify({"message": str(e)}), 500
    
# Set true for testing purposes
if __name__ == '__main__':
    app.run(debug=True, port=5001)
