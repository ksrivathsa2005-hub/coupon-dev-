import React, { useEffect, useState, useCallback } from 'react';
import EventCard from '../components/EventCard';
import type { EventData } from '../components/EventCard';
import QRCodeModal from '../components/QRCodeModal'; 

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
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [qrToken, setQrToken] = useState<string>('');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  
  // Helper to get the full object for the modal
  const selectedEvent = events.find(e => e.id === selectedEventId);

  const fetchEvents = useCallback(async () => {
    try {
      // Hardcoded student_id=2 for testing
      const response = await fetch('http://localhost:3000/events/active?student_id=2');
      
      if (!response.ok) throw new Error('Failed to fetch events');
      const data: BackendEvent[] = await response.json();

      const formattedEvents: EventData[] = data.map((item) => {
        
        let slotInfo = undefined;
        // Check if backend returned slot info (means user is registered)
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
          assignedSlot: slotInfo // Pass it to the card
        };
      });
      setEvents(formattedEvents);
    } catch (err) {
      console.error(err);
      setError('Could not load events.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleGetQR = async (eventId: string) => {
    setSelectedEventId(eventId);

    try {
      const response = await fetch('http://localhost:3000/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: 2, // Matches the fetchEvents ID
          event_id: parseInt(eventId)
        })
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.isRedeemed) alert("❌ Access Denied: This coupon has already been used.");
        else alert(result.error || "Registration failed");
        return;
      }

      setQrToken(result.data.qr_token);
      setShowModal(true);

      // Refresh the list so the Green Box appears on the card
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

  if (loading) return <div className="container py-4 text-center">Loading events...</div>;
  if (error) return <div className="container py-4 text-center text-danger">{error}</div>;

  return (
    <div className="container py-4">
      <div className="mb-4">
        <h1 className="fw-bold">Hello, Student User! 👋</h1>
        <p className="text-secondary">Here are the available mess events for you</p>
      </div>

      <h4 className="mb-3 fw-bold">Available Mess Events</h4>
      
      {events.length === 0 ? (
        <p className="text-muted">No active events found.</p>
      ) : (
        <div className="row">
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
    </div>
  );
};

export default DashboardPage;