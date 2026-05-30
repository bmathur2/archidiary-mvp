import React, { useState } from "react";
import { signUp } from "../lib/database";

interface RegisterProps {
  setPage: (page: string) => void;
  setUser: (user: { id: string; name: string; email: string }) => void;
}

export function Register({ setPage, setUser }: RegisterProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [tel, setTel] = useState("");
  const [profession, setProfession] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const fullName = name.trim();
    const userEmail = email.trim();
    const phoneNumber = tel.trim();

    if (!fullName) {
      setError("Please enter full name");
      return;
    }

    if (!userEmail) {
      setError("Please enter email address");
      return;
    }

    if (!phoneNumber) {
      setError("Please enter phone number");
      return;
    }

    if (!profession) {
      setError("Please select profession");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      /*
        Important:
        Do NOT insert directly into public.profiles here.
        When Email Confirmation is ON, user may not have an authenticated session yet,
        so direct insert/update can fail with RLS policy error.

        signUp() should send full_name, phone, and job_title in auth metadata.
        Supabase database trigger should create the profiles row automatically.
      */
      const { user, error: signUpError } = await signUp(
        userEmail,
        password,
        fullName,
        phoneNumber,
        profession
      );

      if (signUpError) {
        setError(signUpError);
        setLoading(false);
        return;
      }

      if (user?.id) {
        setUser({
          id: user.id,
          name: fullName,
          email: user.email || userEmail,
        });
      }

      setSuccess(
        "Account created successfully. Please check your email to confirm your account."
      );

      setTimeout(() => {
        setPage("login");
      }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    }

    setLoading(false);
  };

  return (
    <section className="auth-card registration-wrapper">
      <div className="brand-logo">
        <img src="/logo.png" alt="Archidiary Logo" />
      </div>

      <div className="auth-content">
        <h1>Create your account</h1>
        <p>Register and start uploading your project details quickly.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-col">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="Enter full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="form-col">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-col">
              <label>Phone Number</label>
              <input
                type="tel"
                placeholder="Enter phone number"
                value={tel}
                onChange={(e) => setTel(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="form-col">
              <label>Select Profession</label>
              <select
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                required
                disabled={loading}
              >
                <option value="">-- Select profession --</option>
                <option value="Architect">Architect</option>
                <option value="Interior Designer">Interior Designer</option>
                <option value="Civil Engineer">Civil Engineer</option>
                <option value="Student">Student</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-col">
              <label>Password</label>
              <input
                type="password"
                placeholder="Create password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="form-col">
              <label>Confirm Password</label>
              <input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          {error && (
            <div style={{ color: "#dc2626", fontSize: "14px" }}>{error}</div>
          )}

          {success && (
            <div style={{ color: "#059669", fontSize: "14px" }}>{success}</div>
          )}

          <button className="primary-btn" type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <div className="auth-links center">
          <button
            type="button"
            onClick={() => setPage("login")}
            disabled={loading}
          >
            Already have an account? Login
          </button>
        </div>
      </div>
    </section>
  );
}
