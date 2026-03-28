import React, { useEffect, useRef, useState } from "react";
import "./HrPortal.css";


export default function HrPortal() {
  // Core state
  const [employees, setEmployees] = useState([]);
  const [message, setMessage] = useState("");

  // UI state
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  // Selected/Editing employee
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [editingId, setEditingId] = useState(null);

  // Form fields (employee)
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [department, setDepartment] = useState("");
  const [position, setPosition] = useState("");
  const [salary, setSalary] = useState("");
  const [hireDate, setHireDate] = useState("");
  const [status, setStatus] = useState("active");

  // Education (single quick form)
  const [level, setLevel] = useState("");
  const [field, setField] = useState("");
  const [institution, setInstitution] = useState("");
  const [eduStart, setEduStart] = useState("");
  const [eduEnd, setEduEnd] = useState("");
  const [eduNotes, setEduNotes] = useState("");

  // Experience
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [expStart, setExpStart] = useState("");
  const [expEnd, setExpEnd] = useState("");
  const [responsibilities, setResponsibilities] = useState("");

  // Biography
  const [bioText, setBioText] = useState("");

  // Documents
  const [docType, setDocType] = useState("");
  const [file, setFile] = useState(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const fileInputRef = useRef(null);

  // Tabs on the right side of profile
  const [activeTab, setActiveTab] = useState("overview");

  // Derived lists
  const filteredEmployees = employees.filter(emp =>
    (emp.full_name || emp.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    ((emp.user && emp.user.email) || emp.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * pageSize,
    (currentPage - 1) * pageSize + pageSize
  );

  // Load employees and documents
  useEffect(() => {
    loadEmployees();
    loadDocuments();
    return () => {
      if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadEmployees() {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/employees");
      const data = await res.json();
      // If backend returns { data: [...] } adapt
      setEmployees(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      console.error(err);
      setMessage("Failed to load employees");
      setTimeout(() => setMessage(""), 2500);
    }
  }

  async function loadDocuments() {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/employee-documents");
      const data = await res.json();
      setDocuments(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      console.error(err);
      setDocuments([]);
    }
  }

  // Select an employee to view in profile
  function openProfile(emp) {
    // If emp contains partial data and you want full details you can fetch detail here:
    // fetch(`http://127.0.0.1:8000/api/employees/${emp.id}`).then...
    setSelectedEmployee(emp);
    setEditingId(emp.id || emp.user_id || null);
    // populate form fields for edit (use fallback names)
    setFullName(emp.full_name || emp.name || "");
    setEmail((emp.user && emp.user.email) || emp.email || "");
    setPassword("");
    setDepartment(emp.department || "");
    setPosition(emp.position || "");
    setSalary(emp.salary || "");
    setHireDate(emp.hire_date || "");
    setStatus(emp.status || "active");
    setActiveTab("overview");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Employee save (create/update)
  async function handleSaveEmployee(e) {
    e.preventDefault();
    const payload = {
      name: fullName,
      email,
      password: password || undefined,
      role: "employee",
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
        setMessage(editingId ? "Employee updated" : "Employee added");
        await loadEmployees();
        setTimeout(() => setMessage(""), 3000);
        // after adding an employee, if creating we set editingId to newly created user's id so HR can add education/docs immediately
        if (!editingId) {
          const newId = data?.id || data?.user_id || (Array.isArray(data) && data[0]?.id) || null;
          if (newId) {
            setEditingId(newId);
            // optionally fetch newly created full record
            try {
              const det = await fetch(`http://127.0.0.1:8000/api/employees/${newId}`);
              if (det.ok) {
                const j = await det.json();
                setSelectedEmployee(j?.data || j);
              }
            } catch {}
          }
        } else {
          // refresh selectedEmployee
          try {
            const det = await fetch(`http://127.0.0.1:8000/api/employees/${editingId}`);
            if (det.ok) {
              const j = await det.json();
              setSelectedEmployee(j?.data || j);
            }
          } catch {}
        }
        // keep editingId so HR can add education/experience/docs
      } else {
        setMessage("Error: " + (data.message || "Could not save"));
      }
    } catch (err) {
      console.error(err);
      setMessage("Error saving employee");
    } finally {
      setTimeout(() => setMessage(""), 4000);
    }
  }

  // Delete employee
  async function handleDeleteEmployee(id) {
    if (!window.confirm("Delete this employee?")) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/employees/${id}`, { method: "DELETE" });
      if (res.ok) {
        setEmployees(prev => prev.filter(p => p.id !== id && p.user_id !== id));
        setMessage("Employee deleted");
        setTimeout(() => setMessage(""), 3000);
        if (selectedEmployee?.id === id) {
          setSelectedEmployee(null);
          setEditingId(null);
        }
      } else {
        setMessage("Could not delete");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (err) {
      console.error(err);
      setMessage("Error deleting");
      setTimeout(() => setMessage(""), 3000);
    }
  }

  // Document flows (no auto-open)
  const onFileChange = (e) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    if (f && f.type?.startsWith("image/")) {
      if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
      setFilePreviewUrl(URL.createObjectURL(f));
    } else {
      if (filePreviewUrl) { URL.revokeObjectURL(filePreviewUrl); setFilePreviewUrl(null); }
    }
  };

  const handleSaveDocument = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage("Choose a file");
      setTimeout(() => setMessage(""), 2500);
      return;
    }
    if (!editingId) {
      setMessage("Save or select an employee to attach document");
      setTimeout(() => setMessage(""), 2500);
      return;
    }
    const fd = new FormData();
    fd.append("user_id", editingId);
    fd.append("document_type", docType || file.name);
    fd.append("file", file);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/employee-documents", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload failed");
      const saved = await res.json();
      setDocuments(prev => [saved, ...prev]);
      setMessage("Document uploaded (not auto-opened)");
      // reset
      setDocType("");
      setFile(null);
      if (filePreviewUrl) { URL.revokeObjectURL(filePreviewUrl); setFilePreviewUrl(null); }
      if (fileInputRef.current) fileInputRef.current.value = "";
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error(err);
      setMessage("Upload failed");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handlePreview = (doc) => {
    setPreviewDoc(doc);
    setPreviewOpen(true);
  };

  const handleDownload = (doc) => {
    const a = document.createElement("a");
    a.href = doc.url || doc.path || doc.download_url;
    a.download = doc.name || doc.filename || "";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleDeleteDocument = async (id) => {
    if (!window.confirm("Delete this document?")) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/employee-documents/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setDocuments(prev => prev.filter(d => d.id !== id));
      setMessage("Document deleted");
      setTimeout(() => setMessage(""), 2500);
    } catch (err) {
      console.error(err);
      setMessage("Delete failed");
      setTimeout(() => setMessage(""), 2500);
    }
  };

  // Education/Experience/Bio handlers (light)
  const handleSaveEducation = async (e) => {
    e.preventDefault();
    if (!editingId) {
      setMessage("Select or save an employee first");
      setTimeout(() => setMessage(""), 2500);
      return;
    }
    const payload = { user_id: editingId, level, field, institution, start_date: eduStart, end_date: eduEnd, notes: eduNotes };
    try {
      const res = await fetch("http://127.0.0.1:8000/api/employee-education", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Save failed");
      setMessage("Education saved");
      setLevel(""); setField(""); setInstitution(""); setEduStart(""); setEduEnd(""); setEduNotes("");
    } catch (err) {
      console.error(err);
      setMessage("Failed to save education");
    } finally { setTimeout(() => setMessage(""), 2500); }
  };

  const handleSaveExperience = async (e) => {
    e.preventDefault();
    if (!editingId) {
      setMessage("Select or save an employee first");
      setTimeout(() => setMessage(""), 2500);
      return;
    }
    const payload = { user_id: editingId, company, role, start_date: expStart, end_date: expEnd, responsibilities };
    try {
      const res = await fetch("http://127.0.0.1:8000/api/employee-experience", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Save failed");
      setMessage("Experience saved");
      setCompany(""); setRole(""); setExpStart(""); setExpEnd(""); setResponsibilities("");
    } catch (err) {
      console.error(err);
      setMessage("Failed to save experience");
    } finally { setTimeout(() => setMessage(""), 2500); }
  };

  const handleSaveBiography = async (e) => {
    e.preventDefault();
    if (!editingId) {
      setMessage("Select or save an employee first");
      setTimeout(() => setMessage(""), 2500);
      return;
    }
    const payload = { user_id: editingId, bio_text: bioText };
    try {
      const res = await fetch("http://127.0.0.1:8000/api/employee-biography", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Save failed");
      setMessage("Biography saved");
      setBioText("");
    } catch (err) {
      console.error(err);
      setMessage("Failed to save biography");
    } finally { setTimeout(() => setMessage(""), 2500); }
  };

  // Helpers
  const formatDate = (iso) => {
    if (!iso) return "";
    try { return new Date(iso).toLocaleDateString(); } catch { return iso; }
  };

  // Documents filtered to selected employee if present
  const shownDocuments = editingId ? documents.filter(d => String(d.user_id) === String(editingId) || String(d.employee_id) === String(editingId)) : documents;

  return (
    <div className="hp-app">
      <header className="hp-topbar">
        <div className="hp-brand">HR Portal</div>
        <div className="hp-search">
          <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search employees..." />
        </div>
        <div className="hp-actions">
          <button className="btn-ghost" onClick={() => { setSelectedEmployee(null); setEditingId(null); }}>Clear Profile</button>
        </div>
      </header>

      <main className="hp-container">
        {/* MESSAGE */}
        {message && <div className="hp-toast">{message}</div>}

        {/* Top: if a profile is selected show two-column profile layout */}
        <section className="hp-profile-section">
          <div className="hp-left-col card">
            {selectedEmployee ? (
              <>
                <div className="profile-head">
                  <div className="avatar">{(selectedEmployee.full_name || selectedEmployee.name || "").split(" ").map(n => n[0]).slice(0,2).join("").toUpperCase()}</div>
                  <div>
                    <h2 className="name">{selectedEmployee.full_name || selectedEmployee.name}</h2>
                    <div className="muted">{selectedEmployee.position || "-"} • {selectedEmployee.department || "-"}</div>
                    <div className={`status ${selectedEmployee.status === "active" ? "active" : "inactive"}`}>{selectedEmployee.status || "-"}</div>
                  </div>
                </div>

                <div className="card-section">
                  <h4>Quick Info</h4>
                  <ul className="info-list">
                    <li><strong>ID:</strong> {selectedEmployee.id || selectedEmployee.user_id}</li>
                    <li><strong>Email:</strong> {(selectedEmployee.user && selectedEmployee.user.email) || selectedEmployee.email}</li>
                    <li><strong>Hire date:</strong> {formatDate(selectedEmployee.hire_date)}</li>
                    <li><strong>Salary:</strong> {selectedEmployee.salary}</li>
                  </ul>
                </div>

                <div className="card-actions">
                  <button className="btn-primary" onClick={() => setActiveTab("overview")}>Overview</button>
                  <button className="btn-ghost" onClick={() => setActiveTab("documents")}>Documents</button>
                </div>
              </>
            ) : (
              <div className="empty-profile">
                <h3>No profile selected</h3>
                <p>Select an employee from the list below to view profile and details; or fill the form to add a new employee and then add Education/Experience/Documents/Bio.</p>
              </div>
            )}
          </div>

          <div className="hp-right-col">
            {/* Right column: new/edit employee form */}
            <div className="card">
              <div className="card-header">
                <h3>{editingId ? (selectedEmployee ? "Edit Employee" : "Editing") : "Add New Employee"}</h3>
              </div>

              <form className="grid-2" onSubmit={handleSaveEmployee}>
                <div>
                  <label>Full Name</label>
                  <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} required />
                </div>
                <div>
                  <label>Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div>
                  <label>Password {editingId ? <span className="muted-small">(leave blank to keep)</span> : null}</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} required={!editingId} />
                </div>
                <div>
                  <label>Department</label>
                  <input type="text" value={department} onChange={e => setDepartment(e.target.value)} required />
                </div>
                <div>
                  <label>Position</label>
                  <input type="text" value={position} onChange={e => setPosition(e.target.value)} required />
                </div>
                <div>
                  <label>Salary</label>
                  <input type="number" value={salary} onChange={e => setSalary(e.target.value)} required />
                </div>
                <div>
                  <label>Hire Date</label>
                  <input type="date" value={hireDate} onChange={e => setHireDate(e.target.value)} />
                </div>
                <div>
                  <label>Status</label>
                  <select value={status} onChange={e => setStatus(e.target.value)}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="form-actions" style={{ gridColumn: "1/-1", justifySelf: "end" }}>
                  <button type="submit" className="btn-primary">{editingId ? "Update Employee" : "Add Employee"}</button>
                  {editingId && <button type="button" className="btn-ghost" onClick={() => { setEditingId(null); setSelectedEmployee(null); }}>Cancel</button>}
                </div>
              </form>
            </div>

            {/* Tabs area */}
            <div className="card tabs-card">
              <div className="tabs">
                <button className={activeTab === "overview" ? "active" : ""} onClick={() => setActiveTab("overview")}>Overview</button>
                <button className={activeTab === "documents" ? "active" : ""} onClick={() => setActiveTab("documents")}>Documents</button>
                <button className={activeTab === "education" ? "active" : ""} onClick={() => setActiveTab("education")}>Education</button>
                <button className={activeTab === "experience" ? "active" : ""} onClick={() => setActiveTab("experience")}>Experience</button>
                <button className={activeTab === "biography" ? "active" : ""} onClick={() => setActiveTab("biography")}>Biography</button>
              </div>

              <div className="tab-panel">
                {activeTab === "overview" && (
                  <>
                    <h4>Contact</h4>
                    <div className="two-col">
                      <div><strong>Email:</strong> {selectedEmployee?.user?.email || selectedEmployee?.email || "-"}</div>
                      <div><strong>Phone:</strong> {selectedEmployee?.phone || "-"}</div>
                    </div>

                    <h4 style={{ marginTop: 12 }}>Employment</h4>
                    <div className="two-col">
                      <div><strong>Department:</strong> {selectedEmployee?.department || "-"}</div>
                      <div><strong>Position:</strong> {selectedEmployee?.position || "-"}</div>
                    </div>

                    <h4 style={{ marginTop: 12 }}>Quick Notes</h4>
                    <p className="muted">{selectedEmployee?.notes || "No notes available."}</p>
                  </>
                )}

                {activeTab === "documents" && (
                  <>
                    <form className="doc-upload" onSubmit={handleSaveDocument}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <input type="text" placeholder="Document Type" value={docType} onChange={e => setDocType(e.target.value)} />
                        <input ref={fileInputRef} type="file" onChange={onFileChange} />
                        <button className="btn-primary" type="submit">Upload</button>
                      </div>
                      {filePreviewUrl && <div className="file-preview"><img src={filePreviewUrl} alt="preview" /></div>}
                    </form>

                    <div className="doc-list">
                      <table>
                        <thead>
                          <tr><th>Type</th><th>Name</th><th>Uploaded</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                          {shownDocuments.length === 0 ? (
                            <tr><td colSpan="4" className="muted">No documents</td></tr>
                          ) : shownDocuments.map(d => (
                            <tr key={d.id}>
                              <td>{d.type || d.document_type || "-"}</td>
                              <td>{d.name || d.filename || d.file_name || "-"}</td>
                              <td>{d.uploaded_at ? new Date(d.uploaded_at).toLocaleString() : d.created_at ? new Date(d.created_at).toLocaleString() : "-"}</td>
                              <td className="actions-col">
                                <button onClick={() => { handlePreview(d); }} className="btn-ghost">Preview</button>
                                <button onClick={() => handleDownload(d)} className="btn-ghost">Download</button>
                                <button onClick={() => handleDeleteDocument(d.id)} className="btn-danger">Delete</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}

                {activeTab === "education" && (
                  <>
                    <form onSubmit={handleSaveEducation} className="grid-2">
                      <div><label>Level</label><input value={level} onChange={e => setLevel(e.target.value)} /></div>
                      <div><label>Field</label><input value={field} onChange={e => setField(e.target.value)} /></div>
                      <div><label>Institution</label><input value={institution} onChange={e => setInstitution(e.target.value)} /></div>
                      <div><label>Start</label><input type="date" value={eduStart} onChange={e => setEduStart(e.target.value)} /></div>
                      <div><label>End</label><input type="date" value={eduEnd} onChange={e => setEduEnd(e.target.value)} /></div>
                      <div style={{ gridColumn: "1/-1" }}><label>Notes</label><textarea value={eduNotes} onChange={e => setEduNotes(e.target.value)} /></div>
                      <div style={{ gridColumn: "1/-1", textAlign: "right" }}><button className="btn-primary" type="submit">Add Education</button></div>
                    </form>
                  </>
                )}

                {activeTab === "experience" && (
                  <>
                    <form onSubmit={handleSaveExperience} className="grid-2">
                      <div><label>Company</label><input value={company} onChange={e => setCompany(e.target.value)} /></div>
                      <div><label>Role</label><input value={role} onChange={e => setRole(e.target.value)} /></div>
                      <div><label>Start</label><input type="date" value={expStart} onChange={e => setExpStart(e.target.value)} /></div>
                      <div><label>End</label><input type="date" value={expEnd} onChange={e => setExpEnd(e.target.value)} /></div>
                      <div style={{ gridColumn: "1/-1" }}><label>Responsibilities</label><textarea value={responsibilities} onChange={e => setResponsibilities(e.target.value)} /></div>
                      <div style={{ gridColumn: "1/-1", textAlign: "right" }}><button className="btn-primary" type="submit">Add Experience</button></div>
                    </form>
                  </>
                )}

                {activeTab === "biography" && (
                  <>
                    <form onSubmit={handleSaveBiography}>
                      <label>Biography</label>
                      <textarea value={bioText} onChange={e => setBioText(e.target.value)} />
                      <div style={{ textAlign: "right" }}><button className="btn-primary" type="submit">Save Biography</button></div>
                    </form>
                  </>
                )}

              </div>
            </div>
          </div>
        </section>

        {/* Employee list */}
        <section className="card list-card">
          <div className="list-header">
            <h3>Employee Directory</h3>
            <div>
              <button className="btn-primary" onClick={() => { setSelectedEmployee(null); setEditingId(null); }}>Add Employee</button>
            </div>
          </div>

          <div className="filters-row">
            <div className="filter-chip">All departments</div>
            <div className="filter-chip">Active</div>
            <div className="filter-chip">Inactive</div>
            <div style={{ marginLeft: "auto" }}>Showing {filteredEmployees.length} employees</div>
          </div>

          <table className="employee-table">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Department</th><th>Position</th><th>Salary</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {paginatedEmployees.map(emp => (
                <tr key={emp.id || emp.user_id}>
                  <td className="name-cell" onClick={() => openProfile(emp)}>
                    <div className="row-avatar">{(emp.full_name || emp.name || "").split(" ").map(n => n[0]).slice(0,2).join("").toUpperCase()}</div>
                    <div>
                      <div className="emp-name">{emp.full_name || emp.name}</div>
                      <div className="muted-small">{(emp.user && emp.user.email) || emp.email}</div>
                    </div>
                  </td>
                  <td>{(emp.user && emp.user.email) || emp.email}</td>
                  <td>{emp.department}</td>
                  <td>{emp.position}</td>
                  <td>{emp.salary}</td>
                  <td><span className={`badge ${emp.status === "active" ? "green" : "muted"}`}>{emp.status}</span></td>
                  <td className="actions-col">
                    <button className="btn-ghost" onClick={() => openProfile(emp)}>View</button>
                    <button className="btn-ghost" onClick={() => { setEditingId(emp.id || emp.user_id); openProfile(emp); }}>Edit</button>
                    <button className="btn-danger" onClick={() => handleDeleteEmployee(emp.id || emp.user_id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Prev</button>
            <span>Page {currentPage}</span>
            <button onClick={() => setCurrentPage(p => p + 1)} disabled={(currentPage * pageSize) >= filteredEmployees.length}>Next</button>
            <select value={pageSize} onChange={e => setPageSize(Number(e.target.value))}>
              <option value={1}>Show 1</option>
              <option value={5}>Show 5</option>
              <option value={10}>Show 10</option>
              <option value={filteredEmployees.length}>Show All</option>
            </select>
          </div>
        </section>
      </main>

      {/* Preview modal */}
      {previewOpen && previewDoc && (
        <div className="modal-overlay" onClick={() => setPreviewOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <strong>{previewDoc.name || previewDoc.filename}</strong>
              <div>
                <button className="btn-ghost" onClick={() => handleDownload(previewDoc)}>Download</button>
                <button className="btn-ghost" onClick={() => setPreviewOpen(false)}>Close</button>
              </div>
            </div>
            <div className="modal-body">
              {previewDoc.type?.startsWith("image/") ? (
                <img src={previewDoc.url} alt={previewDoc.name} style={{ maxWidth: "100%" }} />
              ) : previewDoc.type === "application/pdf" || previewDoc.name?.toLowerCase().endsWith(".pdf") ? (
                <iframe title="pdf" src={previewDoc.url} style={{ width: "100%", height: "70vh", border: "none" }} />
              ) : (
                <p>No inline preview available. Use Download.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}