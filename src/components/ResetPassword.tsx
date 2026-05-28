import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
interface ResetPasswordProps {
  setPage: (page: string) => void;
}

export default function ResetPassword({ setPage }: ResetPasswordProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    setSuccessMsg("");
    setErrorMsg("");

    if (!password || !confirmPassword) {
      setErrorMsg("Please enter password and confirm password.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Password and confirm password do not match.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    setSuccessMsg("Password updated successfully. Please login again.");
    setPassword("");
    setConfirmPassword("");

    setTimeout(() => {
      setPage("login");
    }, 1500);
  };

  return (
    <section className="auth-card">
      <div className="auth-badge">Reset Password</div>

      <h1>Create new password</h1>
      <p>Please enter your new password below.</p>

      {successMsg && <div className="success-box">{successMsg}</div>}
      {errorMsg && <div className="error-box">{errorMsg}</div>}

      <form onSubmit={handleResetPassword}>
        <label>New Password</label>
        <input
          type="password"
          placeholder="Enter new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <label>Confirm Password</label>
        <input
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button className="primary-btn" type="submit" disabled={loading}>
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>

      <div className="auth-links center">
        <button type="button" onClick={() => setPage("login")}>
          Back to login
        </button>
      </div>
    </section>
  );
}