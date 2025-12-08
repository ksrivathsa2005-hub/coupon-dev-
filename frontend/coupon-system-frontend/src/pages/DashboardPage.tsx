import React, { useEffect, useState } from 'react';
import EventCard from '../components/EventCard';
import type { EventData } from '../components/EventCard';
import QRCodeModal from '../components/QRCodeModal'; 

// 1. Define Interface for Backend Event
interface BackendEvent {
  event_id: number;
  name: string;
  description: string;
  date: string;
  status: string;
  created_by: number | null;
  created_at: string;
}

// 2. Define Interface for User Slot
interface UserSlot {
  batch: string;
  floor: string;
  time: string;
}

const DashboardPage: React.FC = () => {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // --- State for Modal ---
  const [showModal, setShowModal] = useState(false);
  const [qrToken, setQrToken] = useState<string>('');
  const [selectedEventName, setSelectedEventName] = useState<string>('');

  // --- State for User Slot (Initialize as null) ---
  const [userSlot, setUserSlot] = useState<UserSlot | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('http://localhost:3000/events/active');
        if (!response.ok) throw new Error('Failed to fetch events');
        const data: BackendEvent[] = await response.json();

        const formattedEvents: EventData[] = data.map((item) => ({
          id: item.event_id.toString(),
          title: item.name,
          description: item.description,
          validDate: new Date(item.date).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
          })
        }));
        setEvents(formattedEvents);
        
        // --- SIMULATE FETCHING USER SLOT ---
        // If the backend sends slot info, set it here.
        // For now, it stays null, so the box won't show.
        // Uncomment the line below to test "showing" the slot:
        //setUserSlot({ batch: "2022 (Seniors)", floor: "1st Floor", time: "2:00 PM - 2:45 PM" });

      } catch (err) {
        console.error(err);
        setError('Could not load events.');
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleGetQR = async (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (event) setSelectedEventName(event.title);

    try {
      const response = await fetch('http://localhost:3000/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: 1, // HARDCODED for now
          event_id: parseInt(eventId)
        })
      });

      const result = await response.json();

      if (!response.ok) {
        // Special check: If backend says it's already redeemed
        if (result.isRedeemed) {
            alert(" Access Denied: This coupon has already been used.");
        } else {
            alert(result.error || "Registration failed");
        }
        return;
      }

      // If success (200 or 201), show the QR code
      setQrToken(result.data.qr_token);
      setShowModal(true);

    } catch (err) {
      console.error("API Error:", err);
      alert("Something went wrong connecting to the server.");
    }
  };
  

  const handleCloseModal = () => {
    setShowModal(false);
    setQrToken('');
  };
  
  if (loading) return <div className="container py-4 text-center">Loading events...</div>;
  if (error) return <div className="container py-4 text-center text-danger">{error}</div>;

  return (
    <div className="container py-4">
      <div className="mb-4">
        <h1 className="fw-bold">Hello, Student User! 👋</h1>
        <p className="text-secondary">Here are the available mess events for you</p>
      </div>

      {/* --- CONDITIONAL SLOT DISPLAY --- */}
      {/* Only render this block if userSlot is NOT null */}
      {userSlot && (
        <div className="bg-light p-4 rounded mb-5 border shadow-sm" style={{ backgroundColor: '#f8f9fa' }}>
          <h5 className="fw-bold mb-3" style={{ color: '#2c3e50' }}>Your Assigned Slot:</h5>
          <div className="d-flex flex-wrap gap-4">
            <div>
              <span className="fw-bold text-secondary d-block small">Batch</span>
              <span>{userSlot.batch}</span>
            </div>
            <div>
              <span className="fw-bold text-secondary d-block small">Floor</span>
              <span>{userSlot.floor}</span>
            </div>
            <div>
              <span className="fw-bold text-secondary d-block small">Time</span>
              <span>{userSlot.time}</span>
            </div>
          </div>
        </div>
      )}

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
        eventName={selectedEventName}
        qrToken={qrToken}
      />
    </div>
  );
};

export default DashboardPage;