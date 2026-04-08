import { useState } from "react";
import "./AdminPanel.css";

export default function AdminPanel() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("hr"); 
  const [department, setDepartment] = useState("");
  const [position, setPosition] = useState("");
  const [salary, setSalary] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("auth_token"); // ✅ Retrieve admin token

    if (!token) {
      setMessage("❌ Unauthorized: No admin token found.");
      return;
    }

    try {
      const response = await fetch("http://hrms-backend.test/api/users", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}` // ✅ Added Authorization Header
        },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          department,
          position,
          salary
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`✅ Success: ${data.message || "Account created successfully"}`);
        // Clear form only on success
        setName("");
        setEmail("");
        setPassword("");
        setRole("hr");
        setDepartment("");
        setPosition("");
        setSalary("");
      } else {
        // Display specific validation errors if they exist
        setMessage("❌ Error: " + (data.message || "Failed to create account"));
      }

    } catch (error) {
      console.error("Submission error:", error);
      setMessage("❌ Connection error. Is the backend running?");
    }
  };

  return (
    <div className="admin-container">
      <h1>Admin Panel</h1>
      <p>Create HR and Director Accounts</p>

      <form onSubmit={handleSubmit} className="admin-form">
        <div className="form-group">
          <label>Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength="6"
          />
        </div>

        <div className="form-group">
          <label>Role:</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="hr">HR</option>
            <option value="director">Director</option>
          </select>
        </div>

        <div className="form-group">
          <label>Department:</label>
          <input
            type="text"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Position:</label>
          <input
            type="text"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Salary:</label>
          <input
            type="number"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="admin-submit-btn">Create Account</button>
      </form>

      {message && (
        <p className={`message-toast ${message.includes('✅') ? 'success' : 'error'}`}>
          {message}
        </p>
      )}
    </div>
  );
}