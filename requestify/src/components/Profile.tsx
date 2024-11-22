import React, { useState } from 'react';
import axios from 'axios';
import './Dashboard.css';

//Sets up the IP address using the environment variable
const ipAddress = process.env.REACT_APP_API_IP;

//Sets up the prop interface for the profile
interface ProfileProps {
  email: string;
  djName: string;
  displayName: string;
  location: string;
  socialMedia: string;
  productLink: string;
  updateProfileData: (updatedData: any) => void;
}

//Sets up the component, states, and variables
const Profile: React.FC<ProfileProps> = ({ email, djName, displayName, location, socialMedia, productLink, updateProfileData }) => {
  const [isProfilePopupOpen, setIsProfilePopupOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    displayName,
    location,
    socialMedia,
    productLink,
  });

  //Handles opening and closing profile page
  const handleOpenProfilePopup = () => setIsProfilePopupOpen(true);
  const handleCloseProfilePopup = () => {
    setIsProfilePopupOpen(false);
    setIsEditing(false);
  };

  //Handles editing the profile
  const handleEditClick = () => setIsEditing(true);

  const handleBackClick = () => setIsEditing(false); // Go back to view mode without saving

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  //Handles saving the profile updates
  const handleSubmit = async () => {
    try {
      await axios.put(`http://${ipAddress}:5001/update-profile`, { ...editData, email });
      alert('Profile updated successfully');
      updateProfileData({ ...editData, email }); // Update the profile data in Dashboard
      handleCloseProfilePopup();
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  //Handles deleting the DJ accounts
  const handleDeleteAccount = async () => {
    const confirmed = window.confirm('Are you sure you want to delete your account?');
    if (!confirmed) return;

    try {
      const response = await axios.delete(`http://${ipAddress}:5001/delete-account`, { data: { email } });
      if (response.status === 200) {
        alert('Account deleted successfully');
        window.location.href = '/login';
      } else {
        alert('Failed to delete account');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account');
    }

    try {
      const response = await fetch(`http://${ipAddress}:5001/api/payments/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ djName })
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
    } catch (error) {
        console.error("Error deleting tip notifications:", error);
    }
  };

  //Displays the profile page to the DJ
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
              {isEditing ? (
                <form onSubmit={(e) => e.preventDefault()} className="edit-profile-form">
                  {/*Back button to switch back to profile view without saving*/}
                  <button type="button" onClick={handleBackClick} className="back-btn">← Back</button>
                  
                  <label>
                    Display Name:
                    <input name="displayName" value={editData.displayName} onChange={handleChange} placeholder="Display Name" />
                  </label>
                  <label>
                    DJ Location:
                    <input name="location" value={editData.location} onChange={handleChange} placeholder="Location" />
                  </label>
                  <label>
                    Social Media:
                    <input name="socialMedia" value={editData.socialMedia} onChange={handleChange} placeholder="Social Media" />
                  </label>
                  <label>
                    Product Link:
                    <input name="productLink" value={editData.productLink} onChange={handleChange} placeholder="Product Link" />
                  </label>
                  <button type="button" onClick={handleSubmit} className="edit-profile-button">Save</button>
                </form>
              ) : (
                <>
                  <h2>Welcome: {djName}</h2>
                  <p>Welcome, {displayName}!</p>
                  <p>Email: {email}</p>
                  <p>DJ Location: {location}</p>
                  <p>Social Media: {socialMedia}</p>
                  <p>Product Link: <a href={productLink} target="_blank" rel="noopener noreferrer">{productLink}</a></p>
                  <button onClick={handleEditClick} className="edit-profile-button">Edit Profile</button>
                  <button onClick={handleDeleteAccount} className="delete-account-button">Delete Account</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Profile;
