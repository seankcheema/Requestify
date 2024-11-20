import React, { useState, useEffect, useRef } from 'react';
import './Dashboard.css';

//Prop for the popup of the song history
interface HistoricalSongsPopupProps {
    show: boolean;
    onClose: () => void;
    djName: string;
}

const HistoricalSongsPopup: React.FC<HistoricalSongsPopupProps> = ({ show, onClose, djName }) => {  
  const [tracks, setTracks] = useState<{ track: string[]; hasUpvoted: boolean; hasDownvoted: boolean }[]>([]);
  const ipAddress = process.env.REACT_APP_API_IP;
  
  //Function that fetches tracks from the history
  const fetchTracks = async () => {
    try {
      const response = await fetch(`http://${ipAddress}:5001/track-history/${djName}`);
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data: string[][] = await response.json();
      setTracks(data.map(track => ({ track, hasUpvoted: false, hasDownvoted: false })));
    } catch (error) {
      console.error("Failed to fetch tracks:", error);
    }
  };

  const messageEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }

    fetchTracks();
  }, [show]);

  //Displays the tracks
  return show ? (
    <div className="popup-overlay">
      <div className="queue-popup-content">
        {/*Close button*/}
        <button className="close-btn" onClick={onClose}>×</button>
            <h2>Track history</h2>
            <div className="song-container">
                <div className="song-list">
                {tracks.length > 0 ? (
                    tracks.map((track, index) => (
                    <div key={index} className="song-item">
                        <img src={track.track[4]} alt={`${track.track[2]} cover`} className="album-cover" />
                        <div className="song-info">
                        <div className="desktop-scrolling-window">
                            <p className={`song-title ${track.track[0].length > 35 ? 'desktop-scrolling-text' : ''}`}>
                            {track.track[0]}
                            </p>
                        </div>
                        {/*<p>{track.track[0]}</p>*/}
                        <p className="artist">{track.track[1]}</p>
                        </div>
                    </div>
                    ))
                ) : (
                    <p>No track history.</p>
                )}
                </div>
            </div>
                
      </div>
    </div>
  ) : null;
};

export default HistoricalSongsPopup;
