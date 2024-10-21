import React, { useState } from 'react';
import { FaHome, FaChartLine, FaDollarSign, FaBell } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';  // Import useNavigate from react-router-dom
import './MobileHome.css';

const RequestifyLayout: React.FC = () => {
  const [query, setQuery] = useState(''); // State to store the user's input
  const [searchResult, setSearchResult] = useState(null); // State to store the result from the backend
  const navigate = useNavigate(); // Initialize useNavigate for navigation

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

  // Function to navigate to the payment page
  const goToPayment = () => {
    // Replace 'some-id' with the actual ID value if needed
    navigate('/0/payment');  // Update the route with the correct ID for your app
  };

  // Function to navigate to the activity page
  const goToActivity = () => {
    // Replace 'some-id' with the actual ID value if needed
    navigate('/0/activity');  // Update the route with the correct ID for your app
  };

  return (
    <div className="mobile-container">
      {/* Header Section */}
      <header className="mobile-header">
        <div className="header-title">
            <img src="/assets/requestify-logo.svg" alt="Requestify Logo" className="mobile-header-logo" />
        </div>
      </header>

      <FaBell className="bell-icon" />

      {/* Main Content */}
      <main className="mobile-content">
        {/* Listening Section */}
        <div className="listening-section">
          <p>You are listening to <a href="#">DJ Grant</a></p>
        </div>

        {/* Current Activity Button */}
        <div className="activity-button" onClick={goToActivity}>
          <button>View current activity</button>
        </div>

        <div className="request-section">
            <div className="request-tile">
                <h3>Request a song</h3>
                <div className="request-input">
                    <input
                    type="text"
                    placeholder="Search by name or Spotify link"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)} // Update query state on input change
                    />
                </div>
                {searchResult && (
                    <div className="search-results">
                    <h4>Search Results:</h4>
                    <pre>{JSON.stringify(searchResult, null, 2)}</pre>
                    </div>
                )}
                <button onClick={handleSearch}>Submit</button>
          </div>
        </div>

        {/* Payment Section */}
        <div className="payment-section">
            <div className="payment-tile" onClick={goToPayment}>  {/* Navigate on click */}
                <h3>Send a tip</h3>
                <div className="payment-options">
                    <img src="./assets/stripe.png" alt="Stripe" />
                </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <footer className="mobile-footer">
        <nav className="bottom-nav">
          <div className="nav-item active">
            <FaHome />
            <span>Home</span>
          </div>
          <div className="nav-item" onClick={goToActivity}>
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
