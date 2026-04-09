import React, { useState, useEffect } from "react";

export default function EmployeeProfile({ 
  employee, 
  onSave, 
  onDelete, 
  isEditing,    
  setIsEditing  
}) {
  const [form, setForm] = useState({});

  useEffect(() => {
    if (!employee || !employee.id) {
      setForm({
        full_name: "", department: "", position: "", salary: "",
        hire_date: "", status: "active", phone_number: "",
        gender: "", address: "", date_of_birth: "", email: "", password: "" 
      });
    } else {
      setForm({
        id: employee.id,
        full_name: employee.full_name || "",
        department: employee.department || "",
        position: employee.position || "",
        salary: employee.salary || "",
        hire_date: employee.hire_date || "",
        status: employee.status || "active",
        gender: employee.gender || "",
        phone_number: employee.phone_number || "",
        address: employee.address || "",
        date_of_birth: employee.date_of_birth || "",
        email: employee.user?.email || "",
        password: "" 
      });
    }
  }, [employee]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (!form.full_name || !form.email) {
      alert("Full Name and Email address are required.");
      return;
    }
    if (onSave) onSave(form); 
  };

  const handleCancel = () => {
    if (employee?.id) setIsEditing(false); 
    else setForm({}); 
  };

  const renderField = (label, name, type = "text") => (
    <div className="hp-form-group">
      <label className="hp-field-label">{label}</label>
      {isEditing ? (
        <input
          className="hp-form-input"
          type={type}
          name={name}
          value={form[name] || ""}
          onChange={handleChange}
          placeholder={`Enter ${label}...`}
        />
      ) : (
        <p className="hp-field-value">{form[name] || "—"}</p>
      )}
    </div>
  );

  return (
    <div className="hp-card hp-profile-card">
      <div className="hp-profile-header">
        <h3 className="hp-card-title">
          {!employee?.id ? "🆕 Staff Registration" : isEditing ? "📝 Edit Employee Record" : "👤 Employee Profile"}
        </h3>
      </div>

      <div className="hp-form-container">
        <div className="hp-section-tag">Account Credentials</div>
        <div className="hp-grid-2">
          {renderField("Full Name", "full_name")}
          {renderField("Email Address", "email", "email")}
          {isEditing && renderField(employee?.id ? "Change Password (Optional)" : "Initial Password", "password", "password")}
        </div>

        <hr className="hp-divider" />

        <div className="hp-section-tag">Employment Details</div>
        <div className="hp-grid-2">
          {renderField("Department", "department")}
          {renderField("Position Title", "position")}
          {renderField("Monthly Salary (ETB)", "salary", "number")}
          {renderField("Hire Date", "hire_date", "date")}
        </div>

        <div className="hp-form-group">
          <label className="hp-field-label">Employment Status</label>
          {isEditing ? (
            <select className="hp-form-input" name="status" value={form.status || "active"} onChange={handleChange}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="on-leave">On Leave</option>
              <option value="suspended">Suspended</option>
            </select>
          ) : (
            <span className={`hp-status-pill hp-status-${(form.status || 'active').toLowerCase()}`}>
              {form.status}
            </span>
          )}
        </div>

        <hr className="hp-divider" />

        <div className="hp-section-tag">Personal Information</div>
        <div className="hp-grid-2">
          <div className="hp-form-group">
            <label className="hp-field-label">Gender</label>
            {isEditing ? (
              <select className="hp-form-input" name="gender" value={form.gender || ""} onChange={handleChange}>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            ) : (
              <p className="hp-field-value">{form.gender || "—"}</p>
            )}
          </div>
          {renderField("Phone Number", "phone_number")}
          {renderField("Date of Birth", "date_of_birth", "date")}
          <div className="hp-grid-full">
            {renderField("Residential Address", "address")}
          </div>
        </div>

        <hr className="hp-divider" />
        <div className="hp-section-tag">Official Documents</div>
        
        <div className="hp-documents-grid">
          {employee?.user?.documents?.length > 0 ? (
            employee.user.documents.map((doc) => (
              <div key={doc.id} className="hp-doc-item">
                <div className="hp-doc-info">
                  <span className="hp-doc-icon">📄</span>
                  <div>
                    <div className="hp-doc-name">{doc.document_type || "Upload"}</div>
                    <div className="hp-doc-date">{new Date(doc.created_at).toLocaleDateString()}</div>
                  </div>
                </div>
                <a href={`https://hrms-owyj.onrender.com/storage/${doc.file_path}`} target="_blank" rel="noopener noreferrer" className="hp-btn-view-doc">
                  VIEW
                </a>
              </div>
            ))
          ) : (
            <div className="hp-no-docs">No documents attached to this profile.</div>
          )}
        </div>
      </div>

      <div className="hp-profile-actions">
        <div className="hp-main-btns">
          {!isEditing && employee?.id ? (
            <button className="hp-btn-edit-main" onClick={() => setIsEditing(true)}>📝 Edit Profile</button>
          ) : (
            <div className="hp-action-group">
              <button className="hp-btn-save-main" onClick={handleSave}>
                {employee?.id ? "💾 Save Updates" : "✅ Complete Registration"}
              </button>
              <button className="hp-btn-cancel" onClick={handleCancel}>Cancel</button>
            </div>
          )}
        </div>

        {employee?.id && (
          <button className="hp-btn-delete" onClick={() => onDelete(employee.id)}>Delete Record</button>
        )}
      </div>
    </div>
  );
}