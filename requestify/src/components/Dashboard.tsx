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
import { useDJ } from './DJContext'; // Use DJContext to manage djName and displayName

const Dashboard: React.FC = () => {
    const [profileData, setProfileData] = useState<any>(null); // Store profile information
    const [loading, setLoading] = useState<boolean>(true); // Loading state for profile data
    const navigate = useNavigate();
    const { djName: paramDJName } = useParams<{ djName: string }>();
    const auth = getAuth();
    const ipAddress = process.env.REACT_APP_API_IP; // Ensure this is set in your environment variables

    const { djName, setDJName, setDisplayName } = useDJ(); // Use DJContext

    // Function to fetch profile data
    const fetchProfileData = async (user: User | null) => {
        if (!user) return;

        try {
            const response = await axios.get(`http://${ipAddress}:5001/user/${user.email}`);
            setProfileData(response.data);

            // Set djName and displayName in context and localStorage
            setDJName(response.data.djName);
            setDisplayName(response.data.displayName);

            // Redirect to the correct DJ dashboard if necessary
            if (response.data.djName && response.data.djName !== paramDJName) {
                navigate(`/dashboard/${response.data.djName}`, { replace: true });
            }
        } catch (error) {
            console.error('Error fetching profile data:', error);
        } finally {
            setLoading(false); // Set loading to false after fetching data
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

    const handleLogout = async () => {
        const confirmed = window.confirm('Are you sure you want to logout? Your track queue, track history, and tip notifcations will be cleared.');
        if (!confirmed) return;

        try {
            // Call the "delete all tracks" endpoint
            await axios.delete(`http://${ipAddress}:5001/tracks/delete-all`, {
                data: { djName: profileData.djName }
            });

            // Sign out the user
            await signOut(auth);
            console.log('User signed out successfully');
            navigate('/login');
        } catch (error) {
            console.error('Error deleting tracks:', error);
        }

        try {
            const response = await fetch(`http://${ipAddress}:5001/track-history/delete-all`, {
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
            console.error("Error deleting track history:", error);
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

          

        signOut(auth)
            .then(() => {
                console.log('User signed out successfully');
                
                // Clear localStorage
                localStorage.removeItem('djName');
                localStorage.removeItem('displayName');
                
                // Clear profile data and navigate to login page
                setProfileData(null);
                setDJName(''); // Clear the djName from context
                setDisplayName(''); // Clear the displayName from context
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
                {/* Show loading indicator if data is being fetched */}
                {loading ? (
                    <div className="loading">Loading...</div>
                ) : (
                    <>
                        {/* Queue section */}
                        {profileData && <Queue djName={profileData.djName} />}

                        {/* Notifications section */}
                        <Notifications 
                            djName={profileData.djName} 
                        />

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
                            {profileData?.djName && <SendMessage djName={profileData.djName} />}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
