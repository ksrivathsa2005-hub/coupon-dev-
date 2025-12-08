import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Row, Col, Alert, Spinner, Table, Badge, Modal } from 'react-bootstrap';
import { PlusCircle, Trash, PencilSquare, XCircle } from 'react-bootstrap-icons';
import colors from '../assets/constants/colors';

interface FloorConfig {
  id: number;
  floorName: string;
  counterCount: number;
  capacityPerCounter: number;
}

interface EventData {
  event_id: number;
  name: string;
  description: string;
  date: string;
  status: string;
}

const AdminPage: React.FC = () => {
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('12:00');
  const [endTime, setEndTime] = useState('14:00');
  
  const [floors, setFloors] = useState<FloorConfig[]>([
    { id: 1, floorName: '1st Floor', counterCount: 2, capacityPerCounter: 50 }
  ]);

  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState<{type: 'success'|'danger', text: string} | null>(null);

  const [editingEventId, setEditingEventId] = useState<number | null>(null);

  const fetchEvents = async () => {
    setFetching(true);
    try {
      // Fetching ALL events (active and inactive) to manage them
        const res = await fetch('http://localhost:3000/events');      
        if(res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // --- Helper Functions ---
  const addFloor = () => {
    setFloors([...floors, { id: Date.now(), floorName: '', counterCount: 1, capacityPerCounter: 50 }]);
  };

  const removeFloor = (id: number) => {
    setFloors(floors.filter(f => f.id !== id));
  };

  const updateFloor = (id: number, field: keyof FloorConfig, value: string | number) => {
    setFloors(floors.map(f => (f.id === id ? { ...f, [field]: value } : f)));
  };

  // --- 2. Populate Form for Editing ---
  const handleEditClick = (event: EventData) => {
    setEditingEventId(event.event_id);
    setEventName(event.name);
    setDescription(event.description);
    // Extract date part from ISO string (YYYY-MM-DD)
    setEventDate(event.date.split('T')[0]); 
    
    // Note: To edit slots, you'd need a separate API call to fetch them.
    // For now, we are just editing Event Details.
    window.scrollTo(0, 0); // Scroll to top
    setMessage({ type: 'success', text: `Editing mode: ${event.name}` });
  };

  // --- 3. Cancel Edit ---
  const handleCancelEdit = () => {
    setEditingEventId(null);
    setEventName('');
    setEventDate('');
    setDescription('');
    setMessage(null);
  }

  // --- 4. Handle Delete (Soft Delete / Close) ---
  const handleDelete = async (id: number) => {
    if(!window.confirm("Are you sure you want to close/delete this event?")) return;

    try {
      const res = await fetch(`http://localhost:3000/events/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'closed' }) // Or 'deleted' depending on backend
      });

      if(res.ok) {
        setMessage({ type: 'success', text: 'Event closed successfully' });
        fetchEvents(); // Refresh list
      } else {
        throw new Error('Failed to delete');
      }
    } catch (err) {
      setMessage({ type: 'danger', text: 'Failed to close event' });
    }
  };

  // --- 5. Submit (Create or Update) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const fullDate = `${eventDate}T00:00:00.000Z`;

    try {
      if (editingEventId) {
        // --- UPDATE EXISTING EVENT ---
        const res = await fetch(`http://localhost:3000/events/${editingEventId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: eventName, description, date: fullDate })
        });
        if (!res.ok) throw new Error("Failed to update");
        setMessage({ type: 'success', text: 'Event updated successfully!' });
        setEditingEventId(null); // Exit edit mode

      } else {
        // --- CREATE NEW EVENT ---
        const eventRes = await fetch('http://localhost:3000/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: eventName, description, date: fullDate })
        });

        if (!eventRes.ok) throw new Error("Failed to create event");
        const eventData = await eventRes.json();
        const newEventId = eventData.event_id;

        // Create Slots Loop (Only for new events)
        const slotPromises: Promise<any>[] = [];
        floors.forEach(floor => {
          for (let i = 1; i <= floor.counterCount; i++) {
            const req = fetch(`http://localhost:3000/events/${newEventId}/slots`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                floor: floor.floorName,
                counter: i,
                capacity: floor.capacityPerCounter,
                time_start: `${eventDate} ${startTime}:00`,
                time_end: `${eventDate} ${endTime}:00`
              })
            });
            slotPromises.push(req);
          }
        });
        await Promise.all(slotPromises);
        setMessage({ type: 'success', text: 'Event and Slots created successfully!' });
      }

      // Reset & Refresh
      setEventName('');
      setDescription('');
      setEventDate('');
      fetchEvents();

    } catch (err) {
      console.error(err);
      setMessage({ type: 'danger', text: 'Operation failed. Check console.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-4">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0">
          {editingEventId ? 'Edit Event' : 'Create New Mess Event'}
        </h2>
        {editingEventId && (
          <Button variant="outline-secondary" onClick={handleCancelEdit}>
            Cancel Edit
          </Button>
        )}
      </div>
      
      {message && <Alert variant={message.type}>{message.text}</Alert>}

      {/* --- FORM SECTION --- */}
      <Form onSubmit={handleSubmit}>
        <Card className="mb-4 shadow-sm border-0">
          <Card.Header className="bg-white fw-bold py-3">Event Details</Card.Header>
          <Card.Body>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Event Name</Form.Label>
                  <Form.Control type="text" placeholder="event name.." required value={eventName} onChange={e => setEventName(e.target.value)} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Date</Form.Label>
                  <Form.Control type="date" required value={eventDate} onChange={e => setEventDate(e.target.value)} />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control as="textarea" rows={2} value={description} onChange={e => setDescription(e.target.value)} />
            </Form.Group>

            {/* Show Time/Slots config only when Creating New (simplification) */}
            {!editingEventId && (
              <Row>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Start Time</Form.Label>
                    <Form.Control type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>End Time</Form.Label>
                    <Form.Control type="time" value={endTime} onChange={e => setEndTime(e.target.value)} required />
                  </Form.Group>
                </Col>
              </Row>
            )}
          </Card.Body>
        </Card>

        {/* Show Floor Config only when Creating New */}
        {!editingEventId && (
          <Card className="mb-4 shadow-sm border-0">
            <Card.Header className="bg-white fw-bold py-3 d-flex justify-content-between align-items-center">
              <span>Floor Configuration</span>
              <Button variant="outline-primary" size="sm" onClick={addFloor}>
                <PlusCircle className="me-1"/> Add Floor
              </Button>
            </Card.Header>
            <Card.Body>
              {floors.map((floor) => (
                <div key={floor.id} className="mb-3 p-3 border rounded bg-light">
                  <Row className="align-items-end">
                    <Col md={4}>
                      <Form.Control type="text" placeholder="Floor Name" value={floor.floorName} onChange={(e) => updateFloor(floor.id, 'floorName', e.target.value)} required />
                    </Col>
                    <Col md={3}>
                      <Form.Control type="number" placeholder="Counters" min={1} value={floor.counterCount} onChange={(e) => updateFloor(floor.id, 'counterCount', parseInt(e.target.value))} />
                    </Col>
                    <Col md={3}>
                      <Form.Control type="number" placeholder="Capacity" value={floor.capacityPerCounter} onChange={(e) => updateFloor(floor.id, 'capacityPerCounter', parseInt(e.target.value))} />
                    </Col>
                    <Col md={2} className="text-end">
                      {floors.length > 1 && <Button variant="outline-danger" onClick={() => removeFloor(floor.id)}><Trash /></Button>}
                    </Col>
                  </Row>
                </div>
              ))}
            </Card.Body>
          </Card>
        )}

        <Button variant={editingEventId ? "warning" : "success"} size="lg" type="submit" className="w-100 mb-5" disabled={loading} style={!editingEventId ? { backgroundColor: colors.primary.main } : {}}>
          {loading ? <Spinner animation="border" size="sm" /> : (editingEventId ? 'Update Event' : 'Create Event')}
        </Button>
      </Form>

      {/* --- MANAGE EXISTING EVENTS SECTION --- */}
      <h3 className="mb-3 fw-bold mt-5 border-top pt-4">Manage Existing Events</h3>
      
      {fetching ? (
        <div className="text-center p-5"><Spinner animation="border" variant="success" /></div>
      ) : events.length === 0 ? (
        <Alert variant="info">No events found.</Alert>
      ) : (
        <Card className="shadow-sm border-0">
          <Table responsive hover className="mb-0 align-middle">
            <thead className="bg-light">
              <tr>
                <th>Event Name</th>
                <th>Date</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map(event => (
                <tr key={event.event_id}>
                  <td>
                    <div className="fw-bold">{event.name}</div>
                    <small className="text-muted">{event.description}</small>
                  </td>
                  <td>{new Date(event.date).toLocaleDateString()}</td>
                  <td>
                    <Badge bg={event.status === 'active' ? 'success' : 'secondary'}>
                      {event.status}
                    </Badge>
                  </td>
                  <td className="text-end">
                    <Button 
                      variant="outline-primary" 
                      size="sm" 
                      className="me-2"
                      onClick={() => handleEditClick(event)}
                    >
                      <PencilSquare /> Edit
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => handleDelete(event.event_id)}
                    >
                      <Trash /> Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}
    </Container>
  );
};

export default AdminPage;