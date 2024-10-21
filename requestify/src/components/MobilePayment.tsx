import React from 'react';
import { FaHome, FaChartLine, FaDollarSign, FaBell, FaExternalLinkAlt } from 'react-icons/fa';
import './MobilePayment.css';

const PaymentPage: React.FC = () => {
    const handlePayment = () => {
        const paymentLink = 'https://buy.stripe.com/test_3csfYZ4QjeNicCs7ss';
        window.location.href = paymentLink;  // Redirects to Stripe Payment Page
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
                    <p>You are listening to <a href="#">DJ Grant</a></p>
                </div>
                <div className="payment-section">
                    <div className="payment-tile">
                        <h3>Send a Tip</h3>
                        <p className="payment-description">Support your favorite DJ with a quick tip!</p>
                        <button onClick={handlePayment} className="payment-button">
                            Pay with Stripe
                        </button>
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
                    <div className="nav-item">
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
