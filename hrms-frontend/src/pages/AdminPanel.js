import { useState } from "react";
import "./AdminPanel.css";

export default function AdminPanel() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");   // use email instead of username
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("hr"); // default role
  const [department, setDepartment] = useState("");
  const [position, setPosition] = useState("");
  const [salary, setSalary] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://127.0.0.1:8000/api/users", {

        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,        // send email instead of username
          password,
          role,
          department,
          position,
          salary
        })
      });

      const data = await response.json();
      if (response.ok) {
        setMessage(data.message);
      } else {
        setMessage("Error: " + (data.message || "Failed to create account"));
      }

      // Clear form
      setName("");
      setEmail("");
      setPassword("");
      setRole("hr");
      setDepartment("");
      setPosition("");
      setSalary("");
    } catch (error) {
      setMessage("Error creating account. Please try again.");
    }
  };

  return (
    <div className="admin-container">
      <h1>Admin Panel</h1>
      <p>Create HR and Director Accounts</p>

      <form onSubmit={handleSubmit} className="admin-form">
        <div>
          <label>Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Role:</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="hr">HR</option>
            <option value="director">Director</option>
          </select>
        </div>

        <div>
          <label>Department:</label>
          <input
            type="text"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Position:</label>
          <input
            type="text"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Salary:</label>
          <input
            type="number"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            required
          />
        </div>

        <button type="submit">Create Account</button>
      </form>

      {message && <p className="success-message">{message}</p>}
    </div>
  );
}
