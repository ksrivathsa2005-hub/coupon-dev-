import React from 'react';
import { Link } from 'react-router-dom';
import { Dropdown } from 'react-bootstrap'; 
import { PersonCircle } from 'react-bootstrap-icons'; 

interface User {
  name: string;
  email: string;
}

interface NavbarProps {
  user?: User | null; 
}

const Navbar: React.FC<NavbarProps> = ({ user }) => {

  const loggedInView = (
    <Dropdown align="end">
      <Dropdown.Toggle 
        variant="light" 
        id="dropdown-user" 
        className="d-flex align-items-center"
      >
        <PersonCircle size={30} className="text-secondary" /> 
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Header>Welcome, {user?.name}</Dropdown.Header>

        <Dropdown.ItemText className="text-muted small ps-3">
          {user?.email}
        </Dropdown.ItemText>
        
        <Dropdown.Divider />
        
        <Dropdown.Item as={Link} to="/logout">
          Logout
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );

  const loggedOutView = (
    <Dropdown align="end">
      <Dropdown.Toggle 
        variant="light" 
        id="dropdown-user" 
        className="d-flex align-items-center"
      >
        <PersonCircle size={30} className="text-secondary" /> 
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Header>WELCOME!</Dropdown.Header>

        <Dropdown.ItemText className="text-muted small ps-3">
          Please Log in!
        </Dropdown.ItemText>
        
        <Dropdown.Divider />
        
        <Dropdown.Item as={Link} to="/login">
          Login
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );

  return (
<<<<<<< Updated upstream
    <nav className="navbar navbar-expand-lg navbar-light bg-light sticky-top shadow-sm">
      <div className="container-fluid">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <span className="bg-success text-white rounded-circle p-2 me-2" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
            CC
          </span>
          <span className="h5 mb-0">College Coupon</span>
        </Link>

=======
    <Navbar bg="white" className="shadow-sm border-bottom sticky-top py-3">
      <Container className="d-flex justify-content-between align-items-center">
        
        {/* LOGO (Left Side) */}
        <Navbar.Brand as={Link} to="/" className="fw-bold d-flex align-items-center text-dark p-0">
          <img 
            src="/klee-logo.png" 
            alt="Klee Logo" 
            style={{width: 38, height: 38}} 
            className="me-2"
          />
          <span style={{ letterSpacing: '-0.5px', fontSize: '1.2rem' }}>Klee</span>
        </Navbar.Brand>
        
        {/* RIGHT SIDE CONTENT */}
>>>>>>> Stashed changes
        <div className="d-flex align-items-center">
          {user ? loggedInView : loggedOutView}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;