import React, { useState } from 'react';
import './Dashboard.css';

interface ProfileProps {
  email: string;
  djName: string;
  displayName: string;
  location: string;
  socialMedia: string;
}

const Profile: React.FC<ProfileProps> = ({ email, djName, displayName, location, socialMedia }) => {
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
        <p>{djName || "Profile"}</p>
      </aside>

      {isProfilePopupOpen && (
        <div className="popup-overlay">
          <div className="popup-content">
            <button className="close-btn" onClick={handleCloseProfilePopup}>×</button>
            <div className="profile-popup-content">
              <img src="/assets/profile.png" alt="Profile" className="popup-profile-img" />
              <h2>DJ name: {djName}</h2>
              <p>DJ Location: {location}</p>
              <p>Welcome, {displayName}!</p>
              <p>Social Media: {socialMedia}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Profile;
