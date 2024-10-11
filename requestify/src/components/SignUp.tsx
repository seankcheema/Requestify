import React, { useState } from 'react';
import axios from 'axios';
import './SignUp.css'; // Reuse or adapt this CSS file

const SignUp: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [message, setMessage] = useState<string>('');

    const handleSignUp = async (event: React.FormEvent) => {
        event.preventDefault();
        if (password !== confirmPassword) {
            setMessage('Passwords do not match');
            return;
        }
        try {
            const response = await axios.post('http://localhost:5001/register', {
                email,
                password
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
        <div className="sign-up-container">
            <div className="sign-up-form">
                <h2>Create Account</h2>
                <div className="progress-bar">
                    <div className="circle active"></div>
                    <div className="circle"></div>
                    <div className="circle"></div>
                </div>
                <form onSubmit={handleSignUp}>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
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
                    <div className="form-group">
                        <label htmlFor="confirm-password">Re-enter Password</label>
                        <input
                            type="password"
                            id="confirm-password"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="next-button">Next</button>
                </form>
                {message && <p className="message">{message}</p>}
            </div>
        </div>
    );
};

export default SignUp;
