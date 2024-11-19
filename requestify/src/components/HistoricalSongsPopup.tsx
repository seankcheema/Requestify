import React, { useState, useEffect, useRef } from 'react';
import './Dashboard.css';

interface HistoricalSongsPopupProps {
  show: boolean;
}

const HistoricalSongsPopup: React.FC<HistoricalSongsPopupProps> = ({ show }) => {
  const [newMessage, setNewMessage] = useState(''); // Local state to manage the new message input
  
  // Ref for auto-scrolling to the bottom
  const messageEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [show]);

  const onClose = () => {
    // Close the popup
    show = false;
  };

  return show ? (
    <div className="popup-overlay">
      <div className="message-popup-content">
        {/* Close button */}
        <button className="close-btn" onClick={onClose}>×</button>
        <section className="queue">
            <h2>Current Queue</h2>
            <div className="song-container">
                <div className="song-list">
                {tracks.length > 0 ? (
                    tracks.map((track, index) => (
                    <div key={index} className="song-item">
                        <img src={track.track[4]} alt={`${track.track[2]} cover`} className="album-cover" />
                        <div className="song-info">
                        <p>{track.track[0]}</p>
                        <p className="artist">{track.track[1]}</p>
                        </div>
                        <div className="song-upvotes">
                        {track.track[5]}
                        </div>
                    </div>
                    ))
                ) : (
                    <p>No tracks in the queue.</p>
                )}
                </div>
            </div>
            </section>
                
      </div>
    </div>
  ) : null;
};

export default HistoricalSongsPopup;
