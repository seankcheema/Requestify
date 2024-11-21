import React, { useEffect, useState } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
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
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const ipAddress = process.env.REACT_APP_API_IP;
  const socket = io(`http://${ipAddress}:5001`);

  const fetchPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`http://${ipAddress}:5001/api/payments/${djName}`);

      console.log('payments:', response);
      
      // If the response contains data as an array, update the state
      if (Array.isArray(response.data)) {
        setPayments(response.data);
      } else {
        setError('Received data is not an array');
      }
    } catch (error) {
      setError('Error fetching payments');
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();

    socket.on('tip_sent', (newTip) => {
      if (newTip.dj_name === djName) {
        setPayments((prevPayments) => [
          ...prevPayments,
          {
            id: newTip.paymentid,
            dj_name: newTip.dj_name,
            amount: newTip.amount,
            currency: newTip.currency,
            timestamp: new Date(newTip.timestamp).toLocaleTimeString(),
          },
        ]);
      }
    });

    // Listen for all_songs_removed event
    socket.on('all_tips_removed', (djName) => {
      if (djName === djName) {
        setPayments([]);
      }
    });

    return () => {
      socket.off('tip_sent');
      socket.off('all_tips_removed');
    };


  }, [djName]);

  return (
    <section className="notifications">
      <h2>Notifications</h2>
      <div className="notification-container">
        <div className="notification-list">
          {loading && <div>Loading...</div>}
          {error && <div>Error: {error}</div>}
          {payments.length === 0 && !loading && !error && (
            <div>No payments found</div>
          )}
          {payments.map((payment) => (
            <ul key={payment.id}>
              <div className="notification-item">
                ${payment.amount} tip received
                {/* <span className="time">
                  {new Date(payment.timestamp).toLocaleTimeString()}
                </span> */}
              </div>
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Notifications;
