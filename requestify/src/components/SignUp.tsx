import React, { useState } from 'react';
import axios from 'axios';
import './SignUp.css';

interface SignUpProps {
  setIsSignUpStepOne: (isSignUpStepOne: boolean) => void; // Keep the prop
}

const SignUp: React.FC<SignUpProps> = ({ setIsSignUpStepOne }) => {
  const [username, setUsername] = useState<string>(''); 
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  const handleSignUp = async (event: React.FormEvent) => {
    event.preventDefault();
    
    // Ensure the username contains "@" symbol
    if (!username.includes('@')) {
      setMessage('Username must include "@" symbol');
      return;
    }

    // Ensure the passwords match
    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }
    
    try {
      // Send only 'username' and 'password' to the backend
      const response = await axios.post('http://localhost:5001/register', {
        username, 
        password,
      });
      
      setMessage(response.data.message);
      setIsSignUpStepOne(false); // Proceed to the next step
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
        <form onSubmit={handleSignUp} className='form'>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
          <div className="form-group">
            <label htmlFor="confirm-password">Re-enter Password</label>
            <input
              type="password"
              id="confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="next-button">Sign Up</button>
        </form>
        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
};

export default SignUp;
