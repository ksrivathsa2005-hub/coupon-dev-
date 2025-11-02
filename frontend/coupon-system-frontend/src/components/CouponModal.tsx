import { Modal, Row, Col, Stack } from 'react-bootstrap';
import { QRCodeSVG } from 'qrcode.react';

// Props
interface CouponModalProps {
  show: boolean;      // Use 'show' for react-bootstrap
  onHide: () => void;   // Use 'onHide' for react-bootstrap
  eventName: string;
  studentName: string;
  couponData: string; // The JSON string for the QR code
}

// Data structure
interface CouponInfo {
  floor?: number;
  timeSlot?: string;
  batch?: string;
  counter?: number;
}

// Helper component to create those gray info blocks
const InfoBlock = ({ label, value }: { label: string, value: string | number }) => (
  <div className="bg-light p-3 rounded">
    <p className="text-muted mb-1" style={{ fontSize: '0.9rem' }}>{label}</p>
    <p className="fw-bold mb-0">{value}</p>
  </div>
);


export const CouponModal = ({ show, onHide, eventName, studentName, couponData }: CouponModalProps) => {
  let couponInfo: CouponInfo = {};

  // Try to parse the QR code data to display it
  try {
    const parsed = JSON.parse(couponData);
    couponInfo = {
      floor: parsed.floor,
      timeSlot: parsed.timeSlot,
      batch: parsed.batch,
      counter: parsed.counter,
    };
  } catch (e) {
    // If parsing fails, just don't show the extra info.
  }

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title className="w-100 text-center h5">{eventName}</Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        {/* 'Stack' adds vertical spacing (gap) between elements */}
        <Stack gap={4} className="py-3">
          
          {/* 1. QR Code (centered) */}
          <div className="d-flex justify-content-center">
            <div className="bg-white p-3 rounded shadow-sm d-inline-block">
              <QRCodeSVG
                value={couponData}
                size={200}
                level="H"
                includeMargin
              />
            </div>
          </div>
          
          {/* 2. Student Name (with border) */}
          <div className="text-center border-bottom pb-3">
            <p className="text-muted mb-1">Student Name</p>
            <p className="h5 fw-bold text-dark mb-0">{studentName}</p>
          </div>
          
          {/* 3. Dynamic Info Section */}
          <Stack gap={3}>
            {/* Floor and Counter (side-by-side) */}
            {couponInfo.floor && couponInfo.counter && (
              <Row>
                <Col>
                  <InfoBlock label="Floor" value={`${couponInfo.floor === 1 ? '1st Floor' : '2nd Floor'}`} />
                </Col>
                <Col>
                  <InfoBlock label="Counter" value={`Counter ${couponInfo.counter}`} />
                </Col>
              </Row>
            )}
            
            {/* Time Slot (full width) */}
            {couponInfo.timeSlot && (
              <InfoBlock label="Time Slot" value={couponInfo.timeSlot} />
            )}
            
            {/* Batch (full width) */}
            {couponInfo.batch && (
              <InfoBlock label="Batch" value={couponInfo.batch} />
            )}
          </Stack>

        </Stack>
      </Modal.Body>
    </Modal>
  );
};