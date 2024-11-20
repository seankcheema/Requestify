const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { spawn } = require('child_process'); // For Python integration
const path = require('path'); // To serve React static files

const app = express();
const port = 5000;

// In-memory storage for messages
let messages = []; // Array to store messages

// Enable CORS for all origins
app.use(cors({
  origin: '*', // Allow all origins
  methods: ["GET", "POST"]
}));

app.use(express.json());

// Serve static files from the React app build folder
app.use(express.static(path.join(__dirname, '../build')));

const runPythonScriptOnStart = () => {
  const pythonProcess = spawn('python', ['main.py']);
  
  let output = '';
  let errorOutput = '';

  // Collect output data
  pythonProcess.stdout.on('data', (data) => {
    output += data.toString();
  });

  // Collect error data
  pythonProcess.stderr.on('data', (data) => {
    errorOutput += data.toString();
  });

  // Handle process close
  pythonProcess.on('close', (code) => {
    if (code === 0) {
      console.log('Python script output:', output);
    } else {
      console.error('Error running Python script:', errorOutput || 'Unknown error occurred');
    }
  });
};

// Fallback to serve React frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

// Create an HTTP server for both Express and Socket.IO
const server = http.createServer(app);

// Setup Socket.IO with CORS configuration
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Listen for client connections
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Send all stored messages to the newly connected client
  socket.emit("load_messages", messages);

  // Handle receiving a message from the client
  socket.on("send_message", (message) => {
    // Store the message in memory
    messages.push(message);
    // Broadcast the message to all other connected clients
    socket.broadcast.emit("receive_message", message);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
  });
});

// Run Python script when the server starts
runPythonScriptOnStart();

// Start the server
server.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${port}`);
});
