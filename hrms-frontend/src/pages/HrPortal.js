import React, { useState, useEffect } from "react";
import EmployeeList from "../components/hr/EmployeeList";
import EmployeeProfile from "../components/hr/EmployeeProfile";
import EmployeeTabs from "../components/hr/EmployeeTabs";
import "../components/hr/HrPortal.css";

const API_BASE = "https://hrms-owyj.onrender.com/api"; 

export default function HrPortal() {
  const [activeScreen, setActiveScreen] = useState("dashboard");
  const [activeTab, setActiveTab] = useState("education");
  const [isEditing, setIsEditing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // For responsive toggle

  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Related Tables States
  const [educationList, setEducation] = useState([]);
  const [experienceList, setExperience] = useState([]);
  const [biographyList, setBiography] = useState([]);
  const [documents, setDocuments] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadEmployees();
  }, []);

  // Terminate Session logic
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_data");
      window.location.reload(); // Refresh to clear state and redirect to login
    }
  };

  const loadEmployees = async () => {
    const token = localStorage.getItem("auth_token");
    try {
      const res = await fetch(`${API_BASE}/employees`, {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}` 
        }
      });
      const data = await res.json();
      setEmployees(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading employees:", err);
    }
  };

  const handleSelectEmployee = async (emp) => {
    setIsSidebarOpen(false);
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

    const token = localStorage.getItem("auth_token");
    try {
      const res = await fetch(`${API_BASE}/employee-by-user/${emp.user_id}`, {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      
      setSelectedEmployee(data);
      setEducation(data.user?.education || []);
      setExperience(data.user?.experience || []);
      setBiography(data.user?.biography ? [data.user.biography] : [{ bio_text: "" }]);
      setDocuments(data.user?.documents || []);
      
      setIsEditing(false); 
      setActiveScreen("editor");
      setActiveTab("education");
    } catch (err) {
      console.error("Error fetching full details:", err);
    }
  };

  const handleGlobalSave = async (profileData) => {
    if (!window.confirm("Save all changes to the database?")) return;

    const isUpdate = !!selectedEmployee?.id;
    const token = localStorage.getItem("auth_token");

    const cleanEducation = educationList.map(({ id, user_id, created_at, updated_at, ...rest }) => ({
        level: rest.level || "",
        field: rest.field || "",
        institution: rest.institution || "",
        start_date: rest.start_date || null,
        end_date: rest.end_date || null,
        notes: rest.notes || ""
    }));

    const cleanExperience = experienceList.map(({ id, user_id, created_at, updated_at, ...rest }) => ({
        company: rest.company || "",
        role: rest.role || "",
        start_date: rest.start_date || null,
        end_date: rest.end_date || null,
        responsibilities: rest.responsibilities || ""
    }));

    const payload = {
      ...profileData,
      name: profileData.full_name || profileData.name, 
      full_name: profileData.full_name || profileData.name, 
      education: cleanEducation,
      experience: cleanExperience,
      biography: biographyList[0] || { bio_text: "" },
      documents: documents || []
    };

    if (!isUpdate && !payload.password) {
       payload.password = "password123"; 
    }

    const url = isUpdate 
      ? `${API_BASE}/employees/${selectedEmployee.id}` 
      : `${API_BASE}/employees`;

    try {
      const res = await fetch(url, {
        method: isUpdate ? "PUT" : "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const responseData = await res.json();

      if (res.ok) {
        alert(isUpdate ? "Updated Successfully! ✅" : "Registered Successfully! ✅");
        setIsEditing(false);
        await loadEmployees(); 
        setActiveScreen("list");
      } else {
        const errorDetails = responseData.errors 
          ? Object.values(responseData.errors).flat().join("\n")
          : responseData.message;
        alert(`Validation Error:\n${errorDetails}`);
      }
    } catch (err) {
      alert("Network error: Check your connection.");
    }
  };
  
  const handleGlobalDelete = async (id) => {
    if (!id || !window.confirm("Delete this employee record permanently?")) return;
    const token = localStorage.getItem("auth_token");
    try {
      const res = await fetch(`${API_BASE}/employees/${id}`, { 
        method: "DELETE",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        loadEmployees();
        setActiveScreen("list");
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return (
    <div className="hp-dashboard-layout">
      {/* Mobile Header */}
      <header className="hp-mobile-header">
        <div className="hp-logo-small">HRMS PRO</div>
        <button className="hp-menu-toggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? "✕" : "⋮"} 
        </button>
      </header>

      {/* Sidebar with Logout */}
      <aside className={`hp-sidebar ${isSidebarOpen ? "hp-sidebar-open" : ""}`}>
        <div className="hp-sidebar-header">
            <div className="hp-logo">HRMS PRO</div>
            <button className="hp-close-sidebar" onClick={() => setIsSidebarOpen(false)}>✕</button>
        </div>
        <nav className="hp-nav">
          <button className={`hp-nav-link ${activeScreen === "dashboard" ? "active" : ""}`} onClick={() => { setActiveScreen("dashboard"); setIsSidebarOpen(false); }}>🏠 Dashboard</button>
          <button className={`hp-nav-link ${activeScreen === "list" ? "active" : ""}`} onClick={() => { setActiveScreen("list"); setIsSidebarOpen(false); }}>👥 Employee List</button>
          <button className="hp-nav-link hp-btn-add-nav" onClick={() => handleSelectEmployee(null)}>➕ Add New Staff</button>
          
          {/* Logout Button */}
          <button className="hp-nav-link" style={{ marginTop: 'auto', color: '#ef4444' }} onClick={handleLogout}>
            🚪 Logout
          </button>
        </nav>
      </aside>

      {isSidebarOpen && <div className="hp-overlay" onClick={() => setIsSidebarOpen(false)}></div>}

      <main className="hp-main-content">
        {activeScreen === "dashboard" && (
          <div className="hp-dashboard-home">
            <div className="hp-intro-card">
              <h1>HR Management</h1>
              <p>Total Records: <strong>{employees.length}</strong></p>
            </div>
            <div className="hp-stats-grid">
               <div className="hp-stat-card">
                  <h4 className="hp-stat-label">Active</h4>
                  <h2 className="hp-stat-value hp-color-green">{employees.filter(e => e.status === 'active').length}</h2>
               </div>
               <div className="hp-stat-card">
                  <h4 className="hp-stat-label">On Leave</h4>
                  <h2 className="hp-stat-value hp-color-orange">{employees.filter(e => e.status === 'on-leave').length}</h2>
               </div>
               <div className="hp-stat-card">
                  <h4 className="hp-stat-label">Departments</h4>
                  <h2 className="hp-stat-value hp-color-blue">{[...new Set(employees.map(e => e.department))].length}</h2>
               </div>
            </div>
          </div>
        )}

        {activeScreen === "list" && (
          <EmployeeList 
            employees={employees} 
            openProfile={handleSelectEmployee} 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm} 
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        )}

        {activeScreen === "editor" && (
          <div className="hp-editor-view">
            <button className="hp-btn-back" onClick={() => setActiveScreen("list")}>← Back to List</button>
            <div className="hp-editor-layout">
              <EmployeeProfile 
                employee={selectedEmployee} 
                isEditing={isEditing}
                setIsEditing={setIsEditing} 
                onSave={handleGlobalSave} 
                onDelete={handleGlobalDelete} 
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
          </div>
        )}
      </main>
    </div>
  );
}