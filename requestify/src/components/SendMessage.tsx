import React, { useState } from 'react';
import { io } from 'socket.io-client';
import MessagePopup from './MessagePopup';
import './Dashboard.css';

const socket = io("http://localhost:5000"); // Connect to your Socket.IO server

const SendMessage: React.FC = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [messages, setMessages] = useState<{ text: string; sent: boolean }[]>([]);

  const handleSendMessage = (message: string) => {
    // Emit the message to the server
    socket.emit("send_message", { text: message, sent: true });

    // Update the local messages array
    setMessages((prevMessages) => [...prevMessages, { text: message, sent: true }]);
  };

  const handleOpenPopup = () => setIsPopupOpen(true);
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
        onSendMessage={handleSendMessage}
      />
    </>
  );
};

export default SendMessage;
