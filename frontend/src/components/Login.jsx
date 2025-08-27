
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { setLogin } from "../slice/auth/authSlice";
import axios from "axios";

const Login = () => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(false);

  const login = (e) => {
    e.preventDefault();
    axios
      .post("http://localhost:5000/users/login", {
        email,
        password,
      })
      .then((res) => {
        dispatch(
          setLogin({
            token: res.data.token,
            userId: res.data.userId,
            roleId: res.data.role,
          })
        );
        setStatus(true);
        setMessage("Login successful");
      })
      .catch((err) => {
        setStatus(false);
        setMessage(err.response?.data?.message || "Login failed");
      });
  };

  return (
    <div className="Form">
      <form onSubmit={login}>
        <p className="Title">Login</p>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <br />
        <button>Login</button>
      </form>
      {status
        ? message && <div className="SuccessMessage">{message}</div>
        : message && <div className="ErrorMessage">{message}</div>}
    </div>
  );
};

export default Login;
