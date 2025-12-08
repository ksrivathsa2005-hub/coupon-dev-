import React from "react";
import LoginForm from "../components/LoginForm";

const LoginPage: React.FC = () => {
  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: "100vh", background: "#ffffff" }}
    >
      <div style={{ padding: 24 }}>
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
