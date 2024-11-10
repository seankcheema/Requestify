const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

const server = http.createServer(app); // Create HTTP server for both Express and Socket.IO
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Replace with your frontend's origin
    methods: ["GET", "POST"]
  }
});

// Listen for client connections on the 'connection' event
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

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
