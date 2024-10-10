const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000; // Define the port where your server will run

// Middleware
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json()); // Parse incoming JSON requests

// Routes
app.post('/register', (req, res) => {
  const { username, password } = req.body;

  // Add logic to handle user registration (e.g., saving to a database)
  console.log(`User registered: ${username}`);

  res.json({ message: 'User registered successfully' });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Add logic to handle user login (e.g., verifying credentials)
  console.log(`User attempted login: ${username}`);

  res.json({ message: 'Login successful' });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});