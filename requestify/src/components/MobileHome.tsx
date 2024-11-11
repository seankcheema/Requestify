import React, { useState, useEffect } from 'react';
import { FaHome, FaChartLine, FaDollarSign, FaBell } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import { useDJ } from './DJContext';
import './MobileHome.css';

const RequestifyLayout: React.FC = () => {
    const [query, setQuery] = useState('');
    const [searchResult, setSearchResult] = useState(null);
    const navigate = useNavigate();
    const { djName: paramDJName } = useParams<{ djName: string }>();
    const { djName, setDJName, displayName, setDisplayName, productLink, setProductLink } = useDJ();
    const ipAddress = process.env.REACT_APP_API_IP;

    // Set djName in context whenever paramDJName changes
    useEffect(() => {
        if (paramDJName) {
            setDJName(paramDJName);
        }
    }, [paramDJName, setDJName]);

    // Fetch displayName and productLink if not already set in context
    useEffect(() => {
        const fetchDJInfo = async () => {
            try {
                if (!displayName) {
                    const response = await fetch(`http://${ipAddress}:5001/dj/displayName/${djName}`);
                    if (response.ok) {
                        const data = await response.json();
                        setDisplayName(data.displayName);
                    } else {
                        console.error('Failed to fetch display name');
                    }
                }

                if (!productLink) {
                    const response = await fetch(`http://${ipAddress}:5001/dj/productLink/${djName}`);
                    if (response.ok) {
                        const data = await response.json();
                        setProductLink(data.productLink);
                    } else {
                        console.error('Failed to fetch product link');
                    }
                }
            } catch (error) {
                console.error('Error fetching DJ information:', error);
            }
        };

        if (djName) {
            fetchDJInfo();
        }
    }, [djName, displayName, setDisplayName, productLink, setProductLink]);

    const handleSearch = async () => {
        if (!query) {
            alert('Please enter a song name or Spotify link');
            return;
        }

        try {
            const response = await fetch(`http://${ipAddress}:5001/search?query=${encodeURIComponent(query)}`);
            const data = await response.json();

            if (response.ok) {
                setSearchResult(data);
            } else {
                alert(data.message || 'Error fetching data');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to fetch song data');
        }
    };

    const goToPayment = () => {
        navigate(`/dj/${paramDJName}/payment`);
    };

    const goToActivity = () => {
        navigate(`/dj/${paramDJName}/activity`);
    };

    return (
        <div className="mobile-container">
            <header className="mobile-header">
                <div className="header-title">
                    <img src="/assets/requestify-logo.svg" alt="Requestify Logo" className="mobile-header-logo" />
                </div>
            </header>

            <FaBell className="bell-icon" />

            <main className="mobile-content">
                <div className="listening-section">
                    <p>You are listening to <a href="#">{displayName || djName}</a></p> {/* Use displayName or fallback to djName */}
                </div>

                <div className="activity-button" onClick={goToActivity}>
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
                        {searchResult && (
                            <div className="search-results">
                                <h4>Search Results:</h4>
                                <pre>{JSON.stringify(searchResult, null, 2)}</pre>
                            </div>
                        )}
                        <button onClick={handleSearch}>Submit</button>
                    </div>
                </div>

                <div className="payment-section">
                    <div className="payment-tile" onClick={goToPayment}>
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
                        <div className="nav-item" onClick={goToActivity}>
                            <FaChartLine />
                            <span>Activity</span>
                        </div>
                        <div className="nav-item" onClick={goToPayment}>
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
