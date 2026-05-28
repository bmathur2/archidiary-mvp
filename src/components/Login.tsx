import React, { useState } from "react";
import { signIn } from "../lib/database";

interface LoginProps {
  setPage: (page: string) => void;
  setUser: (user: { name: string; email: string }) => void;
}

export function Login({ setPage, setUser }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { user, error: signInError } = await signIn(email, password);

    if (signInError) {
      setError(signInError);
      setLoading(false);
      return;
    }

    if (user) {
      setUser({ name: user.name || "User", email: user.email });
      setPage("dashboard");
    }
    setLoading(false);
  };

  return (
    <section className="auth-card">
    <div className="brand-logo">
        <img src="/logo.png" alt="Archidiary Logo" />
    </div>
    <div className="auth-content">
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <label>Email Address</label>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />

        <label>Password</label>
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />

        {error && <div style={{ color: "#dc2626", fontSize: "14px" }}>{error}</div>}

        <button className="primary-btn" type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <div className="auth-links">
        <button onClick={() => setPage("forgot")} disabled={loading}>
          Forgot password?
        </button>
        <button onClick={() => setPage("register")} disabled={loading}>
          Create account
        </button>
      </div>
    </div>
    </section>
  );
}
