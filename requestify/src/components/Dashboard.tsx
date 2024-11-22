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
import { useDJ } from './DJContext';
//Imports required for the dashboard

//Stores the fetched profile information for usage
const Dashboard: React.FC = () => {
    const [profileData, setProfileData] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const navigate = useNavigate();
    const { djName: paramDJName } = useParams<{ djName: string }>();
    const auth = getAuth();
    const ipAddress = process.env.REACT_APP_API_IP;

    //Uses the DJ context to mange the DJs data
    const { djName, setDJName, setDisplayName } = useDJ();

    //Function that actually fetches the profile data
    const fetchProfileData = async (user: User | null) => {
        if (!user) return;

        try {
            const response = await axios.get(`http://${ipAddress}:5001/user/${user.email}`);
            setProfileData(response.data);

            //Set djName and displayName in the local storage
            setDJName(response.data.djName);
            setDisplayName(response.data.displayName);

            //Redirect to the correct DJ dashboard if necessary
            if (response.data.djName && response.data.djName !== paramDJName) {
                navigate(`/dashboard/${response.data.djName}`, { replace: true });
            }
        } catch (error) {
            console.error('Error fetching profile data:', error);
        } finally {
            setLoading(false);
        }
    };

    //Listens for Firebase authentication state changes and routes user to /login if they are logged out
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            console.log('Auth state changed:', user ? user.email : 'No user');
            
            if (user) {
                fetchProfileData(user);
            } else {
                navigate('/login');
            }
        });

        return () => unsubscribe();
    }, [auth, navigate, paramDJName]);

    //Handles the DJ logout
    const handleLogout = async () => {
        const confirmed = window.confirm('Are you sure you want to logout? Your track queue, track history, and tip notifcations will be cleared.');
        if (!confirmed) return;

        //Try function to sign out the user and delete their current tracks
        try {
            //Deletes the tracks
            await axios.delete(`http://${ipAddress}:5001/tracks/delete-all`, {
                data: { djName: profileData.djName }
            });

            //Signs out the user
            await signOut(auth);
            console.log('User signed out successfully');
            navigate('/login');
        } catch (error) {
            console.error('Error deleting tracks:', error);
        }

        //Try function to delete the users track history
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
                
                //Clears the localStorage
                localStorage.removeItem('djName');
                localStorage.removeItem('displayName');
                
                //Clears the profile data and navigates back to the login page
                setProfileData(null);
                setDJName('');
                setDisplayName('');
                navigate('/login');
            })
            .catch((error) => {
                console.error('Error logging out:', error);
            });
    };

    //Function to update the DJs profile data locally if it is changed
    const updateProfileData = (updatedData: any) => {
        setProfileData((prevData: any) => ({ ...prevData, ...updatedData }));
    };

    return (
        <div className="container">
            {/*Logout button*/}
            <div className="logout-container">
                <button onClick={handleLogout}>Logout</button>
            </div>
            <Header />
            <div className="main-content">
                {/*Show loading if data is being fetched*/}
                {loading ? (
                    <div className="loading">Loading...</div>
                ) : (
                    <>
                        {/*Queue*/}
                        {profileData && <Queue djName={profileData.djName} />}

                        {/*Notifications*/}
                        <Notifications 
                            djName={profileData.djName} 
                        />

                        {/*Profile and QR Code, updating profile data feature*/}
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
                                        updateProfileData={updateProfileData}
                                    />
                                    {profileData.qrCode && (
                                        <QRCode qrCodeData={profileData.qrCode} djName={profileData.djName} />
                                    )}
                                </>
                            )}

                            {/*SendMessage*/}
                            {profileData?.djName && <SendMessage djName={profileData.djName} />}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Dashboard;