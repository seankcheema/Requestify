import React, { useState, useEffect } from 'react';
import { FaHome, FaChartLine, FaDollarSign, FaBell } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import { useDJ } from './DJContext';
import { User } from 'firebase/auth';
import axios from 'axios';
import './MobileHome.css';

const RequestifyLayout: React.FC = () => {
    const [profileData, setProfileData] = useState<any>(null);
    const [query, setQuery] = useState('');
    const [showConfirmation, setShowConfirmation] = useState(false); // New state for confirmation message
    const [displayName, setDisplayName] = useState(''); // State for display name
    const navigate = useNavigate();
    const { djName: paramDJName } = useParams<{ djName: string }>(); // Get djName from URL params
    const { djName, setDJName } = useDJ();
    

    // Set djName in context whenever paramDJName changes
    useEffect(() => {
        if (paramDJName) {
            setDJName(paramDJName);
        }
    }, [paramDJName, setDJName]);

    // Fetch the display name whenever djName changes
    useEffect(() => {
        const fetchDisplayName = async () => {
            try {
                const response = await fetch(`http://localhost:5001/dj/displayName/${djName}`);
                if (response.ok) {
                    const data = await response.json();
                    setDisplayName(data.displayName);
                } else {
                    console.error('Failed to fetch display name');
                }
            } catch (error) {
                console.error('Error fetching display name:', error);
            }
        };

        if (djName) {
            fetchDisplayName();
        }
    }, [djName]);

    const handleSearch = async () => {
        if (!query) {
            alert('Please enter a song name or Spotify link');
            return;
        }

        const ipAddress = process.env.REACT_APP_API_IP;

        try {
            const response = await fetch(`http://${ipAddress}:5001/search?query=${encodeURIComponent(query)}`);
            const data = await response.json();

            if (response.ok) {
                setShowConfirmation(true); // Show confirmation message
                setTimeout(() => setShowConfirmation(false), 3000); // Hide after 3 seconds
            } else {
                alert(data.message || 'Error fetching data');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to fetch song data');
        }
    };

    const goToProfile = async () => {
        const ipAddress = process.env.REACT_APP_API_IP;

        try {
            const response = await fetch(`http://localhost:5001/dj/displayName/${djName}`);
                if (response.ok) {
                    const data = await response.json();

                    navigate
                } else {
                    console.error('Failed to fetch display name');
                }
            
           
        } catch (error) {
            console.error('Error fetching profile data:', error);
        }
    };

    return (
        <div className="mobile-container">
            <header className="mobile-header">
                <div className="header-title">
                    <img src="/assets/requestify-logo.svg" alt="Requestify Logo" className="mobile-header-logo" />
                </div>
            </header>

            <FaBell className="bell-icon" onClick={() => navigate(`/dj/${paramDJName}/message`)} />

            <main className="mobile-content">
                {/* Listening Section with dynamic DJ display name */}
                <div className="listening-section" onClick={goToProfile}>
                    <p>You are listening to <a>{displayName || djName}</a></p>
                </div>

                <div className="activity-button" onClick={() => navigate(`/dj/${paramDJName}/activity`)}>
                    <button>View current activity</button>
                </div>

                <div className="request-section">
                    <div className="request-tile">
                        <h3>Request a song</h3>
                        <div className="request-input">
                            <input
                                type="text"
                                placeholder="Search by name or Spotify link"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                        </div>
                        <button onClick={handleSearch}>Submit</button>
                        
                        {/* Display confirmation message */}
                        {showConfirmation && (
                            <p className="confirmation-message">Request submitted</p>
                        )}
                    </div>
                </div>

                <div className="payment-section">
                    <div className="payment-tile" onClick={() => navigate(`/dj/${paramDJName}/payment`)}>
                        <h3>Send a tip</h3>
                        <div className="payment-options">
                            <img src="/assets/stripe.png" alt="Stripe" />
                        </div>
                    </div>
                </div>

                <footer className="mobile-footer">
                    <nav className="bottom-nav">
                        <div className="nav-item active" onClick={() => navigate(`/dj/${paramDJName}`)}>
                            <FaHome />
                            <span>Home</span>
                        </div>
                        <div className="nav-item" onClick={() => navigate(`/dj/${paramDJName}/activity`)}>
                            <FaChartLine />
                            <span>Activity</span>
                        </div>
                        <div className="nav-item" onClick={() => navigate(`/dj/${paramDJName}/payment`)}>
                            <FaDollarSign />
                            <span>Payment</span>
                        </div>
                    </nav>
                </footer>
            </main>
        </div>
    );
};

export default RequestifyLayout;
