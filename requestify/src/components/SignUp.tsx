import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 
import './SignUp.css';

const SignUp: React.FC = () => {
    const [username, setUsername] = useState<string>(''); 
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [djName, setDjName] = useState<string>('');
    const [location, setLocation] = useState<string>('');
    const [socialMedia, setSocialMedia] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const navigate = useNavigate();

    
    const goToLogin = () => {
        navigate('/login');
    };

    const handleSignUp = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!username.includes('@')) {
            setMessage('Username must include "@" symbol');
            return;
        }

        if (password !== confirmPassword) {
            setMessage('Passwords do not match');
            return;
        }

        try {
            const response = await axios.post('http://localhost:5001/register', {
                username,
                password,
                djName,
                location,
                socialMedia,
            });

            setMessage(response.data.message);

            goToLogin();
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                setMessage(error.response.data.message);
            } else {
                setMessage('An error occurred');
            }
        }
    };


    return (
        <div
            className="sign-up-container"
            style={{ 
                backgroundImage: "url('assets/Login_Background_img.png')", 
                backgroundSize: 'cover', 
                backgroundPosition: 'center' 
            }}
        >
            <div className="sign-up-form">
                <h2>Create Account</h2>
                <form onSubmit={handleSignUp} className="form">
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
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
                            onChange={(e) => setDjName(e.target.value)}
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
                    <button type="submit" className="sign-up-button" >Sign Up</button>
                </form>
                <p className="login" onClick={goToLogin}>
                    <a href="#">
                        Already have an account? Login
                    </a>
                </p>
                {message && <p className="message">{message}</p>}
            </div>
        </div>
    );
};

export default SignUp;