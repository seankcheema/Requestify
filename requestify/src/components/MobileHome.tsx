import React, { useState } from 'react';
import { FaHome, FaChartLine, FaDollarSign, FaBell } from 'react-icons/fa';
import './MobileHome.css';

const RequestifyLayout: React.FC = () => {
    const [query, setQuery] = useState(''); // State to store the user's input
  const [searchResult, setSearchResult] = useState(null); // State to store the result from the backend

  // Function to handle the search request
  const handleSearch = async () => {
    if (!query) {
      alert('Please enter a song name or Spotify link');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/search?query=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (response.ok) {
        setSearchResult(data); // Store the response data
      } else {
        alert(data.message || 'Error fetching data');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to fetch song data');
    }
  };

  return (
    <div className="mobile-container">
      {/* Header Section */}
      <header className="mobile-header">
        <div className="header-title">
          <h1>Requestify</h1>
          <FaBell className="bell-icon" />
        </div>
      </header>

      {/* Main Content */}
      <main className="mobile-content">
        {/* Listening Section */}
        <div className="listening-section">
          <p>You are listening to <a href="#">DJ Grant</a></p>
        </div>

        {/* Current Activity Button */}
        <div className="activity-button">
          <button>View current activity</button>
        </div>

        <div className="request-section">
          <h3>Request a song</h3>
          <div className="request-input">
            <input
              type="text"
              placeholder="Search by name or Spotify link"
              value={query}
              onChange={(e) => setQuery(e.target.value)} // Update query state on input change
            />
            <button onClick={handleSearch}>Submit</button>
          </div>
          {searchResult && (
            <div className="search-results">
              <h4>Search Results:</h4>
              <pre>{JSON.stringify(searchResult, null, 2)}</pre>
            </div>
          )}
        </div>

        {/* Payment Section */}
        <div className="payment-section">
          <h3>Send a tip</h3>
          <div className="payment-options">
            <img src="./assets/Apple pay icon.png" alt="Apple Pay" />
            <img src="./assets/Google pay icon.png" alt="Google Pay" />
            <img src="./assets/PayPal Icon.png" alt="PayPal" />
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <footer className="mobile-footer">
        <nav className="bottom-nav">
          <div className="nav-item">
            <FaHome />
            <span>Home</span>
          </div>
          <div className="nav-item">
            <FaChartLine />
            <span>Activity</span>
          </div>
          <div className="nav-item">
            <FaDollarSign />
            <span>Payment</span>
          </div>
        </nav>
      </footer>
    </div>
  );
};

export default RequestifyLayout;
