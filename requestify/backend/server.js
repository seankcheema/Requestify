const express = require('express');
const cors = require('cors');
const axios = require('axios'); // Import axios to make HTTP requests
const app = express();
const port = 5000; // Define the port where your server will run

//Code below sets up the stripe secret key from the .env and imports the
//stripe library 
require('dotenv').config();
//const Stripe = require('stripe');
//const stripe = new Stripe(process.env.REACT_APP_STRIPE_SECRET_KEY); // Use the correct key

// Middleware
app.use(cors());
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


//Below is the stripe stuff//
//--------------------------------------------------------------------------------

// Route to handle creating a payment intent for tipping

/*
app.post('/stripe/create-tip-payment-intent', async (req, res) => {
  const { amount, currency } = req.body;

  // Validate the request
  if (!amount || !currency) {
    return res.status(400).json({ message: 'Amount and currency are required' });
  }

  try {
    // Create a payment intent with the specified amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount, // The amount should be in the smallest currency unit (e.g., cents for USD)
      currency,
      payment_method_types: ['card'], // Specify payment method types
      description: 'Tip Payment', // Optional: Add a description for the payment
    });

    // Return the client secret to the client
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Error creating payment intent for tip:', error);
    res.status(500).json({ message: 'Error creating payment intent for tip' });
  }
});\
*/

//--------------------------------------------------------------------------------

// Start the Express server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});