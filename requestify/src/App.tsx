import React, { useState } from 'react';
import './App.css';
import SignUp from './components/SignUp';
import Login from './components/Login';
import Header from './components/Header'; // Import the Header component

const App: React.FC = () => {
    const [isSignUp, setIsSignUp] = useState<boolean>(false); // Manage state to toggle between login and sign-up

    // Optional: Logging state changes to help debug the issue
    console.log('isSignUp:', isSignUp);

    return (
        <div className="App">
            {/* Add the Header component with the Requestify logo */}
            <Header />

            {/* Login/SignUp Form */}
            <div className="form-container">
                {/* Pass setIsSignUp as a prop to Login and SignUp so it can trigger SignUp form */}
                {isSignUp ? <SignUp /> : <Login setIsSignUp={setIsSignUp} />}
            </div>
        </div>
    );
};

export default App;
