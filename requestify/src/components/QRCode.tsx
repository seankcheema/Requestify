import React from 'react';

const QRCode: React.FC = () => {
  return (
    <aside className="qrcode">
      <img src="/assets/qrcode.svg" alt="QR Code" className="qrcode-img" />
    </aside>
  );
}

export default QRCode;
