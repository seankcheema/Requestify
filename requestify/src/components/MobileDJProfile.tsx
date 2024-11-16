import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Dashboard.css';
import { useNavigate } from 'react-router-dom';

interface ProfileProps {
  email: string;
  djName: string;
  displayName: string;
  location: string;
  socialMedia: string;
}

const MobileDJProfile: React.FC<ProfileProps> = () => {
  const [isProfilePopupOpen, setIsProfilePopupOpen] = useState(false);
  const navigate = useNavigate();
    const [displayName, setDisplayName] = useState('');
    const [location, setLocation] = useState('');
    const [socialMedia, setSocialMedia] = useState('');
    const [djName, setDJName] = useState('');

  const handleOpenProfilePopup = () => setIsProfilePopupOpen(true);
  const handleCloseProfilePopup = () => {
    setIsProfilePopupOpen(false);
  };

  useEffect(() => {
    const fetchDisplayName = async () => {
        const ipAddress = process.env.REACT_APP_API_IP;

        try {
            const response = await fetch(`http://localhost:5001/dj/displayName/${djName}`);
                if (response.ok) {
                    const data = await response.json();
                    setDisplayName(data.displayName);
                    setSocialMedia(data.socialMedia);
                    
                } else {
                    console.error('Failed to fetch display name');
                }
            
            
        } catch (error) {
            console.error('Error fetching profile data:', error);
        }
    }
}, [navigate]);

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
                <form onSubmit={(e) => e.preventDefault()} className="edit-profile-form">
                  {/* Back button to switch back to profile view without saving */}
                  {/* <button type="button" onClick={handleBackClick} className="back-btn">← Back</button> */}
                  
                  <label>
                    Display Name:
                    <input name="displayName" value={displayName} placeholder="Display Name" />
                  </label>
                  <label>
                    DJ Location:
                    <input name="location" value={location}  placeholder="Location" />
                  </label>
                  <label>
                    Social Media:
                    <input name="socialMedia" value={socialMedia}  placeholder="Social Media" />
                  </label>
                </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileDJProfile;
