import React, { useState, useEffect } from "react";
import "./HrPortal.css";

export default function EmployeeProfile({ 
  employee, 
  onSave, 
  onDelete,
  isEditing,
  setIsEditing
}) {

  const [form, setForm] = useState({});
  const [photoFile, setPhotoFile] = useState(null);
  const [idFile, setIdFile] = useState(null);

  const isNew = !employee || !employee.id;

  useEffect(() => {
    if (isNew) {
      setForm({
        full_name: "",
        department: "",
        position: "",
        position_number: "",
        grade: "",
        step: "",
        salary: "",
        hire_date: "",
        status: "active",
        phone_number: "",
        gender: "",
        address: "",
        date_of_birth: "",
        email: "",
        password: "",
        photo: null,
        national_id: null
      });
      setIsEditing(true);
    } else if (employee) {
      // 🔥 Best mapping - checking multiple possible locations
      const profile = employee.employee_profile || 
                     employee.profile || 
                     employee || {};

      setForm({
        id: employee.id || "",
        full_name: employee.full_name || profile.full_name || "",
        department: employee.department || profile.department || "",
        position: employee.position || profile.position || "",
        position_number: employee.position_number || profile.position_number || "",
        grade: employee.grade || profile.grade || "",
        step: employee.step || profile.step || "",
        salary: employee.salary || profile.salary || "",
        hire_date: employee.hire_date || profile.hire_date || "",
        status: employee.status || profile.status || "active",
        gender: employee.gender || profile.gender || "",
        phone_number: employee.phone_number || profile.phone_number || "",
        address: employee.address || profile.address || "",
        date_of_birth: employee.date_of_birth || profile.date_of_birth || "",
        email: employee.user?.email || employee.email || "",
        password: "",
        photo: employee.photo || profile.photo || null,
        national_id: employee.national_id || profile.national_id || null
      });
      setIsEditing(false);
    }
  }, [employee, isNew]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setPhotoFile(file);
    if (file) setForm(prev => ({ ...prev, photo: URL.createObjectURL(file) }));
  };

  const handleIdChange = (e) => {
    const file = e.target.files[0];
    setIdFile(file);
    if (file) setForm(prev => ({ ...prev, national_id: URL.createObjectURL(file) }));
  };

  const handleSave = () => {
    if (!form.full_name?.trim() || !form.email?.trim()) {
      alert("Full Name and Email are required.");
      return;
    }
    if (!window.confirm("Save changes?")) return;

    const payload = new FormData();
    Object.keys(form).forEach(key => {
      if (form[key] != null && key !== "photo" && key !== "national_id") {
        payload.append(key, form[key]);
      }
    });

    if (photoFile) payload.append("photo", photoFile);
    if (idFile) payload.append("national_id", idFile);

    onSave && onSave(payload);
  };

  const handleCancel = () => setIsEditing(false);

  // Movement fields: Visible + Protected
  const renderMovementField = (label, name, type = "text") => (
    <div className="hp-form-group">
      <label>{label}</label>
      {isEditing ? (
        isNew ? (
          <input
            type={type}
            name={name}
            value={form[name] || ""}
            onChange={handleChange}
            className="hp-form-input"
          />
        ) : (
          <input
            type={type}
            value={form[name] || ""}
            className="hp-form-input"
            disabled
            style={{ backgroundColor: "#f8f9fa", color: "#555", cursor: "not-allowed" }}
          />
        )
      ) : (
        <p><strong>{form[name] || "—"}</strong></p>
      )}
    </div>
  );

  const renderField = (label, name, type = "text") => (
    <div className="hp-form-group">
      <label>{label}</label>
      {isEditing ? (
        <input
          type={type}
          name={name}
          value={form[name] || ""}
          onChange={handleChange}
          className="hp-form-input"
        />
      ) : (
        <p>{form[name] || "—"}</p>
      )}
    </div>
  );

  return (
    <div className="hp-card">
      <h3>
        {isNew ? "New Staff" : isEditing ? "Edit Employee" : "Employee Profile"}
      </h3>

      {/* PHOTO + NATIONAL ID */}
      <div className="hp-grid-2">
        <div className="hp-form-group">
          <label>Employee Photo</label>
          {form.photo ? (
            <img
              src={typeof form.photo === "string" && form.photo.startsWith("blob:") 
                ? form.photo 
                : `https://hrms-owyj.onrender.com/storage/${form.photo}?t=${Date.now()}`}
              alt="photo"
              style={{ width: "120px", height: "120px", objectFit: "cover" }}
            />
          ) : <p>No photo</p>}
          {isEditing && <input type="file" accept="image/*" onChange={handlePhotoChange} />}
        </div>

        <div className="hp-form-group">
          <label>National ID</label>
          {form.national_id ? (
            <img
              src={typeof form.national_id === "string" && form.national_id.startsWith("blob:") 
                ? form.national_id 
                : `https://hrms-owyj.onrender.com/storage/${form.national_id}?t=${Date.now()}`}
              alt="id"
              style={{ width: "180px" }}
            />
          ) : <p>No ID</p>}
          {isEditing && <input type="file" onChange={handleIdChange} />}
        </div>
      </div>

      <hr />

      <div className="hp-grid-2">
        {renderField("Full Name", "full_name")}
        {renderField("Email", "email", "email")}
        {isNew && renderField("Password", "password", "password")}
      </div>

      <hr />

      {/* Protected Fields (Movement controlled) */}
      <div className="hp-grid-2">
        {renderMovementField("Department", "department")}
        {renderMovementField("Position", "position")}
        {renderMovementField("Position Number", "position_number")}
        {renderMovementField("Hire Date", "hire_date", "date")}
      </div>

      <hr />

      <div className="hp-grid-2">
        {renderMovementField("Grade", "grade")}
        {renderMovementField("Step", "step")}
        {renderMovementField("Salary", "salary", "number")}
        {renderMovementField("Status", "status")}
      </div>

      <hr />

      <div className="hp-grid-2">
        {renderField("Phone", "phone_number")}
        {renderField("Gender", "gender")}
        {renderField("Date of Birth", "date_of_birth", "date")}
        {renderField("Address", "address")}
      </div>

      <hr />

      {!isEditing ? (
        <button onClick={() => setIsEditing(true)}>Edit Profile</button>
      ) : (
        <>
          <button onClick={handleSave}>Save Changes</button>
          <button onClick={handleCancel}>Cancel</button>
        </>
      )}

      {employee?.id && (
        <button 
          onClick={() => onDelete && onDelete(employee.id)}
          style={{ backgroundColor: "#dc2626", color: "white", marginLeft: "10px" }}
        >
          Delete Employee
        </button>
      )}
    </div>
  );
}