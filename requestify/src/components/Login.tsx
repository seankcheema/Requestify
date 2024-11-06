// Login.tsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebaseConfig'; // Firebase config
import './Login.css';

const Login: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const navigate = useNavigate();

    const goToDashboard = (djName: string) => {
        navigate(`/dashboard/${djName}`);
    };

    const handleLogin = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            // Log in using Firebase Authentication
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Get the Firebase ID token (force a fresh token)
            const idToken = await user.getIdToken(true);

            // Send the ID token to the backend for validation
            const response = await axios.post(
                'http://localhost:5001/login',
                {},
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${idToken}`,
                    },
                }
            );

            const djName = response.data.djName || user.displayName || 'default'; // Use djName from backend

            setMessage(response.data.message);
            goToDashboard(djName); // Redirect to dashboard with djName
        } catch (error: any) {
            if (axios.isAxiosError(error) && error.response) {
                setMessage(error.response.data.message);
            } else {
                setMessage('An error occurred during login.');
            }
        }
    };

    const goToCreateAccount = () => {
        navigate('/create-account');
    };

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
                    <a href="#" onClick={goToCreateAccount}>
                        Create an account
                    </a>
                </p>
                {message && <p className="message">{message}</p>}
            </div>
        </div>
    );
};

export default Login;
