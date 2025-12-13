import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' 
import App from './App.tsx'
import 'bootstrap/dist/css/bootstrap.min.css'

<<<<<<< Updated upstream
=======
const GOOGLE_CLIENT_ID = "CLIENT ID"; 

>>>>>>> Stashed changes
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter> 
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)