import React, { useState } from 'react';
import './App.css';
import SignUp from './components/SignUp';
import Login from './components/Login';

const App: React.FC = () => {
    const [isSignUp, setIsSignUp] = useState<boolean>(false); // Set default to false

    return (
        <div className="App">
            <div className="toggle-buttons">
                <button onClick={() => setIsSignUp(false)}>Login</button>
                <button onClick={() => setIsSignUp(true)}>Sign Up</button>
            </div>
            {isSignUp ? <SignUp /> : <Login />}
        </div>
    );
};

export default App;
