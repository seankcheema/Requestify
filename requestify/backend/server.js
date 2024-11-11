const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const port = 5000;

// Enable CORS for all origins (or you can specify specific origins if you prefer)
app.use(cors({
  origin: '*',  // Allow all origins, or you can specify a specific domain like 'http://192.168.x.x:3000'
  methods: ["GET", "POST"]
}));

app.use(express.json());

// Create an HTTP server for both Express and Socket.IO
const server = http.createServer(app);

// Setup Socket.IO with CORS configuration
const io = new Server(server, {
  cors: {
    origin: "*", // This allows any origin, you can specify a more restrictive origin like 'http://192.168.x.x:3000'
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
  console.log(`Server running at http://0.0.0.0:${port}`);
});
