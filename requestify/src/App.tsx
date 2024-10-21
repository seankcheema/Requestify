import React, { useState } from 'react';
import './App.css';
import SignUp from './components/SignUp';
import Login from './components/Login';
import Header from './components/Header';

const App: React.FC = () => {
    const [isSignUp, setIsSignUp] = useState<boolean>(false); // Manage state to toggle between login and sign-up
    
    return (
        <div className="App">
            <Header />
            <div className="form-container">
                {!isSignUp 
                    ? <Login setIsSignUp={setIsSignUp} /> 
                    : <SignUp setIsSignUp={setIsSignUp} />
                }
            </div>
        </div>
    );
};

export default App; 