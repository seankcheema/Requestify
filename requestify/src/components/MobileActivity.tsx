import React, { useState } from 'react';
import { FaHome, FaChartLine, FaDollarSign, FaBell } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';  // Import useNavigate from react-router-dom
import './MobileActivity.css';

const RequestifyLayout: React.FC = () => {
  const [query, setQuery] = useState(''); // State to store the user's input
  const [searchResult, setSearchResult] = useState(null); // State to store the result from the backend
  const navigate = useNavigate(); // Initialize useNavigate for navigation

  // Function to navigate to the payment page
  const goToHome = () => {
    // Replace 'some-id' with the actual ID value if needed
    navigate('/0');  // Update the route with the correct ID for your app
  };

  // Function to navigate to the payment page
  const goToPayment = () => {
    // Replace 'some-id' with the actual ID value if needed
    navigate('/0/payment');  // Update the route with the correct ID for your app
  };

  return (
    <div className="mobile-container">
      {/* Header Section */}
      <header className="mobile-header">
        <div className="header-title">
            <img src="/assets/requestify-logo.svg" alt="Requestify Logo" className="mobile-header-logo" onClick={goToHome}/>
        </div>
      </header>

      <FaBell className="bell-icon" />

      {/* Main Content */}
      <main className="mobile-content">
        {/* Listening Section */}
        {/* <div className="listening-section">
          <p>You are listening to <a href="#">DJ Grant</a></p>
        </div> */}

        <section className="queue">
            <h2>Current Queue for <a href="#">DJ Grant</a></h2>
            <div className='song-container'>
            <div className="song-list">
                <div className="song-item">
                <img src="/assets/song1.png" alt="Album cover" />
                <div className="song-info">
                    <p>Count me out</p>
                    <p className="artist">Kendrick Lamar</p>
                </div>
                <div className="song-upvotes">16 upvotes</div>
                </div>
            </div>
            </div>
        </section>

      </main>

      {/* Bottom Navigation */}
      <footer className="mobile-footer">
        <nav className="bottom-nav" onClick={goToHome}>
          <div className="nav-item">
            <FaHome />
            <span>Home</span>
          </div>
          <div className="nav-item active">
            <FaChartLine />
            <span>Activity</span>
          </div>
          <div className="nav-item" onClick={goToPayment}>  {/* Navigate on click */}
            <FaDollarSign />
            <span>Payment</span>
          </div>
        </nav>
      </footer>
    </div>
  );
};

export default RequestifyLayout;
