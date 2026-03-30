import { useState, useEffect } from "react";
import "./DirectorConsole.css";

export default function DirectorConsole() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(false);

  // NEW: Overview state
  const [date, setDate] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const [systemStatus, setSystemStatus] = useState("");
  const [overviewMessage, setOverviewMessage] = useState("");

  // LOAD EMPLOYEES
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/employees")
      .then(res => res.json())
      .then(data => setEmployees(data?.data || data));
  }, []);

  // LOAD LEAVE REQUESTS
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/leave-requests")
      .then(res => res.json())
      .then(data => setLeaveRequests(data?.data || data));
  }, []);

  // SELECT EMPLOYEE
  async function selectEmployee(emp) {
    setLoading(true);
    const id = emp.id || emp.user_id;
    const res = await fetch(`http://127.0.0.1:8000/api/employees/${id}`);
    const data = await res.json();
    setSelectedEmployee(data?.data || data);
    setLoading(false);
  }

  // APPROVE / REJECT
  const handleDecision = async (id, decision) => {
    await fetch(`http://127.0.0.1:8000/api/leave-requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: decision })
    });

    setLeaveRequests(prev =>
      prev.map(r =>
        r.id === id ? { ...r, status: decision } : r
      )
    );

    const decidedReq = leaveRequests.find(r => r.id === id);
    if (decidedReq) {
      setLeaveHistory(prev => [
        ...prev,
        { ...decidedReq, status: decision, decisionDate: new Date() }
      ]);
    }
  };

  // END OF DAY ARCHIVE
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      if (now.getHours() === 23 && now.getMinutes() === 59) {
        setLeaveHistory(prev => [
          ...prev,
          ...leaveRequests
            .filter(r => r.status !== "pending")
            .map(r => ({ ...r, decisionDate: new Date() }))
        ]);
        setLeaveRequests(prev => prev.filter(r => r.status === "pending"));
      }
    }, 60000);

    return () => clearInterval(timer);
  }, [leaveRequests]);

  // NEW: Handle Overview submission
  const handleOverviewSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://127.0.0.1:8000/api/overview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          announcement,
          system_status: systemStatus
        })
      });
      const data = await res.json();
      if (res.ok) {
        setOverviewMessage("✅ Overview updated successfully");
        setDate("");
        setAnnouncement("");
        setSystemStatus("");
      } else {
        setOverviewMessage("❌ Failed to update overview");
      }
    } catch (err) {
      setOverviewMessage("❌ Error updating overview");
    }
  };

  return (
    <div className="director-console">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2>Employees</h2>
        <div className="employee-list">
          {employees.map(emp => (
            <div
              key={emp.id}
              className={`employee-card ${selectedEmployee?.id === emp.id ? "active" : ""}`}
              onClick={() => selectEmployee(emp)}
            >
              <h4>{emp.full_name}</h4>
              <p>{emp.position}</p>
            </div>
          ))}
        </div>
      </aside>

      {/* Main content */}
      <main className="details">
        {loading && <p className="loading">Loading...</p>}
        {!selectedEmployee && !loading && (
          <p className="placeholder">Select an employee to view details</p>
        )}

        {selectedEmployee && !loading && (
          <div className="profile-card">
            <h2>{selectedEmployee.full_name}</h2>
            <p className="email">{selectedEmployee?.user?.email}</p>

            <section className="section">
              <h3>Profile</h3>
              <p><b>Department:</b> {selectedEmployee.department}</p>
              <p><b>Position:</b> {selectedEmployee.position}</p>
              <p><b>Salary:</b> {selectedEmployee.salary}</p>
              <p><b>Status:</b> {selectedEmployee.status}</p>
            </section>

            <section className="section">
              <h3>Biography</h3>
              {selectedEmployee?.user?.biography ? (
                <div className="item">
                  <p><strong>Bio:</strong> {selectedEmployee.user.biography.bio_text}</p>
                </div>
              ) : <p>No biography available</p>}
            </section>

            <section className="section">
              <h3>Education</h3>
              {selectedEmployee?.user?.education?.length > 0 ? (
                selectedEmployee.user.education.map((edu, i) => (
                  <div key={i} className="item">
                    <p><strong>Level:</strong> {edu.level}</p>
                    <p><strong>Field:</strong> {edu.field}</p>
                    <p><strong>Institution:</strong> {edu.institution}</p>
                    <p><strong>Start Date:</strong> {edu.start_date}</p>
                    <p><strong>End Date:</strong> {edu.end_date}</p>
                    <p><strong>Notes:</strong> {edu.notes}</p>
                  </div>
                ))
              ) : <p>No education records</p>}
            </section>

            <section className="section">
              <h3>Experience</h3>
              {selectedEmployee?.user?.experience?.length > 0 ? (
                selectedEmployee.user.experience.map((exp, i) => (
                  <div key={i} className="item">
                    <p><strong>Role:</strong> {exp.role}</p>
                    <p><strong>Company:</strong> {exp.company}</p>
                    <p><strong>Start Date:</strong> {exp.start_date}</p>
                    <p><strong>End Date:</strong> {exp.end_date}</p>
                    <p><strong>Responsibilities:</strong> {exp.responsibilities}</p>
                  </div>
                ))
              ) : <p>No experience records</p>}
            </section>

            <section className="section">
              <h3>Documents</h3>
              {selectedEmployee?.user?.documents?.length > 0 ? (
                selectedEmployee.user.documents.map((doc, i) => (
                  <div key={i} className="item">
                    <p><strong>Type:</strong> {doc.document_type}</p>
                    <p>
                      <a
                        href={`http://127.0.0.1:8000/storage/${doc.file_path}`}
                        target="_blank"
                        rel="noreferrer"
                        className="doc-link"
                      >
                        View Document
                      </a>
                    </p>
                    <p><strong>Uploaded At:</strong> {doc.uploaded_at}</p>
                  </div>
                ))
              ) : <p>No documents uploaded</p>}
            </section>
          </div>
        )}

        {/* NEW: Overview Form */}
        <section className="section overview-form">
          <h2>Update Today’s Overview</h2>
          <form onSubmit={handleOverviewSubmit}>
            <label>Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} required />

            <label>Announcement</label>
            <input type="text" value={announcement} onChange={e => setAnnouncement(e.target.value)} required />

            <label>System Status</label>
            <input type="text" value={systemStatus} onChange={e => setSystemStatus(e.target.value)} required />

            <button type="submit">Publish</button>
          </form>
          {overviewMessage && <p className="message">{overviewMessage}</p>}
        </section>

                {/* Leave Requests */}
        <div className="leave-section">
          <h2>Leave Requests</h2>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>From</th>
                <th>To</th>
                <th>Status</th>
                <th>Decision</th>
              </tr>
            </thead>
            <tbody>
              {leaveRequests.map(req => (
                <tr key={req.id}>
                  <td>{req.employee_name}</td>
                  <td>{req.type}</td>
                  <td>{req.start_date}</td>
                  <td>{req.end_date}</td>
                  <td className={`status ${req.status}`}>{req.status}</td>
                  <td>
                    {req.status === "pending" && (
                      <div className="actions">
                        <button
                          className="approve"
                          onClick={() => handleDecision(req.id, "approved")}
                        >
                          Approve
                        </button>
                        <button
                          className="reject"
                          onClick={() => handleDecision(req.id, "rejected")}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Leave History */}
        <div className="leave-history">
          <button onClick={() => setShowHistory(!showHistory)}>
            {showHistory ? "Hide Leave History" : "Show Leave History"}
          </button>

          {showHistory && (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Status</th>
                  <th>Decision Date</th>
                </tr>
              </thead>
              <tbody>
                {leaveHistory.map((h, i) => (
                  <tr key={i}>
                    <td>{h.employee_name}</td>
                    <td>{h.type}</td>
                    <td>{h.start_date}</td>
                    <td>{h.end_date}</td>
                    <td className={`status ${h.status}`}>{h.status}</td>
                    <td>{new Date(h.decisionDate).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
