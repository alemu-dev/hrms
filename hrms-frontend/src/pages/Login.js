import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("https://hrms-owyj.onrender.com/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // 1. CLEAR OLD DATA FIRST (Critical to prevent role mixing)
        localStorage.clear();

        // 2. SAVE NEW DATA
        const userRole = data.role ? data.role.toLowerCase() : "";

        /** * ✅ THE FIX: 
         * Changed 'data.token' to 'data.access_token' 
         * to match the Laravel UserController response.
         */
        localStorage.setItem("auth_token", data.access_token); 
        localStorage.setItem("user_role", userRole);
        
        if (data.user && data.user.id) {
          localStorage.setItem("userId", data.user.id);
        }

        console.log("Saved Token and Role:", userRole);

        // 3. ALERT USER
        alert("Login successful! Role: " + data.role);

        // 4. NAVIGATION
        setTimeout(() => {
          if (userRole === "hr") navigate("/hr");
          else if (userRole === "director") navigate("/director");
          else if (userRole === "employee") navigate("/employee");
          else if (userRole === "admin") navigate("/admin");
          else navigate("/");
        }, 100);

      } else {
        alert("Login failed: " + (data.message || "Invalid credentials"));
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form className="login-form" onSubmit={handleSubmit}>
        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Log In</button>
      </form>
    </div>
  );
}