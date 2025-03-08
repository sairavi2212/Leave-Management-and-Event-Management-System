import { useState } from "react";
import axios from "axios";
<<<<<<< HEAD
import { useNavigate } from "react-router-dom";
=======
import { useNavigate } from "react-router-dom"; 
>>>>>>> 7ab4c32c9066dda2fdd9351a7e672d19e81a6f9d

export default function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate(); 

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    console.log(formData);
    try {
      const response = await axios.post("http://localhost:5000/api/login", formData);
      localStorage.setItem("token", response.data.token);
<<<<<<< HEAD
      navigate("/home");
=======
      console.log("Login successful!");
      navigate("/profile"); 
>>>>>>> 7ab4c32c9066dda2fdd9351a7e672d19e81a6f9d
    } catch (err) {
      console.error(err);
      setError("Login failed. Please check your credentials.");
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <div style={{ padding: "20px", border: "1px solid black", borderRadius: "5px", width: "300px" }}>
        <h2 style={{ textAlign: "center" }}>Login</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "10px" }}>
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={{ width: "100%", padding: "5px" }}
            />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label>Password:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              style={{ width: "100%", padding: "5px" }}
            />
          </div>
          <button type="submit" style={{ width: "100%", padding: "8px", backgroundColor: "black", color: "white", border: "none" }}>
            Login
          </button>
        </form>
      </div>
    </div>
  );
};
