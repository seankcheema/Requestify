import React, { useState, useEffect } from 'react';
import { FaHome, FaChartLine, FaDollarSign, FaBell, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import { useDJ } from './DJContext';
import io from 'socket.io-client';
import './MobileActivity.css';

const ipAddress = process.env.REACT_APP_API_IP;
const socket = io(`http://${ipAddress}:5001`);

const RequestifyLayout: React.FC = () => {
  const navigate = useNavigate();
  const { djName: paramDJName } = useParams<{ djName: string }>();
  const { djName, setDJName } = useDJ();
  const [tracks, setTracks] = useState<{ track: string[]; hasUpvoted: boolean; hasDownvoted: boolean }[]>([]);

  const [displayName, setDisplayName] = useState(''); // State for display name
  const ipAddress = process.env.REACT_APP_API_IP;

  const goToMessage = () => {
    navigate(`/dj/${paramDJName}/message`);
}
  useEffect(() => {
    if (paramDJName && djName !== paramDJName) {
      console.log("Setting djName from paramDJName:", paramDJName);
      setDJName(paramDJName);
    }
  }, [paramDJName, djName, setDJName]);

  // Fetch display name whenever djName changes
  useEffect(() => {
    const fetchDisplayName = async () => {
      try {
        const response = await fetch(`http://${ipAddress}:5001/dj/displayName/${djName}`);
        if (response.ok) {
          const data = await response.json();
          setDisplayName(data.displayName); // Assuming response has { displayName: "Actual Display Name" }
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

  const fetchTracks = async () => {
    try {
      const response = await fetch(`http://${ipAddress}:5001/tracks/${djName}`);

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

    // Listen for 'song_removed' events
    socket.on('song_removed', (removedSong) => {
      // Only update if the removed song belongs to the current DJ
      if (removedSong.djName === djName) {
        setTracks((prevTracks) =>
          prevTracks.filter((trackObj) =>
            !(trackObj.track[0] === removedSong.trackName && trackObj.track[1] === removedSong.artist)
          )
        );
      }
    });

    // Listen for 'song_added' events
    socket.on('song_added', (newSong) => {
      if (newSong.djName === djName) {
        setTracks((prevTracks) => [
          ...prevTracks,
          { track: [newSong.trackName, newSong.artist, newSong.album, newSong.external_url, newSong.album_cover_url, (newSong.upvotes || 0).toString()], hasUpvoted: false, hasDownvoted: false }
        ]);
      }
    });

    // Listening for upvote updates from the server
    socket.on('upvote_updated', (updatedSong) => {
      setTracks((prevTracks) =>
        prevTracks.map((track) =>
          track.track[0] === updatedSong.trackName && track.track[1] === updatedSong.artist
            ? { ...track, upvotes: updatedSong.upvotes }
            : track
        )
      );
    });

    // Listen for all_songs_removed event
    socket.on('all_songs_removed', (djName) => {
      if (djName === djName) {
        setTracks([]);
      }
    });


    // Cleanup listener on component unmount
    return () => {
      socket.off('song_removed');
      socket.off('song_added');
      socket.off('upvote_updated');
      socket.off('all_songs_removed');
    };

  }, [djName]);

  const handleUpvote = async (trackName: string, artist: string, index: number) => {
    try {
      const updatedTracks = [...tracks];

      if (updatedTracks[index].hasUpvoted) {
        await fetch(`http://${ipAddress}:5001/tracks/downvote`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ djName, trackName, artist })
        });
        updatedTracks[index].track[5] = (parseInt(updatedTracks[index].track[5]) - 1).toString();
        updatedTracks[index].hasUpvoted = false;
      } else {
        if (updatedTracks[index].hasDownvoted) {
          await fetch(`http://${ipAddress}:5001/tracks/upvote`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ djName, trackName, artist })
          });
          await fetch(`http://${ipAddress}:5001/tracks/upvote`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ djName, trackName, artist })
          });
          updatedTracks[index].track[5] = (parseInt(updatedTracks[index].track[5]) + 2).toString();
        } else {
          await fetch(`http://${ipAddress}:5001/tracks/upvote`, {
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
        await fetch(`http://${ipAddress}:5001/tracks/upvote`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ djName, trackName, artist })
        });
        updatedTracks[index].track[5] = (parseInt(updatedTracks[index].track[5]) + 1).toString();
        updatedTracks[index].hasDownvoted = false;
      } else {
        if (updatedTracks[index].hasUpvoted) {
          await fetch(`http://${ipAddress}:5001/tracks/downvote`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ djName, trackName, artist })
          });
          await fetch(`http://${ipAddress}:5001/tracks/downvote`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ djName, trackName, artist })
          });
          updatedTracks[index].track[5] = (parseInt(updatedTracks[index].track[5]) - 2).toString();
        } else {
          await fetch(`http://${ipAddress}:5001/tracks/downvote`, {
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

      <FaBell className="bell-icon" onClick={goToMessage} />

      <main className="mobile-content">
  <section className="mobile-queue">
    <h2>Current Queue for {displayName || djName}</h2>
    <div className="mobile-song-container">
      <div className="mobile-song-list">
        {tracks.length > 0 ? (
          tracks.map((trackObj, index) => (
            <div key={index} className="mobile-song-item">
              <img src={trackObj.track[4]} alt={`${trackObj.track[2]} cover`} className="album-cover" />
              <div className="mobile-song-info">
              <div className="scrolling-window">
                <p className={`song-title ${trackObj.track[0].length > 15 ? 'scrolling-text' : ''}`}>
                  {trackObj.track[0]}
                </p>
              </div>
              <div className="scrolling-window">
                <p className={`mobile-artist ${trackObj.track[1].length > 20 ? 'scrolling-text' : ''}`}>
                  {trackObj.track[1]}
                </p>
              </div>
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
