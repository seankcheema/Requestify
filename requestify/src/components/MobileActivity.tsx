// MobileActivity.tsx
import React, { useState, useEffect } from 'react';
import { FaHome, FaChartLine, FaDollarSign, FaBell, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import { useDJ } from './DJContext'; // Import DJContext
import './MobileActivity.css';

const RequestifyLayout: React.FC = () => {
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [hasDownvoted, setHasDownvoted] = useState(false);
  const navigate = useNavigate();
  const { djName: paramDJName } = useParams<{ djName: string }>(); // Get djName from URL parameters
  const { djName, setDJName } = useDJ();
  const [tracks, setTracks] = useState<string[][]>([]);

  // Set djName in context whenever paramDJName changes
  useEffect(() => {
    if (paramDJName) {
      setDJName(paramDJName);
    }
  }, [paramDJName, setDJName]);

  const fetchTracks = async () => {
    try {
      const response = await fetch(`http://localhost:5001/tracks/${djName}`);

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data: string[][] = await response.json();
      setTracks(data);
    } catch (error) {
      console.error("Failed to fetch tracks:", error);
    }
  }

  useEffect(() => {
    fetchTracks();
  }, [paramDJName]);

  const handleUpvote = async (djName: string, trackName: string, artist: string) => {
    console.log("here");
    try {
      if (hasUpvoted) {
        // Remove upvote by calling downvote once
        await fetch('http://localhost:5001/tracks/downvote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ djName, trackName, artist })
        });
        setHasUpvoted(false);
        fetchTracks();
      } else {
        // If previously downvoted, call upvote twice to reset and then upvote
        if (hasDownvoted) {
          await fetch('http://localhost:5001/tracks/upvote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ djName, trackName, artist })
          });
          await fetch('http://localhost:5001/tracks/upvote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ djName, trackName, artist })
          });
        } else {
          // Normal upvote
          await fetch('http://localhost:5001/tracks/upvote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ djName, trackName, artist })
          });
        }
        setHasUpvoted(true);
        setHasDownvoted(false);
        fetchTracks();
      }
    } catch (error) {
      console.error("Error upvoting:", error);
    }
  };
  
  const handleDownvote = async (djName: string, trackName: string, artist: string) => {
    try {
      if (hasDownvoted) {
        // Remove downvote by calling upvote once
        await fetch('http://localhost:5001/tracks/upvote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ djName, trackName, artist })
        });
        setHasDownvoted(false);
        fetchTracks();
      } else {
        // If previously upvoted, call downvote twice to reset and then downvote
        if (hasUpvoted) {
          await fetch('http://localhost:5001/tracks/downvote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ djName, trackName, artist })
          });
          await fetch('http://localhost:5001/tracks/downvote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ djName, trackName, artist })
          });
        } else {
          // Normal downvote
          await fetch('http://localhost:5001/tracks/downvote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ djName, trackName, artist })
          });
        }
        setHasDownvoted(true);
        setHasUpvoted(false);
        fetchTracks();
      }
    } catch (error) {
      console.error("Error downvoting:", error);
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
      <h2>Current Queue</h2>
      <div className="song-container">
        <div className="song-list">
          {tracks.length > 0 ? (
            tracks.map((track, index) => (
              <div key={index} className="song-item">
                <img src={track[4]} alt={`${track[2]} cover`} className="album-cover" />
                <div className="song-info">
                  <p>{track[0]}</p> {/* Track name */}
                  <p className="artist">{track[1]}</p> {/* Artist name */}
                </div>
                <FaArrowUp
                  className={`mobile-upvote ${hasUpvoted ? 'active-upvote' : ''}`}
                  onClick={() => handleUpvote(djName, track[0], track[1])}
                />
                <div className="mobile-song-upvotes">{track[5]}</div>
                <FaArrowDown
                  className={`mobile-downvote ${hasDownvoted ? 'active-downvote' : ''}`}
                  onClick={() => handleDownvote(djName, track[0], track[1])}
                />
              </div>
            ))
          ) : (
            <p>No tracks in the queue.</p>
          )}
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
