import React, { useState } from "react";
import { GoogleLogin } from '@react-oauth/google';
import type { CredentialResponse } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext'; 
import { useNavigate } from 'react-router-dom';
import { Container, Card } from 'react-bootstrap';

const LoginPage: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      const { credential } = credentialResponse;
      if (!credential) return;

      // Use IP if testing on phone
      const API_URL = "http://localhost:3000"; 

      const res = await fetch(`${API_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: credential }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Login failed");

      login(data.token, data.user);
      
      // If an admin logs in via Google, send them to admin page, otherwise dashboard
      if (data.user.role === 'admin') navigate('/admin');
      else navigate('/dashboard');

    } catch (err: any) {
      console.error(err);
      setError(err.message);
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: "100vh", backgroundColor: "#ffffff" }}>
      <Card style={{ maxWidth: 480, width: "100%", padding: 32, border: "none", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}>
        
        <div className="text-center mb-4">
          <div className="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: 50, height: 50, fontSize: '1.2rem'}}>
            CC
          </div>
          <h4 className="fw-bold">College Coupon</h4>
          <p className="text-muted">Sign in with your IIIT Kottayam account</p>
        </div>

        <div className="d-flex justify-content-center mb-3">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError("Google Login Failed")}
            useOneTap
            shape="rectangular"
            width="100%"
          />
        </div>

        {error && (
          <div className="text-danger text-center small mb-3">{error}</div>
        )}

        <div className="text-center" style={{ fontSize: 12, color: "#888" }}>
          Only <strong>@iiitkottayam.ac.in</strong> accounts are allowed
        </div>
        
        {/* Optional: A very subtle link for staff in the footer */}
        <div className="mt-5 text-center">
            <a href="/staff-access" style={{ fontSize: '10px', color: '#eee', textDecoration: 'none' }}>.</a>
        </div>

      </Card>
    </Container>
  );
};

export default LoginPage;