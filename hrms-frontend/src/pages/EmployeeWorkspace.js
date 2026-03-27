import { useState, useEffect } from "react";
import "./EmployeeWorkspace.css";

export default function EmployeeWorkspace() {
  const [employee, setEmployee] = useState(null);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [leaveType, setLeaveType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [message, setMessage] = useState("");

  // Load employee profile and leave requests
  useEffect(() => {
    const userId = localStorage.getItem("userId"); 
    if (!userId) {
      setMessage("❌ No logged-in user found.");
      return;
    }

    fetch(`http://127.0.0.1:8000/api/employee-profile/${userId}`)
      .then(res => res.json())
      .then(data => {
        setEmployee(data);
        // Fetch leave requests for this employee
        fetch(`http://127.0.0.1:8000/api/leave-requests/${data.id}`)
          .then(res => res.json())
          .then(reqs => setLeaveRequests(reqs))
          .catch(err => console.error(err));
      })
      .catch(err => console.error(err));
  }, []);

  // Handle leave request submission
  const handleLeaveSubmit = async (e) => {
    e.preventDefault();

    if (!employee?.id) {
      setMessage("❌ Employee profile not loaded yet.");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/api/leave-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employee_id: employee.id,
          type: leaveType,
          start_date: startDate,
          end_date: endDate
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("✅ " + data.message);
        setLeaveType("");
        setStartDate("");
        setEndDate("");
        setShowLeaveForm(false);

        // Refresh leave requests
        fetch(`http://127.0.0.1:8000/api/leave-requests/${employee.id}`)
          .then(res => res.json())
          .then(reqs => setLeaveRequests(reqs));
      } else {
        if (data.errors) {
          const errorMessages = Object.values(data.errors)
            .reduce((acc, val) => acc.concat(val), [])
            .join(" | ");
          setMessage("❌ " + errorMessages);
        } else {
          setMessage("❌ " + (data.message || "Failed to submit leave"));
        }
      }
    } catch (error) {
      setMessage("❌ Error submitting leave request. Please try again.");
    }
  };

  return (
    <div className="employee-workspace">
      <h1>Employee Workspace</h1>
      <p>Welcome Employee! View your profile, tasks, and company updates here.</p>

      {employee && (
        <div className="profile-card">
          <h2>Your Profile</h2>
          <p><strong>Name:</strong> {employee.full_name}</p>
          <p><strong>Email:</strong> {employee.user?.email}</p>
          <p><strong>Department:</strong> {employee.department}</p>
          <p><strong>Position:</strong> {employee.position}</p>
          <p><strong>Salary:</strong> {employee.salary}</p>
          <p><strong>Status:</strong> {employee.status}</p>
        </div>
      )}

      <button onClick={() => setShowLeaveForm(!showLeaveForm)}>
        Ask for Leave
      </button>

      {showLeaveForm && (
        <form className="leave-form" onSubmit={handleLeaveSubmit}>
          <label>Leave Type</label>
          <select value={leaveType} onChange={e => setLeaveType(e.target.value)} required>
            <option value="">Select type</option>
            <option value="annual">Annual Leave</option>
            <option value="sick">Sick Leave</option>
            <option value="maternity">Maternity Leave</option>
            <option value="unpaid">Unpaid Leave</option>
          </select>

          <label>Start Date</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required />

          <label>End Date</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required />

          <button type="submit">Submit Request</button>
        </form>
      )}

      {message && <p className="message">{message}</p>}

      <h2>Your Leave Requests</h2>
      <table>
        <thead>
          <tr>
            <th>Type</th><th>Start</th><th>End</th><th>Status</th>
          </tr>
        </thead>
        <tbody>
          {leaveRequests.map((req, idx) => (
            <tr key={idx}>
              <td>{req.type}</td>
              <td>{req.start_date}</td>
              <td>{req.end_date}</td>
              <td>{req.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
