#Back End code for Login and Register
from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
import bcrypt

app = Flask(__name__)
CORS(app)

#does this need to be the user we make for mariadb? If so we can use this user i have rn but we should change it later
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

#Create users table
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

    if result and bcrypt.checkpw(password.encode('utf-8'), result[0]):
        return jsonify({"message": "Login successful"}), 200
    else:
        return jsonify({"message": "Invalid username or password"}), 401
    
#set true for testing purposes
if __name__ == '__main__':
    app.run(debug=True, port=5001)