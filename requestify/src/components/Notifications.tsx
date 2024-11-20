import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Dashboard.css';

interface Payment {
  id: number;
  dj_name: string;
  amount: number;
  currency: string;
  timestamp: string;
}

const Notifications: React.FC<{ djName: string }> = ({ djName }) => {
  const [payments, setPayments] = useState<Payment[]>([]);

  const fetchPayments = async () => {
    try {
      const response = await axios.get(`/api/payments/${djName}`);
      setPayments(response.data);
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [djName]);

  return (
    <section className="notifications">
      <h2>Notifications</h2>
      <div className='notification-container'>
        <div className="notification-list">
          {payments.map((payment) => (
            <li key={payment.id}>
              <div className="notification-item">${payment.amount} tip received <span className="time">{new Date(payment.timestamp).toLocaleDateString()}</span></div>
            </li>
          ))}
          <div className="notification-item">$10 tip received <span className="time">10:39 PM</span></div>
          <div className="notification-item">$2 tip received <span className="time">10:32 PM</span></div>
        </div>
      </div>
    </section>
  );
}

export default Notifications;
