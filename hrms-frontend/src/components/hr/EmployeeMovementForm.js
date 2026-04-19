import { useState, useEffect } from "react";
import "./HrPortal.css";

const API_BASE = "https://hrms-owyj.onrender.com/api";

export default function EmployeeMovementForm() {
  const [employeeId, setEmployeeId] = useState("");
  const [employees, setEmployees] = useState([]);
  const [type, setType] = useState("promotion");

  const [oldDepartment, setOldDepartment] = useState("");
  const [newDepartment, setNewDepartment] = useState("");

  const [oldPosition, setOldPosition] = useState("");
  const [newPosition, setNewPosition] = useState("");

  const [oldPositionNumber, setOldPositionNumber] = useState("");
  const [newPositionNumber, setNewPositionNumber] = useState("");

  const [oldSalary, setOldSalary] = useState("");
  const [newSalary, setNewSalary] = useState("");

  const [oldGrade, setOldGrade] = useState("");
  const [newGrade, setNewGrade] = useState("");

  const [oldStep, setOldStep] = useState("");
  const [newStep, setNewStep] = useState("");

  const [effectiveDate, setEffectiveDate] = useState("");
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("auth_token");

  // Fetch employees list
  const fetchEmployees = async () => {
    try {
      const res = await fetch(`${API_BASE}/employees`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json"
        }
      });

      const data = await res.json();
      const list = data?.data || data?.employees || data || [];
      setEmployees(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("EMPLOYEE FETCH ERROR:", err);
    }
  };

  // Fetch selected employee details (including position_number)
  const fetchEmployeeDetails = async (id) => {
    if (!id) return;

    try {
      const res = await fetch(`${API_BASE}/employees/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json"
        }
      });

      const data = await res.json();
      const emp = data?.data || data?.employee || data?.result || data;

      if (emp) {
        setOldDepartment(emp.department ?? "");
        setOldPosition(emp.position ?? "");
        setOldPositionNumber(emp.position_number ?? "");
        setOldSalary(emp.salary ?? "");
        setOldGrade(emp.grade ?? "");
        setOldStep(emp.step ?? "");
      }
    } catch (err) {
      console.error("DETAIL FETCH ERROR:", err);
    }
  };

  useEffect(() => {
    if (token) fetchEmployees();
  }, [token]);

  useEffect(() => {
    fetchEmployeeDetails(employeeId);
  }, [employeeId]);

  // ✅ FIXED SUBMIT - Now properly sends empty values for unchanged "new" fields
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!employeeId) {
      setMessage("❌ Please select an employee");
      return;
    }
    if (!effectiveDate) {
      setMessage("❌ Effective date is required");
      return;
    }

    if (!window.confirm("⚠️ This will update employee current data. Continue?")) return;

    try {
      const formData = new FormData();

      formData.append("employee_id", employeeId);
      formData.append("type", type);

      formData.append("old_position", oldPosition || "");
      formData.append("new_position", newPosition || "");

      formData.append("old_position_number", oldPositionNumber || "");
      formData.append("new_position_number", newPositionNumber || "");   // ← Fixed: send empty string instead of old value

      formData.append("old_department", oldDepartment || "");
      formData.append("new_department", newDepartment || "");

      formData.append("old_grade", oldGrade || "");
      formData.append("new_grade", newGrade || "");

      formData.append("old_step", oldStep || "");
      formData.append("new_step", newStep || "");

      formData.append("old_salary", oldSalary || "");
      formData.append("new_salary", newSalary || "");

      formData.append("effective_date", effectiveDate);

      const res = await fetch(`${API_BASE}/movements`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json"
          // Do NOT set Content-Type when using FormData
        },
        body: formData
      });

      const responseData = await res.json().catch(() => ({}));

      if (res.ok) {
        setMessage("✅ Movement recorded successfully!");
        // Clear only the "new" fields after success
        setNewPosition("");
        setNewPositionNumber("");
        setNewDepartment("");
        setNewSalary("");
        setNewGrade("");
        setNewStep("");
      } else {
        console.error("Server Error:", responseData);
        setMessage("❌ " + (responseData.message || "Failed to save movement"));
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Server error. Please check console.");
    }
  };

  return (
    <div className="admin-container">
      <h1>Employee Movement</h1>

      <form onSubmit={handleSubmit} className="admin-form">

        <div className="form-group">
          <label>Select Employee:</label>
          <select
            value={employeeId}
            onChange={(e) => setEmployeeId(Number(e.target.value))}
          >
            <option value="">-- Choose Employee --</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>
                {emp.full_name} ({emp.department || 'No Dept'})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Movement Type:</label>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="promotion">Promotion</option>
            <option value="step_increment">Step Increment</option>
            <option value="grade_increment">Grade Increment</option>
          </select>
        </div>

        <div className="hp-grid-2">
          <div>
            <label>Old Department</label>
            <input value={oldDepartment} disabled />
          </div>
          <div>
            <label>New Department</label>
            <input 
              value={newDepartment} 
              onChange={e => setNewDepartment(e.target.value)} 
            />
          </div>

          <div>
            <label>Old Position</label>
            <input value={oldPosition} disabled />
          </div>
          <div>
            <label>New Position</label>
            <input 
              value={newPosition} 
              onChange={e => setNewPosition(e.target.value)} 
            />
          </div>

          <div>
            <label>Old Position No</label>
            <input value={oldPositionNumber} disabled />
          </div>
          <div>
            <label>New Position No</label>
            <input 
              value={newPositionNumber} 
              onChange={e => setNewPositionNumber(e.target.value)} 
            />
          </div>

          <div>
            <label>Old Grade</label>
            <input value={oldGrade} disabled />
          </div>
          <div>
            <label>New Grade</label>
            <input 
              value={newGrade} 
              onChange={e => setNewGrade(e.target.value)} 
            />
          </div>

          <div>
            <label>Old Step</label>
            <input value={oldStep} disabled />
          </div>
          <div>
            <label>New Step</label>
            <input 
              value={newStep} 
              onChange={e => setNewStep(e.target.value)} 
            />
          </div>

          <div>
            <label>Old Salary</label>
            <input value={oldSalary} disabled />
          </div>
          <div>
            <label>New Salary</label>
            <input 
              value={newSalary} 
              onChange={e => setNewSalary(e.target.value)} 
            />
          </div>
        </div>

        <div className="form-group">
          <label>Effective Date:</label>
          <input
            type="date"
            value={effectiveDate}
            onChange={e => setEffectiveDate(e.target.value)}
            required
          />
        </div>

        <button type="submit">Save Movement</button>
      </form>

      {message && <p className="message" style={{ marginTop: "15px", fontWeight: "bold" }}>{message}</p>}
    </div>
  );
}