import React from "react";

<<<<<<< Updated upstream
const LoginPage: React.FC=()=>{
    return (
        <div className="container p-4">
            <h1>Login Page</h1>
            <p>This is the login page content.</p>
=======
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
          <img 
            src="/klee-logo.png" 
            alt="Klee Logo" 
            style={{width: 60, height: 60}} 
            className="mb-3"
          />
          <h4 className="fw-bold">Klee</h4>
          <p className="text-muted">Sign in with your IIIT Kottayam account</p>
>>>>>>> Stashed changes
        </div>
    );
};
export default LoginPage;