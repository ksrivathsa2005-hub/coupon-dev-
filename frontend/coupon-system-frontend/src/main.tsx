import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' 
import { GoogleOAuthProvider } from '@react-oauth/google'; // Import this
import { AuthProvider } from '../src/context/AuthContext.tsx'; // Import this
import App from './App.tsx'
import 'bootstrap/dist/css/bootstrap.min.css'

// REPLACE THIS WITH YOUR REAL GOOGLE CLIENT ID
const GOOGLE_CLIENT_ID = ".com"; 

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>,
)