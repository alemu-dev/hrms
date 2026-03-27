import { useState, useEffect } from "react";
import "./DirectorConsole.css";

export default function DirectorConsole() {
  const [director, setDirector] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);

  // Load director profile
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/director-profile")
      .then(res => res.json())
      .then(data => setDirector(data))
      .catch(err => console.error(err));
  }, []);

  // Load employees
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/employees")
      .then(res => res.json())
      .then(data => setEmployees(data))
      .catch(err => console.error(err));
  }, []);

  // Load leave requests
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/leave-requests")
      .then(res => res.json())
      .then(data => setLeaveRequests(data))
      .catch(err => console.error(err));
  }, []);

  // Approve or reject leave
  const handleDecision = async (id, decision) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/leave-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: decision })
      });
      if (response.ok) {
        setLeaveRequests(leaveRequests.map(req =>
          req.id === id ? { ...req, status: decision } : req
        ));
      }
    } catch (error) {
      console.error("Error updating leave:", error);
    }
  };

  return (
    <div className="director-console">
      <h1>Director Console</h1>
      <p>Welcome Director! Access company reports, KPIs, and employee details here.</p>

      {director && (
        <div className="profile-card">
          <h2>Your Profile</h2>
          <p><strong>Name:</strong> {director.full_name}</p>
          <p><strong>Email:</strong> {director.email}</p>
          <p><strong>Department:</strong> {director.department}</p>
          <p><strong>Position:</strong> {director.position}</p>
        </div>
      )}

      <h2>Employee Profiles</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th><th>Department</th><th>Position</th><th>Salary</th><th>Status</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp, index) => (
            <tr key={index}>
              <td>{emp.full_name}</td>
              <td>{emp.department}</td>
              <td>{emp.position}</td>
              <td>{emp.salary}</td>
              <td>{emp.status}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Leave Requests</h2>
      <table>
        <thead>
          <tr>
            <th>Employee</th><th>Type</th><th>From</th><th>To</th><th>Status</th><th>Action</th>
          </tr>
        </thead>
        <tbody>
          {leaveRequests.map(req => (
            <tr key={req.id}>
              <td>{req.employee_name}</td>
              <td>{req.type}</td>
              <td>{req.start_date}</td>
              <td>{req.end_date}</td>
              <td>{req.status}</td>
              <td>
                {req.status === "pending" && (
                  <>
                    <button onClick={() => handleDecision(req.id, "approved")}>Approve</button>
                    <button onClick={() => handleDecision(req.id, "rejected")}>Reject</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
