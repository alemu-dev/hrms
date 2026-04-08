import React, { useState } from "react";

export default function EmployeeTab({ employees }) {
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [loading, setLoading] = useState(false);

  async function selectEmployee(emp) {
    setLoading(true);
    const id = emp.id || emp.user_id;
    
    // ✅ GET THE TOKEN FROM STORAGE
    const token = localStorage.getItem("auth_token");

    try {
      // ✅ ADDED HEADERS TO UNLOCK FETCH
      const res = await fetch(`https://hrms-owyj.onrender.com/api/employees/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}` 
        }
      });

      if (res.status === 401) {
        alert("Session expired. Please log in again.");
        window.location.href = "/login";
        return;
      }

      const data = await res.json();
      setSelectedEmployee(data?.data || data);
    } catch (err) {
      console.error("Error fetching employee details:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="tab-layout">
      {/* SIDEBAR: STAFF LIST */}
      <aside className="employee-sidebar">
        <h2>Staff Directory</h2>
        <div className="list-container">
          {employees.map((emp) => (
            <div
              key={emp.id}
              className={`item-card ${selectedEmployee?.id === emp.id ? "active" : ""}`}
              onClick={() => selectEmployee(emp)}
            >
              <strong>{emp.full_name}</strong>
              <p>{emp.position}</p>
              <span className="dept-tag">{emp.department}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* DETAIL VIEW */}
      <section className="detail-view">
        {loading ? (
          <p className="loading">Loading profile...</p>
        ) : !selectedEmployee ? (
          <div className="placeholder-content">
            <p>Select an employee to view full records</p>
          </div>
        ) : (
          <div className="profile-card">
            {/* Header */}
            <header className="profile-header">
              <div className="header-main">
                <h1>{selectedEmployee.full_name}</h1>
                <span className={`status-badge ${selectedEmployee.status?.toLowerCase()}`}>
                  {selectedEmployee.status}
                </span>
              </div>
              <p className="sub-header">{selectedEmployee.position} | {selectedEmployee.department}</p>
            </header>

            {/* FULL EMPLOYEE DETAILS GRID */}
            <div className="info-grid">
              <div className="info-item">
                <label>Employee ID</label>
                <span>#{selectedEmployee.id}</span>
              </div>
              <div className="info-item">
                <label>User ID</label>
                <span>{selectedEmployee.user_id}</span>
              </div>
              <div className="info-item">
                <label>Phone Number</label>
                <span>{selectedEmployee.phone_number || "Not Provided"}</span>
              </div>
              <div className="info-item">
                <label>Salary</label>
                <span>{selectedEmployee.salary}</span>
              </div>
              <div className="info-item">
                <label>Gender</label>
                <span>{selectedEmployee.Gender}</span>
              </div>
              <div className="info-item">
                <label>Hire Date</label>
                <span>{selectedEmployee.hire_date}</span>
              </div>
              <div className="info-item">
                <label>Date of Birth</label>
                <span>{selectedEmployee.date_of_birth || "Not Provided"}</span>
              </div>
              <div className="info-item full-width">
                <label>Address</label>
                <span>{selectedEmployee.address || "No address on file"}</span>
              </div>
              <div className="info-item">
                <label>Created At</label>
                <span className="timestamp">{new Date(selectedEmployee.created_at).toLocaleDateString()}</span>
              </div>
              <div className="info-item">
                <label>Last Updated</label>
                <span className="timestamp">{new Date(selectedEmployee.updated_at).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Education Section */}
            <section className="details-section">
              <h3>Education</h3>
              {selectedEmployee?.user?.education?.length > 0 ? (
                selectedEmployee.user.education.map((edu) => (
                  <div key={edu.id} className="sub-record">
                    <strong>{edu.level} in {edu.field}</strong>
                    <p>{edu.institution} | {edu.start_date} — {edu.end_date}</p>
                  </div>
                ))
              ) : <p className="none-text">No education records.</p>}
            </section>

            {/* Experience Section */}
            <section className="details-section">
              <h3>Work Experience</h3>
              {selectedEmployee?.user?.experience?.length > 0 ? (
                selectedEmployee.user.experience.map((exp) => (
                  <div key={exp.id} className="sub-record">
                    <strong>{exp.role} at {exp.company}</strong>
                    <p>{exp.start_date} — {exp.end_date}</p>
                    <p className="responsibilities">{exp.responsibilities}</p>
                  </div>
                ))
              ) : <p className="none-text">No previous experience recorded.</p>}
            </section>

            {/* Biography Section */}
            <section className="details-section">
              <h3>Biography</h3>
              <p className="bio-text">
                {selectedEmployee?.user?.biography?.bio_text || "No biography provided."}
              </p>
            </section>

            {/* Documents Section */}
            <section style={{ marginBottom: '30px' }}>
              <h3 style={{ borderLeft: '4px solid #2563eb', paddingLeft: '10px', color: '#1e293b' }}>Official Documents</h3>
              <div style={{ display: 'grid', gap: '10px' }}>
                {selectedEmployee?.user?.documents?.length > 0 ? (
                  selectedEmployee.user.documents.map((doc) => (
                    <div key={doc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 15px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                      <span style={{ fontWeight: '600' }}>📄 {doc.document_type}</span>
                      <a 
                        href={`https://hrms-owyj.onrender.com/storage/${doc.file_path}`} 
                        target="_blank" 
                        rel="noreferrer"
                        style={{ color: '#2563eb', fontWeight: 'bold', fontSize: '0.8rem', textDecoration: 'none' }}
                      >
                        VIEW FILE
                      </a>
                    </div>
                  ))
                ) : <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>No documents uploaded.</p>}
              </div>
            </section>
          </div>
        )}
      </section>
    </div>
  );
}