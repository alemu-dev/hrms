import { useState, useEffect } from "react";
import "./HrPortal.css";

export default function HrPortal() {
  const [employees, setEmployees] = useState([]);
  const [message, setMessage] = useState("");

  // Form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [department, setDepartment] = useState("");
  const [position, setPosition] = useState("");
  const [salary, setSalary] = useState("");
  const [hireDate, setHireDate] = useState("");
  const [status, setStatus] = useState("active");

  // Edit state
  const [editingId, setEditingId] = useState(null);

  // Load employees
  const loadEmployees = () => {
    fetch("http://127.0.0.1:8000/api/employees")
      .then(res => res.json())
      .then(data => setEmployees(data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  // Add or update employee
  const handleSaveEmployee = async (e) => {
    e.preventDefault();

    const payload = {
      // user fields
      name: fullName,
      email,
      password,
      role: "employee",
      // profile fields
      full_name: fullName,
      department,
      position,
      salary,
      hire_date: hireDate,
      status
    };

    try {
      let response;
      if (editingId) {
        response = await fetch(`http://127.0.0.1:8000/api/employees/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } else {
        response = await fetch("http://127.0.0.1:8000/api/employees", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }

      const data = await response.json();
      if (response.ok) {
        setMessage(editingId ? "✅ Employee updated successfully" : "✅ Employee added successfully");
        loadEmployees();

        // Clear form
        setFullName(""); setEmail(""); setPassword("");
        setDepartment(""); setPosition(""); setSalary("");
        setHireDate(""); setStatus("active");
        setEditingId(null);

        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("❌ Error: " + (data.message || "Failed to save employee"));
      }
    } catch (error) {
      setMessage("❌ Error saving employee. Please try again.");
    }
  };

  // Delete employee
  const handleDeleteEmployee = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/employees/${id}`, {
        method: "DELETE"
      });

      if (response.ok) {
        setMessage("✅ Employee deleted successfully");
        setEmployees(employees.filter(emp => emp.id !== id));
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("❌ Error deleting employee");
      }
    } catch (error) {
      setMessage("❌ Error deleting employee. Please try again.");
    }
  };

  // Load employee into form for editing
  const handleEditEmployee = (emp) => {
    setEditingId(emp.id);
    setFullName(emp.full_name);
    setEmail(emp.user?.email || "");
    setPassword("");
    setDepartment(emp.department);
    setPosition(emp.position);
    setSalary(emp.salary);
    setHireDate(emp.hire_date || "");
    setStatus(emp.status || "active");
  };

  return (
    <div className="hr-portal">
      <h1>HR Portal</h1>
      <p>Welcome HR! Manage employee records here.</p>

      {message && <p className="message">{message}</p>}

      <h2>{editingId ? "Edit Employee" : "Add New Employee"}</h2>
      <form onSubmit={handleSaveEmployee}>
        <input type="text" placeholder="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} required />
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required={!editingId} />
        <input type="text" placeholder="Department" value={department} onChange={e => setDepartment(e.target.value)} required />
        <input type="text" placeholder="Position" value={position} onChange={e => setPosition(e.target.value)} required />
        <input type="number" placeholder="Salary" value={salary} onChange={e => setSalary(e.target.value)} required />
        <input type="date" placeholder="Hire Date" value={hireDate} onChange={e => setHireDate(e.target.value)} />
        <select value={status} onChange={e => setStatus(e.target.value)}>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <button type="submit">{editingId ? "Update Employee" : "Add Employee"}</button>
      </form>

      <h2>Employee Profiles</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th><th>User ID</th><th>Name</th><th>Email</th><th>Department</th>
            <th>Position</th><th>Salary</th><th>Hire Date</th><th>Status</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => (
            <tr key={emp.id}>
              <td>{emp.id}</td>
              <td>{emp.user_id}</td>
              <td>{emp.full_name}</td>
              <td>{emp.user?.email}</td>
              <td>{emp.department}</td>
              <td>{emp.position}</td>
              <td>{emp.salary}</td>
              <td>{emp.hire_date}</td>
              <td>{emp.status}</td>
              <td>
                <button onClick={() => handleEditEmployee(emp)}>Edit</button>
                <button onClick={() => handleDeleteEmployee(emp.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
