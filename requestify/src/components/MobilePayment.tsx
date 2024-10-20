import React, { useState } from 'react';
import { FaHome, FaChartLine, FaDollarSign, FaBell } from 'react-icons/fa';
import './MobilePayment.css';

const RequestifyLayout: React.FC = () => {

  return (
    <div className="mobile-container">
      {/* Header Section */}
      <header className="mobile-header">
        <div className="header-title">
            <img src="/assets/requestify-logo.svg" alt="Requestify Logo" className="mobile-header-logo" />
        </div>
      </header>

      <FaBell className="bell-icon" />

      {/* Main Content */}
      <main className="mobile-content">
        {/* Listening Section */}
        <div className="listening-section">
          <p>You are listening to <a href="#">DJ Grant</a></p>
        </div>

        {/* Payment Section */}
        <div className="payment-section">
            <div className="payment-tile">
                <h3>Send a tip</h3>
                <div className="payment-options">
                    <img src="./assets/Apple pay icon.png" alt="Apple Pay" />
                    <img src="./assets/Google pay icon.png" alt="Google Pay" />
                    <img src="./assets/PayPal Icon.png" alt="PayPal" />
                </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
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

export default RequestifyLayout;
