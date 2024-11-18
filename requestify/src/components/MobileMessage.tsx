import React, { useEffect, useState } from 'react';
import { FaHome, FaChartLine, FaDollarSign } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { useUser } from './UserContext';
import './MobileMessage.css';

const ipAddress = process.env.REACT_APP_API_IP; // Use the environment variable

const MobileMessage: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<{ text: string; sent: boolean }[]>([]);
  const { scannedDJName, setScannedDJName, scannedDisplayName, setScannedDisplayName } = useUser();

  // Fetch display name whenever scannedDJName changes
  useEffect(() => {
    const fetchDisplayName = async () => {
      try {
        const response = await fetch(`http://${ipAddress}:5001/dj/displayName/${scannedDJName}`);
        if (response.ok) {
          const data = await response.json();
          setScannedDisplayName(data.displayName || 'Unknown DJ');
        } else {
          console.error('Failed to fetch display name');
        }
      } catch (error) {
        console.error('Error fetching display name:', error);
      }
    };

    if (scannedDJName) {
      fetchDisplayName();
    }
  }, [scannedDJName, setScannedDisplayName]);

  useEffect(() => {
    // Connect to the socket server using dynamic IP
    const socket: Socket = io(`http://${ipAddress}:5000`);

    // Listen for the initial set of messages when the client connects
    socket.on('load_messages', (loadedMessages) => {
      setMessages(loadedMessages); // Update the messages state with the loaded messages
    });

    // Listen for new incoming messages
    socket.on('receive_message', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    // Cleanup when component unmounts
    return () => {
      socket.off('load_messages');
      socket.off('receive_message');
      socket.disconnect();
    };
  }, []);

  const goToHome = () => navigate(`/dj/${scannedDJName}`);
  const goToActivity = () => navigate(`/dj/${scannedDJName}/activity`);
  const goToPayment = () => navigate(`/dj/${scannedDJName}/payment`);

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
          <h2>Messages from {scannedDisplayName || scannedDJName || 'Loading...'}</h2>
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
