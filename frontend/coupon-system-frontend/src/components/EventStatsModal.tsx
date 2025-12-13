import React, { useEffect, useState } from 'react';
import { Modal, Button, Card, Row, Col, Table, ProgressBar, Spinner, Alert } from 'react-bootstrap';
import { BarChartFill, PeopleFill, Shop } from 'react-bootstrap-icons';
import { useAuth } from '../context/AuthContext'; // Import useAuth to get the token

interface EventStatsModalProps {
  show: boolean;
  onHide: () => void;
  eventId: number | null;
  eventName: string;
}

interface EventStats {
  total: number;
  byBatch: { batch: string; count: string }[];
  byCounter: { counter_name: string; count: string }[];
}

const EventStatsModal: React.FC<EventStatsModalProps> = ({ show, onHide, eventId, eventName }) => {
  const { token } = useAuth(); // Get the token
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<EventStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (show && eventId) {
      fetchStats();
    }
  }, [show, eventId]);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    setStats(null);
    try {
      // 🔐 Add Authorization Header
      const res = await fetch(`http://localhost:3000/events/${eventId}/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!res.ok) throw new Error('Failed to fetch stats');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error(err);
      setError('Could not load statistics.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="bg-success text-white">
        <Modal.Title className="d-flex align-items-center">
          <BarChartFill className="me-2" />
          Analytics: {eventName}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="bg-light p-4">
        {loading ? (
          <div className="text-center p-5">
            <Spinner animation="border" variant="success" />
            <p className="mt-2 text-muted">Crunching numbers...</p>
          </div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : stats ? (
          <div>
            {/* 1. Total Served Card */}
            <Card className="mb-4 text-center border-0 shadow-sm">
              <Card.Body className="py-4">
                <h6 className="text-muted text-uppercase fw-bold mb-2" style={{ letterSpacing: '1px' }}>Total Students Served</h6>
                <h1 className="display-3 fw-bold text-success mb-0">{stats.total}</h1>
              </Card.Body>
            </Card>

            <Row className="g-4">
              {/* 2. Breakdown by Batch */}
              <Col md={6}>
                <Card className="h-100 border-0 shadow-sm">
                  <Card.Header className="bg-white fw-bold py-3 border-bottom-0">
                    <PeopleFill className="me-2 text-primary" />
                    By Batch (Year)
                  </Card.Header>
                  <Card.Body>
                    {stats.byBatch.length === 0 ? (
                      <p className="text-muted small text-center my-4">No data yet.</p>
                    ) : (
                      stats.byBatch.map((item, idx) => {
                        const percent = stats.total > 0 ? (parseInt(item.count) / stats.total) * 100 : 0;
                        return (
                          <div key={idx} className="mb-3">
                            <div className="d-flex justify-content-between small fw-bold mb-1">
                              <span>Batch {item.batch || 'Unknown'}</span>
                              <span>{item.count}</span>
                            </div>
                            <ProgressBar 
                              now={percent} 
                              variant="info" 
                              style={{ height: '6px', borderRadius: '10px' }} 
                            />
                          </div>
                        );
                      })
                    )}
                  </Card.Body>
                </Card>
              </Col>

              {/* 3. Breakdown by Counter */}
              <Col md={6}>
                <Card className="h-100 border-0 shadow-sm">
                  <Card.Header className="bg-white fw-bold py-3 border-bottom-0">
                    <Shop className="me-2 text-warning" />
                    By Counter
                  </Card.Header>
                  <Card.Body className="p-0">
                    <Table hover borderless className="mb-0 align-middle">
                      <thead className="bg-light small text-muted">
                        <tr>
                          <th className="ps-3 fw-normal">Counter Name</th>
                          <th className="text-end pe-3 fw-normal">Served</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.byCounter.length === 0 ? (
                          <tr><td colSpan={2} className="text-center text-muted small py-4">No data yet.</td></tr>
                        ) : (
                          stats.byCounter.map((item, idx) => (
                            <tr key={idx}>
                              <td className="ps-3 fw-semibold text-dark">{item.counter_name}</td>
                              <td className="text-end pe-3 fw-bold text-success">{item.count}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </div>
        ) : (
          <Alert variant="info">No statistics available for this event yet.</Alert>
        )}
      </Modal.Body>
      <Modal.Footer className="border-top-0 bg-light">
        <Button variant="outline-secondary" onClick={onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EventStatsModal;