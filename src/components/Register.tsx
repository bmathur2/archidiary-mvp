import React, { useState } from "react";
import { signUp } from "../lib/database";

interface RegisterProps {
  setPage: (page: string) => void;
  setUser: (user: { name: string; email: string }) => void;
}

export function Register({ setPage, setUser }: RegisterProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    const { user, error: signUpError } = await signUp(email, password, name);

    if (signUpError) {
      setError(signUpError);
      setLoading(false);
      return;
    }

    if (user) {
      setSuccess("Account created successfully! Please check your email to verify your account.");
      setUser({ name: user.name || "User", email: user.email });
      setTimeout(() => setPage("login"), 2000);
    }
    setLoading(false);
  };

  return (
     <section className="auth-card">
    <div className="brand-logo">
        <img src="/logo.png" alt="Archidiary Logo" />
    </div>
    <div className="auth-content">
      <h1>Create your account</h1>
      <p>Register and start uploading your project details quickly.</p>

      <form onSubmit={handleSubmit}>
        <label>Full Name</label>
        <input
          type="text"
          placeholder="Enter full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={loading}
        />

        <label>Email Address</label>
        <input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />

        <label>Password</label>
        <input
          type="password"
          placeholder="Create password (min 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />

        <label>Confirm Password</label>
        <input
          type="password"
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          disabled={loading}
        />

        {error && <div style={{ color: "#dc2626", fontSize: "14px" }}>{error}</div>}
        {success && <div style={{ color: "#059669", fontSize: "14px" }}>{success}</div>}

        <button className="primary-btn" type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Register"}
        </button>
      </form>

      <div className="auth-links center">
        <button onClick={() => setPage("login")} disabled={loading}>
          Already have an account? Login
        </button>
      </div>
       </div>
    </section>
  );
}
