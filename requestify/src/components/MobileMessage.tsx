import React, { useEffect, useState } from 'react';
import { FaHome, FaChartLine, FaDollarSign } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { useUser } from './UserContext';
import './MobileMessage.css';
//Imports and user context set

//Use the ipAddress set in the environment variable
const ipAddress = process.env.REACT_APP_API_IP;

//Sets up MobileMessage component and sets up state, variables, context, etc.
const MobileMessage: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<{ text: string; sent: boolean }[]>([]);
  const [displayName, setDisplayName] = useState('');
  const { djName: paramDJName } = useParams<{ djName: string }>();
  const { scannedDJName, setScannedDJName, scannedDisplayName, setScannedDisplayName } = useUser();

  //Sets the scanned DJName if it is different from the URL's DJ Name
  useEffect(() => {
    if (paramDJName && scannedDJName !== paramDJName) {
      setScannedDJName(paramDJName);
    }
  }, [paramDJName, scannedDJName, setScannedDJName]);

    //Fetches the DJs display name using the DJ username
  useEffect(() => {
    const fetchDisplayName = async () => {
      if (!scannedDJName) return;

      try {
        const response = await fetch(`http://${ipAddress}:5001/dj/displayName/${scannedDJName}`);
        if (response.ok) {
          const data = await response.json();
          setScannedDisplayName(data.displayName); // Set the display name in context
        } else {
          console.error('Failed to fetch display name');
        }
      } catch (error) {
        console.error('Error fetching display name:', error);
      }
    };

    fetchDisplayName();
  }, [scannedDJName, setScannedDisplayName]);

  //Connects to socketIO server using IP, listens for previous messages being loaded, 
  //and listens for new messages
  useEffect(() => {
    const socket: Socket = io(`http://${ipAddress}:5000`);

    socket.on('load_messages', (loadedMessages) => {
      setMessages(loadedMessages);
    });

    socket.on('receive_message', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.off('load_messages');
      socket.off('receive_message');
      socket.disconnect();
    };
  }, []);

  //Sets up navigation for going to different pages
  const goToHome = () => navigate(`/dj/${scannedDJName}`);
  const goToActivity = () => navigate(`/dj/${scannedDJName}/activity`);
  const goToPayment = () => navigate(`/dj/${scannedDJName}/payment`);

  //Sets up the display of the mobile messages page
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
