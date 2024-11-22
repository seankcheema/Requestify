import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebaseConfig'; // Firebase config
import './Login.css';

//Sets up the state variables and IP address
const Login: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const navigate = useNavigate();
    const ipAddress = process.env.REACT_APP_API_IP;

    const goToDashboard = (djName: string) => {
        navigate(`/dashboard/${djName}`);
    };

    //Handles when a user is logging in
    const handleLogin = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            //Firebase authentication is handled here
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            //Gets the Firebase ID Token
            const idToken = await user.getIdToken(true);

            //Sends the Firebase ID Token to the backend for validation
            const response = await axios.post(
                `http://${ipAddress}:5001/login`,
                {},
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${idToken}`,
                    },
                }
            );

            const djName = response.data.djName || user.displayName || 'default';

            setMessage(response.data.message);
            goToDashboard(djName);
        } catch (error: any) {
            if (axios.isAxiosError(error) && error.response) {
                setMessage(error.response.data.message);
            } else {
                setMessage('An error occurred during login.');
            }
        }
    };

    //Redirects to the create account page if it is clicked
    const goToCreateAccount = () => {
        navigate('/create-account');
    };

    //User is required to input their username and password to login
    return (
        <div className="login-container" style={{ backgroundImage: "url('assets/Login_Background_img.png')" }}>
            <div className="login-form">
                <h2>Log in</h2>
                <form onSubmit={handleLogin} className="form">
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="login-button">Log in</button>
                </form>
                <p className="create-account">
                    <a onClick={goToCreateAccount}>
                        Create an account
                    </a>
                </p>
                {message && <p className="message">{message}</p>}
            </div>
        </div>
    );
};

export default Login;
