import React, { useEffect, useState } from 'react';
import { FaHome, FaChartLine, FaDollarSign, FaBell } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { useDJ } from './DJContext';
import './MobileMessage.css';

const ipAddress = process.env.REACT_APP_API_IP; // Use the environment variable

const MobileMessage: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<{ text: string; sent: boolean }[]>([]);
  const [displayName, setDisplayName] = useState(''); // State for display name
  const { djName: paramDJName } = useParams<{ djName: string }>(); // Get djName from URL params
  const { djName, setDJName } = useDJ();

  // Set djName in context whenever paramDJName changes
  useEffect(() => {
      if (paramDJName) {
          setDJName(paramDJName);
      }
  }, [paramDJName, setDJName]);
  

  // Fetch the display name whenever djName changes
  useEffect(() => {
      const fetchDisplayName = async () => {
          try {
              const response = await fetch(`http://localhost:5001/dj/displayName/${djName}`);
              if (response.ok) {
                  const data = await response.json();
                  setDisplayName(data.displayName);
              } else {
                  console.error('Failed to fetch display name');
              }
          } catch (error) {
              console.error('Error fetching display name:', error);
          }
      };

      if (djName) {
          fetchDisplayName();
      }
  }, [djName]);

  useEffect(() => {
    // Connect to the socket server using dynamic IP
    const socket: Socket = io(`http://${ipAddress}:5000`);

    // Listen for messages from the server
    socket.on("receive_message", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    // Cleanup when component unmounts
    return () => {
      socket.off("receive_message");
      socket.disconnect();
    };
  }, []);

  const goToHome = () => navigate(`/dj/${paramDJName}`);
  const goToActivity = () => navigate(`/dj/${paramDJName}/activity`);
  const goToPayment = () => navigate(`/dj/${paramDJName}/payment`);

  return (
    <div className="mobile-container">
      <header className="mobile-header">
        <div className="header-title">
          <img
            src="/assets/requestify-logo.svg"
            alt="Requestify Logo"
            className="mobile-header-logo"
            onClick={goToHome}
          />
        </div>
      </header>

      <main className="mobile-content">
        <section className="mobile-queue">
          <h2>Messsages from {displayName || djName}</h2>
          <div className="mobile-song-container">
            <div className="mobile-song-list">
            {messages.map((msg, index) => (
            <div className="mobile-message-bubble" key={index}>
              <div className="mobile-message-text">{msg.text}</div>
            </div>
          ))}
            </div>
          </div>
        </section>
      </main>



      <footer className="mobile-footer">
        <nav className="bottom-nav">
          <div className="nav-item" onClick={goToHome}>
            <FaHome />
            <span>Home</span>
          </div>
          <div className="nav-item">
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