import React, { useState } from 'react';
import './SignUp.css';

const PaymentRegistration: React.FC = () => {
    const [message, setMessage] = useState<string>('');

    const handleFinish = (event: React.FormEvent) => {
        event.preventDefault();
        // Your form submission logic goes here
        setMessage('Form submitted successfully!');
    };

    return (
        <div className="payment-container">
            <div className="payment-form">
                <h2>Create Account</h2>
                <div className="progress-bar">
                    <div className="step completed"></div>
                    <div className="step completed"></div>
                    <div className="step active"></div>
                </div>
                <p>Some prompt to enter info to receive payments</p>
                <form onSubmit={handleFinish} className='form'>
                    <button type="button" className="form-button previous-button">Previous</button>
                    <button type="submit" className="form-button finish-button">Finish</button>
                </form>
                {message && <p className="message">{message}</p>}
            </div>
        </div>
    );
};

export default PaymentRegistration;