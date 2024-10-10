import React from 'react';
import './App.css';  // Ensure CSS is imported
import Header from './components/Header';
import Queue from './components/Queue';
import Notifications from './components/Notifications';
import Profile from './components/Profile';
import QRCode from './components/QRCode';
import SendMessage from './components/SendMessage';

const App: React.FC = () => {
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

export default App;
