import React, { useEffect, useState } from 'react';
import Header from './Header';
import Queue from './Queue';
import Notifications from './Notifications';
import Profile from './Profile';
import QRCode from './QRCode1';
import SendMessage from './SendMessage';
import { getAuth, signOut, User } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard: React.FC = () => {
    const [profileData, setProfileData] = useState<any>(null);
    const navigate = useNavigate();
    const auth = getAuth();

    useEffect(() => {
        const zoom = () => {
            (document.body.style as any).zoom = '90%';
        };
        zoom();

        const fetchProfileData = async (user: User | null) => {
            if (!user) return;

            try {
                const response = await axios.get(`http://localhost:5000/user/${user.email}`);
                setProfileData(response.data);
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
    }, [auth, navigate]);

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
                <Queue />
                <Notifications />
                <div className="mini-tiles">
                    {profileData && (
                        <>
                            <Profile
                                username={profileData.username}
                                djName={profileData.djName}
                                location={profileData.location}
                                socialMedia={profileData.socialMedia}
                            />
                            {/* Render QR Code Component if Available */}
                            {profileData.qrCode && (
                                <QRCode qrCodeData={profileData.qrCode} />
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
