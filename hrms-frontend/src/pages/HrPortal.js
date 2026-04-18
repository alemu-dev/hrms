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

  const [educationList, setEducation] = useState([]);
  const [experienceList, setExperience] = useState([]);
  const [biographyList, setBiography] = useState([]);
  const [documents, setDocuments] = useState([]);

  const [reportUserId, setReportUserId] = useState(null);
  const [chartStyle, setChartStyle] = useState("bar");

  const authToken = useCallback(() => localStorage.getItem("auth_token"), []);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    const token = authToken();
    if (!token) return;

    try {
      let res = await fetch(`${API_BASE}/employees`, {
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      });

      let data = await res.json();

      if (!Array.isArray(data) || data.length === 0) {
        res = await fetch(`${API_BASE}/employee-profile`, {
          headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        });
        data = await res.json();
      }

      setEmployees(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load employees:", err);
    }
  };

  const fetchFullEmployee = async (userId) => {
    const token = authToken();
    try {
      const res = await fetch(`${API_BASE}/employee-by-user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      setSelectedEmployee(data);
      setEducation(Array.isArray(data.user?.education) ? data.user.education : []);
      setExperience(Array.isArray(data.user?.experience) ? data.user.experience : []);
      setBiography(
        data.user?.biography
          ? [{ bio_text: data.user.biography.bio_text || "" }]
          : [{ bio_text: "" }]
      );
      setDocuments(Array.isArray(data.user?.documents) ? data.user.documents : []);
    } catch (err) {
      console.error(err);
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
      // Add New Employee
      setSelectedEmployee(null);
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
  // ✅ HYBRID SAVE - Best for Production (Photo + Complex Data)
  // ===============================
  const handleGlobalSave = async (formData) => {
    if (!window.confirm("Save all changes?")) return;

    const token = authToken();
    const isUpdate = !!selectedEmployee?.id;

    const payload = {
      name: formData.get("full_name") || formData.get("name") || "",
      email: formData.get("email") || "",
      position_number: formData.get("position_number") || "",
      grade: formData.get("grade") || "",
      step: formData.get("step") || "",
      salary: formData.get("salary") || "",
      hire_date: formData.get("hire_date") || "",
      status: formData.get("status") || "active",
      phone_number: formData.get("phone_number") || "",
      address: formData.get("address") || "",
      gender: formData.get("gender") || "",
      department: formData.get("department") || "",

      education: educationList || [],
      experience: experienceList || [],
      biography: biographyList?.[0] || { bio_text: "" },
      documents: documents || [],
    };

    if (!payload.name.trim()) return alert("Full name is required");
    if (!payload.email.trim()) return alert("Email is required");

    if (!isUpdate) {
      payload.password = "password123";
      payload.password_confirmation = "password123";
    }

    const finalFormData = new FormData();
    finalFormData.append("data", JSON.stringify(payload));

    // Append photo if user uploaded one
    const photoFile = formData.get("photo");
    if (photoFile) {
      finalFormData.append("photo", photoFile);
    }

    if (isUpdate && selectedEmployee?.id) {
      finalFormData.append("_method", "PUT");
    }

    const url = isUpdate
      ? `${API_BASE}/employees/${selectedEmployee.id}`
      : `${API_BASE}/employees`;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: finalFormData,
      });

      let responseData = {};
      try {
        responseData = await res.json();
      } catch (e) {}

      if (res.ok) {
        alert(isUpdate ? "✅ Employee updated successfully!" : "✅ New employee created successfully!");
        await loadEmployees();
        setIsEditing(false);
        setActiveScreen("list");
        setSelectedEmployee(null);
      } else {
        console.error("Save failed:", responseData);
        alert(responseData.message || "❌ Save failed");
      }
    } catch (err) {
      console.error("Network error:", err);
      alert("❌ Network error while saving.");
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
      alert("Failed to delete employee");
    }
  };

  const handleLogout = () => {
    if (!window.confirm("Are you sure you want to logout?")) return;
    localStorage.removeItem("auth_token");
    window.location.reload();
  };

  // ==================== CHART FUNCTIONS (Unchanged) ====================
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

    return Object.keys(counts).map((k) => ({ name: k, value: counts[k] }));
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
                {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
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
        <button onClick={handleLogout} className="hp-btn-delete">🚪 Logout</button>
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
          <EmployeeList employees={employees} openProfile={handleSelectEmployee} />
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