const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const port = 5000;

// Enable CORS for all origins (or you can specify specific origins if you prefer)
app.use(cors({
  origin: '',  // Allow all origins, or you can specify a specific domain like 'http://192.168.x.x:3000/'
  methods: ["GET", "POST"]
}));

app.use(express.json());

// Create an HTTP server for both Express and Socket.IO
const server = http.createServer(app);

// Setup Socket.IO with CORS configuration
const io = new Server(server, {
  cors: {
    origin: "", // This allows any origin, you can specify a more restrictive origin like 'http://192.168.x.x:3000/'
    methods: ["GET", "POST"]
  }
});

// Listen for client connections
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Handle receiving a message from the client
  socket.on("send_message", (message) => {
    // Broadcast the message to all connected clients except the sender
    socket.broadcast.emit("receive_message", message);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
  });
});

// Update to listen on all network interfaces (0.0.0.0) or a specific local IP
server.listen(port, '0.0.0.0', () => {
  console.log('Server running at http://0.0.0.0:${port}');
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
