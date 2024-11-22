import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth'; // Firebase method
import { auth } from './firebaseConfig'; // Firebase config
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

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
    const storage = getStorage(); // Initialize storage

    const [profilePicture, setProfilePicture] = useState<File | null>(null);
    const [profilePictureError, setProfilePictureError] = useState<string>('');
    const [previewImage, setPreviewImage] = useState<string | null>(null);


    const goToLogin = () => {
        navigate('/login');
    };

    const handleSignUp = async (event: React.FormEvent) => {
        event.preventDefault();
    
        // Basic validation
        if (!email.includes('@')) {
            setMessage('Please enter a valid email.');
            return;
        }
        if (password !== confirmPassword) {
            setMessage('Passwords do not match.');
            return;
        }
        if (djName.includes('/')) {
            setDjNameError('DJ Name cannot contain slashes.');
            return;
        }
    
        try {
            // Register the user with Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
    
            // Upload profile picture if it exists
            let profilePictureURL = '';
            if (profilePicture) {
                const storageRef = ref(storage, `gs://requestify-9b333.firebasestorage.app/profilePictures`);
                await uploadBytes(storageRef, profilePicture);
                profilePictureURL = await getDownloadURL(storageRef);
            }
    
            // Get ID token for backend
            const idToken = await user.getIdToken();
    
            // Send user data along with profile picture URL to backend
            await axios.post(
                `http://${ipAddress}:5001/register`,
                {
                    email: email,
                    djName,
                    displayName,
                    location,
                    socialMedia,
                    profilePictureURL, // Send the profile picture URL
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
    const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files ? e.target.files[0] : null;
    
        if (file) {
            // Validate file type (check for image file)
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
            if (!allowedTypes.includes(file.type)) {
                setProfilePictureError('Please upload a valid image (JPG, PNG, or GIF).');
                setProfilePicture(null);
                setPreviewImage(null);
                return;
            }
    
            // Set the profile picture and preview image
            setProfilePicture(file);
            setProfilePictureError('');
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result as string); // Generate the preview URL
            };
            reader.readAsDataURL(file);
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
                    <div className="form-group">
                    <label htmlFor="profilePicture">Profile Picture</label>
    <input
        type="file"
        id="profilePicture"
        onChange={handleProfilePictureChange}
        accept="image/*"
        className="input-field"
    />
    {profilePictureError && <p style={{ color: 'red' }}>{profilePictureError}</p>}
</div>

{previewImage && (
    <div className="image-preview-container">
        <img src={previewImage} alt="Profile Preview" className="image-preview" />
    </div>
)}

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