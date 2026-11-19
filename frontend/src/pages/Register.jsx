import { useState } from "react";
import { ShieldCheck, Eye, EyeOff } from "lucide-react";
import "./Auth.css";

export default function Register({ onLogin }) {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "", confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      return setError("Passwords do not match.");
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Registration failed.");

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.location.reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo"><ShieldCheck size={30}/></div>
        <h1>Create Customer Account</h1>
        <p className="auth-subtitle">Join Document Scam Detector and stay protected.</p>

        <form onSubmit={submit}>
          <label>Full Name</label>
          <input name="name" value={form.name} onChange={update} placeholder="Enter your full name" required />

          <label>Email Address</label>
          <input name="email" type="email" value={form.email} onChange={update} placeholder="Enter your email" required />

          <label>Phone Number</label>
          <input name="phone" type="tel" value={form.phone} onChange={update} placeholder="Enter phone number" />

          <label>Password</label>
          <div className="password-field">
            <input name="password" type={showPassword ? "text" : "password"} value={form.password} onChange={update} placeholder="Minimum 8 characters" minLength="8" required />
            <button type="button" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
            </button>
          </div>

          <label>Confirm Password</label>
          <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={update} placeholder="Re-enter password" required />

          {error && <div className="auth-error">{error}</div>}

          <button className="auth-submit" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <button onClick={onLogin}>Login</button>
        </p>
      </div>
    </div>
  );
}
