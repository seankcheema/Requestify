import React from 'react';
import { FaHome, FaChartLine, FaDollarSign, FaBell, FaExternalLinkAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';  // Import useNavigate from react-router-dom
import './MobilePayment.css';

const PaymentPage: React.FC = () => {
    const navigate = useNavigate(); // Initialize useNavigate for navigation
    const handlePayment = () => {
        const paymentLink = 'https://buy.stripe.com/test_3csfYZ4QjeNicCs7ss';
        window.open(paymentLink, '_blank');  // Redirects to Stripe Payment Page
    };

    // Function to navigate to the payment page
    const goToHome = () => {
        // Replace 'some-id' with the actual ID value if needed
        navigate('/0');  // Update the route with the correct ID for your app
    };

    return (
        <div className="mobile-container">
            <header className="mobile-header">
                <div className="header-title">
                    <img src="/assets/requestify-logo.svg" alt="Requestify Logo" className="mobile-header-logo" onClick={goToHome}/>
                </div>
            </header>
            <FaBell className="bell-icon" />
            <main className="mobile-content">
                <div className="listening-section">
                    <p>You are listening to <a href="#">DJ Grant</a></p>
                </div>
                <div className="payment-section">
                    <div className="payment-tile">
                        <h3>Send a Tip</h3>
                        <div className="payment-content">
                            <img src="/assets/profile.png" alt="Profile" className="popup-profile-img" />
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
                    <div className="nav-item">
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

const MobilePayment: React.FC = () => <PaymentPage />;

export default MobilePayment;
