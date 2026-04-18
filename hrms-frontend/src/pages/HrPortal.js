import React, { useState, useEffect, useCallback } from "react";
import EmployeeList from "../components/hr/EmployeeList";
import EmployeeProfile from "../components/hr/EmployeeProfile";
import EmployeeTabs from "../components/hr/EmployeeTabs";
import EmployeeMovementForm from "../components/hr/EmployeeMovementForm";
import EmployeeReport from "../components/hr/EmployeeReport";
import "../components/hr/HrPortal.css";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";

const API_BASE = "https://hrms-owyj.onrender.com/api";

export default function HrPortal() {
  const [activeScreen, setActiveScreen] = useState("dashboard");
  const [activeTab, setActiveTab] = useState("education");
  const [isEditing, setIsEditing] = useState(false);

  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Tab data
  const [educationList, setEducation] = useState([]);
  const [experienceList, setExperience] = useState([]);
  const [biographyList, setBiography] = useState([]);
  const [documents, setDocuments] = useState([]);

  // Report
  const [reportUserId, setReportUserId] = useState(null);

  const [chartStyle, setChartStyle] = useState("bar");

  const [lastFetchedSnapshot, setLastFetchedSnapshot] = useState(null);

  const authToken = useCallback(() => localStorage.getItem("auth_token"), []);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    const token = authToken();
    if (!token) return;

    try {
      let res = await fetch(`${API_BASE}/employees`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      let data = await res.json();

      if (!Array.isArray(data) || data.length === 0) {
        res = await fetch(`${API_BASE}/employee-profile`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        data = await res.json();
      }

      setEmployees(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load employees:", err);
      setEmployees([]);
    }
  };

  const normalizeEmployeePayload = (data) => {
    const user = data?.user || {};
    return {
      ...data,
      user: {
        education: Array.isArray(user.education) ? user.education : [],
        experience: Array.isArray(user.experience) ? user.experience : [],
        biography: user.biography ?? null,
        documents: Array.isArray(user.documents) ? user.documents : [],
        ...user,
      },
    };
  };

  const fetchFullEmployee = async (userId) => {
    const token = authToken();

    try {
      const res = await fetch(`${API_BASE}/employee-by-user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = normalizeEmployeePayload(await res.json());

      setSelectedEmployee(data);
      setLastFetchedSnapshot(data);

      setEducation(Array.isArray(data?.user?.education) ? data.user.education : []);
      setExperience(Array.isArray(data?.user?.experience) ? data.user.experience : []);

      setBiography(
        data?.user?.biography
          ? [{ bio_text: data.user.biography.bio_text || "" }]
          : [{ bio_text: "" }]
      );

      setDocuments(Array.isArray(data?.user?.documents) ? data.user.documents : []);
    } catch (err) {
      console.error("Failed to fetch full employee:", err);
      setSelectedEmployee(null);
      setLastFetchedSnapshot(null);
      setEducation([]);
      setExperience([]);
      setBiography([{ bio_text: "" }]);
      setDocuments([]);
    }
  };

  const handleSelectEmployee = async (emp) => {
    if (emp?.type === "report") {
      if (!emp.user_id) return alert("No user_id found!");
      setReportUserId(emp.user_id);
      setActiveScreen("report");
      return;
    }

    if (!emp) {
      // Add new employee
      setSelectedEmployee(null);
      setLastFetchedSnapshot(null);
      setEducation([]);
      setExperience([]);
      setBiography([{ bio_text: "" }]);
      setDocuments([]);
      setIsEditing(true);
      setActiveScreen("editor");
      return;
    }

    if (!emp.user_id) return alert("Employee missing user_id");

    setIsEditing(false);
    await fetchFullEmployee(emp.user_id);
    setActiveScreen("editor");
  };

  // ===============================
  // ✅ FINAL FIXED SAVE FUNCTION
  // ===============================
  const handleGlobalSave = async (formData) => {
    if (!window.confirm("Save all changes?")) return;

    const token = authToken();
    const isUpdate = !!selectedEmployee?.id;

    // Basic validation
    const fullName = formData.get("full_name") || formData.get("name") || "";
    const email = formData.get("email") || "";

    if (!fullName.trim()) return alert("Full name is required");
    if (!email.trim()) return alert("Email is required");

    // Fix hire_date format (if sent as dd/mm/yyyy)
    let hireDate = formData.get("hire_date");
    if (hireDate && hireDate.includes("/")) {
      const parts = hireDate.split("/");
      if (parts.length === 3) {
        hireDate = `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
        formData.set("hire_date", hireDate);
      }
    }

    // === Copy all important basic fields safely ===
    const importantFields = [
      "full_name", "name", "email", "position_number", "grade", "step",
      "salary", "hire_date", "status", "phone_number", "address", "gender",
      "department"
    ];

    importantFields.forEach((field) => {
      const value = formData.get(field);
      if (value !== null && value !== undefined && value !== "") {
        formData.set(field, value);   // .set prevents duplicates
      }
    });

    // Name fallback
    if (formData.get("full_name") && !formData.get("name")) {
      formData.set("name", formData.get("full_name"));
    }

    // === Send tab data as JSON strings (Critical Fix) ===
    formData.set("education", JSON.stringify(educationList || []));
    formData.set("experience", JSON.stringify(experienceList || []));
    formData.set("biography", JSON.stringify(biographyList?.[0] || { bio_text: "" }));
    formData.set("documents", JSON.stringify(documents || []));

    // Default password for new employees
    if (!isUpdate) {
      if (!formData.get("password")) {
        formData.set("password", "password123");
      }
      if (!formData.get("password_confirmation")) {
        formData.set("password_confirmation", "password123");
      }
    }

    // Laravel PUT method spoofing
    if (isUpdate && selectedEmployee?.id) {
      formData.set("_method", "PUT");
    }

    const url = isUpdate
      ? `${API_BASE}/employees/${selectedEmployee.id}`
      : `${API_BASE}/employees`;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // Do NOT set Content-Type when using FormData
        },
        body: formData,
      });

      let responseData = {};
      const text = await res.text();
      try {
        responseData = JSON.parse(text);
      } catch (e) {
        console.warn("Non-JSON response received");
      }

      console.log("Save Response:", responseData);

      if (res.ok) {
        alert(isUpdate ? "✅ Employee updated successfully!" : "✅ New employee created successfully!");

        await loadEmployees();           // Refresh list
        setIsEditing(false);
        setActiveScreen("list");
        setSelectedEmployee(null);       // Clear selection
        setLastFetchedSnapshot(null);
      } else {
        console.error("Save failed:", responseData);
        alert(responseData.message || responseData.error || "❌ Save failed. Check console for details.");
      }
    } catch (err) {
      console.error("Network error during save:", err);
      alert("❌ Network error while saving employee.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to DELETE this employee?")) return;

    const token = authToken();
    try {
      await fetch(`${API_BASE}/employees/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      await loadEmployees();
      setActiveScreen("list");
    } catch (err) {
      console.error(err);
      alert("Failed to delete employee");
    }
  };

  const handleLogout = () => {
    if (!window.confirm("Are you sure you want to logout?")) return;
    localStorage.removeItem("auth_token");
    window.location.reload();
  };

  // Chart formatting logic (unchanged)
  const formatData = (metric) => {
    const counts = {};

    employees.forEach((emp) => {
      let key = "Unknown";

      if (metric === "status") {
        const status = (emp.status || "Active").toLowerCase();
        key = status === "on leave" ? "On Leave" : status === "inactive" ? "Inactive" : "Active";
      } else if (metric === "gender") {
        key = (emp.gender || "Not Specified").toUpperCase();
        if (key !== "MALE" && key !== "FEMALE") key = "Not Specified";
      } else if (metric === "salary") {
        const s = parseFloat(emp.salary);
        if (isNaN(s)) key = "Unknown";
        else if (s < 15000) key = "0-15k";
        else if (s < 30000) key = "15k-30k";
        else if (s < 50000) key = "30k-50k";
        else key = "50k+";
      } else if (metric === "education") {
        key = emp.user?.education?.[0]?.level || "Unknown";
      } else {
        key = emp[metric] || "Unknown";
      }

      counts[key] = (counts[key] || 0) + 1;
    });

    return Object.keys(counts).map((k) => ({
      name: k,
      value: counts[k],
    }));
  };

  const COLORS = ["#2563eb", "#16a34a", "#f59e0b", "#dc2626", "#8b5cf6"];

  const Chart = ({ title, metric }) => {
    const data = formatData(metric);

    return (
      <div className="hp-card">
        <h3>{title}</h3>
        <ResponsiveContainer width="100%" height={250}>
          {chartStyle === "pie" ? (
            <PieChart>
              <Pie data={data} dataKey="value" label>
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          ) : chartStyle === "line" ? (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line dataKey="value" stroke="#2563eb" strokeWidth={2} />
            </LineChart>
          ) : chartStyle === "area" ? (
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Area dataKey="value" fill="#93c5fd" />
            </AreaChart>
          ) : (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#2563eb" />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <div className="hp-dashboard-layout">
      <aside className="hp-sidebar">
        <button onClick={() => setActiveScreen("dashboard")}>🏠 Dashboard</button>
        <button onClick={() => setActiveScreen("list")}>👥 Employee List</button>
        <button onClick={() => setActiveScreen("movement")}>📈 Movement</button>
        <button onClick={() => handleSelectEmployee(null)}>➕ Add Staff</button>
        <button onClick={handleLogout} className="hp-btn-delete">
          🚪 Logout
        </button>
      </aside>

      <main className="hp-main-content">
        {activeScreen === "dashboard" && (
          <>
            <div className="hp-card">
              <h1>About the Organization</h1>
              <p>This HR system supports employee lifecycle, planning, and analytics.</p>

              <div className="hp-grid-2" style={{ marginTop: 20 }}>
                <div className="hp-card">
                  <h3>Total Employees</h3>
                  <h2>{employees.length}</h2>
                </div>

                <div className="hp-card">
                  <h3>Departments</h3>
                  <h2>{[...new Set(employees.map((e) => e.department))].filter(Boolean).length}</h2>
                </div>
              </div>
            </div>

            <div className="hp-card">
              <label>Select Chart Type: </label>
              <select value={chartStyle} onChange={(e) => setChartStyle(e.target.value)}>
                <option value="bar">Bar</option>
                <option value="pie">Pie</option>
                <option value="line">Line</option>
                <option value="area">Area</option>
              </select>
            </div>

            <div className="hp-grid-2">
              <Chart title="By Department" metric="department" />
              <Chart title="Gender Distribution" metric="gender" />
              <Chart title="Status Distribution" metric="status" />
              <Chart title="Salary Distribution" metric="salary" />
              <Chart title="Education Level" metric="education" />
            </div>
          </>
        )}

        {activeScreen === "list" && (
          <EmployeeList 
            employees={employees} 
            openProfile={handleSelectEmployee} 
          />
        )}

        {activeScreen === "editor" && (
          <div className="hp-card">
            <button className="hp-btn hp-btn-view" onClick={() => setActiveScreen("list")}>
              ← Back
            </button>

            <EmployeeProfile
              employee={selectedEmployee}
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              onSave={handleGlobalSave}
              onDelete={handleDelete}
            />

            <EmployeeTabs
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              isEditing={isEditing}
              educationList={educationList}
              experienceList={experienceList}
              biographyList={biographyList}
              documents={documents}
              setEducation={setEducation}
              setExperience={setExperience}
              setBiography={setBiography}
              setDocuments={setDocuments}
            />
          </div>
        )}

        {activeScreen === "movement" && <EmployeeMovementForm employee={selectedEmployee} />}

        {activeScreen === "report" && (
          <div className="hp-card">
            <button className="hp-btn hp-btn-view" onClick={() => setActiveScreen("list")}>
              ← Back
            </button>
            {!reportUserId ? (
              <p>No employee selected for report</p>
            ) : (
              <EmployeeReport employeeId={reportUserId} />
            )}
          </div>
        )}
      </main>
    </div>
  );
}