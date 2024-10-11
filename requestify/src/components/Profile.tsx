import React, { useState } from 'react';
import './Dashboard.css';

const Profile: React.FC = () => {
  const [isProfilePopupOpen, setIsProfilePopupOpen] = useState(false);

  const handleOpenProfilePopup = () => {
    setIsProfilePopupOpen(true);
  };

  const handleCloseProfilePopup = () => {
    setIsProfilePopupOpen(false);
  };

  return (
    <>
      <aside className="profile" onClick={handleOpenProfilePopup}>
        <img src="/assets/profile.png" alt="Profile" className="profile-img" />
        <p>Profile</p>
      </aside>

      {isProfilePopupOpen && (
        <div className="popup-overlay">
          <div className="popup-content">
            <button className="close-btn" onClick={handleCloseProfilePopup}>×</button>
            <div className="profile-popup-content">
              <img src="/assets/profile.png" alt="Profile" className="popup-profile-img" />
              <h2>DJ Grant</h2>
              <p>Detroit, Michigan</p>
              <p>Hey y'all! I'm DJ Grant, I love rap music, kickin' it with the boys, and having a good time with good vibes! 🎉</p>
              <p><strong>Instagram:</strong> @meekergrant</p>
              <p><strong>X:</strong> @meekergrant</p>
              <p><strong>YouTube:</strong> Hivemind TV</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Profile;
