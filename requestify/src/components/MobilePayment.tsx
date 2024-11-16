import React, { useEffect, useState } from 'react';
import { FaHome, FaChartLine, FaDollarSign, FaBell, FaExternalLinkAlt } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import { useDJ } from './DJContext';
import './MobilePayment.css';

const PaymentPage: React.FC = () => {
    const [productLink, setProductLink] = useState(''); // State for dynamic product link
    const navigate = useNavigate();
    const { djName: paramDJName } = useParams<{ djName: string }>();
    const { djName, setDJName, displayName, setDisplayName } = useDJ();
    const ipAddress = process.env.REACT_APP_API_IP;
    useEffect(() => {
        window.scrollTo(0, 0);  // Scroll to top (0px, 0px)
      }, []);
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
                const displayNameResponse = await fetch(`http://${ipAddress}:5001/dj/displayName/${djName}`);
                if (displayNameResponse.ok) {
                    const displayNameData = await displayNameResponse.json();
                    setDisplayName(displayNameData.displayName); 
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
    }, [djName, setDisplayName]);

    // Fetch the product link whenever djName changes
    useEffect(() => {
        const fetchProductLink = async () => {
            try {
                const productLinkResponse = await fetch(`http://${ipAddress}:5001/dj/productLink/${djName}`);
                if (productLinkResponse.ok) {
                    const productLinkData = await productLinkResponse.json();
                    setProductLink(productLinkData.productLink);
                } else {
                    console.error('Failed to fetch product link');
                }
            } catch (error) {
                console.error('Error fetching product link:', error);
            }
        };

        if (djName) {
            fetchProductLink();
        }
    }, [djName]);

    const handlePayment = () => {
        if (productLink) {
            window.open(productLink, '_blank'); // Redirects to DJ's specific payment page
        } else {
            alert('Payment link is not available for this DJ.');
        }
    };

    const goToHome = () => {
        navigate(`/dj/${paramDJName}`);
    };

    const goToActivity = () => {
        navigate(`/dj/${paramDJName}/activity`);
    };

    const goToMessage = () => {
        navigate(`/dj/${paramDJName}/message`);
    }
    return (
        <div className="mobile-container">
            <header className="mobile-header">
                <div className="header-title">
                    <img src="/assets/requestify-logo.svg" alt="Requestify Logo" className="mobile-header-logo" onClick={goToHome} />
                </div>
            </header>
            <FaBell className="bell-icon" onClick={goToMessage} />
            <main className="mobile-content">
                <div className="listening-section" onClick={() => navigate(`/dj/${paramDJName}/profile`)}>
                    <p>You are listening to <a href="#">{displayName || djName}</a></p>
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
