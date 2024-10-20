import React, { useState } from 'react';
import axios from 'axios';
import './Login.css';

interface LoginProps {
    setIsSignUp: (isSignUp: boolean) => void;
}

const Login: React.FC<LoginProps> = ({ setIsSignUp }) => {
    const [username, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [message, setMessage] = useState<string>('');

    const handleLogin = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/login', {
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
                <form onSubmit={handleLogin} className='form'>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={username}
                            onChange={e => setEmail(e.target.value)}
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
                    <a href="#" onClick={(e) => {
                        e.preventDefault();
                        setIsSignUp(true);
                    }}>
                        Create an account
                    </a>
                </p>
                {message && <p className="message">{message}</p>}
            </div>
        </div>
    );
};

export default Login;