import React, { useEffect, useRef, useState } from "react";
import "./HrPortal.css";

/*
  HrPortal.js - full CRUD for employees + education/experience/biography/documents
  Uses your provided endpoints. Adjust API_BASE if needed.
  NOTE: Logic is kept intact; layout moved so Employee Directory appears above the profile/form.
*/

export default function HrPortal() {
  const API_BASE = "http://127.0.0.1:8000/api";

  // Core
  const [employees, setEmployees] = useState([]);
  const [message, setMessage] = useState("");

  // UI
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Selected employee and edit state
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);

  // Employee form
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [department, setDepartment] = useState("");
  const [position, setPosition] = useState("");
  const [salary, setSalary] = useState("");
  const [hireDate, setHireDate] = useState("");
  const [status, setStatus] = useState("active");

  // Education
  const [educationList, setEducationList] = useState([]);
  const [eduForm, setEduForm] = useState({ id: null, level: "", field: "", institution: "", start_date: "", end_date: "", notes: "" });
  const [editingEduId, setEditingEduId] = useState(null);

  // Experience
  const [experienceList, setExperienceList] = useState([]);
  const [expForm, setExpForm] = useState({ id: null, company: "", role: "", start_date: "", end_date: "", responsibilities: "" });
  const [editingExpId, setEditingExpId] = useState(null);

  // Biography
  const [biographyList, setBiographyList] = useState([]);
  const [bioForm, setBioForm] = useState({ id: null, bio_text: "" });
  const [editingBioId, setEditingBioId] = useState(null);

  // Documents
  const [documents, setDocuments] = useState([]);
  const [docType, setDocType] = useState("");
  const [file, setFile] = useState(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState(null);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const fileInputRef = useRef(null);

  // Tabs
  const [activeTab, setActiveTab] = useState("overview");

  // Loading flags
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [savingEmployee, setSavingEmployee] = useState(false);
  const [savingEdu, setSavingEdu] = useState(false);
  const [savingExp, setSavingExp] = useState(false);
  const [savingBio, setSavingBio] = useState(false);

  // Helpers: filtered / paginated employees
  const filteredEmployees = employees.filter(emp =>
    (emp.full_name || emp.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (((emp.user && emp.user.email) || emp.email || "").toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * pageSize,
    (currentPage - 1) * pageSize + pageSize
  );

  // Decide which id to use for related resources (user_id vs employee id)
  function getTargetId() {
    if (editingEmployeeId) return editingEmployeeId;
    if (!selectedEmployee) return null;
    return selectedEmployee.user_id || selectedEmployee.id || selectedEmployee.user?.id || null;
  }

  // Generic safe parser: tries JSON then falls back to text (prevents crash when server returns HTML)
  async function safeParseResponseToObject(res) {
    const text = await res.text();
    try {
      return { json: JSON.parse(text), text };
    } catch {
      return { json: null, text };
    }
  }

  // Generic error reader that handles HTML pages too
  async function readError(res) {
    try {
      const parsed = await safeParseResponseToObject(res);
      if (parsed.json) {
        if (parsed.json.message) return parsed.json.message;
        if (parsed.json.errors) return JSON.stringify(parsed.json.errors);
        return JSON.stringify(parsed.json);
      }
      // If text looks like HTML, return a compacted snippet
      const txt = (parsed.text || `HTTP ${res.status}`).toString();
      if (txt.trim().startsWith("<")) {
        // compact HTML: strip tags and long whitespace
        return txt.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "").replace(/<\/?[^>]+(>|$)/g, " ").replace(/\s+/g, " ").trim().slice(0, 1000);
      }
      return txt || `HTTP ${res.status}`;
    } catch (err) {
      return `HTTP ${res.status}`;
    }
  }

  // Initial load
  useEffect(() => {
    loadEmployees();
    return () => { if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load employees list
  async function loadEmployees() {
    setLoadingEmployees(true);
    try {
      const res = await fetch(`${API_BASE}/employees`, { headers: { "Accept": "application/json" } });
      if (!res.ok) {
        const err = await readError(res);
        throw new Error(err);
      }
      const data = await res.json();
      setEmployees(Array.isArray(data) ? data : (data?.data || []));
    } catch (err) {
      console.error("loadEmployees", err);
      setMessage("Failed to load employees: " + (err.message || err));
      setTimeout(() => setMessage(""), 4000);
    } finally {
      setLoadingEmployees(false);
    }
  }

  // Load selected employee full details
  async function loadEmployeeDetail(targetId) {
    if (!targetId) return null;
    try {
      const res = await fetch(`${API_BASE}/employees/${targetId}`, { headers: { "Accept": "application/json" } });
      if (!res.ok) throw new Error(await readError(res));
      const js = await res.json();
      const rec = js?.data || js;
      return rec;
    } catch (err) {
      console.error("loadEmployeeDetail", err);
      return null;
    }
  }

  // Load related lists for a user/employee
  async function loadRelatedForUser(userId) {
    if (!userId) {
      setEducationList([]); setExperienceList([]); setBiographyList([]); setDocuments([]);
      return;
    }
    try {
      // Education
      const edRes = await fetch(`${API_BASE}/employee-education/${userId}`, { headers: { "Accept": "application/json" } });
      const edJson = edRes.ok ? await edRes.json() : null;
      setEducationList(edJson ? (Array.isArray(edJson) ? edJson : edJson?.data || []) : []);

      // Experience
      const exRes = await fetch(`${API_BASE}/employee-experience/${userId}`, { headers: { "Accept": "application/json" } });
      const exJson = exRes.ok ? await exRes.json() : null;
      setExperienceList(exJson ? (Array.isArray(exJson) ? exJson : exJson?.data || []) : []);

      // Biography
      const bioRes = await fetch(`${API_BASE}/employee-biography/${userId}`, { headers: { "Accept": "application/json" } });
      const bioJson = bioRes.ok ? await bioRes.json() : null;
      setBiographyList(bioJson ? (Array.isArray(bioJson) ? bioJson : bioJson?.data ? (Array.isArray(bioJson.data) ? bioJson.data : [bioJson.data]) : (bioJson ? [bioJson] : [])) : []);

      // Documents
      const docsRes = await fetch(`${API_BASE}/employee-documents/${userId}`, { headers: { "Accept": "application/json" } });
      const docsJson = docsRes.ok ? await docsRes.json() : null;
      setDocuments(docsJson ? (Array.isArray(docsJson) ? docsJson : docsJson?.data || []) : []);
    } catch (err) {
      console.error("loadRelatedForUser", err);
    }
  }

  // Open profile and load related lists
  async function openProfile(emp) {
    setSelectedEmployee(emp);
    const id = emp.id || emp.user_id || emp.user?.id || null;
    setEditingEmployeeId(id);
    // populate employee form
    setFullName(emp.full_name || emp.name || "");
    setEmail(emp.user?.email || emp.email || "");
    setPassword("");
    setDepartment(emp.department || "");
    setPosition(emp.position || "");
    setSalary(emp.salary || "");
    setHireDate(emp.hire_date || "");
    setStatus(emp.status || "active");
    setActiveTab("overview");
    if (id) await loadRelatedForUser(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Employee save (create / update)
  async function handleSaveEmployee(e) {
    e.preventDefault();
    if (savingEmployee) return;
    setSavingEmployee(true);

    const targetId = editingEmployeeId || (selectedEmployee && (selectedEmployee.id || selectedEmployee.user_id));
    const payload = {
      name: fullName,
      email,
      full_name: fullName,
      department,
      position,
      salary,
      hire_date: hireDate,
      status
    };
    if (password && password.trim() !== "") payload.password = password;

    try {
      let res;
      if (targetId) {
        res = await fetch(`${API_BASE}/employees/${targetId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error(await readError(res));
        setMessage("Employee updated");
      } else {
        res = await fetch(`${API_BASE}/employees`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error(await readError(res));
        setMessage("Employee created");
      }

      // Refresh list
      await loadEmployees();

      // Attempt to get returned id and load fresh record
      let returned = null;
      try { returned = await res.json(); } catch (_) { returned = null; }
      const newId = returned?.data?.id || returned?.id || returned?.data?.user_id || returned?.user_id || targetId;
      if (newId) {
        const fresh = await loadEmployeeDetail(newId);
        if (fresh) {
          setSelectedEmployee(fresh);
          setEditingEmployeeId(fresh.user_id || fresh.id || newId);
          await loadRelatedForUser(fresh.user_id || fresh.id || newId);
        }
      }

      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("handleSaveEmployee", err);
      setMessage("Save employee failed: " + (err.message || err));
      setTimeout(() => setMessage(""), 5000);
    } finally {
      setSavingEmployee(false);
    }
  }

  // Delete employee
  async function handleDeleteEmployee(emp) {
    const id = emp.id || emp.user_id || emp.user?.id;
    if (!id) return alert("Missing id");
    if (!window.confirm("Delete this employee?")) return;
    try {
      const res = await fetch(`${API_BASE}/employees/${id}`, { method: "DELETE", headers: { "Accept": "application/json" } });
      if (!res.ok) throw new Error(await readError(res));
      setEmployees(prev => prev.filter(p => String(p.id) !== String(id) && String(p.user_id) !== String(id)));
      if (selectedEmployee && (selectedEmployee.id === id || selectedEmployee.user_id === id)) {
        setSelectedEmployee(null);
        setEditingEmployeeId(null);
        await loadRelatedForUser(null);
      }
      setMessage("Employee deleted");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("handleDeleteEmployee", err);
      setMessage("Delete failed: " + (err.message || err));
      setTimeout(() => setMessage(""), 4000);
    }
  }

  // -----------------------
  // Education CRUD
  // -----------------------
  function startAddEdu() {
    setEduForm({ id: null, level: "", field: "", institution: "", start_date: "", end_date: "", notes: "" });
    setEditingEduId(null);
  }
  function startEditEdu(ed) {
    setEduForm({ id: ed.id, level: ed.level || "", field: ed.field || "", institution: ed.institution || "", start_date: ed.start_date || "", end_date: ed.end_date || "", notes: ed.notes || "" });
    setEditingEduId(ed.id);
    setActiveTab("education");
  }

  async function handleSaveEducation(e) {
    e.preventDefault();
    if (savingEdu) return;
    setSavingEdu(true);
    const target = getTargetId();
    if (!target) {
      setMessage("Select or save an employee first");
      setSavingEdu(false);
      setTimeout(() => setMessage(""), 2500);
      return;
    }

    const payload = { user_id: target, level: eduForm.level, field: eduForm.field, institution: eduForm.institution, start_date: eduForm.start_date, end_date: eduForm.end_date, notes: eduForm.notes };

    try {
      let res;
      if (editingEduId) {
        res = await fetch(`${API_BASE}/employee-education/${editingEduId}`, {
          method: "PUT", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error(await readError(res));
        setMessage("Education updated");
      } else {
        res = await fetch(`${API_BASE}/employee-education`, {
          method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error(await readError(res));
        setMessage("Education added");
      }

      await loadRelatedForUser(target);
      startAddEdu();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("handleSaveEducation", err);
      setMessage("Saving education failed: " + (err.message || err));
      setTimeout(() => setMessage(""), 4000);
    } finally {
      setSavingEdu(false);
    }
  }

  async function handleDeleteEducation(id) {
    if (!window.confirm("Delete this education record?")) return;
    try {
      const res = await fetch(`${API_BASE}/employee-education/${id}`, { method: "DELETE", headers: { "Accept": "application/json" } });
      if (!res.ok) throw new Error(await readError(res));
      setEducationList(prev => prev.filter(x => String(x.id) !== String(id)));
      setMessage("Education deleted");
      const target = getTargetId();
      if (target) await loadRelatedForUser(target);
      setTimeout(() => setMessage(""), 2500);
    } catch (err) {
      console.error("handleDeleteEducation", err);
      setMessage("Delete failed: " + (err.message || err));
      setTimeout(() => setMessage(""), 3000);
    }
  }

  // -----------------------
  // Experience CRUD
  // -----------------------
  function startAddExp() {
    setExpForm({ id: null, company: "", role: "", start_date: "", end_date: "", responsibilities: "" });
    setEditingExpId(null);
  }
  function startEditExp(ex) {
    setExpForm({ id: ex.id, company: ex.company || "", role: ex.role || "", start_date: ex.start_date || "", end_date: ex.end_date || "", responsibilities: ex.responsibilities || "" });
    setEditingExpId(ex.id);
    setActiveTab("experience");
  }

  async function handleSaveExperience(e) {
    e.preventDefault();
    if (savingExp) return;
    setSavingExp(true);
    const target = getTargetId();
    if (!target) {
      setMessage("Select or save an employee first");
      setSavingExp(false);
      setTimeout(() => setMessage(""), 2500);
      return;
    }
    const payload = { user_id: target, company: expForm.company, role: expForm.role, start_date: expForm.start_date, end_date: expForm.end_date, responsibilities: expForm.responsibilities };
    try {
      let res;
      if (editingExpId) {
        res = await fetch(`${API_BASE}/employee-experience/${editingExpId}`, { method: "PUT", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify(payload) });
        if (!res.ok) throw new Error(await readError(res));
        setMessage("Experience updated");
      } else {
        res = await fetch(`${API_BASE}/employee-experience`, { method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify(payload) });
        if (!res.ok) throw new Error(await readError(res));
        setMessage("Experience added");
      }
      await loadRelatedForUser(target);
      startAddExp();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("handleSaveExperience", err);
      setMessage("Saving experience failed: " + (err.message || err));
      setTimeout(() => setMessage(""), 4000);
    } finally {
      setSavingExp(false);
    }
  }

  async function handleDeleteExperience(id) {
    if (!window.confirm("Delete this experience record?")) return;
    try {
      const res = await fetch(`${API_BASE}/employee-experience/${id}`, { method: "DELETE", headers: { "Accept": "application/json" } });
      if (!res.ok) throw new Error(await readError(res));
      setExperienceList(prev => prev.filter(x => String(x.id) !== String(id)));
      setMessage("Experience deleted");
      const target = getTargetId();
      if (target) await loadRelatedForUser(target);
      setTimeout(() => setMessage(""), 2500);
    } catch (err) {
      console.error("handleDeleteExperience", err);
      setMessage("Delete failed: " + (err.message || err));
      setTimeout(() => setMessage(""), 3000);
    }
  }

  // -----------------------
  // Biography CRUD
  // -----------------------
  function startAddBio() {
    setBioForm({ id: null, bio_text: "" });
    setEditingBioId(null);
  }
  function startEditBio(bio) {
    setBioForm({ id: bio.id, bio_text: bio.bio_text || bio.text || bio.description || "" });
    setEditingBioId(bio.id);
    setActiveTab("biography");
  }

  async function handleSaveBiography(e) {
    e.preventDefault();
    if (savingBio) return;
    setSavingBio(true);
    const target = getTargetId();
    if (!target) {
      setMessage("Select or save an employee first");
      setSavingBio(false);
      setTimeout(() => setMessage(""), 2500);
      return;
    }

    const payload = { user_id: target, bio_text: bioForm.bio_text };

    try {
      let res;
      if (editingBioId) {
        res = await fetch(`${API_BASE}/employee-biography/${editingBioId}`, { method: "PUT", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify(payload) });
        if (!res.ok) throw new Error(await readError(res));
        setMessage("Biography updated");
      } else {
        res = await fetch(`${API_BASE}/employee-biography`, { method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" }, body: JSON.stringify(payload) });
        if (!res.ok) throw new Error(await readError(res));
        setMessage("Biography added");
      }
      await loadRelatedForUser(target);
      startAddBio();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("handleSaveBiography", err);
      setMessage("Saving biography failed: " + (err.message || err));
      setTimeout(() => setMessage(""), 4000);
    } finally {
      setSavingBio(false);
    }
  }

  async function handleDeleteBiography(id) {
    if (!window.confirm("Delete this biography?")) return;
    try {
      const res = await fetch(`${API_BASE}/employee-biography/${id}`, { method: "DELETE", headers: { "Accept": "application/json" } });
      if (!res.ok) throw new Error(await readError(res));
      setBiographyList(prev => prev.filter(x => String(x.id) !== String(id)));
      setMessage("Biography deleted");
      const target = getTargetId();
      if (target) await loadRelatedForUser(target);
      setTimeout(() => setMessage(""), 2500);
    } catch (err) {
      console.error("handleDeleteBiography", err);
      setMessage("Delete failed: " + (err.message || err));
      setTimeout(() => setMessage(""), 3000);
    }
  }

  // -----------------------
  // Documents: upload, delete, preview
  // -----------------------
  function onFileChange(e) {
    const f = e.target.files?.[0] || null;
    setFile(f);
    if (f && f.type?.startsWith("image/")) {
      if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
      setFilePreviewUrl(URL.createObjectURL(f));
    } else {
      if (filePreviewUrl) { URL.revokeObjectURL(filePreviewUrl); setFilePreviewUrl(null); }
    }
  }

  async function handleUploadDocument(e) {
    e.preventDefault();
    if (uploadingDocument) return;
    setUploadingDocument(true);
    const target = getTargetId();
    if (!target) {
      setMessage("Select or save an employee first");
      setUploadingDocument(false);
      setTimeout(() => setMessage(""), 2500);
      return;
    }
    if (!file) {
      setMessage("Choose a file");
      setUploadingDocument(false);
      setTimeout(() => setMessage(""), 2000);
      return;
    }

    const fd = new FormData();
    fd.append("user_id", target);
    fd.append("document_type", docType || file.name);
    fd.append("file", file);

    try {
      const res = await fetch(`${API_BASE}/employee-documents`, { method: "POST", body: fd });
      if (!res.ok) throw new Error(await readError(res));
      await loadRelatedForUser(target);
      setDocType("");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (filePreviewUrl) { URL.revokeObjectURL(filePreviewUrl); setFilePreviewUrl(null); }
      setMessage("Document uploaded");
      setTimeout(() => setMessage(""), 2500);
    } catch (err) {
      console.error("handleUploadDocument", err);
      setMessage("Upload failed: " + (err.message || err));
      setTimeout(() => setMessage(""), 4000);
    } finally {
      setUploadingDocument(false);
    }
  }

  async function handleDeleteDocument(id) {
    if (!window.confirm("Delete this document?")) return;
    try {
      const res = await fetch(`${API_BASE}/employee-documents/${id}`, { method: "DELETE", headers: { "Accept": "application/json" } });
      if (!res.ok) throw new Error(await readError(res));
      setDocuments(prev => prev.filter(d => String(d.id) !== String(id)));
      setMessage("Document deleted");
      const target = getTargetId();
      if (target) await loadRelatedForUser(target);
      setTimeout(() => setMessage(""), 2500);
    } catch (err) {
      console.error("handleDeleteDocument", err);
      setMessage("Delete failed: " + (err.message || err));
      setTimeout(() => setMessage(""), 3000);
    }
  }

  function handlePreview(doc) {
    const url = doc.url || doc.path || doc.download_url || doc.file_url || doc.file || null;
    if (!url) return alert("No preview URL");
    window.open(url, "_blank");
  }

  function handleDownload(doc) {
    const url = doc.url || doc.path || doc.download_url || doc.file_url || doc.file;
    if (!url) return alert("No file URL available");
    const a = document.createElement("a");
    a.href = url;
    a.download = doc.name || doc.filename || doc.file_name || "";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  // Helper date formatting
  const formatDate = (iso) => {
    if (!iso) return "";
    try { return new Date(iso).toLocaleDateString(); } catch { return iso; }
  };

  // shownDocuments filtered by selected employee
  const shownDocuments = (() => {
    const target = getTargetId();
    if (!target) return documents;
    return documents.filter(d => String(d.user_id) === String(target) || String(d.employee_id) === String(target));
  })();

  // Helper to reset employee form
  function resetEmployeeForm() {
    setEditingEmployeeId(null);
    setSelectedEmployee(null);
    setFullName("");
    setEmail("");
    setDepartment("");
    setPosition("");
    setSalary("");
    setHireDate("");
    setStatus("active");
    setPassword("");
  }

  return (
    <div className="hp-app">
      <header className="hp-topbar">
        <div className="hp-brand">HR Portal</div>
        <div className="hp-search">
          <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search employees..." />
        </div>
        <div className="hp-actions">
          <button className="btn-ghost" onClick={() => { resetEmployeeForm(); setActiveTab("overview"); }}>Clear Profile</button>
        </div>
      </header>

      <main className="hp-container">
        {message && <div className="hp-toast">{message}</div>}

        {/* EMPLOYEE LIST (moved above) */}
        <section className="card list-card">
          <div className="list-header">
            <h3>Employee Directory</h3>
            <div>
              <button className="btn-primary" onClick={() => { resetEmployeeForm(); setActiveTab("overview"); }}>Add Employee</button>
            </div>
          </div>

          <div className="filters-row">
            <div className="filter-chip">All departments</div>
            <div className="filter-chip">Active</div>
            <div className="filter-chip">Inactive</div>
            <div style={{ marginLeft: "auto" }}>Showing {filteredEmployees.length} employees</div>
          </div>

          <div className="table-wrap">
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
                        <div className="emp-name">{(emp.full_name || emp.name || "").toUpperCase()}</div>
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
                      <button className="btn-ghost" onClick={() => { setEditingEmployeeId(emp.id || emp.user_id); openProfile(emp); }}>Edit</button>
                      <button className="btn-danger" onClick={() => handleDeleteEmployee(emp)}>Delete</button>
                    </td>
                  </tr>
                ))}
                {paginatedEmployees.length === 0 && (
                  <tr><td colSpan="7" className="muted">No employees found</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Prev</button>
            <span>Page {currentPage}</span>
            <button onClick={() => setCurrentPage(p => p + 1)} disabled={(currentPage * pageSize) >= filteredEmployees.length}>Next</button>
            <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}>
              <option value={1}>Show 1</option>
              <option value={5}>Show 5</option>
              <option value={10}>Show 10</option>
              <option value={filteredEmployees.length}>Show All</option>
            </select>
          </div>
        </section>

        {/* PROFILE AND FORM BELOW */}
        <section className="hp-profile-section">
          <div className="hp-left-col card">
            {selectedEmployee ? (
              <>
                <div className="profile-head">
                  <div className="avatar">{(selectedEmployee.full_name || selectedEmployee.name || "").split(" ").map(n => n[0]).slice(0,2).join("").toUpperCase()}</div>
                  <div>
                    <h2 className="name">{(selectedEmployee.full_name || selectedEmployee.name || "").toUpperCase()}</h2>
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
                <p>Select an employee from the list above to view profile and details; or fill the form to add a new employee and then add Education/Experience/Documents/Bio.</p>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: employee form + tabs */}
          <div className="hp-right-col">
            <div className="card">
              <div className="card-header">
                <h3>{editingEmployeeId ? (selectedEmployee ? "Edit Employee" : "Editing") : "Add New Employee"}</h3>
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
                  <label>Password {editingEmployeeId ? <span className="muted-small">(leave blank to keep)</span> : null}</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} required={!editingEmployeeId} />
                </div>
                <div>
                  <label>Department</label>
                  <input type="text" value={department} onChange={e => setDepartment(e.target.value)} />
                </div>
                <div>
                  <label>Position</label>
                  <input type="text" value={position} onChange={e => setPosition(e.target.value)} />
                </div>
                <div>
                  <label>Salary</label>
                  <input type="number" value={salary} onChange={e => setSalary(e.target.value)} />
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
                  <button type="submit" className="btn-primary" disabled={savingEmployee}>{savingEmployee ? "Saving..." : (editingEmployeeId ? "Update Employee" : "Add Employee")}</button>
                  {editingEmployeeId && <button type="button" className="btn-ghost" onClick={() => { resetEmployeeForm(); }}>Cancel</button>}
                </div>
              </form>
            </div>

            {/* Tabs */}
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
                    <form className="doc-upload" onSubmit={handleUploadDocument}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <input type="text" placeholder="Document Type" value={docType} onChange={e => setDocType(e.target.value)} />
                        <input ref={fileInputRef} type="file" onChange={onFileChange} />
                        <button className="btn-primary" type="submit" disabled={uploadingDocument}>{uploadingDocument ? "Uploading..." : "Upload"}</button>
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
                                <button onClick={() => handlePreview(d)} className="btn-ghost">Preview</button>
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
                      <div><label>Level</label><input value={eduForm.level} onChange={e => setEduForm(f => ({ ...f, level: e.target.value }))} required /></div>
                      <div><label>Field</label><input value={eduForm.field} onChange={e => setEduForm(f => ({ ...f, field: e.target.value }))} /></div>
                      <div><label>Institution</label><input value={eduForm.institution} onChange={e => setEduForm(f => ({ ...f, institution: e.target.value }))} /></div>
                      <div><label>Start</label><input type="date" value={eduForm.start_date} onChange={e => setEduForm(f => ({ ...f, start_date: e.target.value }))} /></div>
                      <div><label>End</label><input type="date" value={eduForm.end_date} onChange={e => setEduForm(f => ({ ...f, end_date: e.target.value }))} /></div>
                      <div style={{ gridColumn: "1/-1" }}><label>Notes</label><textarea value={eduForm.notes} onChange={e => setEduForm(f => ({ ...f, notes: e.target.value }))} /></div>

                      <div style={{ gridColumn: "1/-1", textAlign: "right" }}>
                        <button className="btn-primary" type="submit" disabled={savingEdu}>{savingEdu ? "Saving..." : (editingEduId ? "Update Education" : "Add Education")}</button>
                        <button type="button" className="btn-ghost" onClick={startAddEdu}>Reset</button>
                      </div>
                    </form>

                    <div className="list-section">
                      <h4>Education</h4>
                      {educationList.length === 0 ? <p className="muted">No education records</p> : (
                        <ul>
                          {educationList.map(ed => (
                            <li key={ed.id}>
                              <div className="line">
                                <div>{ed.level} — {ed.field} at {ed.institution} ({formatDate(ed.start_date)} - {formatDate(ed.end_date)})</div>
                                <div>
                                  <button className="btn-ghost" onClick={() => startEditEdu(ed)}>Edit</button>
                                  <button className="btn-danger" onClick={() => handleDeleteEducation(ed.id)}>Delete</button>
                                </div>
                              </div>
                              {ed.notes && <div className="muted-small">{ed.notes}</div>}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </>
                )}

                {activeTab === "experience" && (
                  <>
                    <form onSubmit={handleSaveExperience} className="grid-2">
                      <div><label>Company</label><input value={expForm.company} onChange={e => setExpForm(f => ({ ...f, company: e.target.value }))} required /></div>
                      <div><label>Role</label><input value={expForm.role} onChange={e => setExpForm(f => ({ ...f, role: e.target.value }))} /></div>
                      <div><label>Start</label><input type="date" value={expForm.start_date} onChange={e => setExpForm(f => ({ ...f, start_date: e.target.value }))} /></div>
                      <div><label>End</label><input type="date" value={expForm.end_date} onChange={e => setExpForm(f => ({ ...f, end_date: e.target.value }))} /></div>
                      <div style={{ gridColumn: "1/-1" }}><label>Responsibilities</label><textarea value={expForm.responsibilities} onChange={e => setExpForm(f => ({ ...f, responsibilities: e.target.value }))} /></div>

                      <div style={{ gridColumn: "1/-1", textAlign: "right" }}>
                        <button className="btn-primary" type="submit" disabled={savingExp}>{savingExp ? "Saving..." : (editingExpId ? "Update Experience" : "Add Experience")}</button>
                        <button type="button" className="btn-ghost" onClick={startAddExp}>Reset</button>
                      </div>
                    </form>

                    <div className="list-section">
                      <h4>Experience</h4>
                      {experienceList.length === 0 ? <p className="muted">No experience records</p> : (
                        <ul>
                          {experienceList.map(ex => (
                            <li key={ex.id}>
                              <div className="line">
                                <div>{ex.role} at {ex.company} ({formatDate(ex.start_date)} - {formatDate(ex.end_date)})</div>
                                <div>
                                  <button className="btn-ghost" onClick={() => startEditExp(ex)}>Edit</button>
                                  <button className="btn-danger" onClick={() => handleDeleteExperience(ex.id)}>Delete</button>
                                </div>
                              </div>
                              {ex.responsibilities && <div className="muted-small">{ex.responsibilities}</div>}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </>
                )}

                {activeTab === "biography" && (
                  <>
                    <form onSubmit={handleSaveBiography}>
                      <label>Biography</label>
                      <textarea value={bioForm.bio_text} onChange={e => setBioForm(f => ({ ...f, bio_text: e.target.value }))} required />
                      <div style={{ textAlign: "right", marginTop: 8 }}>
                        <button className="btn-primary" type="submit" disabled={savingBio}>{savingBio ? "Saving..." : (editingBioId ? "Update Biography" : "Add Biography")}</button>
                        <button type="button" className="btn-ghost" onClick={startAddBio}>Reset</button>
                      </div>
                    </form>

                    <div className="list-section">
                      <h4>Biography</h4>
                      {biographyList.length === 0 ? <p className="muted">No biography</p> : (
                        biographyList.map(b => (
                          <div key={b.id} className="bio-item">
                            <div className="line">
                              <div><p>{b.bio_text || b.text || b.description}</p></div>
                              <div>
                                <button className="btn-ghost" onClick={() => startEditBio(b)}>Edit</button>
                                <button className="btn-danger" onClick={() => handleDeleteBiography(b.id)}>Delete</button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}