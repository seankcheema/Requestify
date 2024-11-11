// Dashboard.tsx
import React, { useEffect, useState } from 'react';
import Header from './Header';
import Queue from './Queue';
import Notifications from './Notifications';
import Profile from './Profile';
import QRCode from './QRCode';
import SendMessage from './SendMessage';
import { getAuth, signOut, User } from 'firebase/auth';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const Dashboard: React.FC = () => {
    const [profileData, setProfileData] = useState<any>(null);
    const navigate = useNavigate();
    const { djName: paramDJName } = useParams<{ djName: string }>(); // Get djName from URL params
    const auth = getAuth();
    const ipAddress = process.env.REACT_APP_API_IP;

    useEffect(() => {
        const fetchProfileData = async (user: User | null) => {
            if (!user) return;

            try {
                const response = await axios.get(`http://${ipAddress}:5001/user/${user.email}`);
                setProfileData(response.data);

                // Redirect to /dashboard/:djName if URL's djName doesn't match
                if (response.data.djName && response.data.djName !== paramDJName) {
                    navigate(`/dashboard/${response.data.djName}`, { replace: true });
                }
            } catch (error) {
                console.error('Error fetching profile data:', error);
            }
        };

        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                fetchProfileData(user);
            } else {
                navigate('/login');
            }
        });

        return () => unsubscribe();
    }, [auth, navigate, paramDJName]);

    const handleLogout = () => {
        signOut(auth)
            .then(() => {
                console.log('User signed out successfully');
                navigate('/login');
            })
            .catch((error) => {
                console.error('Error logging out:', error);
            });
    };

   return (
    <div className="container">
        <div className="logout-container">
            <button onClick={handleLogout}>Logout</button>
        </div>
        <Header />
        <div className="main-content">
            {profileData && <Queue djName={profileData.djName} />} {/* Pass the djName prop */}
            <Notifications />
            <div className="mini-tiles">
                {profileData && (
                    <>
                        <Profile
                            email={profileData.email}
                            djName={profileData.djName}
                            displayName={profileData.displayName}
                            location={profileData.location}
                            socialMedia={profileData.socialMedia}
                        />
                        {/* Render QR Code Component if Available */}
                        {profileData.qrCode && (
                            <QRCode qrCodeData={profileData.qrCode} djName={profileData.djName} />
                        )}
                    </>
                )}
                <SendMessage />
            </div>
        </div>
    </div>
);

};

export default Dashboard;
