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

  // ✅ ADDED: Security Badge logic for loading the list
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

  // ✅ ADDED: Security Badge logic for specific employee details
  const handleSelectEmployee = async (emp) => {
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

  // ✅ ADDED: Security Badge logic for Save/Update
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
          "Authorization": `Bearer ${token}` // ✅ Added token
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
        console.error("Validation Errors:", responseData.errors);
        const errorDetails = responseData.errors 
          ? Object.values(responseData.errors).flat().join("\n")
          : responseData.message;
          
        alert(`Validation Error:\n${errorDetails}`);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      alert("Network error: Check your connection to the Laravel server.");
    }
  };
  
  // ✅ ADDED: Security Badge logic for Delete
  const handleGlobalDelete = async (id) => {
    if (!id || !window.confirm("Delete this employee record permanently?")) return;
    const token = localStorage.getItem("auth_token");
    try {
      const res = await fetch(`${API_BASE}/employees/${id}`, { 
        method: "DELETE",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}` // ✅ Added token
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
      <aside className="hp-sidebar">
        <div className="hp-logo">HRMS PRO</div>
        <nav>
          <button className={activeScreen === "dashboard" ? "active" : ""} onClick={() => setActiveScreen("dashboard")}>🏠 Dashboard</button>
          <button className={activeScreen === "list" ? "active" : ""} onClick={() => setActiveScreen("list")}>👥 Employee List</button>
          <button onClick={() => handleSelectEmployee(null)}>➕ Add New Staff</button>
        </nav>
      </aside>

      <main className="hp-main-content">
        {activeScreen === "dashboard" && (
          <div className="hp-dashboard-home">
            <div className="hp-intro-card">
              <h1>HR Management</h1>
              <p>Total Records: <strong>{employees.length}</strong></p>
            </div>
            <div className="hp-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginTop: '20px' }}>
               <div className="stat-card" style={{ padding: '20px', background: '#fff', borderRadius: '10px', textAlign: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                  <h4 style={{ margin: 0, color: '#64748b' }}>Active</h4>
                  <h2 style={{ margin: '10px 0', color: '#10b981' }}>{employees.filter(e => e.status === 'active').length}</h2>
               </div>
               <div className="stat-card" style={{ padding: '20px', background: '#fff', borderRadius: '10px', textAlign: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                  <h4 style={{ margin: 0, color: '#64748b' }}>On Leave</h4>
                  <h2 style={{ margin: '10px 0', color: '#f59e0b' }}>{employees.filter(e => e.status === 'on-leave').length}</h2>
               </div>
               <div className="stat-card" style={{ padding: '20px', background: '#fff', borderRadius: '10px', textAlign: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                  <h4 style={{ margin: 0, color: '#64748b' }}>Departments</h4>
                  <h2 style={{ margin: '10px 0', color: '#2563eb' }}>{[...new Set(employees.map(e => e.department))].length}</h2>
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
            <button className="btn-secondary" style={{ marginBottom: '15px', cursor: 'pointer' }} onClick={() => setActiveScreen("list")}>← Back to List</button>
            
            <div className="hp-editor-grid" style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '20px', alignItems: 'start' }}>
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