import { Modal, Row, Col, Stack } from 'react-bootstrap';
import { QRCodeSVG } from 'qrcode.react';

// Props
interface CouponModalProps {
  show: boolean;
  onHide: () => void;
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

// Helper component to create those styled info blocks
const InfoBlock = ({ label, value }: { label: string; value: string | number }) => (
  <div
    className="p-3 rounded"
    style={{
      backgroundColor: 'var(--bs-gray-100, #f8f9fa)',
      border: '1px solid var(--bs-gray-200, #e9ecef)',
    }}
  >
    <p className="text-muted mb-1" style={{ fontSize: '0.875rem', fontWeight: 500 }}>
      {label}
    </p>
    <p className="fw-semibold mb-0" style={{ fontSize: '1rem', color: 'var(--bs-gray-900, #212529)' }}>
      {value}
    </p>
  </div>
);

export const CouponModal = ({
  show,
  onHide,
  eventName,
  studentName,
  couponData,
}: CouponModalProps) => {
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
    console.error('Failed to parse coupon data:', e);
  }

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header
        closeButton
        className="border-bottom"
        style={{
          backgroundColor: 'var(--bs-light, #f8f9fa)',
          borderColor: 'var(--bs-gray-300, #dee2e6)',
        }}
      >
        <Modal.Title className="w-100 text-center h5 mb-0 fw-semibold">
          {eventName}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-4">
        {/* Stack adds vertical spacing (gap) between elements */}
        <Stack gap={4}>
          {/* 1. QR Code (centered with shadow) */}
          <div className="d-flex justify-content-center">
            <div
              className="bg-white p-4 rounded shadow-sm d-inline-block"
              style={{
                border: '2px solid var(--bs-gray-200, #e9ecef)',
              }}
            >
              <QRCodeSVG
                value={couponData}
                size={220}
                level="H"
                includeMargin={true}
                bgColor="#ffffff"
                fgColor="#000000"
              />
            </div>
          </div>

          {/* 2. Student Name (with border and better styling) */}
          <div
            className="text-center pb-3"
            style={{
              borderBottom: '2px solid var(--bs-gray-300, #dee2e6)',
            }}
          >
            <p
              className="text-muted mb-2 text-uppercase"
              style={{ fontSize: '0.75rem', letterSpacing: '0.5px', fontWeight: 600 }}
            >
              Student Name
            </p>
            <p
              className="h4 fw-bold mb-0"
              style={{ color: 'var(--bs-dark, #212529)' }}
            >
              {studentName}
            </p>
          </div>

          {/* 3. Dynamic Info Section */}
          {(couponInfo.floor || couponInfo.timeSlot || couponInfo.batch || couponInfo.counter) && (
            <Stack gap={3}>
              {/* Floor and Counter (side-by-side) */}
              {(couponInfo.floor || couponInfo.counter) && (
                <Row className="g-3">
                  {couponInfo.floor && (
                    <Col xs={6}>
                      <InfoBlock
                        label="Floor"
                        value={couponInfo.floor === 1 ? '1st Floor' : '2nd Floor'}
                      />
                    </Col>
                  )}
                  {couponInfo.counter && (
                    <Col xs={6}>
                      <InfoBlock label="Counter" value={`Counter ${couponInfo.counter}`} />
                    </Col>
                  )}
                </Row>
              )}

              {/* Time Slot (full width) */}
              {couponInfo.timeSlot && (
                <InfoBlock label="Time Slot" value={couponInfo.timeSlot} />
              )}

              {/* Batch (full width) */}
              {couponInfo.batch && <InfoBlock label="Batch" value={couponInfo.batch} />}
            </Stack>
          )}
        </Stack>
      </Modal.Body>

      {/* Optional Footer with action button */}
      <Modal.Footer
        className="border-top justify-content-center"
        style={{
          backgroundColor: 'var(--bs-light, #f8f9fa)',
          borderColor: 'var(--bs-gray-300, #dee2e6)',
        }}
      >
        <button
          className="btn btn-primary px-4"
          onClick={onHide}
          style={{ fontWeight: 500 }}
        >
          Close
        </button>
      </Modal.Footer>
    </Modal>
  );
};
