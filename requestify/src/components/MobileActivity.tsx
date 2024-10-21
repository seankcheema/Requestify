import React, { useState } from 'react';
import { FaHome, FaChartLine, FaDollarSign, FaBell, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './MobileActivity.css';

const RequestifyLayout: React.FC = () => {
  const [upvotes, setUpvotes] = useState(16); // State for current upvotes
  const [hasUpvoted, setHasUpvoted] = useState(false); // Track if the user has upvoted
  const [hasDownvoted, setHasDownvoted] = useState(false); // Track if the user has downvoted
  const navigate = useNavigate();

  // Function to handle upvote
  const handleUpvote = () => {
    if (hasUpvoted) {
      setUpvotes(upvotes - 1);
      setHasUpvoted(false);
    } else {
      setUpvotes(hasDownvoted ? upvotes + 2 : upvotes + 1); // Adjust if previously downvoted
      setHasUpvoted(true);
      setHasDownvoted(false);
    }
  };

  // Function to handle downvote
  const handleDownvote = () => {
    if (hasDownvoted) {
      setUpvotes(upvotes + 1);
      setHasDownvoted(false);
    } else {
      setUpvotes(hasUpvoted ? upvotes - 2 : upvotes - 1); // Adjust if previously upvoted
      setHasDownvoted(true);
      setHasUpvoted(false);
    }
  };

  // Function to navigate to the home page
  const goToHome = () => {
    navigate('/0');
  };

  // Function to navigate to the payment page
  const goToPayment = () => {
    navigate('/0/payment');
  };

  return (
    <div className="mobile-container">
      {/* Header Section */}
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

      <FaBell className="bell-icon" />

      {/* Main Content */}
      <main className="mobile-content">
        <section className="mobile-queue">
          <h2>
            Current Queue for <a href="#">DJ Grant</a>
          </h2>
          <div className="mobile-song-container">
            <div className="mobile-song-list">
              <div className="mobile-song-item">
                <img src="/assets/song1.png" alt="Album cover" />
                <div className="mobile-song-info">
                  <p>Count me out</p>
                  <p className="mobile-artist">Kendrick Lamar</p>
                </div>
                {/* Upvote Arrow */}
                <FaArrowUp
                  className={`mobile-upvote ${hasUpvoted ? 'active-upvote' : ''}`}
                  onClick={handleUpvote}
                />
                <div className="mobile-song-upvotes">{upvotes}</div>
                {/* Downvote Arrow */}
                <FaArrowDown
                  className={`mobile-downvote ${hasDownvoted ? 'active-downvote' : ''}`}
                  onClick={handleDownvote}
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Bottom Navigation */}
      <footer className="mobile-footer">
        <nav className="bottom-nav">
          <div className="nav-item" onClick={goToHome}>
            <FaHome />
            <span>Home</span>
          </div>
          <div className="nav-item active">
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

export default RequestifyLayout;
