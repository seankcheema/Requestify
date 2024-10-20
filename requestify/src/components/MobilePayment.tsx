import React, { useState, useRef, useEffect } from 'react';
import { FaHome, FaChartLine, FaDollarSign, FaBell, FaExternalLinkAlt } from 'react-icons/fa';
import './MobilePayment.css';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe('your_public_key_here');

const PaymentPage: React.FC = () => {
    const inputRef = useRef<HTMLInputElement>(null);

    const [amount, setAmount] = useState<number>(0);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string>('');
    const stripe = useStripe();
    const elements = useElements();

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!stripe || !elements) return;
        

        const cardElement = elements.getElement(CardElement);

        // Call your backend to create the payment intent
        const response = await fetch('http://localhost:5000/create-payment-intent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ amount: amount * 100 }), // Convert to cents
        });

        const { clientSecret } = await response.json();

        const { error } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: cardElement!,
            },
        });

        if (error) {
            setError(error.message || 'Payment failed');
        } else {
            setMessage('Payment successful!');
            setAmount(0); // Reset amount
        }
    };

    // Update input width based on amount
    useEffect(() => {
      if (inputRef.current) {
        // Set a minimum width, and expand based on input length
        const width = Math.max(50, inputRef.current.value.length > 0 ? inputRef.current.value.length * 32.5 : 50);
        inputRef.current.style.width = `${width}px`;
      }
    }, [amount]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
    
     // Allow empty string or limit to 5 digits and ensure it’s numeric
    if (value === '' || (/^[0-9]*$/.test(value) && value.length <= 5)) {
      setAmount(Number(value)); // Update state only if valid
    }
    };

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
                <form onSubmit={handleSubmit}>
                  <label className="amount-label">
                    <div className="amount-input-container">
                      <span className="dollar-sign">$</span>
                      <input
                        ref={inputRef}
                        type="tel"
                        value={amount === 0 ? "" : amount} // Show empty field when it's 0
                        placeholder="0"
                        onChange={handleChange}
                        required
                        className="amount-input"
                        onFocus={(e) => e.target.select()} // Select all text on focus
                      />
                    </div>
                  </label>
                </form>
                {error && <div className="error">{error}</div>}
                {message && <div className="success">{message}</div>}
                <div className="payment-options">
                    <img src="./assets/Apple tile.svg" alt="Apple Pay" />
                    <img src="./assets/Google tile.svg" alt="Google Pay" />
                    <img src="./assets/PayPal tile.svg" alt="PayPal" />
                </div>
          </div>
        </div>

        <div className="listening-section">
        <a href="https://support.stripe.com/" target="_blank" rel="noopener noreferrer" className="payment-help-link">
          <p>Payment Help </p>
          <FaExternalLinkAlt className='external-link' />
        </a>
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

const MobilePayment: React.FC = () => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentPage />
    </Elements>
  );
};

export default MobilePayment;
