import { useState, useEffect } from "react";
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line, AreaChart, Area 
} from "recharts";
import EmployeeTab from "../components/director/EmployeeTab.js";
import LeavesTab from "../components/director/LeavesTab.js";
import OverviewTab from "../components/director/OverviewTab.js";
import "./DirectorConsole.css";

export default function DirectorConsole() {
  const [activeTab, setActiveTab] = useState("main");
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false); 
  const [globalChartStyle, setGlobalChartStyle] = useState("bar");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const token = localStorage.getItem("auth_token");
      try {
        const res = await fetch("http://hrms-backend.test/api/employees", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });

        if (res.status === 401) {
          terminateSession();
          return;
        }

        const data = await res.json();
        const empList = data?.data || data;
        setEmployees(Array.isArray(empList) ? empList : []);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch:", err);
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // --- Session Management ---
  const terminateSession = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data"); // Clear any other stored user info
    window.location.href = "/login";
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout and end your session?")) {
      terminateSession();
    }
  };

  // --- Data Formatting Logic ---
  const formatDataForMetric = (metric) => {
    const counts = {};
    employees.forEach((emp) => {
      let key = "Not Specified";
      if (metric === "level") {
        if (emp.user?.education && emp.user.education.length > 0) {
          key = emp.user.education[0].level;
        }
      } else if (metric === "salary") {
        const s = parseFloat(emp.salary);
        if (s < 15000) key = "0-15k";
        else if (s < 30000) key = "15k-30k";
        else if (s < 50000) key = "30k-50k";
        else key = "50k+";
      } else {
        key = emp[metric] || "Not Specified";
      }
      const label = key.toUpperCase();
      counts[label] = (counts[label] || 0) + 1;
    });

    const eduOrder = ["DIPLOMA", "DEGREE", "BA", "BSC", "MA", "MSC", "MBA", "PHD", "NOT SPECIFIED"];
    return Object.keys(counts).map(k => ({ name: k, value: counts[k] }))
      .sort((a, b) => {
        if (metric === "level") return eduOrder.indexOf(a.name) - eduOrder.indexOf(b.name);
        return 0;
      });
  };

  const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

  const DataChart = ({ title, metric }) => {
    const data = formatDataForMetric(metric);
    const commonProps = { data, margin: { top: 10, right: 10, left: -20, bottom: 0 } };

    return (
      <div className="chart-card">
        <h3>{title}</h3>
        <ResponsiveContainer width="100%" height={250}>
          {globalChartStyle === "pie" ? (
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          ) : globalChartStyle === "line" ? (
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          ) : globalChartStyle === "area" ? (
            <AreaChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Area type="monotone" dataKey="value" stroke="#4f46e5" fill="#c7d2fe" />
            </AreaChart>
          ) : (
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={12} allowDecimals={false} />
              <Tooltip cursor={{ fill: "#f1f5f9" }} />
              <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <div className="director-container">
      {/* Mobile Header/Toggle */}
      <button className="mobile-toggle-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
        {isMenuOpen ? "✕" : "☰"}
      </button>

      {/* Sidebar with Integrated Logout */}
      <nav className={`left-navbar ${isMenuOpen ? "mobile-open" : ""}`}>
        <div className="nav-logo">DIRECTOR PANEL</div>
        <ul className="nav-links">
          <li className={activeTab === "main" ? "active" : ""} onClick={() => { setActiveTab("main"); setIsMenuOpen(false); }}>🏠 Dashboard</li>
          <li className={activeTab === "employees" ? "active" : ""} onClick={() => { setActiveTab("employees"); setIsMenuOpen(false); }}>👥 Employees</li>
          <li className={activeTab === "leaves" ? "active" : ""} onClick={() => { setActiveTab("leaves"); setIsMenuOpen(false); }}>📅 Leaves</li>
          <li className={activeTab === "overview" ? "active" : ""} onClick={() => { setActiveTab("overview"); setIsMenuOpen(false); }}>📢 Updates</li>
          
          {/* Logout button at the bottom of the nav */}
          <li className="nav-logout-item" onClick={handleLogout} style={{ marginTop: 'auto', color: '#ef4444', fontWeight: 'bold' }}>
            🚪 Logout
          </li>
        </ul>
      </nav>

      {/* Overlay for mobile sidebar */}
      {isMenuOpen && <div className="sidebar-overlay" onClick={() => setIsMenuOpen(false)}></div>}

      <main className="main-content">
        {loading ? (
          <div className="loading-spinner"><h3>Syncing Data...</h3></div>
        ) : (
          <>
            {activeTab === "main" && (
              <div className="dashboard-summary">
                <div className="dashboard-header-flex">
                  <h1>Executive Analytics Dashboard</h1>
                  <div className="style-selector-container">
                    <span>Visual Style:</span>
                    <select value={globalChartStyle} onChange={(e) => setGlobalChartStyle(e.target.value)}>
                      <option value="bar">Bar Graphs</option>
                      <option value="pie">Pie Charts</option>
                      <option value="line">Line Graphs</option>
                      <option value="area">Area Charts</option>
                    </select>
                  </div>
                </div>

                <div className="stats-grid">
                  <div className="stat-box"><h3>Total Staff</h3><p>{employees.length}</p></div>
                  <div className="stat-box"><h3>Active Depts</h3><p>{[...new Set(employees.map(e => e.department))].length}</p></div>
                  <div className="stat-box"><h3>System Status</h3><p style={{ color: "#22c55e" }}>Active</p></div>
                </div>

                <div className="charts-main-grid">
                  <DataChart title="Staff by Department" metric="department" />
                  <DataChart title="Gender Distribution" metric="gender" />
                  <DataChart title="Education Qualifications" metric="level" />
                  <DataChart title="Salary Brackets" metric="salary" />
                </div>
              </div>
            )}

            {activeTab === "employees" && <EmployeeTab employees={employees} />}
            {activeTab === "leaves" && <LeavesTab employees={employees} />}
            {activeTab === "overview" && <OverviewTab />}
          </>
        )}
      </main>
    </div>
  );
}