import React, { useState } from 'react';
import axios from 'axios';
import './Login.css';

interface LoginProps {
    setIsSignUp: (isSignUp: boolean) => void;
}

const Login: React.FC<LoginProps> = ({ setIsSignUp }) => {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [message, setMessage] = useState<string>('');

    const handleLogin = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            const response = await axios.post('http://localhost:5001/login', {
                username,
                password,
            });
            setMessage(response.data.message);
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                setMessage(error.response.data.message);
            } else {
                setMessage('An error occurred');
            }
        }
    };

    return (
        <div className="login-container">
            <div className="login-form">
                <h2>Log in</h2>
                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label htmlFor="username">Email</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="login-button">Log in</button>
                </form>
                <p className="create-account">
                    {/* Use onClick handler correctly to toggle sign-up form */}
                    <a href="#" onClick={() => setIsSignUp(true)}>
                        Create an account
                    </a>
                </p>
                {message && <p className="message">{message}</p>}
            </div>
        </div>
    );
};

export default Login;
