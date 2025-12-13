import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Spinner } from 'react-bootstrap';
import { QrScanner } from '../components/QrScanner';
import { useAuth } from '../context/AuthContext';
import ScanResult from '../components/ScanResult';

export const StaffPage = () => {
  const { user } = useAuth();
  
  const [showScanner, setShowScanner] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [scanResult, setScanResult] = useState<{ status: 'success' | 'error' | 'warning', message: string, studentId?: string } | null>(null);

  const handleScanSuccess = async (decodedText: string) => {
    setShowScanner(false);
    setLoading(true);
    setScanResult(null);

    try {
      const res = await fetch('http://localhost:3000/registrations/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            qr_token: decodedText, 
            volunteer_id: user?.user_id 
        })
      });

      const data = await res.json();

      if (res.ok) {
        // SUCCESS (Green)
        setScanResult({
            status: 'success',
            message: 'Coupon Verified. You can serve the food.',
            // Removed studentId from here as requested
        });
      } else {
        // FAILURE (Red or Yellow)
        const errorMessage = data.error || 'Invalid Token';
        
        // Check if the message indicates "Already Served"
        const isWarning = errorMessage.toLowerCase().includes("already served");

        setScanResult({
            status: isWarning ? 'warning' : 'error',
            message: errorMessage
        });
      }

    } catch (err) {
      console.error(err);
      setScanResult({ status: 'error', message: 'Server Connection Error' });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setScanResult(null);
    setShowScanner(true);
  };

  // --- CONDITIONAL RENDER: SHOW RESULT PAGE ---
  if (scanResult) {
    let title = 'Scan Failed';
    if (scanResult.status === 'success') title = 'Scan Successful!';
    if (scanResult.status === 'warning') title = 'Already Served';

    return (
      <ScanResult 
        result={{
          status: scanResult.status,
          title: title,
          // Only append Student ID if it exists (which now only happens for errors/warnings if backend sends it, or never)
          message: scanResult.studentId 
            ? `${scanResult.message} (${scanResult.studentId})` 
            : scanResult.message
        }} 
        onScanNext={handleReset} 
      />
    );
  }

  // --- STANDARD UI ---
  return (
    <Container className="py-5">
      <div className="text-center mb-5">
        <h2 className="fw-bold">Volunteer Scanner</h2>
        <p className="text-muted">Scan student QR codes to mark them as served.</p>
      </div>

      <Row className="justify-content-center">
        <Col xs={12} md={8} lg={6}>
          
          {/* INITIAL STATE */}
          {!showScanner && !loading && (
            <Card className="text-center p-5 shadow-sm border-0">
              <div className="mb-3 text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M15 12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h1.172a3 3 0 0 0 2.12-.879l.83-.828A1 1 0 0 1 6.827 3h2.344a1 1 0 0 1 .707.293l.828.828A3 3 0 0 0 12.828 5H14a1 1 0 0 1 1 1v6zM2 4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1.172a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 9.172 2H6.828a2 2 0 0 0-1.414.586l-.828.828A2 2 0 0 1 3.172 4H2z"/>
                  <path d="M8 11a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5zm0 1a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM3 6.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0z"/>
                </svg>
              </div>
              <h4>Ready to Serve?</h4>
              <Button variant="primary" size="lg" className="mt-3 px-5 rounded-pill" onClick={() => setShowScanner(true)}>
                Start Camera
              </Button>
            </Card>
          )}

          {/* LOADING STATE */}
          {loading && (
            <div className="text-center p-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3 text-muted fw-bold">Verifying Coupon...</p>
            </div>
          )}
    
          {/* SCANNER STATE */}
          {showScanner && (
            <Card className="shadow-lg border-0 overflow-hidden">
              <Card.Header className="bg-dark text-white text-center py-3 d-flex justify-content-between align-items-center">
                <span className="fw-bold">Scanning...</span>
                <Button variant="outline-light" size="sm" onClick={() => setShowScanner(false)}>Close</Button>
              </Card.Header>
              <Card.Body className="p-0 bg-black">
                <QrScanner 
                  onScanSuccess={handleScanSuccess}
                />
              </Card.Body>
            </Card>
          )}

        </Col>
      </Row>
    </Container>
  );
};

export default StaffPage;