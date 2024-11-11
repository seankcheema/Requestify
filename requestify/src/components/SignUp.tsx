import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth'; // Firebase method
import { auth } from './firebaseConfig'; // Firebase config
import './SignUp.css';

const SignUp: React.FC = () => {
    const [email, setEmail] = useState<string>(''); // Changed from setUsername to setEmail
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [djName, setDjName] = useState<string>('');
    const [displayName, setDisplayName] = useState<string>('');
    const [location, setLocation] = useState<string>('');
    const [socialMedia, setSocialMedia] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const [djNameError, setDjNameError] = useState<string>(''); // Error state for DJ Name
    const navigate = useNavigate();
    const ipAddress = process.env.REACT_APP_API_IP;

    const goToLogin = () => {
        navigate('/login');
    };

    const handleSignUp = async (event: React.FormEvent) => {
        event.preventDefault();

        // Basic email validation
        if (!email.includes('@')) {
            setMessage('Please enter a valid email.');
            return;
        }

        if (password !== confirmPassword) {
            setMessage('Passwords do not match.');
            return;
        }

        // DJ Name validation
        if (djName.includes('/')) {
            setDjNameError('DJ Name cannot contain slashes.');
            return;
        }

        try {
            // Register the user with Firebase
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Get the Firebase ID token to send to the backend
            const idToken = await user.getIdToken();

            // Send additional user data along with the ID token to the Flask backend
            await axios.post(
                `http://${ipAddress}:5001/register`,
                {
                    email: email,
                    djName,
                    displayName,
                    location,
                    socialMedia,
                },
                {
                    headers: {
                        Authorization: `Bearer ${idToken}`, // Send the ID token in the header
                        'Content-Type': 'application/json',
                    },
                }
            );

            setMessage('Account created successfully!');
            goToLogin();
        } catch (error: any) {
            if (error.code === 'auth/email-already-in-use') {
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

    const handleDjNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value.includes('/')) {
            setDjNameError('DJ Name cannot contain slashes.');
        } else {
            setDjNameError('');
        }
        setDjName(value);
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
                        <label htmlFor="djName">DJ Name</label>
                        <input
                            type="text"
                            id="djName"
                            value={djName}
                            onChange={handleDjNameChange}
                            required
                            className="input-field"
                        />
                        {djNameError && <p style={{ color: 'red' }}>{djNameError}</p>}
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