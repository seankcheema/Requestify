import React from 'react';

const SendMessage: React.FC = () => {
  return (
    <aside className="send-message">
      <img src="/assets/Message square.svg" alt="message icon" className="message-icon" />
      <p>Send a message</p>
    </aside>
  );
}

export default SendMessage;
