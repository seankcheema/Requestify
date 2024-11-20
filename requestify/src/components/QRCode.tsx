// QRCode.tsx
import React, { useState } from 'react';
import './Dashboard.css';

interface QRCodeProps {
    qrCodeData: string; // Base64 encoded data for the QR code image
    djName: string;     // The DJ's name for generating the link
}

// Popup component for displaying a larger QR code
const QRCodePopup: React.FC<{ show: boolean; onClose: () => void; qrCodeData: string; djName: string }> = ({ show, onClose, qrCodeData, djName }) => {
  if (!show) return null;

  // Use REACT_APP_API_IP environment variable for constructing the full URL
  const qrCodeUrl = `http://${process.env.REACT_APP_API_IP}:5000/dj/${djName}`;

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = `data:image/png;base64,${qrCodeData}`;
    link.download = `${djName}-qrcode.png`;
    link.click();
  };

  return (
    <div className="popup-overlay">
      <div className="qr-popup-content">
        <button className="close-btn" onClick={onClose}>×</button>
        <div className="popup-qrcode">
          <img src={`data:image/png;base64,${qrCodeData}`} alt={`${djName}'s QR Code`} className="large-qrcode-img" />
          <button className="download-btn" onClick={handleDownload}>Download QR Code</button>
          <p className="qr-link-text">Scan to visit {djName}'s page:</p>
          <a href={qrCodeUrl} target="_blank" rel="noopener noreferrer" className="qr-link">{qrCodeUrl}</a>
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
        src={`data:image/png;base64,${qrCodeData}`}
        alt="QR Code"
        className="qrcode-img"
        onClick={handleOpenPopup}  // Open popup on click
      />
      <p className="qr-code-caption">QR Code</p>
      <QRCodePopup show={isPopupOpen} onClose={handleClosePopup} qrCodeData={qrCodeData} djName={djName} />
    </aside>
  );
};

export default QRCode;
