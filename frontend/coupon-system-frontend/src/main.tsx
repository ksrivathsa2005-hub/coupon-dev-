import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' 
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from '../src/context/AuthContext.tsx';
import App from './App.tsx'
import 'bootstrap/dist/css/bootstrap.min.css'

const GOOGLE_CLIENT_ID = "997232015364-urvnif0r9aacvtlslfu1kurbrps9jb0h.apps.googleusercontent.com"; 

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