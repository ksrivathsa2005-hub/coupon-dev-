import React, { useState } from "react";

type StaffCreds = { username: string; password: string; remember?: boolean };

export interface LoginFormProps {
  onStudentSignIn?: () => void;
  onStaffSignIn?: (creds: StaffCreds) => Promise<void> | void;
}

const PRIMARY = "#4caf50";
const cardStyle: React.CSSProperties = {
  maxWidth: 480,
  width: "100%",
  margin: "0 auto",
  padding: 32,
  borderRadius: 2,
  background: "#ffffff",
  boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
  border: "none",
};

const primaryBtnStyle: React.CSSProperties = {
  background: PRIMARY,
  borderColor: PRIMARY,
  color: "#fff",
  borderRadius: 0,
  padding: "13px 18px",
  fontWeight: 600,
  fontSize: 15,
  letterSpacing: 0.3,
  border: "none",
  cursor: "pointer",
  transition: "all 0.2s ease",
};

const tabActiveStyle: React.CSSProperties = {
  background: PRIMARY,
  color: "#fff",
  border: "none",
  borderRadius: 0,
  padding: "11px 16px",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 0.2s ease",
};

const tabInactiveStyle: React.CSSProperties = {
  background: "#f8f9fa",
  color: "#333",
  border: "1px solid #e0e0e0",
  borderRadius: 0,
  padding: "11px 16px",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 0.2s ease",
};

const inputCustomStyle: React.CSSProperties = {
  borderRadius: 0,
  padding: "13px 14px",
  border: "1px solid #ddd",
  boxShadow: "none",
  minHeight: 46,
  fontSize: 14,
  fontFamily: "inherit",
  transition: "border 0.2s ease",
};

export default function LoginForm({
  onStudentSignIn,
  onStaffSignIn,
}: LoginFormProps) {
  const [mode, setMode] = useState<"student" | "staff">("student");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleStudent() {
    setError(null);
    if (onStudentSignIn) return onStudentSignIn();
    // Default behavior: redirect to backend Google OAuth endpoint.
    // Backend should validate the hosted domain (hd) claim to allow only @iiitkottayam.ac.in.
    window.location.href = "/auth/google";
  }

  async function handleStaffSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    if (!username.trim() || !password) {
      setError("Please enter username and password");
      return;
    }
    try {
      setLoading(true);
      if (onStaffSignIn) {
        await onStaffSignIn({ username: username.trim(), password, remember });
      } else {
        // Default: call placeholder API - replace with your endpoint
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: username.trim(), password }),
        });
        if (!res.ok) throw new Error("Invalid credentials");
        console.log("staff login success");
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={cardStyle}>
      <h4
        style={{
          textAlign: "center",
          marginBottom: 20,
          color: "#222",
          fontSize: 22,
          fontWeight: 600,
          letterSpacing: -0.2,
        }}
      >
        Login
      </h4>

      <div
        style={{ display: "flex", gap: 14, marginBottom: 16 }}
        role="tablist"
      >
        <button
          type="button"
          style={mode === "student" ? tabActiveStyle : tabInactiveStyle}
          onClick={() => setMode("student")}
          aria-pressed={mode === "student"}
        >
          Student
        </button>
        <button
          type="button"
          style={mode === "staff" ? tabActiveStyle : tabInactiveStyle}
          onClick={() => setMode("staff")}
          aria-pressed={mode === "staff"}
        >
          Staff / Admin
        </button>
      </div>

      {mode === "student" ? (
        <div>
          <p
            style={{
              marginBottom: 14,
              color: "#666",
              fontSize: 13,
              lineHeight: 1.5,
            }}
          >
            Sign in with your IIIT Kottayam Gmail account
          </p>
          <button
            style={{ ...primaryBtnStyle, width: "100%", marginBottom: 10 }}
            onClick={handleStudent}
          >
            Sign in with Google
          </button>
          <div
            style={{
              textAlign: "center",
              fontSize: 12,
              color: "#888",
              lineHeight: 1.5,
            }}
          >
            Only <strong>@iiitkottayam.ac.in</strong> accounts are allowed
          </div>
        </div>
      ) : (
        <form onSubmit={handleStaffSubmit}>
          <div style={{ marginBottom: 14 }}>
            <input
              type="text"
              className="form-control"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              aria-label="username"
              style={inputCustomStyle}
            />
          </div>
          <div style={{ marginBottom: 14 }}>
            <input
              type="password"
              className="form-control"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-label="password"
              style={inputCustomStyle}
            />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 18,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                id="remember"
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <label htmlFor="remember" style={{ fontSize: 13, color: "#444" }}>
                Remember me
              </label>
            </div>
            <a href="#" style={{ fontSize: 13, color: PRIMARY }}>
              Forgot password?
            </a>
          </div>

          {error && (
            <div
              style={{
                background: "#ffebee",
                color: "#c62828",
                padding: "10px 12px",
                borderRadius: 0,
                marginBottom: 14,
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              {error}
            </div>
          )}

          <button
            style={{ ...primaryBtnStyle, width: "100%" }}
            type="submit"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      )}
    </div>
  );
}
