import React, { useEffect, useState } from 'react';
import { getAuth, User } from 'firebase/auth';
import { useNavigate, useParams } from 'react-router-dom';
import { FaHome, FaChartLine, FaDollarSign, FaMap, FaUser } from 'react-icons/fa';
import axios from 'axios';
import './MobileDJProfile.css';

const MobileDJProfile: React.FC = () => {
  const [profileData, setProfileData] = useState<any>(null);
  const navigate = useNavigate();
  const { djName: paramDJName } = useParams<{ djName: string }>();
  const auth = getAuth();
  const ipAddress = process.env.REACT_APP_API_IP;

  useEffect(() => {
    window.scrollTo(0, 0);  // Scroll to top (0px, 0px)
  }, []);
  // Fetch profile data once the user is authenticated
  useEffect(() => {
    const fetchProfileData = async (user: User | null) => {
      if (!user) return;

      try {
        const response = await axios.get(`http://${ipAddress}:5001/user/${user.email}`);
        setProfileData(response.data);
      } catch (error) {
        console.error('Error fetching profile data:', error);
      }
    };

    // Wait for auth state change
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchProfileData(user);  // Fetch profile if user is signed in
      } else {
        navigate('/login');  // Redirect to login if no user is signed in
      }
    });

    // Cleanup the listener on component unmount
    return () => unsubscribe();
  }, [auth, navigate, ipAddress]);

  // Display loading state if profile data is not yet available
  if (!profileData) {
    return <div><header className="mobile-header">
    <div className="header-title">
        <img src="/assets/requestify-logo.svg" alt="Requestify Logo" className="mobile-header-logo" />
    </div>
</header>
<footer className="mobile-footer">
        <nav className="bottom-nav">
          <div className="nav-item" onClick={() => navigate(`/dj/${profileData.djName}`)}>
            <FaHome />
            <span>Home</span>
          </div>
          <div className="nav-item" onClick={() => navigate(`/dj/${profileData.djName}/activity`)}>
            <FaChartLine />
            <span>Activity</span>
          </div>
          <div className="nav-item" onClick={() => navigate(`/dj/${profileData.djName}/payment`)}>
            <FaDollarSign />
            <span>Payment</span>
          </div>
        </nav>
      </footer></div>
;
  }

  return (
    <div className="mobile-profile-container">
        <header className="mobile-header">
                <div className="header-title">
                    <img src="/assets/requestify-logo.svg" alt="Requestify Logo" className="mobile-header-logo" />
                </div>
            </header>
          <div className="mobile-profile-content">
            <img src="/assets/profile.png" alt="Profile" className="mobile-profile-img" />
              {/* Back button to switch back to profile view without saving */}
              {/* <button type="button" onClick={handleBackClick} className="back-btn">← Back</button> */}
              
              <h2>
                {profileData.displayName}
              </h2>
              <p>
                <FaMap /> {profileData.location}
              </p>
              <p>
                <FaUser /> {profileData.socialMedia}
              </p>
        </div>


      <footer className="mobile-footer">
        <nav className="bottom-nav">
          <div className="nav-item" onClick={() => navigate(`/dj/${profileData.djName}`)}>
            <FaHome />
            <span>Home</span>
          </div>
          <div className="nav-item" onClick={() => navigate(`/dj/${profileData.djName}/activity`)}>
            <FaChartLine />
            <span>Activity</span>
          </div>
          <div className="nav-item" onClick={() => navigate(`/dj/${profileData.djName}/payment`)}>
            <FaDollarSign />
            <span>Payment</span>
          </div>
        </nav>
      </footer>
    </div>
  );
};

export default MobileDJProfile;
