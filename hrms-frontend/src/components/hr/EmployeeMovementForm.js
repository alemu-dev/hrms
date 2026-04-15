import { useState, useEffect } from "react";
import "./HrPortal.css";

const API_BASE = "http://hrms-backend.test/api";

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

  // ✅ FETCH EMPLOYEES (FIXED)
  const fetchEmployees = async () => {
    try {
      const res = await fetch(`${API_BASE}/employees`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json"
        }
      });

      const data = await res.json();

      console.log("EMPLOYEES RESPONSE:", data);

      // ✅ Handles: {data: [...]}, [...] , {employees: [...]}
      const list = data?.data || data?.employees || data || [];
      setEmployees(Array.isArray(list) ? list : []);

    } catch (err) {
      console.error("EMPLOYEE FETCH ERROR:", err);
    }
  };

  // ✅ FETCH EMPLOYEE DETAILS (FIXED 🔥)
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

      console.log("FULL RESPONSE:", data);

      // ✅ Normalize backend response
      const emp = data?.data || data?.employee || data?.result || data;

      console.log("EXTRACTED EMP:", emp);

      if (res.ok && emp) {
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

  // ✅ SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!employeeId) {
      setMessage("❌ Please select employee");
      return;
    }

    const finalDepartment = newDepartment || oldDepartment;
    const finalPosition = newPosition || oldPosition;
    const finalPositionNumber = newPositionNumber || oldPositionNumber;
    const finalSalary = newSalary || oldSalary;
    const finalGrade = newGrade || oldGrade;
    const finalStep = newStep || oldStep;

    if (!window.confirm("⚠️ This will permanently change employee data. Continue?")) return;
    if (!window.confirm("❗ Are you absolutely sure? This cannot be undone.")) return;

    try {
      const res = await fetch(`${API_BASE}/movements`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          employee_id: employeeId,
          type,

          old_department: oldDepartment,
          new_department: finalDepartment,

          old_position: oldPosition,
          new_position: finalPosition,

          old_position_number: oldPositionNumber,
          new_position_number: finalPositionNumber,

          old_salary: oldSalary,
          new_salary: finalSalary,

          old_grade: oldGrade,
          new_grade: finalGrade,

          old_step: oldStep,
          new_step: finalStep,

          effective_date: effectiveDate
        })
      });

      if (res.ok) {
        setMessage("✅ Saved successfully");
        resetForm();
      } else {
        const data = await res.json();
        setMessage("❌ " + (data.message || "Failed"));
      }

    } catch (err) {
      console.error(err);
      setMessage("❌ Server error");
    }
  };

  const resetForm = () => {
    setEmployeeId("");
    setNewDepartment("");
    setNewPosition("");
    setNewPositionNumber("");
    setNewSalary("");
    setNewGrade("");
    setNewStep("");
    setEffectiveDate("");
  };

  return (
    <div className="admin-container">
      <h1>Employee Movement</h1>

      <form onSubmit={handleSubmit} className="admin-form">

        {/* EMPLOYEE */}
        <div className="form-group">
          <label>Select Employee:</label>
          <select
            value={employeeId}
            onChange={(e) => setEmployeeId(Number(e.target.value))} // ✅ FIXED
          >
            <option value="">-- Choose Employee --</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>
                {emp.full_name} ({emp.department})
              </option>
            ))}
          </select>
        </div>

        {/* TYPE */}
        <div className="form-group">
          <label>Movement Type:</label>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="promotion">Promotion</option>
            <option value="step_increment">Step Increment</option>
            <option value="grade_increment">Grade Increment</option>
          </select>
        </div>

        {/* GRID */}
        <div className="hp-grid-2">

          <div>
            <label>Old Department</label>
            <input value={oldDepartment} disabled />
          </div>
          <div>
            <label>New Department</label>
            <input value={newDepartment} onChange={e => setNewDepartment(e.target.value)} />
          </div>

          <div>
            <label>Old Position</label>
            <input value={oldPosition} disabled />
          </div>
          <div>
            <label>New Position</label>
            <input value={newPosition} onChange={e => setNewPosition(e.target.value)} />
          </div>

          <div>
            <label>Old Position No</label>
            <input value={oldPositionNumber} disabled />
          </div>
          <div>
            <label>New Position No</label>
            <input value={newPositionNumber} onChange={e => setNewPositionNumber(e.target.value)} />
          </div>

          <div>
            <label>Old Grade</label>
            <input value={oldGrade} disabled />
          </div>
          <div>
            <label>New Grade</label>
            <input value={newGrade} onChange={e => setNewGrade(e.target.value)} />
          </div>

          <div>
            <label>Old Step</label>
            <input value={oldStep} disabled />
          </div>
          <div>
            <label>New Step</label>
            <input value={newStep} onChange={e => setNewStep(e.target.value)} />
          </div>

          <div>
            <label>Old Salary</label>
            <input value={oldSalary} disabled />
          </div>
          <div>
            <label>New Salary</label>
            <input value={newSalary} onChange={e => setNewSalary(e.target.value)} />
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

      {message && <p>{message}</p>}
    </div>
  );
}