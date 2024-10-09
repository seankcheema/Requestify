import React from 'react';

const Profile: React.FC = () => {
  return (
    <aside className="profile">
      <img src="/assets/profile.png" alt="Profile" className="profile-img" />
      <p>Profile</p>
      <img src="/assets/qrcode.png" alt="QR Code" className="qrcode" />
      <button className="send-message">Send a message</button>
    </aside>
  );
}

export default Profile;
