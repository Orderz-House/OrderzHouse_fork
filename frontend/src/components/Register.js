import React, { useState } from "react";
import axios from "axios";

const Register = () => {
  const [role_id, setRole_id] = useState("");
  const [first_name, setFirst_name] = useState("");
  const [last_name, setLast_name] = useState("");
  const [phone_number, setPhone_number] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [country, setCountry] = useState("");
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(false);

  const register = (e) => {
    e.preventDefault();
    axios
      .post("http://localhost:5000/users/register", {
        role_id,
        first_name,
        last_name,
        email,
        password,
        phone_number,
        country,
        username,
      })
      .then((result) => {
        console.log(result);
        setStatus(true);
        setMessage(result.data.message || "Registration successful");
      })
      .catch((error) => {
        console.log(error);
        setStatus(false);
        setMessage(error.response?.data?.message || "Registration failed");
      });
  };

  return (
    <div className="Form">
      <form onSubmit={register}>
        <p className="Title">Register Form</p>
        <input
          type="text"
          placeholder="Role ID"
          value={role_id}
          onChange={(e) => setRole_id(e.target.value)}
        />
        <input
          type="text"
          placeholder="First Name"
          value={first_name}
          onChange={(e) => setFirst_name(e.target.value)}
        />
        <input
          type="text"
          placeholder="Last Name"
          value={last_name}
          onChange={(e) => setLast_name(e.target.value)}
        />
        <input
          type="number"
          placeholder="Phone Number"
          value={phone_number}
          onChange={(e) => setPhone_number(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="text"
          placeholder="Country"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        />
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button>Register</button>
      </form>
      {status
        ? message && <div className="SuccessMessage">{message}</div>
        : message && <div className="ErrorMessage">{message}</div>}
    </div>
  );
};

export default Register;
