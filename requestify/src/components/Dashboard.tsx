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
    const [profileData, setProfileData] = useState<any>(null); // Store profile information
    const navigate = useNavigate();
    const { djName: paramDJName } = useParams<{ djName: string }>();
    const auth = getAuth();
    const ipAddress = process.env.REACT_APP_API_IP; // Ensure this is set in your environment variables

    // Function to fetch profile data
    const fetchProfileData = async (user: User | null) => {
        if (!user) return;

        try {
            const response = await axios.get(`http://${ipAddress}:5001/user/${user.email}`);
            setProfileData(response.data);

            // Redirect to the correct DJ dashboard if necessary
            if (response.data.djName && response.data.djName !== paramDJName) {
                navigate(`/dashboard/${response.data.djName}`, { replace: true });
            }
        } catch (error) {
            console.error('Error fetching profile data:', error);
        }
    };

    // Listen for Firebase authentication state changes
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            console.log('Auth state changed:', user ? user.email : 'No user');
            
            if (user) {
                fetchProfileData(user);
            } else {
                // If no user is logged in, navigate to the login page
                navigate('/login');
            }
        });

        return () => unsubscribe();
    }, [auth, navigate, paramDJName]);

    // Logout function
    const handleLogout = () => {
        signOut(auth)
            .then(() => {
                console.log('User signed out successfully');
                
                // Clear profile data and navigate to login page
                setProfileData(null);
                navigate('/login');
            })
            .catch((error) => {
                console.error('Error logging out:', error);
            });
    };

    // Function to update profile data locally
    const updateProfileData = (updatedData: any) => {
        setProfileData((prevData: any) => ({ ...prevData, ...updatedData }));
    };

    return (
        <div className="container">
            {/* Logout button */}
            <div className="logout-container">
                <button onClick={handleLogout}>Logout</button>
            </div>

            {/* Header section */}
            <Header />

            {/* Main content */}
            <div className="main-content">
                {/* Queue section */}
                {profileData && <Queue djName={profileData.djName} />}

                {/* Notifications section */}
                <Notifications />

                {/* Profile and QR Code section */}
                <div className="mini-tiles">
                    {profileData && (
                        <>
                            <Profile
                                email={profileData.email}
                                djName={profileData.djName}
                                displayName={profileData.displayName}
                                location={profileData.location}
                                socialMedia={profileData.socialMedia}
                                productLink={profileData.productLink}
                                updateProfileData={updateProfileData} // Pass updateProfileData as a prop
                            />
                            {profileData.qrCode && (
                                <QRCode qrCodeData={profileData.qrCode} djName={profileData.djName} />
                            )}
                        </>
                    )}

                    {/* SendMessage component */}
                    <SendMessage />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
