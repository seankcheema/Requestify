import React, { useState } from 'react';
import axios from 'axios';
import './SignUp.css';

interface SignUpProps {
  setIsSignUp: (isSignUp: boolean) => void;
}

const SignUp: React.FC<SignUpProps> = ({ setIsSignUp }) => {
  const [isSignUpStepOne, setIsSignUpStepOne] = useState<boolean>(true);
  const [username, setUsername] = useState<string>(''); 
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [djName, setDjName] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [socialMedia, setSocialMedia] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  const handleSignUpStepOne = async (event: React.FormEvent) => {
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
      });
      
      setMessage(response.data.message);
      setIsSignUpStepOne(false);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setMessage(error.response.data.message);
      } else {
        setMessage('An error occurred');
      }
    }
  };

  const handleSignUpStepTwo = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const response = await axios.post('http://localhost:5001/registername', {
        djName,
        location,
        socialMedia,
      });
      setMessage(response.data.message);
      setIsSignUp(false); // Go back to login after sign-up completion
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
          <div className={`circle ${isSignUpStepOne ? 'active' : ''}`}></div>
          <div className="line"></div>
          <div className={`circle ${!isSignUpStepOne ? 'active' : ''}`}></div>
          <div className="line"></div>
          <div className="circle"></div>
        </div>
        {isSignUpStepOne ? (
          <form onSubmit={handleSignUpStepOne} className="form">
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
            <button type="submit" className="next-button">Next</button>
          </form>
        ) : (
          <form onSubmit={handleSignUpStepTwo} className="form">
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
            <button type="submit" className="next-button">Sign Up</button>
          </form>
        )}
        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
};

export default SignUp;