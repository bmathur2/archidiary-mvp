import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

function ForgotPassword() {
  const [email, setEmail] = useState("");

  async function handleReset(e) {
    e.preventDefault();

    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Password reset link sent to your email.");
  }

  return (
    <form onSubmit={handleReset}>
      <h1>Forgot Password</h1>

      <input
        type="email"
        placeholder="Enter your email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <button type="submit">Send Reset Link</button>
    </form>
  );
}

export default ForgotPassword;