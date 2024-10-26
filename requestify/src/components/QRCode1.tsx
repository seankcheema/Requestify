import React from 'react';

interface QRCodeProps {
    qrCodeData: string;
}

const QRCode: React.FC<QRCodeProps> = ({ qrCodeData }) => {
    return (
        <div className="qr-code-container">
            <h3>Scan to Visit</h3>
            <img
                src={`data:image/png;base64,${qrCodeData}`}
                alt="QR Code"
                style={{ width: '200px', height: '200px' }}
            />
        </div>
    );
};

export default QRCode;
