import React, { useState, useEffect } from "react";

export default function EmployeeProfile({ 
  employee, 
  onSave, 
  onDelete, 
  isEditing,    
  setIsEditing  
}) {
  const [form, setForm] = useState({});

  // ✅ SYNC FORM DATA
  useEffect(() => {
    if (!employee || !employee.id) {
      setForm({
        full_name: "",
        department: "",
        position: "",
        salary: "",
        hire_date: "",
        status: "active",
        phone_number: "",
        gender: "", // Added
        address: "",
        date_of_birth: "",
        email: "",
        password: "" 
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
        gender: employee.gender || "", // Added
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
      alert("Full Name and Email address are required to process this record.");
      return;
    }
    if (onSave) {
      onSave(form); 
    }
  };

  const handleCancel = () => {
    if (employee?.id) {
      setIsEditing(false); 
    } else {
      setForm({}); 
    }
  };

  const renderField = (label, name, type = "text") => (
    <div className="form-group">
      <label className="field-label" style={{ fontWeight: '600', display: 'block', marginBottom: '4px', fontSize: '0.9rem', color: '#475569' }}>
        {label}
      </label>
      {isEditing ? (
        <input
          className="form-input"
          type={type}
          name={name}
          value={form[name] || ""}
          onChange={handleChange}
          placeholder={`Enter ${label}...`}
          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
        />
      ) : (
        <p className="field-value" style={{ margin: '0', color: '#1e293b', fontSize: '1rem', fontWeight: '500' }}>
          {form[name] || "—"}
        </p>
      )}
    </div>
  );

  return (
    <div className="card hp-profile-card" style={{ padding: '25px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
      <div className="profile-header" style={{ borderBottom: '2px solid #f1f5f9', marginBottom: '25px', paddingBottom: '15px' }}>
        <h3 className="card-title" style={{ margin: 0, color: '#1e293b', fontSize: '1.25rem' }}>
          {!employee?.id ? "🆕 Staff Registration" : isEditing ? "📝 Edit Employee Record" : "👤 Employee Profile"}
        </h3>
      </div>

      <div className="hp-form-grid" style={{ display: 'grid', gap: '20px' }}>
        <div style={{ color: '#2563eb', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Account Credentials</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          {renderField("Full Name", "full_name")}
          {renderField("Email Address", "email", "email")}
          {isEditing && renderField(employee?.id ? "Change Password (Optional)" : "Initial Password", "password", "password")}
        </div>

        <hr style={{ border: '0', borderTop: '1px solid #f1f5f9' }} />

        <div style={{ color: '#2563eb', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Employment Details</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          {renderField("Department", "department")}
          {renderField("Position Title", "position")}
          {renderField("Monthly Salary (ETB)", "salary", "number")}
          {renderField("Hire Date", "hire_date", "date")}
        </div>

        <div className="form-group">
          <label className="field-label" style={{ fontWeight: '600', display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#475569' }}>Employment Status</label>
          {isEditing ? (
            <select name="status" value={form.status || "active"} onChange={handleChange} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="on-leave">On Leave</option>
              <option value="suspended">Suspended</option>
            </select>
          ) : (
            <span style={{ 
              padding: '6px 16px', 
              borderRadius: '20px', 
              fontSize: '0.75rem', 
              fontWeight: 'bold',
              textTransform: 'uppercase',
              backgroundColor: form.status === 'active' ? '#dcfce7' : '#fee2e2', 
              color: form.status === 'active' ? '#166534' : '#991b1b' 
            }}>
              {form.status}
            </span>
          )}
        </div>

        <hr style={{ border: '0', borderTop: '1px solid #f1f5f9' }} />

        <div style={{ color: '#2563eb', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Personal Information</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          {/* ✅ GENDER DROPDOWN ADDED HERE */}
          <div className="form-group">
            <label className="field-label" style={{ fontWeight: '600', display: 'block', marginBottom: '4px', fontSize: '0.9rem', color: '#475569' }}>
              Gender
            </label>
            {isEditing ? (
              <select 
                name="gender" 
                value={form.gender || ""} 
                onChange={handleChange} 
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            ) : (
              <p className="field-value" style={{ margin: '0', color: '#1e293b', fontSize: '1rem', fontWeight: '500' }}>
                {form.gender || "—"}
              </p>
            )}
          </div>
          {renderField("Phone Number", "phone_number")}
          {renderField("Date of Birth", "date_of_birth", "date")}
          <div style={{ gridColumn: 'span 1' }}>
             {/* This space intentionally left for layout balance */}
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            {renderField("Residential Address", "address")}
          </div>
        </div>

        <hr style={{ border: '0', borderTop: '1px solid #f1f5f9' }} />
        <div style={{ color: '#2563eb', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Official Documents</div>
        
        <div className="documents-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '10px' }}>
          {employee?.user?.documents?.length > 0 ? (
            employee.user.documents.map((doc) => (
              <div key={doc.id} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                padding: '12px', 
                background: '#f8fafc', 
                borderRadius: '8px', 
                border: '1px solid #e2e8f0' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.2rem' }}>📄</span>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b' }}>
                      {doc.document_type || "Upload"}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                      {new Date(doc.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <a 
                  href={`https://hrms-owyj.onrender.com/storage/${doc.file_path}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                    fontSize: '0.75rem', 
                    color: '#2563eb', 
                    fontWeight: '700', 
                    textDecoration: 'none', 
                    padding: '5px 10px', 
                    border: '1px solid #2563eb', 
                    borderRadius: '4px',
                    backgroundColor: '#fff'
                  }}
                >
                  VIEW
                </a>
              </div>
            ))
          ) : (
            <div style={{ gridColumn: 'span 2', padding: '15px', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1', color: '#94a3b8', fontSize: '0.85rem' }}>
              No documents attached to this profile.
            </div>
          )}
        </div>
      </div>

      <div className="profile-actions" style={{ marginTop: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
        <div className="main-actions">
          {!isEditing && employee?.id ? (
            <button 
              className="btn-primary" 
              onClick={() => setIsEditing(true)} 
              style={{ backgroundColor: '#2563eb', color: 'white', padding: '12px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600' }}
            >
              📝 Edit Profile
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                className="btn-primary" 
                onClick={handleSave} 
                style={{ backgroundColor: '#059669', color: 'white', padding: '12px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600' }}
              >
                {employee?.id ? "💾 Save Updates" : "✅ Complete Registration"}
              </button>
              <button className="btn-secondary" onClick={handleCancel} style={{ padding: '12px 24px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#fff', cursor: 'pointer', fontWeight: '600', color: '#64748b' }}>
                Cancel
              </button>
            </div>
          )}
        </div>

        {employee?.id && (
          <button 
            onClick={() => onDelete(employee.id)} 
            style={{ color: '#dc2626', border: '1px solid #fee2e2', padding: '10px 18px', borderRadius: '8px', background: '#fef2f2', cursor: 'pointer', fontWeight: '500', fontSize: '0.9rem' }}
          >
            Delete Record
          </button>
        )}
      </div>
    </div>
  );
}