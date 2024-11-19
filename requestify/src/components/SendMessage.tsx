import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import MessagePopup from './MessagePopup';
import './Dashboard.css';

const ipAddress = process.env.REACT_APP_API_IP;

const socket: Socket = io(`http://${ipAddress}:5000`); // Ensure this connects to the correct server

const SendMessage: React.FC<{ djName: string }> = ({ djName }) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [messages, setMessages] = useState<{ text: string; sent: boolean }[]>([]);

  // Fetch previously sent messages when the component mounts
  useEffect(() => {
    if (djName) {
      console.log("Loading messages for DJ:", djName); // Debugging
      socket.emit("load_messages", djName); // Emit load_messages event with djName

      // Listen for the loaded messages
      socket.on("load_messages", (loadedMessages) => {
        console.log("Messages loaded:", loadedMessages); // Debugging
        setMessages(loadedMessages.map((msg: any) => ({ text: msg.text, sent: true }))); // Update state
      });

      // Listen for new messages (receive_message)
      socket.on("receive_message", (message) => {
        console.log("New message received:", message); // Debugging
        setMessages((prevMessages) => [...prevMessages, { text: message.text, sent: true }]); // Add to state
      });

      // Cleanup the listeners when the component unmounts
      return () => {
        socket.off("load_messages");
        socket.off("receive_message");
      };
    }
  }, [djName]); // Only run when djName changes

  // Handle sending a message
  const handleSendMessage = (message: string) => {
    console.log("Sending message:", message); // Debugging
    // Emit the message to the server
    socket.emit("send_message", { djName, text: message });

    // Update local messages array
    setMessages((prevMessages) => [...prevMessages, { text: message, sent: true }]);
  };

  // Open the message popup
  const handleOpenPopup = () => setIsPopupOpen(true);
  
  // Close the message popup
  const handleClosePopup = () => setIsPopupOpen(false);

  return (
    <>
      <aside className="send-message" onClick={handleOpenPopup}>
        <img src="/assets/Message square.svg" alt="message icon" className="message-icon" />
        <p>Send a message</p>
      </aside>
      <MessagePopup
        show={isPopupOpen}
        onClose={handleClosePopup}
        messages={messages}
        onSendMessage={handleSendMessage} // Pass send message handler
      />
    </>
  );
};

export default SendMessage;
