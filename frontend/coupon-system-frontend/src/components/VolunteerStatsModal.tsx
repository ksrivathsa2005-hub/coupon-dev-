import React, { useEffect, useState } from 'react';
import { Modal, Button, Card, Row, Col, ProgressBar, Spinner, Alert } from 'react-bootstrap';
import { BarChartFill, PeopleFill } from 'react-bootstrap-icons';
import { useAuth } from '../context/AuthContext';

interface VolunteerStatsModalProps {
  show: boolean;
  onHide: () => void;
  eventId: number | null;
  eventName: string;
}

interface VolunteerStats {
  total: number;
  byBatch: { batch: string; count: string }[];
}

const VolunteerStatsModal: React.FC<VolunteerStatsModalProps> = ({ show, onHide, eventId, eventName }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<VolunteerStats | null>(null);

  useEffect(() => {
    if (show && eventId && user) {
      fetchStats();
    }
  }, [show, eventId, user]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      // Fetch stats specific to THIS logged-in volunteer
      const res = await fetch(`http://localhost:3000/events/${eventId}/stats/volunteer/${user?.user_id}`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title className="h5"><BarChartFill className="me-2"/>My Stats: {eventName}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="bg-light">
        {loading ? (
          <div className="text-center p-4"><Spinner animation="border" variant="primary" /></div>
        ) : stats ? (
          <div>
            {/* Total Count */}
            <Card className="mb-3 text-center border-0 shadow-sm">
                <Card.Body>
                    <h6 className="text-muted text-uppercase small">Total Served by You</h6>
                    <h1 className="display-4 fw-bold text-primary">{stats.total}</h1>
                </Card.Body>
            </Card>

            {/* Batch Breakdown */}
            <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white fw-bold"><PeopleFill className="me-2"/>Batch Breakdown</Card.Header>
                <Card.Body>
                    {stats.byBatch.length === 0 ? <p className="text-muted small">No scans yet.</p> : (
                        stats.byBatch.map((item, idx) => (
                            <div key={idx} className="mb-2">
                                <div className="d-flex justify-content-between small fw-bold mb-1">
                                    <span>Batch {item.batch}</span>
                                    <span>{item.count}</span>
                                </div>
                                <ProgressBar variant="info" now={(parseInt(item.count) / stats.total) * 100} style={{height: '6px'}} />
                            </div>
                        ))
                    )}
                </Card.Body>
            </Card>
          </div>
        ) : (
          <Alert variant="warning">Could not load stats.</Alert>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default VolunteerStatsModal;