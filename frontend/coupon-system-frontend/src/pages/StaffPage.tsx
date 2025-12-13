import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, ListGroup } from 'react-bootstrap';
import { QrScanner } from '../components/QrScanner';
import { useAuth } from '../context/AuthContext';
import ScanResult from '../components/ScanResult';
import VolunteerStatsModal from '../components/VolunteerStatsModal'; 
import { CalendarEvent, ChevronRight } from 'react-bootstrap-icons';
import { registrationApi, eventsApi } from '../services/api';

interface EventData {
  event_id: number;
  name: string;
  date: string;
  status: string;
}

export const StaffPage = () => {
  const { user } = useAuth();
  
  // --- UI States ---
  const [showScanner, setShowScanner] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // --- Result State ---
  const [scanResult, setScanResult] = useState<{ status: 'success' | 'error' | 'warning', message: string, studentId?: string } | null>(null);

  // --- Analytics State ---
  const [events, setEvents] = useState<EventData[]>([]);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<{id: number, name: string} | null>(null);

  // 1. Fetch Active Events (Using Service Layer)
  useEffect(() => {
    const fetchEvents = async () => {
        try {
            //   API CALL
            const data = await eventsApi.getAll();
            // Filter only ACTIVE events for the volunteer to see
            setEvents(data.filter((e: EventData) => e.status === 'active'));
        } catch(err) { 
            console.error("Failed to load events", err); 
        }
    };
    fetchEvents();
  }, []);

  // 2. Open Stats Modal
  const handleOpenStats = (event: EventData) => {
      setSelectedEvent({ id: event.event_id, name: event.name });
      setShowStatsModal(true);
  };

  // 3. Handle Scan (Using Service Layer)
  const handleScanSuccess = async (decodedText: string) => {
    setShowScanner(false);
    setLoading(true);
    setScanResult(null);

    try {
      if (!user?.user_id) throw new Error("User not authenticated");

      //   API CALL
      const data = await registrationApi.scan(decodedText, user.user_id);

      // Success
      setScanResult({
        status: 'success',
        message: 'Coupon Verified. You can serve the food.',
      });

    } catch (err: any) {
      // Error Handling
      const errorMessage = err.message || 'Invalid Token';
      const isWarning = errorMessage.toLowerCase().includes("already served");

      setScanResult({
        status: isWarning ? 'warning' : 'error',
        message: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setScanResult(null);
    setShowScanner(true);
  };

  // --- RENDER: Result Screen ---
  if (scanResult) {
    let title = 'Scan Failed';
    if (scanResult.status === 'success') title = 'Scan Successful!';
    if (scanResult.status === 'warning') title = 'Already Served';

    return (
      <ScanResult 
        result={{
          status: scanResult.status,
          title: title,
          message: scanResult.studentId 
            ? `${scanResult.message} (${scanResult.studentId})` 
            : scanResult.message
        }} 
        onScanNext={handleReset} 
      />
    );
  }

  // --- RENDER: Main Dashboard ---
  return (
    <Container className="py-5">
      <div className="text-center mb-5">
        <h2 className="fw-bold">Volunteer Scanner</h2>
        <p className="text-muted">Scan student QR codes to mark them as served.</p>
      </div>

      <Row className="justify-content-center">
        <Col xs={12} md={8} lg={6}>
          
          {/* INITIAL STATE: Start Button */}
          {!showScanner && !loading && (
            <Card className="text-center p-5 shadow-sm border-0 mb-5">
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
            <Card className="shadow-lg border-0 overflow-hidden mb-5">
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

          {/* --- ANALYTICS SECTION --- */}
          {!showScanner && !loading && (
             <div className="mt-4">
                 <h5 className="fw-bold mb-3 text-muted border-bottom pb-2">Your Analytics</h5>
                 {events.length === 0 ? (
                     <p className="text-muted small">No active events found.</p>
                 ) : (
                     <ListGroup variant="flush" className="shadow-sm rounded overflow-hidden">
                         {events.map(event => (
                             <ListGroup.Item 
                                key={event.event_id} 
                                action 
                                onClick={() => handleOpenStats(event)}
                                className="d-flex justify-content-between align-items-center py-3"
                             >
                                 <div className="d-flex align-items-center">
                                     <div className="bg-light rounded-circle p-2 me-3 text-primary">
                                         <CalendarEvent />
                                     </div>
                                     <div>
                                         <div className="fw-bold text-dark">{event.name}</div>
                                         <div className="small text-muted">Tap to view your stats</div>
                                     </div>
                                 </div>
                                 <ChevronRight className="text-muted" />
                             </ListGroup.Item>
                         ))}
                     </ListGroup>
                 )}
             </div>
          )}

        </Col>
      </Row>
      
      {/* STATS MODAL */}
      <VolunteerStatsModal 
        show={showStatsModal} 
        onHide={() => setShowStatsModal(false)} 
        eventId={selectedEvent?.id || null}
        eventName={selectedEvent?.name || ''}
      />

    </Container>
  );
};

export default StaffPage;