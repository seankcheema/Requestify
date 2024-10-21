import React, {useEffect} from 'react';
import Header from './Header';
import Queue from './Queue';
import Notifications from './Notifications';
import Profile from './Profile';
import QRCode from './QRCode';
import SendMessage from './SendMessage';

const Dashboard: React.FC = () => {
    useEffect(() => {
        const zoom = () => {
            (document.body.style as any).zoom = '90%';
        }
        zoom();
    }, []);

    return (
        <div className="container">
        <Header />
            <div className="main-content">
            <Queue />
            <Notifications />
            <div className='mini-tiles'>
                <Profile />
                <QRCode />
                <SendMessage />
            </div>
            </div>
        </div>
    );
}

export default Dashboard;



