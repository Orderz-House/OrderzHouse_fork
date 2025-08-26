import { useState } from "react";
import axios from "axios";
console.log("test");

export default function Register() {
  const [form, setForm] = useState({
    role_id: "",
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    phone_number: "",
    country: "",
    username: "",
  });
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:5000/users/register",
        form,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      setMessage(res.data.message || "Registration successful.");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 640, margin: "40px auto" }}>
      <h2>Register</h2>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
        <input
          name="role_id"
          placeholder="Role ID"
          value={form.role_id}
          onChange={onChange}
          required
        />
        <input
          name="first_name"
          placeholder="First name"
          value={form.first_name}
          onChange={onChange}
          required
        />
        <input
          name="last_name"
          placeholder="Last name"
          value={form.last_name}
          onChange={onChange}
          required
        />
        <input
          name="email"
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={onChange}
          required
        />
        <input
          name="password"
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={onChange}
          required
        />
        <input
          name="phone_number"
          placeholder="Phone number"
          value={form.phone_number}
          onChange={onChange}
          required
        />
        <input
          name="country"
          placeholder="Country"
          value={form.country}
          onChange={onChange}
          required
        />
        <input
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={onChange}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "crimson" }}>{error}</p>}
    </div>
  );
}
