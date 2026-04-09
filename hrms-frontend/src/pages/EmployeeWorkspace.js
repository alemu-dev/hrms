import { useState, useEffect } from "react";
import "./EmployeeWorkspace.css";

export default function EmployeeWorkspace() {
  const [employee, setEmployee] = useState(null);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [reason, setReason] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  // NEW: State for mobile sidebar responsiveness
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // NEW: Logout Logic
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      localStorage.removeItem("userId");
      localStorage.removeItem("auth_token");
      window.location.href = "/login"; // Redirect to login page
    }
  };

  // Load employee profile and leave requests
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("auth_token");

    if (!userId || !token) {
      setMessage("❌ No logged-in session found. Please login again.");
      return;
    }

    const authHeaders = {
      "Accept": "application/json",
      "Authorization": `Bearer ${token}`
    };

    fetch(`https://hrms-owyj.onrender.com/api/employee-profile/${userId}`, { headers: authHeaders })
      .then(res => {
        if (res.status === 401) {
          handleLogout(); // Auto-logout if token is expired
          return;
        }
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then(data => {
        setEmployee(data);
        // Load leave requests using the employee's user_id
        fetch(`https://hrms-owyj.onrender.com/api/leave-requests/${data.user_id}`, { headers: authHeaders })
          .then(res => res.json())
          .then(reqs => setLeaveRequests(Array.isArray(reqs) ? reqs : []))
          .catch(err => console.error("Error loading leave requests:", err));
      })
      .catch(err => {
        console.error("Error loading profile:", err);
        setMessage("❌ Session expired. Please login.");
      });
  }, []);

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("auth_token");

    try {
      const payload = {
        user_id: employee.user_id,
        start_date: startDate,
        end_date: endDate,
        reason: reason
      };

      const response = await fetch("https://hrms-owyj.onrender.com/api/leave-requests", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setMessage("✅ Leave request submitted successfully");
        setReason(""); setStartDate(""); setEndDate("");
        setShowLeaveForm(false);
        
        // Refresh list after success
        fetch(`https://hrms-owyj.onrender.com/api/leave-requests/${employee.user_id}`, {
          headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" }
        })
          .then(res => res.json())
          .then(reqs => setLeaveRequests(reqs));
      } else {
        setMessage("❌ Failed to submit. Please check your data.");
      }
    } catch (error) {
      setMessage("❌ Error submitting request.");
    }
  };

  return (
    <div className="hp-dashboard-layout">
      {/* NEW: Mobile Toggle Button */}
      <button className="mobile-menu-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
        {isSidebarOpen ? "✕" : "☰"}
      </button>

      {/* --- SIDEBAR --- */}
      <aside className={`hp-sidebar ${isSidebarOpen ? "mobile-open" : ""}`}>
        <div className="hp-logo">HRMS PORTAL</div>
        <nav>
          <button 
            className={activeTab === 'overview' ? 'active' : ''} 
            onClick={() => { setActiveTab('overview'); setIsSidebarOpen(false); }}>
            📊 Dashboard
          </button>
          <button 
            className={activeTab === 'profile' ? 'active' : ''} 
            onClick={() => { setActiveTab('profile'); setIsSidebarOpen(false); }}>
            👤 Full Profile
          </button>
          <button 
            className={activeTab === 'leave' ? 'active' : ''} 
            onClick={() => { setActiveTab('leave'); setIsSidebarOpen(false); }}>
            📅 Leave Requests
          </button>
          
          {/* NEW: Logout Button at the bottom of Nav */}
          <button className="logout-btn" onClick={handleLogout}>
            🚪 Logout
          </button>
        </nav>
      </aside>

      {/* NEW: Overlay for mobile when sidebar is open */}
      {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>}

      {/* --- MAIN CONTENT --- */}
      <main className="hp-main-content">
        <header className="main-header">
          <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
          <div className="user-welcome">Welcome, <strong>{employee?.full_name}</strong></div>
        </header>

        {message && <p className="message-toast">{message}</p>}

        {/* --- TAB: OVERVIEW --- */}
        {activeTab === 'overview' && (
          <div className="tab-content">
            <div className="card summary-grid">
              <div className="summary-item">
                <label>Department</label>
                <p>{employee?.department}</p>
              </div>
              <div className="summary-item">
                <label>Position</label>
                <p>{employee?.position}</p>
              </div>
              <div className="summary-item">
                <label>Status</label>
                <p><span className={`status-pill ${employee?.status}`}>{employee?.status}</span></p>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB: FULL PROFILE --- */}
        {activeTab === 'profile' && employee && (
          <div className="tab-content profile-detailed">
            <div className="card">
              <div className="section-header">
                <h2>Full Employee Record</h2>
              </div>

              <div className="detail-info-grid">
                <div className="detail-group">
                  <h4>Personal & Contact</h4>
                  <p><strong>Full Name:</strong> {employee.full_name}</p>
                  <p><strong>Email:</strong> {employee.user?.email}</p>
                  <p><strong>Salary:</strong> {employee.salary}</p>
                  <p><strong>Phone:</strong> {employee.phone_number || "N/A"}</p>
                  <p><strong>Address:</strong> {employee.address || "N/A"}</p>
                  <p><strong>Date of Birth:</strong> {employee.date_of_birth || "N/A"}</p>
                </div>
                
                <div className="detail-group">
                  <h4>Employment Info</h4>
                  <p><strong>Staff ID:</strong> #EMP-{employee.user_id}</p>
                  <p><strong>Department:</strong> {employee.department}</p>
                  <p><strong>Position:</strong> {employee.position}</p>
                  <p><strong>Hire Date:</strong> {employee.hire_date || "N/A"}</p>
                  <p><strong>Status:</strong> <span className={`status-pill ${employee.status}`}>{employee.status}</span></p>
                </div>

                <div className="detail-group">
                  <h4>System Data</h4>
                  <p><strong>Employee ID:</strong> {employee.id}</p>
                  <p><strong>Created:</strong> {new Date(employee.created_at).toLocaleDateString()}</p>
                  <p><strong>Last Update:</strong> {new Date(employee.updated_at).toLocaleDateString()}</p>
                </div>
              </div>

              <section className="info-section">
                <h3>🎓 Education History</h3>
                {employee.user?.education?.map((edu, i) => (
                  <div key={i} className="item-box history-card">
                    <div className="history-header">
                      <strong>{edu.level} in {edu.field}</strong>
                      <span className="date-tag">{edu.start_date} to {edu.end_date}</span>
                    </div>
                    <p className="inst-name">{edu.institution}</p>
                    {edu.notes && <p className="notes-text"><strong>Notes:</strong> {edu.notes}</p>}
                  </div>
                ))}
              </section>

              <section className="info-section">
                <h3>💼 Work Experience</h3>
                {employee.user?.experience?.map((exp, i) => (
                  <div key={i} className="item-box history-card">
                    <div className="history-header">
                      <strong>{exp.role}</strong>
                      <span className="date-tag">{exp.start_date} to {exp.end_date}</span>
                    </div>
                    <p className="inst-name">{exp.company}</p>
                    <p className="resp-text"><strong>Responsibilities:</strong> {exp.responsibilities}</p>
                  </div>
                ))}
              </section>

              <section className="info-section">
                <h3>📜 Biography</h3>
                <div className="item-box bio-box">
                  <p>{employee.user?.biography?.bio_text || "No biography added yet."}</p>
                </div>
              </section>

              <section className="info-section">
                <h3>📂 Documents</h3>
                <div className="docs-grid">
                  {employee.user?.documents?.map((doc, i) => (
                    <div key={i} className="doc-card">
                      <div className="doc-info">
                        <strong>{doc.document_type}</strong>
                        <span>ID: {doc.id} | Uploaded: {doc.uploaded_at}</span>
                      </div>
                      <a href={`https://hrms-owyj.onrender.com/storage/${doc.file_path}`} target="_blank" rel="noreferrer" className="view-btn">
                        View File
                      </a>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        )}

        {/* --- TAB: LEAVE REQUESTS --- */}
        {activeTab === 'leave' && (
          <div className="tab-content">
            <div className="card">
              <div className="header-row">
                <h3>My Leave History</h3>
                <button className="btn-primary" onClick={() => setShowLeaveForm(!showLeaveForm)}>
                  {showLeaveForm ? "Close Form" : "New Request"}
                </button>
              </div>

              {showLeaveForm && (
                <form className="leave-inline-form" onSubmit={handleLeaveSubmit}>
                  <div className="form-group">
                    <label>Reason</label>
                    <select value={reason} onChange={e => setReason(e.target.value)} required>
                      <option value="">Select Reason</option>
                      <option value="annual">Annual Leave</option>
                      <option value="sick">Sick Leave</option>
                      <option value="unpaid">Unpaid Leave</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Start Date</label>
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>End Date</label>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required />
                  </div>
                  <button type="submit" className="submit-btn">Submit Request</button>
                </form>
              )}

              <table className="modern-table">
                <thead>
                  <tr><th>Type</th><th>Dates</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {leaveRequests.map((req, idx) => (
                    <tr key={idx}>
                      <td>{req.reason}</td>
                      <td>{req.start_date} to {req.end_date}</td>
                      <td><span className={`status-pill ${req.status}`}>{req.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}