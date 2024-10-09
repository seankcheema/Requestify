import React from 'react';

const Notifications: React.FC = () => {
  return (
    <section className="notifications">
      <h2>Notifications</h2>
      <div className="notification-item">$5 tip received <span className="time">10:42 PM</span></div>
      <div className="notification-item">$10 tip received <span className="time">10:39 PM</span></div>
      <div className="notification-item">$2 tip received <span className="time">10:32 PM</span></div>
    </section>
  );
}

export default Notifications;
