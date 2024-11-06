// QRCode.tsx
import React, { useState } from 'react';
import './Dashboard.css';

interface QRCodeProps {
    qrCodeData: string; // URL or data for the QR code image
    djName: string;     // The DJ's name for generating the link
}

// Popup component for displaying a larger QR code
const QRCodePopup: React.FC<{ show: boolean; onClose: () => void; qrCodeData: string; djName: string }> = ({ show, onClose, qrCodeData, djName }) => {
  if (!show) return null;

  const qrCodeUrl = `https://yourdomain.com/dj/${djName}`;

  return (
    <div className="popup-overlay">
      <div className="qr-popup-content">
        <button className="close-btn" onClick={onClose}>×</button>
        <div className="popup-qrcode">
          <img src={qrCodeData} alt={`${djName}'s QR Code`} className="large-qrcode-img" />
          <a href={qrCodeData} download={`${djName}-qrcode.png`}>
            <button className="download-btn">Download QR Code</button>
          </a>
          <p>Scan to visit {djName}'s page: <a href={qrCodeUrl} target="_blank" rel="noopener noreferrer">{qrCodeUrl}</a></p>
        </div>
      </div>
    </div>
  );
};

const QRCode: React.FC<QRCodeProps> = ({ qrCodeData, djName }) => {
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
        src={qrCodeData}
        alt="QR Code"
        className="qrcode-img"
        onClick={handleOpenPopup}  // Open popup on click
      />
      <QRCodePopup show={isPopupOpen} onClose={handleClosePopup} qrCodeData={qrCodeData} djName={djName} />
    </aside>
  );
};

export default QRCode;
