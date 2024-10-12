import React, { useState } from 'react';
import axios from 'axios';
import './SignUp.css';

const SignUpTwo: React.FC = () => {
  const [djName, setDjName] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [socialMedia, setSocialMedia] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  const handleSignUp = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const response = await axios.post('http://localhost:5001/registername', {
        djName,
        location,
        socialMedia,
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
          <div className="line"></div>
          <div className="circle active"></div>
          <div className="line"></div>
          <div className="circle"></div>
        </div>
        <form onSubmit={handleSignUp} className='form'>
          <div className="form-group">
            <label htmlFor="djName">DJ Name</label>
            <input
              type="text"
              id="djName"
              value={djName}
              onChange={(e) => setDjName(e.target.value)}
              required
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
            />
          </div>
          <button type="submit" className="next-button">Next</button>
        </form>
        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
};

export default SignUpTwo;