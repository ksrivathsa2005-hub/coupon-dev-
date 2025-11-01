import React from 'react';
import { Link } from 'react-router-dom'; 

const Navbar: React.FC = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light sticky-top shadow-sm">
      <div className="container-fluid">
        {/* Left Section: Logo/App Name */}
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <span className="bg-success text-white rounded-circle p-2 me-2" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
            CC
          </span>
          <span className="h5 mb-0">College Coupon</span>
        </Link>

        {/* Right Section: User Icon */}
        <div className="d-flex align-items-center">
          {/* User Icon (replace with a proper icon library later if needed) */}
          <Link to="/profile" className="nav-link"> {/* Assuming a profile page */}
            <img 
              src="https://via.placeholder.com/30" // Placeholder image for user icon
              alt="User" 
              className="rounded-circle" 
              style={{ width: '35px', height: '35px' }} 
            />
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;