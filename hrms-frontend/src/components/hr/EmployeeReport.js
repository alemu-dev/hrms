import React, { useEffect, useState } from "react";
import "./HrPortal.css";
import logo from "./stica.png";

const API_BASE = "https://hrms-owyj.onrender.com/api";

export default function EmployeeReport({ employeeId }) {
  const [employee, setEmployee] = useState(null);
  const [education, setEducation] = useState([]);
  const [experience, setExperience] = useState([]);
  const [biography, setBiography] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [movements, setMovements] = useState([]);

  useEffect(() => {
    if (employeeId) loadReport();
  }, [employeeId]);

  const loadReport = async () => {
    const token = localStorage.getItem("auth_token");

    try {
      const res = await fetch(`${API_BASE}/employee-by-user/${employeeId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();

      setEmployee(data);
      setEducation(data.user?.education || []);
      setExperience(data.user?.experience || []);
      setBiography(data.user?.biography || null);
      setDocuments(data.user?.documents || []);

      const moveRes = await fetch(
        `${API_BASE}/movements?employee_id=${data.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const moveData = await moveRes.json();
      setMovements(Array.isArray(moveData) ? moveData : []);
    } catch (err) {
      console.error(err);
    }
  };

  if (!employee) return <div className="hp-card">Loading report...</div>;

  return (
    <div className="hp-report">

      {/* OFFICIAL CENTERED HEADER */}
      <div className="hp-report-header">
        <img 
          src={logo} 
          alt="STICA Logo" 
          style={{ width: "95px", marginBottom: "15px" }} 
        />
        
        <h1 className="hp-report-main-title">
          Benishangul Gumuz Regional State
        </h1>
        <h2 className="hp-report-agency">
          Science and Technology Innovation Agency
        </h2>
        <h3 className="hp-report-directorate">
          Human Resource Management Directorate
        </h3>

        <div className="hp-report-title-section">
          <h2 className="report-title">
            EMPLOYEE PROFILE REPORT
          </h2>
        </div>

        <p className="hp-report-date">
          Date: {new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      <hr className="report-divider" />

      {/* PHOTO + NATIONAL ID ROW */}
      <section className="hp-report-section">
        <h3>Employee Identification</h3>

        <div className="hp-report-photo-id-row">
          {/* LEFT: PHOTO */}
          <div className="hp-report-photo-side">
            <label>Employee Photograph</label>
            {employee.photo ? (
              <img
                src={`https://hrms-owyj.onrender.com/storage/${employee.photo}?t=${Date.now()}`}
                alt="Employee Photo"
                className="hp-report-employee-photo"
              />
            ) : (
              <div className="hp-no-photo-box">No Photograph Available</div>
            )}
          </div>

          {/* RIGHT: NATIONAL ID */}
          <div className="hp-report-id-side">
            <label>National Identification Card</label>
            {employee.national_id ? (
              <img
                src={`https://hrms-owyj.onrender.com/storage/${employee.national_id}?t=${Date.now()}`}
                alt="National ID"
                className="hp-report-national-id"
              />
            ) : (
              <div className="hp-no-photo-box">No National ID Uploaded</div>
            )}
          </div>
        </div>

        {/* Personal & Job Information */}
        <div className="hp-report-details">
          <div>
            <p><strong>Full Name:</strong> {employee.full_name || "—"}</p>
            <p><strong>Email:</strong> {employee.user?.email || employee.email || "—"}</p>
            <p><strong>Department:</strong> {employee.department || "—"}</p>
            <p><strong>Status:</strong> {employee.status || "—"}</p>
          </div>
          <div>
            <p><strong>Position:</strong> {employee.position || "—"}</p>
            <p><strong>Position Number:</strong> {employee.position_number || "—"}</p>
            <p><strong>Grade / Step:</strong> {employee.grade || "—"} / {employee.step || "—"}</p>
            <p><strong>Hire Date:</strong> {employee.hire_date || "—"}</p>
            <p><strong>Salary:</strong> {employee.salary || "—"} ETB</p>
          </div>
        </div>
      </section>

      <hr className="report-divider" />

      {/* BIOGRAPHY */}
      <section className="hp-report-section">
        <h3>Professional Biography</h3>
        <p>{biography?.bio_text || "No biography available"}</p>
      </section>

      {/* EDUCATION */}
      <section className="hp-report-section">
        <h3>Academic History</h3>
        {education.length === 0 ? (
          <p>No academic records found.</p>
        ) : (
          education.map((edu, i) => (
            <div key={i} className="hp-report-card">
              <strong>{edu.level}</strong> in {edu.field} — {edu.institution}
              <br />
              <small>{edu.start_date} — {edu.end_date}</small>
            </div>
          ))
        )}
      </section>

      {/* EXPERIENCE */}
      <section className="hp-report-section">
        <h3>Work Experience</h3>
        {experience.length === 0 ? (
          <p>No work experience records found.</p>
        ) : (
          experience.map((exp, i) => (
            <div key={i} className="hp-report-card">
              <strong>{exp.role}</strong> at {exp.company}
              <br />
              <small>{exp.start_date} — {exp.end_date}</small>
            </div>
          ))
        )}
      </section>

      {/* MOVEMENTS */}
      <section className="hp-report-section">
        <h3>Employee Movement History</h3>
        {movements.length === 0 ? (
          <p>No movement records found.</p>
        ) : (
          <table className="hp-table">
            <thead>
              <tr>
                <th>Effective Date</th>
                <th>Type</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((m, i) => (
                <tr key={i}>
                  <td>{m.effective_date}</td>
                  <td>{m.type}</td>
                  <td>{m.description || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* SIGNATURE SECTION */}
      <div className="hp-signatures">
        <div>
          <p>__________________________</p>
          <p>Prepared by: HR Officer</p>
        </div>
        <div>
          <p>__________________________</p>
          <p>Approved by: Directorate Head</p>
        </div>
      </div>

    </div>
  );
}