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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      localStorage.removeItem("userId");
      localStorage.removeItem("auth_token");
      window.location.href = "/login";
    }
  };

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("auth_token");

    if (!userId || !token) {
      setMessage("❌ No active session. Please login again.");
      setLoading(false);
      return;
    }

    const headers = {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    };

    fetch(`https://hrms-owyj.onrender.com/api/employee-profile/${userId}`, { headers })
      .then(async (res) => {
        if (res.status === 401) {
          handleLogout();
          throw new Error("Unauthorized");
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        console.log("📥 Raw API Response:", data);   // Helpful for debugging
        return data;
      })
      .then((data) => {
        // Strong normalization to handle different backend structures
        const normalized = {
          id: data.id || data.user?.id,
          user_id: data.user_id || data.user?.id,
          full_name: data.full_name,
          email: data.email || data.user?.email,
          gender: data.gender,
          department: data.department,
          position: data.position,
          position_number: data.position_number,
          grade: data.grade,
          step: data.step,
          salary: data.salary,
          hire_date: data.hire_date,
          status: data.status,
          phone_number: data.phone_number,
          address: data.address,
          date_of_birth: data.date_of_birth,
          created_at: data.created_at,
          updated_at: data.updated_at,

          // Relations
          education: data.education || data.user?.education || [],
          experience: data.experience || data.user?.experience || [],
          biography: data.biography || data.user?.biography || null,
          documents: data.documents || data.user?.documents || [],
        };

        console.log("✅ Normalized Data:", normalized);
        setEmployee(normalized);
      })
      .then(() => {
        // Load leave requests
        const leaveUserId = employee?.user_id || employee?.id || userId; // fallback
        return fetch(`https://hrms-owyj.onrender.com/api/leave-requests/${leaveUserId}`, { headers });
      })
      .then(async (res) => {
        if (res && res.ok) {
          const reqs = await res.json();
          setLeaveRequests(Array.isArray(reqs) ? reqs : []);
        }
      })
      .catch((err) => {
        console.error("Load error:", err);
        setMessage("❌ Failed to load profile. Check console.");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    if (!employee) return;

    const token = localStorage.getItem("auth_token");
    const payload = {
      user_id: employee.user_id || employee.id,
      start_date: startDate,
      end_date: endDate,
      reason,
    };

    try {
      const res = await fetch("https://hrms-owyj.onrender.com/api/leave-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setMessage("✅ Leave request submitted successfully!");
        setReason(""); setStartDate(""); setEndDate(""); setShowLeaveForm(false);

        const headers = { Accept: "application/json", Authorization: `Bearer ${token}` };
        const refreshRes = await fetch(`https://hrms-owyj.onrender.com/api/leave-requests/${employee.user_id || employee.id}`, { headers });
        if (refreshRes.ok) {
          const updated = await refreshRes.json();
          setLeaveRequests(Array.isArray(updated) ? updated : []);
        }
      } else {
        setMessage("❌ Failed to submit leave request.");
      }
    } catch (err) {
      setMessage("❌ Network error.");
    }
  };

  if (loading) return <div className="loading-screen">Loading your profile...</div>;

  const safeLeaveRequests = Array.isArray(leaveRequests) ? leaveRequests : [];

  return (
    <div className="hp-dashboard-layout">
      <button className="mobile-menu-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
        {isSidebarOpen ? "✕" : "☰"}
      </button>

      <aside className={`hp-sidebar ${isSidebarOpen ? "mobile-open" : ""}`}>
        <div className="hp-logo">HRMS PORTAL</div>
        <nav>
          <button className={activeTab === "overview" ? "active" : ""} onClick={() => {setActiveTab("overview"); setIsSidebarOpen(false);}}>📊 Dashboard</button>
          <button className={activeTab === "profile" ? "active" : ""} onClick={() => {setActiveTab("profile"); setIsSidebarOpen(false);}}>👤 Full Profile</button>
          <button className={activeTab === "leave" ? "active" : ""} onClick={() => {setActiveTab("leave"); setIsSidebarOpen(false);}}>📅 Leave Requests</button>
          <button className="logout-btn" onClick={handleLogout}>🚪 Logout</button>
        </nav>
      </aside>

      {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />}

      <main className="hp-main-content">
        <header className="main-header">
          <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
          <div className="user-welcome">Welcome, <strong>{employee?.full_name || "User"}</strong></div>
        </header>

        {message && <div className="error-banner">{message}</div>}

        {/* OVERVIEW */}
        {activeTab === "overview" && employee && (
          <div className="tab-content">
            <div className="card summary-card">
              <div className="summary-item"><label>Department</label><p>{employee.department || "—"}</p></div>
              <div className="summary-item"><label>Position</label><p>{employee.position || "—"}</p></div>
              <div className="summary-item"><label>Status</label><p><span className={`status-pill ${employee.status?.toLowerCase() || "active"}`}>{employee.status || "ACTIVE"}</span></p></div>
            </div>
          </div>
        )}

        {/* FULL PROFILE - All fields included */}
        {activeTab === "profile" && employee && (
          <div className="tab-content profile-detailed">
            <div className="card">

              <div className="detail-info-grid">
                <div className="detail-group">
                  <h4>Personal Information</h4>
                  <p><strong>Full Name:</strong> {employee.full_name}</p>
                  <p><strong>Email:</strong> {employee.email || "—"}</p>
                  <p><strong>Gender:</strong> {employee.gender || "—"}</p>
                  <p><strong>Date of Birth:</strong> {employee.date_of_birth || "N/A"}</p>
                  <p><strong>Phone:</strong> {employee.phone_number || "N/A"}</p>
                  <p><strong>Address:</strong> {employee.address || "N/A"}</p>
                </div>

                <div className="detail-group">
                  <h4>Employment Information</h4>
                  <p><strong>Staff ID:</strong> #EMP-{employee.user_id || employee.id}</p>
                  <p><strong>Department:</strong> {employee.department || "—"}</p>
                  <p><strong>Position:</strong> {employee.position || "—"}</p>
                  <p><strong>Position Number:</strong> {employee.position_number || "—"}</p>
                  <p><strong>Grade:</strong> {employee.grade || "—"}</p>
                  <p><strong>Step:</strong> {employee.step || "—"}</p>
                  <p><strong>Hire Date:</strong> {employee.hire_date || "N/A"}</p>
                  <p><strong>Salary:</strong> {employee.salary ? `${employee.salary} ETB` : "—"}</p>
                  <p><strong>Status:</strong> <span className={`status-pill ${employee.status?.toLowerCase() || ""}`}>{employee.status || "Active"}</span></p>
                </div>

                <div className="detail-group">
                  <h4>System Data</h4>
                  <p><strong>Employee ID:</strong> {employee.id}</p>
                  <p><strong>Created:</strong> {employee.created_at ? new Date(employee.created_at).toLocaleDateString() : "—"}</p>
                  <p><strong>Last Updated:</strong> {employee.updated_at ? new Date(employee.updated_at).toLocaleDateString() : "—"}</p>
                </div>
              </div>

              {/* Education History */}
              <section className="info-section">
                <h3>🎓 Education History</h3>
                {employee.education?.length > 0 ? employee.education.map((edu, i) => (
                  <div key={i} className="item-box history-card">
                    <div className="history-header">
                      <strong>{edu.level} in {edu.field}</strong>
                      <span className="date-tag">{edu.start_date} — {edu.end_date}</span>
                    </div>
                    <p className="inst-name">{edu.institution}</p>
                    {edu.notes && <p><strong>Notes:</strong> {edu.notes}</p>}
                  </div>
                )) : <p>No education records found.</p>}
              </section>

              {/* Work Experience */}
              <section className="info-section">
                <h3>💼 Work Experience</h3>
                {employee.experience?.length > 0 ? employee.experience.map((exp, i) => (
                  <div key={i} className="item-box history-card">
                    <div className="history-header">
                      <strong>{exp.role}</strong>
                      <span className="date-tag">{exp.start_date} — {exp.end_date}</span>
                    </div>
                    <p className="inst-name">{exp.company}</p>
                    {exp.responsibilities && <p><strong>Responsibilities:</strong> {exp.responsibilities}</p>}
                  </div>
                )) : <p>No work experience records found.</p>}
              </section>

              {/* Biography */}
              <section className="info-section">
                <h3>📜 Biography</h3>
                <div className="item-box bio-box">
                  <p>{employee.biography?.bio_text || "No biography added yet."}</p>
                </div>
              </section>

              {/* Documents */}
              <section className="info-section">
                <h3>📂 Documents</h3>
                {employee.documents?.length > 0 ? (
                  <div className="docs-grid">
                    {employee.documents.map((doc, i) => (
                      <div key={i} className="doc-card">
                        <div className="doc-info">
                          <strong>{doc.document_type}</strong>
                          <span>Uploaded: {doc.uploaded_at || "—"}</span>
                        </div>
                        <a href={`https://hrms-owyj.onrender.com/storage/${doc.file_path}`} target="_blank" rel="noreferrer" className="view-btn">
                          View File
                        </a>
                      </div>
                    ))}
                  </div>
                ) : <p>No documents uploaded yet.</p>}
              </section>
            </div>
          </div>
        )}

        {/* Leave Requests Tab - unchanged */}
        {activeTab === "leave" && (
          <div className="tab-content">
            <div className="card">
              <div className="header-row">
                <h3>My Leave History</h3>
                <button className="btn-primary" onClick={() => setShowLeaveForm(!showLeaveForm)}>
                  {showLeaveForm ? "Close Form" : "+ New Request"}
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
                <thead><tr><th>Type</th><th>Dates</th><th>Status</th></tr></thead>
                <tbody>
                  {safeLeaveRequests.length === 0 ? (
                    <tr><td colSpan="3" className="no-data">No leave requests found.</td></tr>
                  ) : safeLeaveRequests.map((req, i) => (
                    <tr key={i}>
                      <td>{req.reason || "—"}</td>
                      <td>{req.start_date} — {req.end_date}</td>
                      <td><span className={`status-pill ${req.status?.toLowerCase() || "pending"}`}>{req.status || "Pending"}</span></td>
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