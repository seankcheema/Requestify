import React, { useEffect, useState } from 'react';
import { FaHome, FaChartLine, FaDollarSign, FaBell, FaExternalLinkAlt } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import { useUser } from './UserContext';
import './MobilePayment.css';
//Uses the correct context (user for mobile) and imports

//Sets up PaymentPage component and sets up navigation, variables, context, etc.
const PaymentPage: React.FC = () => {
    const [productLink, setProductLink] = useState('');
    const navigate = useNavigate();
    const { djName: paramDJName } = useParams<{ djName: string }>();
    const { scannedDJName, setScannedDJName, scannedDisplayName, setScannedDisplayName } = useUser();
    const ipAddress = process.env.REACT_APP_API_IP;

  //Sets the scanned DJName if it is different from the URL's DJ Name
    useEffect(() => {
        if (paramDJName && scannedDJName !== paramDJName) {
            setScannedDJName(paramDJName);
        }
    }, [paramDJName, scannedDJName, setScannedDJName]);

  //Fetches the DJs display name using the DJ username
    useEffect(() => {
        const fetchDisplayName = async () => {
            if (!scannedDJName) return;

            try {
                const response = await fetch(`http://${ipAddress}:5001/dj/displayName/${scannedDJName}`);
                if (response.ok) {
                    const data = await response.json();
                    setScannedDisplayName(data.displayName); // Set the display name in context
                } else {
                    console.error('Failed to fetch display name');
                }
            } catch (error) {
                console.error('Error fetching display name:', error);
            }
        };

        fetchDisplayName();
    }, [scannedDJName, setScannedDisplayName]);

    //Fetches the product link for the specific DJ
    useEffect(() => {
        const fetchProductLink = async () => {
            if (!scannedDJName) return;

            try {
                const response = await fetch(`http://${ipAddress}:5001/dj/productLink/${scannedDJName}`);
                if (response.ok) {
                    const data = await response.json();
                    setProductLink(data.productLink);
                } else {
                    console.error('Failed to fetch product link');
                }
            } catch (error) {
                console.error('Error fetching product link:', error);
            }
        };

        fetchProductLink();
    }, [scannedDJName]);

    //Redirects user to the payment page on Stripe if it exists
    const handlePayment = () => {
        if (productLink) {
            window.open(productLink, '_blank');
        } else {
            alert('Payment link is not available for this DJ.');
        }
    };

    //Navigation setup below
    const goToHome = () => {
        navigate(`/dj/${paramDJName}`);
    };

    const goToActivity = () => {
        navigate(`/dj/${paramDJName}/activity`);
    };

    const goToMessage = () => {
        navigate(`/dj/${paramDJName}/message`);
    };

    //Sets up the display of the mobile payment page
    return (
        <div className="mobile-container">
            <header className="mobile-header">
                <div className="header-title">
                    <img src="/assets/requestify-logo.svg" alt="Requestify Logo" className="mobile-header-logo" onClick={goToHome} />
                </div>
            </header>
            <FaBell className="bell-icon" onClick={goToMessage} />
            <main className="mobile-content">
                <div className="listening-section">
                    <p>You are listening to <a href="#">{scannedDisplayName || scannedDJName}</a></p>
                </div>
                <div className="payment-section">
                    <div className="payment-tile">
                        <h3>Send a Tip</h3>
                        <div className="mobile-payment-content">
                            <img src="/assets/profile.png" alt="Profile" />
                            <p className="payment-description">Support your favorite DJ with a quick tip!</p>
                            <button onClick={handlePayment} className="payment-button">
                                Pay with Stripe
                            </button>
                        </div>
                    </div>
                </div>
                <div className="listening-section">
                    <a
                        href="https://support.stripe.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="payment-help-link"
                    >
                        <p>Payment Help</p>
                        <FaExternalLinkAlt className="external-link" />
                    </a>
                </div>
            </main>
            <footer className="mobile-footer">
                <nav className="bottom-nav">
                    <div className="nav-item" onClick={goToHome}>
                        <FaHome />
                        <span>Home</span>
                    </div>
                    <div className="nav-item" onClick={goToActivity}>
                        <FaChartLine />
                        <span>Activity</span>
                    </div>
                    <div className="nav-item active">
                        <FaDollarSign />
                        <span>Payment</span>
                    </div>
                </nav>
            </footer>
        </div>
    );
};

export default PaymentPage;
