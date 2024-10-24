import React, { useEffect } from 'react';
import Header from './Header';
import Queue from './Queue';
import Notifications from './Notifications';
import Profile from './Profile';
import QRCode from './QRCode';
import SendMessage from './SendMessage';
import { getAuth, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const auth = getAuth();

    useEffect(() => {
        const zoom = () => {
            (document.body.style as any).zoom = '90%';
        };
        zoom();
    }, []);

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
                    <Profile />
                    <QRCode />
                    <SendMessage />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
