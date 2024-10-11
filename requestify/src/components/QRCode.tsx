import React, { useState } from 'react';
import './Dashboard.css';

// Popup component for larger QR code
const QRCodePopup: React.FC<{ show: boolean; onClose: () => void }> = ({ show, onClose }) => {
  if (!show) return null;

  return (
    <div className="popup-overlay">
      <div className="qr-popup-content">
        <button className="close-btn" onClick={onClose}>×</button>
        <div className="popup-qrcode">
          <img src="/assets/qrcode.png" alt="Large QR Code" className="large-qrcode-img" />
          <a href="/assets/qrcode.png" download="qrcode.png">
            <button className="download-btn">Download QR Code</button>
          </a>
        </div>
      </div>
    </div>
  );
};

const QRCode: React.FC = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handleOpenPopup = () => {
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };

  return (
    <aside className="qrcode">
      <img
        src="/assets/qrcode.png"
        alt="QR Code"
        className="qrcode-img"
        onClick={handleOpenPopup}  // Open popup on click
      />
      <QRCodePopup show={isPopupOpen} onClose={handleClosePopup} />
    </aside>
  );
};

export default QRCode;
