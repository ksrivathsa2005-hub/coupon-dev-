// In a test page like 'src/pages/TestEventPage.tsx'
import { useState } from 'react';
import { CouponModal } from '../components/couponModal';
import { Button } from 'react-bootstrap'; // <-- Use the Bootstrap Button

export const TestEventPage = () => {
  // State to control when the modal is open or closed
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- Test Data (Same as your screenshot) ---
  const eventName = "Onam Special Lunch";
  const studentName = "Student User";
  const testCouponData = {
    eventId: "evt_onam_2025",
    studentId: "user_12345",
    floor: 1,
    counter: 1,
    timeSlot: "2:00 PM – 2:45 PM",
    batch: "2022 Batch (Seniors)"
  };
  // The QR code needs the data as a string
  const couponDataString = JSON.stringify(testCouponData);
  // --- End of Test Data ---

  return (
    // Using Bootstrap classes for layout
    <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 bg-secondary-subtle p-4">
      
      <h1 className="h3 fw-bold mb-3">Event Page</h1>
      <p className="text-muted mb-4">Click the button to get your QR code.</p>
      
      <Button variant="success" size="lg" onClick={() => setIsModalOpen(true)}>
        Get My QR Code
      </Button>

      {/* This is your modal. It's invisible until 'isModalOpen' is true.
      */}
      <CouponModal
        show={isModalOpen}                      // <-- Use 'show'
        onHide={() => setIsModalOpen(false)}  // <-- Use 'onHide'
        eventName={eventName}
        studentName={studentName}
        couponData={couponDataString}
      />
    </div>
  );
};

export default TestEventPage;