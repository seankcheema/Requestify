const express = require('express');
const cors = require('cors');
const axios = require('axios'); // Import axios to make HTTP requests
const app = express();
const port = 5000; // Define the port where your server will run

// Middleware
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json()); // Parse incoming JSON requests

// Routes
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Make a request to the Flask backend to register the user
    const response = await axios.post('http://localhost:5001/register', {
      username,
      password,
    });

    // Send Flask's response back to the frontend
    res.status(response.status).json(response.data);
  } catch (error) {
    // Handle any errors from the Flask API call
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Make a request to the Flask backend to log in the user
    const response = await axios.post('http://localhost:5001/login', {
      username,
      password,
    });

    // Send Flask's response back to the frontend
    res.status(response.status).json(response.data);
  } catch (error) {
    // Handle any errors from the Flask API call
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
