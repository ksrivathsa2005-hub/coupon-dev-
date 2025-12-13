import React, { useEffect, useState, useCallback } from 'react';
import EventCard from '../components/EventCard';
import type { EventData } from '../components/EventCard';
import QRCodeModal from '../components/QRCodeModal'; 
import { useAuth } from '../context/AuthContext';
import { Spinner, Container, Badge } from 'react-bootstrap';

interface BackendEvent {
  event_id: number;
  name: string;
  description: string;
  date: string;
  status: string;
  registration_id: number | null;
  registration_status: string | null;
  floor: string | null;
  time_start: string | null;
  time_end: string | null;
}

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [qrToken, setQrToken] = useState<string>('');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  
  const selectedEvent = events.find(e => e.id === selectedEventId);

  // Clean Name (Remove "- IIITK")
  const getCleanName = (fullName: string | undefined) => {
    if (!fullName) return "Student";
    return fullName.split('-')[0].trim();
  };

  //Date for Display
  const todayDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const fetchEvents = useCallback(async () => {
    if (!user) return;
    try {
      const response = await fetch(`http://localhost:3000/events/active?student_id=${user.user_id}`);      
      if (!response.ok) throw new Error('Failed to fetch events');
      const data: BackendEvent[] = await response.json();

      const formattedEvents: EventData[] = data.map((item) => {
        let slotInfo = undefined;
        if (item.floor && item.time_start && item.time_end) {
          const start = new Date(item.time_start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
          const end = new Date(item.time_end).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
          
          slotInfo = {
            floor: item.floor,
            time: `${start} - ${end}`
          };
        }

        return {
          id: item.event_id.toString(),
          title: item.name,
          description: item.description,
          validDate: new Date(item.date).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
          }),
          assignedSlot: slotInfo 
        };
      });
      setEvents(formattedEvents);
    } catch (err) {
      console.error(err);
      setError('Could not load events.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleGetQR = async (eventId: string) => {
    if (!user) return;
    setSelectedEventId(eventId);

    try {
      const response = await fetch('http://localhost:3000/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: user.user_id, 
          event_id: parseInt(eventId)
        })
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.isRedeemed) alert("Access Denied: This coupon has already been used.");
        else alert(result.error || "Registration failed");
        return;
      }

      setQrToken(result.data.qr_token);
      setShowModal(true);
      fetchEvents(); 

    } catch (err) {
      console.error("API Error:", err);
      alert("Something went wrong connecting to the server.");
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setQrToken('');
    setSelectedEventId(null);
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <Spinner animation="border" variant="success" />
    </div>
  );

  if (error) return <div className="container py-5 text-center text-danger"><h4>{error}</h4></div>;

  return (
    <Container className="py-5">
      
      {/*Welcome Banner*/}
      <div 
        className="p-5 rounded-4 mb-5 shadow-sm text-center text-md-start"
        style={{ 
          background: 'linear-gradient(135deg, #e8f5e9 0%, #ffffff 100%)',
          borderLeft: '5px solid #4caf50' 
        }}
      >
        <h1 className="fw-bold display-6 text-dark mb-2">
          Welcome back, <span className="text-success">{getCleanName(user?.name)}!</span> 
        </h1>
        <p className="text-secondary mb-0" style={{ fontSize: '1.1rem' }}>
          {todayDate}
        </p>
      </div>

      {/*Section Header*/}
      <div className="d-flex align-items-center mb-4">
        <h4 className="fw-bold mb-0 me-3">Available Mess Events</h4>
        <Badge bg="success" pill>{events.length}</Badge>
      </div>
      
      {/*Events Grid*/}
      {events.length === 0 ? (
        <div className="text-center py-5 bg-light rounded-3">
          <p className="text-muted mb-0">No active events found for today.</p>
        </div>
      ) : (
        <div className="row g-4">
          {events.map((event) => (
            <div key={event.id} className="col-md-6 col-lg-4">
              <EventCard 
                event={event} 
                onGetQR={handleGetQR} 
              />
            </div>
          ))}
        </div>
      )}

      <QRCodeModal 
        show={showModal}
        onHide={handleCloseModal}
        eventName={selectedEvent?.title || ''}
        qrToken={qrToken}
        slotDetails={selectedEvent?.assignedSlot}
      />
    </Container>
  );
};

export default DashboardPage;