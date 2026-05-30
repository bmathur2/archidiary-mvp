import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function ChangePassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (newPassword.length < 6) {
      setMessage("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setMessage("Password changed successfully.");
    setNewPassword("");
    setConfirmPassword("");
    setLoading(false);
  };

  return (
   <section className="page-container">
      <div className="card profile-card">
        <h2>Change Password</h2>
        <form onSubmit={handleSubmit} className="form-grid">
            <div className="form-row">
                <div className="form-col">
                    <label>New Password</label>
                    <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    disabled={loading}
                    />
                </div>
                <div className="form-col">
                    <label>Confirm New Password</label>
                    <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                    />
                </div>
            </div>
            
            {message && <div style={{ color: message.includes("success") ? "#065f46" : "#dc2626" }}>{message}</div>}

            <button className="primary-btn" type="submit" disabled={loading}>
            {loading ? "Changing..." : "Change Password"}
            </button>
        </form>
      </div>
    </section>
  );
}
