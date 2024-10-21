import React, { useState } from 'react';
import './App.css';  // Ensure CSS is imported
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

const App: React.FC = () => {
    const [isSignUp, setIsSignUp] = useState<boolean>(true);
    
  return (
    <div className="App">
      {/* <MobileHome /> */}
      <MobilePayment />
    </div>
    // <div className="container">
    //   <Header />
    //   <div className="main-content">
    //     <Queue />
    //     <Notifications />
    //     <div className='mini-tiles'>
    //       <Profile />
    //       <QRCode />
    //       <SendMessage />
    //     </div>
    //   </div>
    // </div>
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