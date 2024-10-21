import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useParams } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import Queue from './components/Queue';
import Notifications from './components/Notifications';
import Profile from './components/Profile';
import QRCode from './components/QRCode';
import SendMessage from './components/SendMessage';
import SignUp from './components/SignUp';
import Login from './components/Login';
import MobileHome from './components/MobileHome';
import MobilePayment from './components/MobilePayment';
import MobileActivity from './components/MobileActivity';

// const MobileHomeWithId: React.FC = () => {
//     const { id } = useParams<{ id: string }>(); // Get the id from the URL
//     return <MobileHome id={id} />;
// };

// const MobilePaymentWithId: React.FC = () => {
//     const { id } = useParams<{ id: string }>(); // Get the id from the URL
//     return <MobilePayment id={id} />;
// };

const App: React.FC = () => {
    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/create-account" element={<SignUp />} />
                    <Route path="/0" element={<MobileHome />} />
                    <Route path="/0/payment" element={<MobilePayment />} />
                    <Route path="/0/activity" element={<MobileActivity />} />
                </Routes>
            </div>
        </Router>
    );
}

// return (
//         <div className="App">
//             <button onClick={() => setIsSignUp(true)}>Sign Up</button>
//             <button onClick={() => setIsSignUp(false)}>Login</button>
//             {isSignUp ? <SignUp /> : <Login />}
//         </div>
//     );

export default App;