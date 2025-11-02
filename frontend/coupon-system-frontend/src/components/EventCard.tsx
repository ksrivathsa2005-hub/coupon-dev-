import React from 'react';
import { Card } from 'react-bootstrap';
import { CalendarEvent } from 'react-bootstrap-icons';
import QrButton from './common/QrButton';

export interface EventData {
  id: string;
  title: string;
  description: string;
  validDate: string;
}

interface EventCardProps {
  event: EventData;
  onGetQR: (eventId: string) => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onGetQR }) => {
  return (
    <Card className="shadow-sm mb-3" style={{ borderRadius: '15px' }}>
      <Card.Body className="p-4">
        
        {/* Title */}
        <Card.Title className="h4" style={{ fontWeight: 700 }}>
          {event.title}
        </Card.Title>
        
        {/* Description */}
        <Card.Text className="text-secondary">
          {event.description}
        </Card.Text>
        
        {/* Date Info */}
        <div 
          className="d-flex align-items-center text-secondary mb-4" 
          style={{ fontSize: '0.9rem' }}
        >
          <CalendarEvent className="me-2" />
          <span>Valid: {event.validDate}</span>
        </div>
        
        <QrButton 
          text="Get My QR Code" 
          onClick={() => onGetQR(event.id)} 
        />
        
      </Card.Body>
    </Card>
  );
};

export default EventCard;

{/*
    to use this component

import this inside

import EventCard from './components/EventCard';
import type { EventData } from './components/EventCard';
    
inside app function
const mockEvent: EventData = {
    id: "1",
    title: "Onam Special Lunch",
    description: "Traditional Onam Sadhya with special dishes",
    validDate: "Sep 10, 2025"
  };

  // 3. Create a mock function for the button
  const handleTestClick = (eventId: string) => {
    alert(`Button clicked for event ID: ${eventId}`);
  };


  inside return
  <EventCard event={mockEvent} onGetQR={handleTestClick} />
  
    */}