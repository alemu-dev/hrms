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

  /* ===========================
      LOAD DATA FROM API
  ============================ */
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

  if (!employee) return <div>Loading...</div>;

  return (
    <div className="hp-report">

      {/* ===========================
          HEADER
      ============================ */}
      <div className="hp-report-header">
        <img src={logo} alt="logo" style={{ width: "80px", marginBottom: "10px" }} />

        <h2>Benishangul Gumuz Regional State</h2>
        <h3>Science and Technology Innovation Agency</h3>
        <p>Human Resource Management Directorate</p>
        <p><strong>Employee Profile Report</strong></p>

        <p style={{ textAlign: "right" }}>
          {new Date().toLocaleDateString()}
        </p>
      </div>

      <hr />

      {/* ===========================
          IDENTIFICATION SECTION
      ============================ */}
      <section className="hp-report-section">
        <h3>Employee Identification</h3>

        <div className="hp-grid-2">

          {/* ===========================
              LEFT SIDE (PHOTO + BASIC INFO)
          ============================ */}
          <div className="hp-report-left">
            {/* LEFT: EMPLOYEE PHOTO */}
            {employee.photo && (
              <img
                src={`https://hrms-owyj.onrender.com/storage/${employee.photo}?t=${Date.now()}`}
                alt="employee"
                className="hp-photo"
              />
            )}

            <p><strong>Full Name:</strong> {employee.full_name || "—"}</p>
            <p><strong>Email:</strong> {employee.user?.email || "—"}</p>
            <p><strong>Department:</strong> {employee.department || "—"}</p>
            <p><strong>Status:</strong> {employee.status || "—"}</p>
          </div>

          {/* ===========================
              RIGHT SIDE (ID CARD + JOB INFO)
          ============================ */}
          <div className="hp-report-right">
            {/* RIGHT: NATIONAL ID */}
            {employee.national_id && (
              <img
                src={`https://hrms-owyj.onrender.com/storage/${employee.national_id}?t=${Date.now()}`}
                alt="national id"
                className="hp-id-card-right"
              />
            )}

            <p><strong>Position:</strong> {employee.position || "—"}</p>
            <p><strong>Position No:</strong> {employee.position_number || "—"}</p>
            <p><strong>Grade / Step:</strong> {employee.grade || "—"} / {employee.step || "—"}</p>
            <p><strong>Hire Date:</strong> {employee.hire_date || "—"}</p>
            <p><strong>Salary:</strong> {employee.salary || "—"} ETB</p>
          </div>

        </div>
      </section>

      {/* ===========================
          BIOGRAPHY
      ============================ */}
      <section className="hp-report-section">
        <h3>Biography</h3>
        <p>{biography?.bio_text || "No biography available"}</p>
      </section>

      {/* ===========================
          EDUCATION
      ============================ */}
      <section className="hp-report-section">
        <h3>Education</h3>

        {education.length === 0 && <p>No records</p>}

        {education.map((edu, i) => (
          <div key={i} className="hp-report-card">
            <strong>{edu.level}</strong> in {edu.field}
            <br />
            {edu.institution}
            <br />
            <small>{edu.start_date} → {edu.end_date}</small>
          </div>
        ))}
      </section>

      {/* ===========================
          EXPERIENCE
      ============================ */}
      <section className="hp-report-section">
        <h3>Work Experience</h3>

        {experience.length === 0 && <p>No records</p>}

        {experience.map((exp, i) => (
          <div key={i} className="hp-report-card">
            <strong>{exp.role}</strong> at {exp.company}
            <br />
            <small>{exp.start_date} → {exp.end_date}</small>
          </div>
        ))}
      </section>

      {/* ===========================
          MOVEMENTS
      ============================ */}
      <section className="hp-report-section">
        <h3>Employee Movements</h3>

        {movements.length === 0 ? (
          <p>No movement records</p>
        ) : (
          <table className="hp-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Action</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((m, i) => (
                <tr key={i}>
                  <td>{m.effective_date}</td>
                  <td>{m.type}</td>
                  <td>{m.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* ===========================
          DOCUMENTS
      ============================ */}
      <section className="hp-report-section">
        <h3>Documents</h3>

        {documents.length === 0 && <p>No documents</p>}

        {documents.map((doc, i) => (
          <div key={i}>
            <a
              href={`https://hrms-owyj.onrender.com/storage/${doc.file_path}`}
              target="_blank"
              rel="noreferrer"
            >
              📄 {doc.document_type}
            </a>
          </div>
        ))}
      </section>

      {/* ===========================
          FOOTER (SIGNATURES)
      ============================ */}
      <div className="hp-signatures">
        <div>
          <p>__________________________</p>
          <p>HR Officer Signature</p>
        </div>

        <div>
          <p>__________________________</p>
          <p>Authorized Signature</p>
        </div>
      </div>

    </div>
  );
}