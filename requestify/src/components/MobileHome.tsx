import React, { useState, useEffect } from 'react';
import { FaHome, FaChartLine, FaDollarSign, FaBell } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import { useUser } from './UserContext';
import './MobileHome.css';
//Uses the correct context (user for mobile) and imports

//Sets up RequestifyLayout component and sets up navigation, variables, context, etc.
const RequestifyLayout: React.FC = () => {
    const [query, setQuery] = useState('');
    const [showConfirmation, setShowConfirmation] = useState(false);
    const navigate = useNavigate();
    const { djName: paramDJName } = useParams<{ djName: string }>();
    const { scannedDJName, setScannedDJName, scannedDisplayName, setScannedDisplayName } = useUser();

    //Sets the scanned DJName if it is different from the URL's DJ Name
    useEffect(() => {
        if (paramDJName && scannedDJName !== paramDJName) {
            setScannedDJName(paramDJName);
        }
    }, [paramDJName, scannedDJName, setScannedDJName]);

    //Fetches the DJs display name using the DJ username from the URL
    useEffect(() => {
        const fetchDisplayName = async () => {
            if (!scannedDJName) return;

            try {
                const response = await fetch(`http://localhost:5001/dj/displayName/${scannedDJName}`);
                if (response.ok) {
                    const data = await response.json();
                    setScannedDisplayName(data.displayName);
                } else {
                    console.error('Failed to fetch display name');
                }
            } catch (error) {
                console.error('Error fetching display name:', error);
            }
        };

        fetchDisplayName();
    }, [scannedDJName, setScannedDisplayName]);

    //Sends song search query to backend and alerts the user if the input box is empty
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
                setQuery('');
                setShowConfirmation(true);
                setTimeout(() => setShowConfirmation(false), 3000);
            } else {
                alert(data.message || 'Error fetching data');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to fetch song data');
        }
    };

    //Sets up the display of the mobile home page, search, dj display name, etc.
    return (
        <div className="mobile-container">
            <header className="mobile-header">
                <div className="header-title">
                    <img src="/assets/requestify-logo.svg" alt="Requestify Logo" className="mobile-header-logo" />
                </div>
            </header>

            <FaBell className="bell-icon" onClick={() => navigate(`/dj/${paramDJName}/message`)} />

            <main className="mobile-content">
                {/*DJ Display name and activity*/}
                <div className="listening-section">
                    <p>You are listening to <a href="#">{scannedDisplayName || scannedDJName}</a></p>
                </div>

                <div className="activity-button" onClick={() => navigate(`/dj/${paramDJName}/activity`)}>
                    <button style={{ color: '#00bf33' }}>View current activity</button>
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
                        
                        {/*Display confirmation message of song request*/}
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
