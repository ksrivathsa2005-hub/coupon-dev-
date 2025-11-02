import React from 'react';
import { Button } from 'react-bootstrap';
import { QrCodeScan } from 'react-bootstrap-icons';
import colors from '../../assets/constants/colors'; 

interface QrButtonProps {
  text: string;
  onClick: () => void;
}

const QrButton: React.FC<QrButtonProps> = ({ text, onClick }) => {
  return (
    <Button
      variant="success"
      size="lg"
      className="w-100 d-flex align-items-center justify-content-center"
      style={{ backgroundColor: colors.primary.main, border: 'none' }}
      onClick={onClick}
    >
      <QrCodeScan className="me-2" />
      <span>{text}</span>
    </Button>
  );
};

export default QrButton;