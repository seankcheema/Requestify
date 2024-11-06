// MobileActivity.tsx
import React, { useState, useEffect } from 'react';
import { FaHome, FaChartLine, FaDollarSign, FaBell, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import { useDJ } from './DJContext'; // Import DJContext
import './MobileActivity.css';

const RequestifyLayout: React.FC = () => {
  const [upvotes, setUpvotes] = useState(16);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [hasDownvoted, setHasDownvoted] = useState(false);
  const navigate = useNavigate();
  const { djName: paramDJName } = useParams<{ djName: string }>(); // Get djName from URL parameters
  const { djName, setDJName } = useDJ();

  // Set djName in context whenever paramDJName changes
  useEffect(() => {
    if (paramDJName) {
      setDJName(paramDJName);
    }
  }, [paramDJName, setDJName]);

  const handleUpvote = () => {
    if (hasUpvoted) {
      setUpvotes(upvotes - 1);
      setHasUpvoted(false);
    } else {
      setUpvotes(hasDownvoted ? upvotes + 2 : upvotes + 1);
      setHasUpvoted(true);
      setHasDownvoted(false);
    }
  };

  const handleDownvote = () => {
    if (hasDownvoted) {
      setUpvotes(upvotes + 1);
      setHasDownvoted(false);
    } else {
      setUpvotes(hasUpvoted ? upvotes - 2 : upvotes - 1);
      setHasDownvoted(true);
      setHasUpvoted(false);
    }
  };

  const goToHome = () => {
    navigate(`/dj/${paramDJName}`);
  };

  const goToPayment = () => {
    navigate(`/dj/${paramDJName}/payment`);
  };

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

      <FaBell className="bell-icon" />

      <main className="mobile-content">
        <section className="mobile-queue">
          <h2>
            Current Queue for <a href="#">{djName}</a> {/* Use djName from context */}
          </h2>
          <div className="mobile-song-container">
            <div className="mobile-song-list">
              <div className="mobile-song-item">
                <img src="/assets/song1.png" alt="Album cover" />
                <div className="mobile-song-info">
                  <p>Count me out</p>
                  <p className="mobile-artist">Kendrick Lamar</p>
                </div>
                <FaArrowUp
                  className={`mobile-upvote ${hasUpvoted ? 'active-upvote' : ''}`}
                  onClick={handleUpvote}
                />
                <div className="mobile-song-upvotes">{upvotes}</div>
                <FaArrowDown
                  className={`mobile-downvote ${hasDownvoted ? 'active-downvote' : ''}`}
                  onClick={handleDownvote}
                />
              </div>
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
