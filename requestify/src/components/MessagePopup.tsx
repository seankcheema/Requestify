import React, { useState, useEffect, useRef } from 'react';
import './Dashboard.css';

//Props for controlling message popup
interface MessagePopupProps {
  show: boolean;
  onClose: () => void;
  messages: { text: string; sent: boolean }[];
  onSendMessage: (message: string) => void;
}

//Defines MessagePopup component
const MessagePopup: React.FC<MessagePopupProps> = ({ show, onClose, messages, onSendMessage }) => {
  const [newMessage, setNewMessage] = useState('');
  
  const messageEndRef = useRef<HTMLDivElement>(null);

  //Sets up auto scrolling
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [show, messages]);

  //Logic for sending a message to end-users
  const handleSend = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };

  //Lets DJ send a message by pressing enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  //Displays the popup
  return show ? (
    <div className="popup-overlay">
      <div className="message-popup-content">
        {/*Close button*/}
        <button className="close-btn" onClick={onClose}>×</button>
        
        {/*Message container with scroll*/}
        <div className="message-container">
          <ul className="message-list">
            {messages.map((message, index) => (
              <li key={index} className={`message-bubble ${message.sent ? 'sent' : ''}`}>
                {message.text}
              </li>
            ))}
            {/*Auto-scroll*/}
            <div ref={messageEndRef} />
          </ul>
        </div>

        {/*Message input and send button*/}
        <div className="message-form">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
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
