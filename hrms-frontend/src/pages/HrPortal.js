import React, { useState, useEffect } from "react";
import EmployeeList from "../components/hr/EmployeeList";
import EmployeeProfile from "../components/hr/EmployeeProfile";
import EmployeeTabs from "../components/hr/EmployeeTabs";
import EmployeeMovementForm from "../components/hr/EmployeeMovementForm";
import EmployeeReport from "../components/hr/EmployeeReport";
import "../components/hr/HrPortal.css";

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

  useEffect(() => {
    loadEmployees();
  }, []);

  // ===============================
  // LOAD EMPLOYEES
  // ===============================
  const loadEmployees = async () => {
    const token = localStorage.getItem("auth_token");

    try {
      let res = await fetch(`${API_BASE}/employees`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      let data = await res.json();

      if (!Array.isArray(data) || data.length === 0) {
        res = await fetch(`${API_BASE}/employee-profile`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`
          }
        });
        data = await res.json();
      }

      setEmployees(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  // ===============================
  // FETCH FULL EMPLOYEE
  // ===============================
  const fetchFullEmployee = async (userId) => {
    const token = localStorage.getItem("auth_token");

    try {
      const res = await fetch(`${API_BASE}/employee-by-user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();

      setSelectedEmployee(data);
      setEducation(data.user?.education || []);
      setExperience(data.user?.experience || []);
      setBiography(
        data.user?.biography
          ? [data.user.biography]
          : [{ bio_text: "" }]
      );
      setDocuments(data.user?.documents || []);
    } catch (err) {
      console.error(err);
    }
  };

  // ===============================
  // SELECT EMPLOYEE
  // ===============================
  const handleSelectEmployee = async (emp) => {

    if (emp?.type === "report") {
      if (!emp.user_id) {
        alert("No user_id found!");
        return;
      }

      setReportUserId(emp.user_id);
      setActiveScreen("report");
      return;
    }

    if (!emp) {
      setSelectedEmployee(null);
      setEducation([]);
      setExperience([]);
      setBiography([{ bio_text: "" }]);
      setDocuments([]);
      setIsEditing(true);
      setActiveScreen("editor");
      return;
    }

    if (!emp.user_id) {
      alert("Employee missing user_id");
      return;
    }

    await fetchFullEmployee(emp.user_id);
    setIsEditing(false);
    setActiveScreen("editor");
  };

  // ===============================
  // ✅ FIXED SAVE (FORMDATA)
  // ===============================
  const handleGlobalSave = async (formData) => {
    if (!window.confirm("Save all changes?")) return;

    const token = localStorage.getItem("auth_token");

    // 🔥 FIXED HERE
    const isUpdate = selectedEmployee !== null;

    // 🔥 attach extra data
    formData.append("name", formData.get("full_name") || "");
    formData.append("education", JSON.stringify(educationList));
    formData.append("experience", JSON.stringify(experienceList));
    formData.append("biography", JSON.stringify(biographyList[0] || {}));
    formData.append("documents", JSON.stringify(documents || []));

    // 🔥 ensure email exists (IMPORTANT)
    if (!formData.get("email")) {
      alert("Email is required");
      return;
    }

    // default password for new
    if (!isUpdate && !formData.get("password")) {
      formData.append("password", "password123");
    }

    // 🔥 Laravel PUT fix
    if (isUpdate && selectedEmployee?.id) {
      formData.append("_method", "PUT");
    }

    const url = isUpdate
      ? `${API_BASE}/employees/${selectedEmployee.id}`
      : `${API_BASE}/employees`;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      console.log("SERVER RESPONSE:", data);

      if (res.ok) {
        alert("✅ Saved with photo!");
        setIsEditing(false);
        loadEmployees();
        setActiveScreen("list");
      } else {
        alert(data.message || "❌ Save failed");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ===============================
  // DELETE
  // ===============================
  const handleDelete = async (id) => {
    if (!window.confirm("Delete?")) return;

    const token = localStorage.getItem("auth_token");

    await fetch(`${API_BASE}/employees/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });

    loadEmployees();
    setActiveScreen("list");
  };

  // ===============================
  // LOGOUT
  // ===============================
  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    window.location.reload();
  };

  return (
    <div className="hp-dashboard-layout">

      {/* SIDEBAR */}
      <aside className="hp-sidebar">
        <button onClick={() => setActiveScreen("dashboard")}>🏠 Dashboard</button>
        <button onClick={() => setActiveScreen("list")}>👥 Employee List</button>
        <button onClick={() => setActiveScreen("movement")}>📈 Movement</button>
        <button onClick={() => handleSelectEmployee(null)}>➕ Add Staff</button>
        <button onClick={handleLogout}>🚪 Logout</button>
      </aside>

      {/* MAIN */}
      <main className="hp-main-content">

        {activeScreen === "dashboard" && (
          <div>
            <h1>HR Dashboard</h1>
            <p>Total Employees: {employees.length}</p>
          </div>
        )}

        {activeScreen === "list" && (
          <EmployeeList
            employees={employees}
            openProfile={handleSelectEmployee}
          />
        )}

        {activeScreen === "editor" && (
          <>
            <button onClick={() => setActiveScreen("list")}>← Back</button>

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

            <button
              onClick={() => {
                if (!selectedEmployee?.user_id) {
                  alert("No employee selected");
                  return;
                }

                setReportUserId(selectedEmployee.user_id);
                setActiveScreen("report");
              }}
              className="hp-btn-save-main"
            >
              📄 View Report
            </button>

            <button
              onClick={() => setActiveScreen("movement")}
              className="hp-btn-edit-main"
            >
              ➕ Add Movement
            </button>
          </>
        )}

        {activeScreen === "movement" && (
          <EmployeeMovementForm employee={selectedEmployee} />
        )}

        {activeScreen === "report" && (
          <>
            <button onClick={() => setActiveScreen("list")}>← Back</button>

            {!reportUserId ? (
              <p>⚠️ No employee selected for report</p>
            ) : (
              <EmployeeReport employeeId={reportUserId} />
            )}
          </>
        )}

      </main>
    </div>
  );
}