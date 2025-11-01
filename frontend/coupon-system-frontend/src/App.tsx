import { Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import AdminPage from './pages/AdminPage'
import StaffPage from './pages/StaffPage'
// import Navbar from './components/Navbar' 
// import Footer from './components/Footer'

function App() {
  return (
    <div className="d-flex flex-column min-vh-100"> {}
      {/* <Navbar /> */} 

      <main className="flex-grow-1">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/staff" element={<StaffPage />} />
          
          {/* Default route: redirect to login */}
          <Route path="/" element={<LoginPage />} /> 
        </Routes>
      </main>

      {/* <Footer /> */} 
    </div>
  )
}

export default App