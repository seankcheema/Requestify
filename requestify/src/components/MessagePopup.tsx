import React, { useState, useEffect, useRef } from 'react';

interface MessagePopupProps {
  show: boolean;
  onClose: () => void;
  messages: { text: string; sent: boolean }[];
  onSendMessage: (message: string) => void;
}

const MessagePopup: React.FC<MessagePopupProps> = ({ show, onClose, messages, onSendMessage }) => {
  const [newMessage, setNewMessage] = useState('');
  
  // Ref for auto-scrolling to the bottom
  const messageEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [show, messages]);

  const handleSend = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage('');  // Clear input after sending
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent default form submission
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
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
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
