import React, { useEffect, useState } from 'react';
import { FaHome, FaChartLine, FaDollarSign, FaBell } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
//import './MobileMessage.css';

const socket = io("http://localhost:5000"); // Connect to your socket.io server

const MobileMessage: React.FC = () => {
  const navigate = useNavigate();
  const { djName: paramDJName } = useParams<{ djName: string }>();
  const [messages, setMessages] = useState<{ text: string; sent: boolean }[]>([]);

  useEffect(() => {
    // Listen for messages from the server
    socket.on("receive_message", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    // Cleanup when component unmounts
    return () => {
      socket.off("receive_message");
    };
  }, []);

  const goToHome = () => navigate(`/dj/${paramDJName}`);
  const goToActivity = () => navigate(`/dj/${paramDJName}/activity`);
  const goToPayment = () => navigate(`/dj/${paramDJName}/payment`);

  return (
    <div className="message-container">
      <header className="mobile-header">
        <div className="header-title">
          <img src="/assets/requestify-logo.svg" alt="Requestify Logo" className="mobile-header-logo" onClick={goToHome} />
        </div>
      </header>

      <main className="message-content">
        <div className="message-box">
          {messages.map((msg, index) => (
            <div className="message-bubble" key={index}>
              <p className="message-sender">DJ Grant</p>
              <div className="message-text">{msg.text}</div>
            </div>
          ))}
        </div>
      </main>

      <footer className="message-footer">
        <nav className="bottom-nav">
          <div className="nav-item" onClick={goToHome}>
            <FaHome />
            <span>Home</span>
          </div>
          <div className="nav-item" onClick={goToActivity}>
            <FaChartLine />
            <span>Activity</span>
          </div>
          <div className="nav-item" onClick={goToPayment}>
            <FaDollarSign />
            <span>Payment</span>
          </div>
        </nav>
      </footer>
    </div>
  );
};

export default MobileMessage;