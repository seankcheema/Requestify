const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const port = 5000;

//Stores messages in an array (Still need to update to double array)
let messages = [];

//Allows server to handle requests from all Origins
app.use(cors({
  origin: '*',
  methods: ["GET", "POST"]
}));

app.use(express.json());

//Creates HTTP Server for Express and SocketIO an HTTP server for both Express and Socket.IO
const server = http.createServer(app);

//Sets up SocketIO with CORS config, allows any origin
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

//Listens for when a client establishes a connection
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  //Sends all the stored messages to the connected client
  socket.emit("load_messages", messages);

  //Handles incoming messages, stores them, and broadcasts to all of the other connected clients
  socket.on("send_message", (message) => {
    messages.push(message); 
    socket.broadcast.emit("receive_message", message);
  });

  //Disconnects the client
  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
  });
});

//Starts the server
server.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${port}`);
});
