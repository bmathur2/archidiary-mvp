import React, { useState } from "react";
import { resetPassword } from "../lib/database";

interface ForgotPasswordProps {
  setPage: (page: string) => void;
}

export function ForgotPassword({ setPage }: ForgotPasswordProps) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    const { error: resetError } = await resetPassword(cleanEmail);

    if (resetError) {
      setError(resetError);
      setLoading(false);
      return;
    }

    setEmail(cleanEmail);
    setSent(true);
    setLoading(false);
  };

  return (
    <section className="auth-card">
    <div className="brand-logo">
        <img src="/logo.png" alt="Archidiary Logo" />
    </div>
    <div className="auth-content">
      <h1>Forgot password?</h1>
      <p>Enter your email address and we will send reset instructions.</p>

      {!sent ? (
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

          {error && (
            <div className="error-box">
              ⚠️ {error}
            </div>
          )}

          <button className="primary-btn" type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      ) : (
        <div className="success-box">
          <div style={{ marginBottom: "12px", fontWeight: "bold" }}>
            ✓ Password reset link sent to <strong>{email}</strong>
          </div>

          <div style={{ fontSize: "13px", lineHeight: "1.6" }}>
            <p style={{ margin: "0 0 8px 0" }}>
              📧 <strong>Check your inbox</strong> for the reset email. It may
              take a few minutes to arrive.
            </p>

            <p style={{ margin: "0 0 8px 0" }}>
              💌 <strong>Check spam/promotions folder</strong> if you do not
              see it in your inbox.
            </p>

            <p style={{ margin: "0" }}>
              ⏱️ If email does not arrive within 5 minutes, try requesting
              again.
            </p>
          </div>
        </div>
      )}

      <div className="auth-links center">
        {sent && (
          <button
            type="button"
            onClick={() => {
              setSent(false);
              setEmail("");
              setError("");
            }}
            disabled={loading}
            style={{ marginRight: "12px" }}
          >
            Send to different email
          </button>
        )}

        <button type="button" onClick={() => setPage("login")} disabled={loading}>
          Back to login
        </button>
      </div>
      </div>
    </section>
  );
}