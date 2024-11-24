import React, { useEffect, useState } from 'react';
import './Dashboard.css';
import io from 'socket.io-client';
import { FaHistory } from 'react-icons/fa';
import HistoricalSongsPopup from './HistoricalSongsPopup';

const ipAddress = process.env.REACT_APP_API_IP;
const socket = io(`http://${ipAddress}:5001`);

interface QueueProps {
  djName: string;
}

interface Track {
  trackName: string;
  artist: string;
  album: string;
  external_url: string;
  album_cover_url: string;
  upvotes: number;
}

const Queue: React.FC<QueueProps> = ({ djName }) => {
  const [tracks, setTracks] = useState<{ track: string[]; hasUpvoted: boolean; hasDownvoted: boolean }[]>([]);
  const [showPopup, setShowPopup] = useState(false);  // State to control popup visibility
  
  
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

  const removeTrack = async (trackName: string, artist: string) => {
    try {
      const response = await fetch(`http://${ipAddress}:5001/tracks/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ djName, trackName, artist })
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      // Update state by filtering out the removed track
      setTracks((prevTracks) =>
        prevTracks.filter(
          (trackObj) =>
            !(trackObj.track[0] === trackName && trackObj.track[1] === artist)
        )
      );
    } catch (error) {
      console.error("Failed to remove track:", error);
    }
  };

  const removeAllTracks = async () => {
    // Show a confirmation popup
    const confirmed = window.confirm("Are you sure you want to clear the queue?");
    if (!confirmed) return; // Exit if user cancels

    try {
      const response = await fetch(`http://${ipAddress}:5001/tracks/delete-all`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ djName })
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      setTracks([]);
    } catch (error) {
      console.error("Failed to remove all tracks:", error);
    }
  };

  useEffect(() => {
    if (djName) {
      fetchTracks();
    }

    // Listen for 'song_added' events
    socket.on('song_added', (newSong) => {
      if (newSong.djName === djName) {
        setTracks((prevTracks) => [
          ...prevTracks,
          { track: [newSong.trackName, newSong.artist, newSong.album, newSong.external_url, newSong.album_cover_url, (newSong.upvotes || 0).toString()], hasUpvoted: false, hasDownvoted: false }
        ]);
      }
    });

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

    // Listening for upvote updates from the server
    socket.on('upvote_updated', (updatedSong) => {
      setTracks((prevTracks) =>
        prevTracks.map((track) =>
          track.track[0] === updatedSong.trackName && track.track[1] === updatedSong.artist
            ? { ...track, track: [...track.track.slice(0, 5), updatedSong.upvotes] } // Update upvotes
            : track
        )
      );
      fetchTracks();
    });

    // Listen for all_songs_removed event
    socket.on('all_songs_removed', (djName) => {
      if (djName === djName) {
        setTracks([]);
      }
    });

    // Cleanup listeners on unmount
    return () => {
      socket.off('song_added');
      socket.off('song_removed');
      socket.off('upvote_updated');
      socket.off('all_songs_removed');
    };

  }, [djName]);

  // Toggle popup visibility when FaHistory icon is clicked
  const handleHistoryClick = () => {
    setShowPopup(true);
  };

  const handleClosePopup = () => setShowPopup(false);

  return (
    <section className="queue">
      <h2>Current Queue</h2>
      <div className="song-container">
        <div className="song-list">
          {tracks.length > 0 ? (
            tracks.map((track, index) => (
              <div key={index} className="song-item">
                <img src={track.track[4]} alt={`${track.track[2]} cover`} className="album-cover" />
                <div className="song-info">
                  <div className="desktop-scrolling-window">
                    <p className={`song-title ${track.track[0].length > 50 ? 'desktop-scrolling-text' : ''}`}>
                      {track.track[0]}
                    </p>
                  </div>
                  {/* <p>{track.track[0]}</p> */}
                  <p className="artist">{track.track[1]}</p>
                </div>
                <div className="song-upvotes">
                  {track.track[5]}
                </div>
                <img src="/assets/Remove icon.svg" alt="Remove button" className="remove-btn" onClick={() => removeTrack(track.track[0], track.track[1])}/>
              </div>
            ))
          ) : (
            <p>No tracks in the queue.</p>
          )}
        </div>
      </div>
      <button className="clear-queue" onClick={removeAllTracks}>Clear Queue</button>
      <FaHistory className="track-history" onClick={handleHistoryClick}/>
      <HistoricalSongsPopup
        show={showPopup}
        onClose={handleClosePopup} // Pass the function reference here
        djName={djName}
      />
    </section>
  );
};

export default Queue;
