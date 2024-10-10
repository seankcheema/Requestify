import React, { useState } from 'react';
import './App.css';
import SignUp from './components/SignUp';
import Login from './components/Login';

const App: React.FC = () => {
    const [isSignUp, setIsSignUp] = useState<boolean>(true);

    return (
        <div className="App">
            <button onClick={() => setIsSignUp(true)}>Sign Up</button>
            <button onClick={() => setIsSignUp(false)}>Login</button>
            {isSignUp ? <SignUp /> : <Login />}
        </div>
    );
};

export default App;