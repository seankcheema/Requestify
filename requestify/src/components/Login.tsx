import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 
import './Login.css';

const Login: React.FC = () => {
    const [username, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const navigate = useNavigate();

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

    const goToCreateAccount = () => {
        navigate('/create-account');
    };

    return (
        <div
            className="login-container"
            style={{ 
                backgroundImage: "url('assets/Login_Background_img.png')", 
                backgroundSize: 'cover', 
                backgroundPosition: 'center' 
            }}
        >
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