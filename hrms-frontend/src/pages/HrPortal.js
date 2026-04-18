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

// 🔥 UPDATE THIS TO YOUR ACTUAL LARAVEL BACKEND URL
// It should be the Render (or other) service where your Laravel API is deployed
const API_BASE = "https://hrms-owyj.onrender.com/api";  
// Change it to something like: "https://your-laravel-backend.onrender.com/api"

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
    if (!token) {
      console.error("No auth token found");
      return;
    }

    try {
      let res = await fetch(`${API_BASE}/employees`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      let data = await res.json();

      // Fallback endpoint
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
      console.error("Load employees failed:", err);
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
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/employee-by-user/${userId}`, {
        headers: { 
          Accept: "application/json",
          Authorization: `Bearer ${token}` 
        },
      });

      const data = normalizeEmployeePayload(await res.json());

      setSelectedEmployee(data);
      setLastFetchedSnapshot(data);

      setEducation(Array.isArray(data?.user?.education) ? data.user.education : []);
      setExperience(Array.isArray(data?.user?.experience) ? data.user.experience : []);

      if (data?.user?.biography) {
        setBiography([{ bio_text: data.user.biography.bio_text || "" }]);
      } else {
        setBiography([{ bio_text: "" }]);
      }

      setDocuments(Array.isArray(data?.user?.documents) ? data.user.documents : []);
    } catch (err) {
      console.error("Fetch full employee failed:", err);
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
    setIsEditing(true);
    setActiveScreen("editor");
  };

  const handleGlobalSave = async (formData) => {
    if (!window.confirm("Save all changes?")) return;

    const token = authToken();
    const isUpdate = !!selectedEmployee;

    const fullName = formData.get("full_name") || "";
    const email = formData.get("email") || "";

    if (!fullName.trim()) return alert("Full name is required");
    if (!email.trim()) return alert("Email is required");

    // Fix hire_date format
    let hire_date = formData.get("hire_date");
    if (hire_date && hire_date.includes("/")) {
      const parts = hire_date.split("/");
      if (parts.length === 3) {
        hire_date = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }

    const url = isUpdate
      ? `${API_BASE}/employees/${selectedEmployee.id}`
      : `${API_BASE}/employees`;

    try {
      const sendFormData = new FormData();

      // Basic fields
      sendFormData.append("full_name", fullName);
      sendFormData.append("name", fullName);
      sendFormData.append("email", email);
      sendFormData.append("position_number", formData.get("position_number") || "");
      sendFormData.append("grade", formData.get("grade") || "");
      sendFormData.append("step", formData.get("step") || "");
      sendFormData.append("department", formData.get("department") || "");
      sendFormData.append("position", formData.get("position") || "");
      sendFormData.append("gender", formData.get("gender") || "");
      sendFormData.append("salary", formData.get("salary") || "");
      sendFormData.append("hire_date", hire_date || "");
      sendFormData.append("status", formData.get("status") || "");
      sendFormData.append("phone_number", formData.get("phone_number") || "");
      sendFormData.append("address", formData.get("address") || "");

      // Files
      if (formData.get("photo")) sendFormData.append("photo", formData.get("photo"));
      if (formData.get("national_id")) sendFormData.append("national_id", formData.get("national_id"));

      // Complex arrays as JSON strings
      sendFormData.append("education", JSON.stringify(educationList));
      sendFormData.append("experience", JSON.stringify(experienceList));
      sendFormData.append("biography", JSON.stringify(biographyList?.[0] || { bio_text: "" }));
      sendFormData.append("documents", JSON.stringify(documents || []));

      if (isUpdate) {
        sendFormData.append("_method", "PUT");
      }

      if (!isUpdate) {
        sendFormData.append("password", formData.get("password") || "password123");
      }

      console.log("🔄 Saving to:", url);
      console.log("📤 Is Update:", isUpdate);

      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",        // ← Important
        },
        body: sendFormData,
      });

      const responseText = await res.text();
      console.log("Status:", res.status);
      console.log("Content-Type:", res.headers.get("content-type"));
      console.log("Raw Response (first 700 chars):", responseText.substring(0, 700));

      // Check if we got HTML instead of JSON
      if (!responseText.trim().startsWith("{") && !responseText.trim().startsWith("[")) {
        throw new Error(`Expected JSON but received HTML (Status ${res.status})`);
      }

      const data = JSON.parse(responseText);

      if (res.ok) {
        alert("✅ Saved successfully!");
        setIsEditing(false);
        await loadEmployees();
        setActiveScreen("list");
      } else {
        console.error("Server Error:", data);
        alert(data?.message || `❌ Save failed (${res.status})`);
      }
    } catch (err) {
      console.error("💥 FULL SAVE ERROR:", err);
      alert("❌ Save failed. Check browser console for details.\n\nLikely cause: Wrong API_BASE or backend returning HTML.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to DELETE this employee?")) return;

    const token = authToken();
    await fetch(`${API_BASE}/employees/${id}`, {
      method: "DELETE",
      headers: { 
        Accept: "application/json",
        Authorization: `Bearer ${token}` 
      },
    });

    await loadEmployees();
    setActiveScreen("list");
  };

  const handleLogout = () => {
    if (!window.confirm("Are you sure you want to logout?")) return;
    localStorage.removeItem("auth_token");
    window.location.reload();
  };

  const formatData = (metric) => {
    const counts = {};

    employees.forEach((emp) => {
      let key = "Unknown";

      if (metric === "status") {
        const status = (emp.status || "Active").toLowerCase();
        key = status === "on leave" ? "On Leave" : 
              status === "inactive" ? "Inactive" : "Active";
      } 
      else if (metric === "gender") {
        key = (emp.gender || "Not Specified").toUpperCase();
        if (key !== "MALE" && key !== "FEMALE") key = "Not Specified";
      } 
      else if (metric === "salary") {
        const s = parseFloat(emp.salary);
        if (isNaN(s)) key = "Unknown";
        else if (s < 15000) key = "0-15k";
        else if (s < 30000) key = "15k-30k";
        else if (s < 50000) key = "30k-50k";
        else key = "50k+";
      } 
      else if (metric === "education") {
        key = emp.user?.education?.[0]?.level || "Unknown";
      } 
      else {
        key = emp[metric] || "Unknown";
      }

      key = key.toString();
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
            selectedEmployee={selectedEmployee}
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