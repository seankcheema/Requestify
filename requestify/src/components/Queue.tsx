import React, { useEffect, useState } from 'react';
import './Dashboard.css';

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
  const [tracks, setTracks] = useState<string[][]>([]);
  const ipAddress = process.env.REACT_APP_API_IP;

  const fetchTracks = async () => {
    try {
      const response = await fetch(`http://${ipAddress}:5001/tracks/${djName}`);
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data: string[][] = await response.json();
      setTracks(data);
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
      setTracks(tracks.filter(track => track[0] !== trackName && track[1] !== artist));
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
    fetchTracks();
    const intervalId = setInterval(() => {
      fetchTracks();
    }, 5000);
    return () => clearInterval(intervalId);
  }, [djName]);

  return (
    <section className="queue">
      <h2>Current Queue</h2>
      <div className="song-container">
        <div className="song-list">
          {tracks.length > 0 ? (
            tracks.map((track, index) => (
              <div key={index} className="song-item">
                <img src={track[4]} alt={`${track[2]} cover`} className="album-cover" />
                <div className="song-info">
                  <p>{track[0]}</p>
                  <p className="artist">{track[1]}</p>
                </div>
                <div className="song-upvotes">
                  {track[5]}
                </div>
                <img src="/assets/Remove icon.svg" alt="Remove button" className="remove-btn" onClick={() => removeTrack(track[0], track[1])}/>
              </div>
            ))
          ) : (
            <p>No tracks in the queue.</p>
          )}
        </div>
      </div>
      <button className="clear-queue" onClick={removeAllTracks}>Clear Queue</button>
    </section>
  );
};

export default Queue;
