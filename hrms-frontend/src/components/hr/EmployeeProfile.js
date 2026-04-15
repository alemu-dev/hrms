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

  useEffect(() => {
    if (!employee || !employee.id) {
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
    } else {
      setForm({
        id: employee.id,
        full_name: employee.full_name || "",
        department: employee.department || "",
        position: employee.position || "",
        position_number: employee.position_number || "",
        grade: employee.grade || "",
        step: employee.step || "",
        salary: employee.salary || "",
        hire_date: employee.hire_date || "",
        status: employee.status || "active",
        gender: employee.gender || "",
        phone_number: employee.phone_number || "",
        address: employee.address || "",
        date_of_birth: employee.date_of_birth || "",
        email: employee.user?.email || "",
        password: "",
        photo: employee.photo || null,
        national_id: employee.national_id || null
      });

      setIsEditing(false);
    }
  }, [employee, setIsEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setPhotoFile(file);

    if (file) {
      setForm(prev => ({
        ...prev,
        photo: URL.createObjectURL(file)
      }));
    }
  };

  const handleIdChange = (e) => {
    const file = e.target.files[0];
    setIdFile(file);

    if (file) {
      setForm(prev => ({
        ...prev,
        national_id: URL.createObjectURL(file)
      }));
    }
  };

  const handleSave = () => {
    if (!form.full_name || !form.email) {
      alert("Full Name and Email are required.");
      return;
    }

    if (!window.confirm("Save changes?")) return;

    const payload = new FormData();

    Object.keys(form).forEach(key => {
      if (
        form[key] !== null &&
        form[key] !== undefined &&
        key !== "photo" &&
        key !== "national_id"
      ) {
        payload.append(key, form[key]);
      }
    });

    if (photoFile) payload.append("photo", photoFile);
    if (idFile) payload.append("national_id", idFile);

    payload.delete("salary");
    payload.delete("grade");
    payload.delete("step");
    payload.delete("position_number");

    onSave && onSave(payload);
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (employee?.id) setIsEditing(false);
    else setForm({});
  };

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

  const renderReadOnly = (label, value) => (
    <div className="hp-form-group">
      <label>{label}</label>
      <p>{value || "—"}</p>
    </div>
  );

  return (
    <div className="hp-card">

      <h3>
        {!employee?.id 
          ? "New Staff" 
          : isEditing 
            ? "Edit Employee" 
            : "Employee Profile"}
      </h3>

      {/* PHOTO + ID */}
      <div className="hp-grid-2">

        <div className="hp-form-group">
          <label>Employee Photo</label>

          {form.photo ? (
            <img
              src={
                typeof form.photo === "string" && form.photo.startsWith("blob:")
                  ? form.photo
                  : `https://hrms-owyj.onrender.com/storage/${form.photo}?t=${Date.now()}`
              }
              alt="employee"
              style={{ width: "120px", height: "120px", objectFit: "cover" }}
            />
          ) : <p>No photo</p>}

          {isEditing && (
            <input type="file" accept="image/*" onChange={handlePhotoChange} />
          )}
        </div>

        <div className="hp-form-group">
          <label>National ID</label>

          {form.national_id ? (
            <img
              src={
                typeof form.national_id === "string" && form.national_id.startsWith("blob:")
                  ? form.national_id
                  : `https://hrms-owyj.onrender.com/storage/${form.national_id}?t=${Date.now()}`
              }
              alt="id"
              style={{ width: "180px" }}
            />
          ) : <p>No ID</p>}

          {isEditing && (
            <input type="file" onChange={handleIdChange} />
          )}
        </div>
      </div>

      <hr />

      {/* ACCOUNT */}
      <div className="hp-grid-2">
        {renderField("Full Name", "full_name")}
        {renderField("Email", "email", "email")}
      </div>

      <hr />

      {/* EMPLOYMENT BASIC */}
      <div className="hp-grid-2">
        {renderReadOnly("Department", form.department)}
        {renderReadOnly("Position", form.position)}
        {renderReadOnly("Hire Date", form.hire_date)}
        {renderReadOnly("Salary", form.salary)}
      </div>

      <hr />

      {/* 🔥 NEW SECTION (ADDED ONLY — SAFE) */}
      <div className="hp-grid-2">
        {renderReadOnly("Position Number", form.position_number)}
        {renderReadOnly("Grade", form.grade)}
        {renderReadOnly("Step", form.step)}
        {renderReadOnly("Status", form.status)}
      </div>

      <hr />

      {/* 🔥 PERSONAL INFO */}
      <div className="hp-grid-2">
        {renderField("Phone", "phone_number")}
        {renderField("Gender", "gender")}
        {renderField("Date of Birth", "date_of_birth", "date")}
        {renderField("Address", "address")}
      </div>

      <hr />

      {/* ACTIONS */}
      {!isEditing ? (
        <button onClick={() => setIsEditing(true)}>Edit</button>
      ) : (
        <>
          <button onClick={handleSave}>Save</button>
          <button onClick={handleCancel}>Cancel</button>
        </>
      )}

      {employee?.id && (
        <button onClick={() => onDelete(employee.id)}>
          Delete
        </button>
      )}

    </div>
  );
}