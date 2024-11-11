// MobileActivity.tsx
import React, { useState, useEffect } from 'react';
import { FaHome, FaChartLine, FaDollarSign, FaBell, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import { useDJ } from './DJContext';
import './MobileActivity.css';

const RequestifyLayout: React.FC = () => {
  const navigate = useNavigate();
  const { djName: paramDJName } = useParams<{ djName: string }>();
  const { djName, setDJName } = useDJ();
  const [tracks, setTracks] = useState<{ track: string[]; hasUpvoted: boolean; hasDownvoted: boolean }[]>([]);

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
      setTracks(data.map(track => ({ track, hasUpvoted: false, hasDownvoted: false })));
    } catch (error) {
      console.error("Failed to fetch tracks:", error);
    }
  };

  useEffect(() => {
    if (djName) {
      fetchTracks();
    }
  }, [paramDJName]);

  const handleUpvote = async (trackName: string, artist: string, index: number) => {
    try {
      const updatedTracks = [...tracks];

      if (updatedTracks[index].hasUpvoted) {
        // Remove upvote by calling downvote once
        await fetch('http://localhost:5001/tracks/downvote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ djName, trackName, artist })
        });
        updatedTracks[index].track[5] = (parseInt(updatedTracks[index].track[5]) - 1).toString();
        updatedTracks[index].hasUpvoted = false;
      } else {
        if (updatedTracks[index].hasDownvoted) {
          // Remove downvote and add upvote
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
          updatedTracks[index].track[5] = (parseInt(updatedTracks[index].track[5]) + 2).toString();
        } else {
          // Normal upvote
          await fetch('http://localhost:5001/tracks/upvote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ djName, trackName, artist })
          });
          updatedTracks[index].track[5] = (parseInt(updatedTracks[index].track[5]) + 1).toString();
        }
        updatedTracks[index].hasUpvoted = true;
        updatedTracks[index].hasDownvoted = false;
      }
      
      setTracks(updatedTracks);
    } catch (error) {
      console.error("Error upvoting:", error);
    }
  };
  
  const handleDownvote = async (trackName: string, artist: string, index: number) => {
    try {
      const updatedTracks = [...tracks];

      if (updatedTracks[index].hasDownvoted) {
        // Remove downvote by calling upvote once
        await fetch('http://localhost:5001/tracks/upvote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ djName, trackName, artist })
        });
        updatedTracks[index].track[5] = (parseInt(updatedTracks[index].track[5]) + 1).toString();
        updatedTracks[index].hasDownvoted = false;
      } else {
        if (updatedTracks[index].hasUpvoted) {
          // Remove upvote and add downvote
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
          updatedTracks[index].track[5] = (parseInt(updatedTracks[index].track[5]) - 2).toString();
        } else {
          // Normal downvote
          await fetch('http://localhost:5001/tracks/downvote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ djName, trackName, artist })
          });
          updatedTracks[index].track[5] = (parseInt(updatedTracks[index].track[5]) - 1).toString();
        }
        updatedTracks[index].hasDownvoted = true;
        updatedTracks[index].hasUpvoted = false;
      }
      
      setTracks(updatedTracks);
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
                tracks.map((trackObj, index) => (
                  <div key={index} className="song-item">
                    <img src={trackObj.track[4]} alt={`${trackObj.track[2]} cover`} className="album-cover" />
                    <div className="song-info">
                      <p>{trackObj.track[0]}</p> {/* Track name */}
                      <p className="artist">{trackObj.track[1]}</p> {/* Artist name */}
                    </div>
                    <FaArrowUp
                      className={`mobile-upvote ${trackObj.hasUpvoted ? 'active-upvote' : ''}`}
                      onClick={() => handleUpvote(trackObj.track[0], trackObj.track[1], index)}
                    />
                    <div className="mobile-song-upvotes">{trackObj.track[5]}</div>
                    <FaArrowDown
                      className={`mobile-downvote ${trackObj.hasDownvoted ? 'active-downvote' : ''}`}
                      onClick={() => handleDownvote(trackObj.track[0], trackObj.track[1], index)}
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
