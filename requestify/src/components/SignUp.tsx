import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth'; // Firebase method
import { auth } from './firebaseConfig'; // Firebase config
import './SignUp.css';

const SignUp: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [djName, setDjName] = useState<string>('');
    const [displayName, setDisplayName] = useState<string>('');
    const [location, setLocation] = useState<string>('');
    const [socialMedia, setSocialMedia] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const navigate = useNavigate();
    const ipAddress = process.env.REACT_APP_API_IP;

    const goToLogin = () => {
        navigate('/login');
    };

    const handleSignUp = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!email.includes('@')) {
            setMessage('Please enter a valid email.');
            return;
        }

        if (password !== confirmPassword) {
            setMessage('Passwords do not match.');
            return;
        }

        if (djName.includes('/')) {
            setMessage('DJ Name cannot contain slashes.');
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            const idToken = await user.getIdToken();

            const response = await axios.post(
                `http://${ipAddress}:5001/register`,
                {
                    email,
                    djName,
                    displayName,
                    location,
                    socialMedia,
                },
                {
                    headers: {
                        Authorization: `Bearer ${idToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            setMessage('Account created successfully!');
            goToLogin();
        } catch (error: any) {
            if (error.response) {
                const errorMessage = error.response.data.message;
                if (errorMessage.includes("email")) {
                    setMessage('Email is already registered.');
                } else if (errorMessage.includes("DJ name")) {
                    setMessage('DJ Name is already taken.');
                } else {
                    setMessage(errorMessage || 'An error occurred during registration.');
                }
            } else if (error.code === 'auth/email-already-in-use') {
                setMessage('Email is already registered.');
            } else if (error.code === 'auth/invalid-email') {
                setMessage('Invalid email format.');
            } else if (error.code === 'auth/weak-password') {
                setMessage('Password should be at least 6 characters.');
            } else {
                setMessage('An error occurred: ' + error.message);
            }
        }
    };

    return (
        <div
            className="sign-up-container"
            style={{
                backgroundImage: "url('assets/Login_Background_img.png')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            <div className="sign-up-form">
                <h2>Create Account</h2>
                <form onSubmit={handleSignUp} className="form">
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="input-field"
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
                            className="input-field"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="confirm-password">Re-enter Password</label>
                        <input
                            type="password"
                            id="confirm-password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="input-field"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="djName">Username</label>
                        <input
                            type="text"
                            id="djName"
                            value={djName}
                            onChange={(e) => setDjName(e.target.value)}
                            required
                            className="input-field"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="displayName">Display Name</label>
                        <input
                            type="text"
                            id="displayName"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            required
                            className="input-field"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="location">Location</label>
                        <input
                            type="text"
                            id="location"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            required
                            className="input-field"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="socialMedia">Social Media</label>
                        <input
                            type="text"
                            id="socialMedia"
                            value={socialMedia}
                            onChange={(e) => setSocialMedia(e.target.value)}
                            required
                            className="input-field"
                        />
                    </div>
                    <button type="submit" className="sign-up-button">
                        Sign Up
                    </button>
                </form>
                <p className="login" onClick={goToLogin}>
                    <a href="#">Already have an account? Login</a>
                </p>
                {message && <p className="message">{message}</p>}
            </div>
        </div>
    );
};

export default SignUp;
