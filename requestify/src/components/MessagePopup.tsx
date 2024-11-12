import React, { useState, useEffect, useRef } from 'react';
import './Dashboard.css';

interface MessagePopupProps {
  show: boolean;
  onClose: () => void;
  messages: { text: string; sent: boolean }[];
  onSendMessage: (message: string) => void;
}

const MessagePopup: React.FC<MessagePopupProps> = ({ show, onClose, messages, onSendMessage }) => {
  const [newMessage, setNewMessage] = useState(''); // Local state to manage the new message input
  
  // Ref for auto-scrolling to the bottom
  const messageEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [show, messages]);

  const handleSend = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage); // Call onSendMessage passed from parent
      setNewMessage('');  // Clear the input field after sending the message
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent default form submission on Enter
      handleSend();  // Send the message when Enter is pressed
    }
  };

  return show ? (
    <div className="popup-overlay">
      <div className="message-popup-content">
        {/* Close button */}
        <button className="close-btn" onClick={onClose}>×</button>
        
        {/* Message container with scroll */}
        <div className="message-container">
          <ul className="message-list">
            {messages.map((message, index) => (
              <li key={index} className={`message-bubble ${message.sent ? 'sent' : ''}`}>
                {message.text}
              </li>
            ))}
            {/* Auto-scroll element */}
            <div ref={messageEndRef} />
          </ul>
        </div>

        {/* Message input and send button */}
        <div className="message-form">
          <input
            type="text"
            value={newMessage} // Control the value of the input field with newMessage state
            onChange={(e) => setNewMessage(e.target.value)} // Update newMessage state as user types
            onKeyDown={handleKeyDown}  // Add keydown event handler
            placeholder="Write a message"
            className="message-input"
          />
          <button onClick={handleSend} className="send-btn">Send</button>
        </div>
      </div>
    </div>
  ) : null;
};

export default MessagePopup;
