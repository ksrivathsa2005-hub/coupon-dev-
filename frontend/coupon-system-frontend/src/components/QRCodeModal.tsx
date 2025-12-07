import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { QRCodeSVG } from 'qrcode.react'; // Using SVG for better quality

interface QRCodeModalProps {
  show: boolean;
  onHide: () => void;
  eventName: string;
  qrToken: string; // The token string from the backend
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({ show, onHide, eventName, qrToken }) => {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Your Coupon</Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="text-center p-4">
        <h5 className="mb-4 text-success fw-bold">{eventName}</h5>
        
        {/* This generates the actual QR code */}
        <div className="p-3 border rounded d-inline-block bg-white">
          <QRCodeSVG 
            value={qrToken} 
            size={200}
            level="H" // High error correction
            includeMargin={true}
          />
        </div>
        
        <p className="mt-4 text-muted small">
          This is valid for one-time use only.
        </p>
        
        <div className="mt-3 p-2 bg-light rounded text-monospace" style={{ fontSize: '0.8rem' }}>
          Show this QR code at the counter.
        </div>
      </Modal.Body>
      
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default QRCodeModal;