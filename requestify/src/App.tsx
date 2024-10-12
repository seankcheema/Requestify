/*import React, { useState } from 'react';
import './App.css';
import SignUp from './components/SignUp';
import SignUpTwo from './components/SignUpTwo';
import Login from './components/Login';
import Header from './components/Header';

const App: React.FC = () => {
    const [isSignUp, setIsSignUp] = useState<boolean>(false); // Manage state to toggle between login and sign-up
    const [isSignUpStepOne, setIsSignUpStepOne] = useState<boolean>(true); // Manage state to navigate between sign-up steps

    return (
        <div className="App">
            <Header />
            
            <div className="form-container">
                {!isSignUp 
                    ? <Login setIsSignUp={setIsSignUp} /> 
                    : isSignUpStepOne 
                        ? <SignUp setIsSignUpStepOne={setIsSignUpStepOne} />
                        : <SignUpTwo />
                }
            </div>
        </div>
    );
};

export default App; */
import React from 'react';
import './App.css';
import SignUpTwo from './components/SignUpTwo';
import Header from './components/Header';

const App: React.FC = () => {
    return (
        <div className="App">
            <Header />
            <div className="form-container">
                <SignUpTwo />
            </div>
        </div>
    );
};

export default App;