import React, { useState } from 'react';
import MessagePopup from './MessagePopup';
import './Dashboard.css';

const SendMessage: React.FC = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  
  // Messages now an array of objects with text and sent fields
  const [messages, setMessages] = useState<{ text: string; sent: boolean }[]>([]);

  const handleSendMessage = (message: string) => {
    // Add a new message object with text and sent properties
    setMessages((prevMessages) => [...prevMessages, { text: message, sent: true }]);
  };

  const handleOpenPopup = () => {
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };

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
