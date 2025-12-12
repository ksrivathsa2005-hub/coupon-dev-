import { useState } from 'react';
import { CouponModal } from '../components/CouponModal';
import { QrScanner } from '../components/QrScanner';
import { Button, Container, Row, Col, Card, Alert } from 'react-bootstrap';

export const TestEventPage = () => {
  // State to control when the modal is open or closed
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State to control scanner visibility
  const [showScanner, setShowScanner] = useState(false);
  
  // State to store scanned result
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [scanError, setScannedError] = useState<string | null>(null);

  // --- Test Data (Same as your screenshot) ---
  const eventName = "Onam Special Lunch";
  const studentName = "Student User";
  const testCouponData = {
    eventId: "evt_onam_2025",
    studentId: "user_12345",
    floor: 1,
    counter: 1,
    timeSlot: "2:00 PM – 2:45 PM",
    batch: "2022 Batch (Seniors)"
  };
  // The QR code needs the data as a string
  const couponDataString = JSON.stringify(testCouponData);
  // --- End of Test Data ---

  // Handle successful scan
  const handleScanSuccess = (decodedText: string) => {
    console.log('Scanned:', decodedText);
    setScannedData(decodedText);
    setShowScanner(false);
    setScannedError(null);
  };

  // Handle scan failure (optional)
  const handleScanFailure = (errorMessage: string) => {
    console.error('Scan error:', errorMessage);
    setScannedError(errorMessage);
  };

  // Parse scanned data for display
  let parsedData: any = null;
  if (scannedData) {
    try {
      parsedData = JSON.parse(scannedData);
    } catch (e) {
      // If it's not JSON, just display as text
      parsedData = { raw: scannedData };
    }
  }

  return (
    <Container className="py-5 min-vh-100">
      <Row className="justify-content-center">
        <Col xs={12} md={10} lg={8}>
          
          {/* Header */}
          <div className="text-center mb-5">
            <h1 className="h2 fw-bold mb-3">QR Code Test Page</h1>
            <p className="text-muted">
              Test both QR code generation and scanning functionality
            </p>
          </div>

          {/* Action Cards */}
          <Row className="g-4 mb-4">
            {/* Generate QR Code Card */}
            <Col xs={12} md={6}>
              <Card className="h-100 shadow-sm border-0">
                <Card.Body className="d-flex flex-column align-items-center justify-content-center p-4">
                  <div className="text-center mb-3">
                    <div 
                      className="rounded-circle bg-success bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-3"
                      style={{ width: '60px', height: '60px' }}
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="30" 
                        height="30" 
                        fill="currentColor" 
                        className="text-success"
                        viewBox="0 0 16 16"
                      >
                        <path d="M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2zm5 0v6h6V2H5zm6 8v6h2a1 1 0 0 0 1-1v-5h-3zm-7 6h6v-6H3v5a1 1 0 0 0 1 1z"/>
                        <path d="M2 3h1v1H2V3zm2 0h1v1H4V3z"/>
                      </svg>
                    </div>
                    <h5 className="fw-semibold mb-2">Generate QR Code</h5>
                    <p className="text-muted small mb-3">
                      Generate a test coupon QR code
                    </p>
                  </div>
                  <Button 
                    variant="success" 
                    size="lg" 
                    onClick={() => setIsModalOpen(true)}
                    className="px-4"
                  >
                    Get My QR Code
                  </Button>
                </Card.Body>
              </Card>
            </Col>

            {/* Scan QR Code Card */}
            <Col xs={12} md={6}>
              <Card className="h-100 shadow-sm border-0">
                <Card.Body className="d-flex flex-column align-items-center justify-content-center p-4">
                  <div className="text-center mb-3">
                    <div 
                      className="rounded-circle bg-primary bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-3"
                      style={{ width: '60px', height: '60px' }}
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="30" 
                        height="30" 
                        fill="currentColor" 
                        className="text-primary"
                        viewBox="0 0 16 16"
                      >
                        <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
                        <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
                      </svg>
                    </div>
                    <h5 className="fw-semibold mb-2">Scan QR Code</h5>
                    <p className="text-muted small mb-3">
                      Scan a coupon QR code with camera
                    </p>
                  </div>
                  <Button 
                    variant="primary" 
                    size="lg" 
                    onClick={() => {
                      setShowScanner(!showScanner);
                      setScannedData(null);
                      setScannedError(null);
                    }}
                    className="px-4"
                  >
                    {showScanner ? 'Hide Scanner' : 'Start Scanner'}
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Scanner Section */}
          {showScanner && (
            <Card className="shadow-sm border-0 mb-4">
              <Card.Body className="p-4">
                <h5 className="fw-semibold mb-3 text-center">QR Code Scanner</h5>
                <QrScanner 
                  onScanSuccess={handleScanSuccess}
                  onScanFailure={handleScanFailure}
                />
                {scanError && (
                  <Alert variant="warning" className="mt-3 mb-0">
                    <small>{scanError}</small>
                  </Alert>
                )}
              </Card.Body>
            </Card>
          )}

          {/* Scanned Result Section */}
          {scannedData && (
            <Card className="shadow-sm border-0 border-start border-4 border-success">
              <Card.Body className="p-4">
                <div className="d-flex align-items-center mb-3">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="24" 
                    height="24" 
                    fill="currentColor" 
                    className="text-success me-2"
                    viewBox="0 0 16 16"
                  >
                    <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
                  </svg>
                  <h5 className="fw-semibold mb-0">Scan Successful!</h5>
                </div>
                
                {parsedData && parsedData.raw ? (
                  <div>
                    <p className="text-muted small mb-2">Raw Data:</p>
                    <code className="d-block p-3 bg-light rounded" style={{ fontSize: '0.875rem' }}>
                      {scannedData}
                    </code>
                  </div>
                ) : parsedData ? (
                  <div>
                    <p className="text-muted small mb-2">Scanned Coupon Data:</p>
                    <div className="bg-light p-3 rounded">
                      {Object.entries(parsedData).map(([key, value]) => (
                        <div key={key} className="d-flex justify-content-between py-1 border-bottom border-white">
                          <span className="text-muted small fw-medium">{key}:</span>
                          <span className="small fw-semibold">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                <Button 
                  variant="outline-success" 
                  size="sm" 
                  onClick={() => setScannedData(null)}
                  className="mt-3"
                >
                  Clear Result
                </Button>
              </Card.Body>
            </Card>
          )}

        </Col>
      </Row>

      {/* Coupon Modal */}
      <CouponModal
        show={isModalOpen}
        onHide={() => setIsModalOpen(false)}
        eventName={eventName}
        studentName={studentName}
        couponData={couponDataString}
      />
    </Container>
  );
};

export default TestEventPage;
