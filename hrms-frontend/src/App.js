import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import "./App.css";

import Home from "./pages/Home";
import Login from "./pages/Login";
import HrPortal from "./pages/HrPortal";
import DirectorConsole from "./pages/DirectorConsole";
import EmployeeWorkspace from "./pages/EmployeeWorkspace";
import AdminPanel from "./pages/AdminPanel";

// The Guard Logic
const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem("auth_token");
  const userRole = localStorage.getItem("user_role");

  // DEBUG: Check your console (F12) to see why access is granted/denied
  console.log(`Checking access for: ${allowedRole}. Current Role in storage: ${userRole}`);

  // 1. If no token, redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 2. Normalize roles to lowercase
  const normalizedUserRole = userRole ? userRole.toLowerCase() : "";
  const normalizedAllowedRole = allowedRole ? allowedRole.toLowerCase() : "";

  // 3. If the role doesn't match, send home
  if (allowedRole && normalizedUserRole !== normalizedAllowedRole) {
    console.warn("Unauthorized Role Access Denied!");
    return <Navigate to="/" replace />;
  }

  // 4. Access Granted
  return children;
};

function App() {
  return (
    <div className="App">
      <Router>
        <nav className="navbar">
          <div className="navbar-left">
            <h2 className="brand">BGRS STICA</h2>
          </div>
          <div className="navbar-right">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/login" className="nav-link">Login</Link>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />

          {/* HR ROUTE - Protected */}
          <Route 
            path="/hr" 
            element={
              <ProtectedRoute allowedRole="hr">
                <HrPortal />
              </ProtectedRoute>
            } 
          />

          {/* DIRECTOR ROUTE - Protected */}
          <Route 
            path="/director" 
            element={
              <ProtectedRoute allowedRole="director">
                <DirectorConsole />
              </ProtectedRoute>
            } 
          />

          {/* EMPLOYEE ROUTE - Protected */}
          <Route 
            path="/employee" 
            element={
              <ProtectedRoute allowedRole="employee">
                <EmployeeWorkspace />
              </ProtectedRoute>
            } 
          />

          {/* ADMIN ROUTE - Protected */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminPanel />
              </ProtectedRoute>
            } 
          />

          {/* Fallback for undefined routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;