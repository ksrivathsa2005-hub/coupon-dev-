import React,{useEffect,useState} from 'react';
import EventCard from '../components/EventCard';
import type { EventData } from '../components/EventCard';

interface Events {
  event_id: number;
  name: string;
  description: string;
  date: string; // ISO string like "2025-12-19T18:30:00.000Z"
  status: string;
  created_by: number | null;
  created_at: string;
}

const DashboardPage: React.FC = () => {
  // 2. State to store the events list and loading status
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('http://localhost:3000/events/active');
        
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }

        const data: Events[] = await response.json();

        const formattedEvents: EventData[] = data.map((item) => ({
          id: item.event_id.toString(), // Frontend expects a string ID
          title: item.name,             // Backend "name" -> Frontend "title"
          description: item.description,
          // Format the date (e.g., "Dec 19, 2025")
          validDate: new Date(item.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })
        }));

        setEvents(formattedEvents);
      } catch (err) {
        console.error(err);
        setError('Could not load events. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []); // Empty dependency array means this runs once on load

  // Handler for the button
  const handleGetQR = (eventId: string) => {
    alert(`Opening QR code for event ID: ${eventId}`);
  };

  // 5. Render Loading or Error states if needed
  if (loading) {
    return <div className="container py-4 text-center">Loading events...</div>;
  }

  if (error) {
    return <div className="container py-4 text-center text-danger">{error}</div>;
  }

  return (
    <div className="container py-4">
      <div className="mb-4">
        <h1 className="fw-bold">Hello, Student User! 👋</h1>
      </div>

      <h4 className="mb-3 fw-bold">Available Mess Events</h4>
      
      {/* 6. Check if there are no events */}
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
    </div>
  );
};

export default DashboardPage;