import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./App.css";

import Home from "./pages/Home";
import Login from "./pages/Login";
import HrPortal from "./pages/HrPortal";
import DirectorConsole from "./pages/DirectorConsole";
import EmployeeWorkspace from "./pages/EmployeeWorkspace";
import AdminPanel from "./pages/AdminPanel";

function App() {
  return (
    <div className="App">
      <Router>
        {/* Navigation bar */}
        <nav className="navbar">
          <div className="navbar-left">
            <h2 className="brand">
              BGRS STICA
            </h2>
          </div>
          <div className="navbar-right">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/login" className="nav-link">Login</Link>
          </div>
        </nav>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />

          {/* Role-based pages (hidden from navbar, only accessible via login redirect) */}
          <Route path="/hr" element={<HrPortal />} />
          <Route path="/director" element={<DirectorConsole />} />
          <Route path="/employee" element={<EmployeeWorkspace />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
