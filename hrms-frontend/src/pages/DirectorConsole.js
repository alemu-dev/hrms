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
  
  // Toggle the visual style for the entire dashboard at once
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
          localStorage.clear();
          window.location.href = "/login";
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

  // --- Helper to format data for any metric ---
  const formatDataForMetric = (metric) => {
    const counts = {};
    employees.forEach((emp) => {
      let key = "Not Specified";

      // Logic to extract the correct key based on metric
      if (metric === "level") {
        // Since 'level' is inside user.education (which is an array), we take the first one
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
        // For department or gender
        key = emp[metric] || "Not Specified";
      }

      // Standardize casing (e.g., 'BA' and 'ba' become the same)
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

  // --- Internal Component to render specific chart types based on global selection ---
  const DataChart = ({ title, metric }) => {
    const data = formatDataForMetric(metric);
    const commonProps = { data, margin: { top: 10, right: 10, left: -20, bottom: 0 } };

    return (
      <div className="chart-card" style={{ background: "#fff", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
        <h3 style={{ marginBottom: "15px", color: "#475569", fontSize: "1.1rem" }}>{title}</h3>
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
      <nav className="left-navbar">
        <div className="nav-logo">DIRECTOR PANEL</div>
        <ul className="nav-links">
          <li className={activeTab === "main" ? "active" : ""} onClick={() => setActiveTab("main")}>🏠 Dashboard</li>
          <li className={activeTab === "employees" ? "active" : ""} onClick={() => setActiveTab("employees")}>👥 Employees</li>
          <li className={activeTab === "leaves" ? "active" : ""} onClick={() => setActiveTab("leaves")}>📅 Leaves</li>
          <li className={activeTab === "overview" ? "active" : ""} onClick={() => setActiveTab("overview")}>📢 Updates</li>
        </ul>
      </nav>

      <main className="main-content" style={{ background: "#f8fafc" }}>
        {loading ? (
          <div className="loading-spinner"><h3>Syncing Data...</h3></div>
        ) : (
          <>
            {activeTab === "main" && (
              <div className="dashboard-summary">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <h1>Executive Analytics Dashboard</h1>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center", background: "#fff", padding: "10px", borderRadius: "30px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
                    <span style={{ fontWeight: "600", fontSize: "0.9rem", marginLeft: "5px" }}>Visual Style:</span>
                    <select 
                      value={globalChartStyle} 
                      onChange={(e) => setGlobalChartStyle(e.target.value)}
                      style={{ border: "none", outline: "none", background: "transparent", color: "#6366f1", fontWeight: "bold", cursor: "pointer" }}
                    >
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

                {/* --- 4-CHART GRID VIEW --- */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))", gap: "20px", marginTop: "25px" }}>
                  <DataChart title="Staff by Department" metric="department" />
                  <DataChart title="Gender Distribution" metric="gender" />
                  <DataChart title="Education Qualifications" metric="level" />
                  <DataChart title="Salary Brackets (Histogram)" metric="salary" />
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