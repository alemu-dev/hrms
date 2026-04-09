import React from "react";

export default function EmployeeTabs({
  activeTab,
  setActiveTab,
  isEditing,
  educationList = [],
  experienceList = [],
  biographyList = [],
  documents = [],
  setEducation,
  setExperience,
  setBiography,
  setDocuments
}) {

  // ✅ UNIVERSAL HANDLER
  const handleChange = (list, setList, index, field, value) => {
    const updated = [...list];
    if (list === biographyList && updated.length === 0) {
      updated[0] = { bio_text: "" };
    }
    updated[index] = { ...updated[index], [field]: value };
    setList(updated);
  };

  const removeItem = (list, setList, index, type) => {
    if (window.confirm(`Are you sure you want to delete this ${type} entry?`)) {
      setList(list.filter((_, i) => i !== index));
    }
  };

  // 🎓 RENDER EDUCATION
  const renderEducation = () => (
    <div className="hp-tab-pane">
      <div className="hp-tab-header">
        <h4>Academic History</h4>
        {isEditing && (
          <button type="button" className="hp-btn-add" onClick={() => setEducation([{ level: "", field: "", institution: "", start_date: "", end_date: "", notes: "" }, ...educationList])}>
            + Add Education
          </button>
        )}
      </div>
      
      {educationList.length === 0 && <p className="hp-no-data-text">No academic records found.</p>}

      {educationList.map((edu, i) => (
        <div key={i} className="hp-data-card">
          {isEditing ? (
            <div className="hp-grid-2">
              <input className="hp-form-input" placeholder="Level (e.g. BA, MSc)" value={edu.level || ""} onChange={(e) => handleChange(educationList, setEducation, i, "level", e.target.value)} />
              <input className="hp-form-input" placeholder="Field of Study" value={edu.field || ""} onChange={(e) => handleChange(educationList, setEducation, i, "field", e.target.value)} />
              <input className="hp-form-input hp-grid-full" placeholder="Institution Name" value={edu.institution || ""} onChange={(e) => handleChange(educationList, setEducation, i, "institution", e.target.value)} />
              <input className="hp-form-input" type="date" value={edu.start_date || ""} onChange={(e) => handleChange(educationList, setEducation, i, "start_date", e.target.value)} />
              <input className="hp-form-input" type="date" value={edu.end_date || ""} onChange={(e) => handleChange(educationList, setEducation, i, "end_date", e.target.value)} />
              <textarea className="hp-form-input hp-grid-full" placeholder="Additional Notes" value={edu.notes || ""} onChange={(e) => handleChange(educationList, setEducation, i, "notes", e.target.value)} />
              <button type="button" className="hp-btn-delete-small" onClick={() => removeItem(educationList, setEducation, i, "Education")}>Delete Entry</button>
            </div>
          ) : (
            <div className="hp-view-mode">
              <div className="hp-text-bold">{edu.level || "Degree"} in {edu.field || "Not Specified"}</div>
              <div className="hp-text-blue">{edu.institution || "Institution Name"}</div>
              <div className="hp-text-muted">{edu.start_date} — {edu.end_date || "Present"}</div>
              {edu.notes && <p className="hp-notes-box">{edu.notes}</p>}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  // 💼 RENDER EXPERIENCE
  const renderExperience = () => (
    <div className="hp-tab-pane">
      <div className="hp-tab-header">
        <h4>Work Experience</h4>
        {isEditing && (
          <button type="button" className="hp-btn-add" onClick={() => setExperience([{ company: "", role: "", responsibilities: "", start_date: "", end_date: "" }, ...experienceList])}>
            + Add Experience
          </button>
        )}
      </div>

      {experienceList.map((exp, i) => (
        <div key={i} className="hp-data-card">
          {isEditing ? (
            <div className="hp-grid-2">
              <input className="hp-form-input" placeholder="Company Name" value={exp.company || ""} onChange={(e) => handleChange(experienceList, setExperience, i, "company", e.target.value)} />
              <input className="hp-form-input" placeholder="Job Role" value={exp.role || ""} onChange={(e) => handleChange(experienceList, setExperience, i, "role", e.target.value)} />
              <input className="hp-form-input" type="date" value={exp.start_date || ""} onChange={(e) => handleChange(experienceList, setExperience, i, "start_date", e.target.value)} />
              <input className="hp-form-input" type="date" value={exp.end_date || ""} onChange={(e) => handleChange(experienceList, setExperience, i, "end_date", e.target.value)} />
              <textarea className="hp-form-input hp-grid-full" placeholder="Responsibilities" rows="3" value={exp.responsibilities || ""} onChange={(e) => handleChange(experienceList, setExperience, i, "responsibilities", e.target.value)} />
              <button type="button" className="hp-btn-delete-small" onClick={() => removeItem(experienceList, setExperience, i, "Experience")}>Remove</button>
            </div>
          ) : (
            <div className="hp-view-mode">
              <div className="hp-text-bold">{exp.role || "Job Title"}</div>
              <div className="hp-text-blue">{exp.company}</div>
              <div className="hp-text-muted">{exp.start_date} — {exp.end_date || "Present"}</div>
              <p className="hp-text-body">{exp.responsibilities}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  // 📝 RENDER BIOGRAPHY
  const renderBiography = () => (
    <div className="hp-tab-pane">
      <h4 className="hp-mb-15">Professional Biography</h4>
      {isEditing ? (
        <textarea 
          className="hp-form-input hp-bio-area"
          rows={10} 
          placeholder="Write a brief professional summary..."
          value={biographyList[0]?.bio_text || ""} 
          onChange={(e) => handleChange(biographyList, setBiography, 0, "bio_text", e.target.value)} 
        />
      ) : (
        <p className="hp-bio-view">
          {biographyList[0]?.bio_text || "No professional biography written yet."}
        </p>
      )}
    </div>
  );

  // 📁 RENDER DOCUMENTS
  const renderDocuments = () => (
    <div className="hp-tab-pane">
      <div className="hp-tab-header">
        <h4>Official Documents</h4>
        {isEditing && (
          <button type="button" className="hp-btn-add" onClick={() => setDocuments([...documents, { document_type: "", file_path: "" }])}>
            + Add Document Row
          </button>
        )}
      </div>
      
      {documents.map((doc, i) => (
        <div key={i} className="hp-doc-row">
          {isEditing ? (
            <div className="hp-doc-edit-group">
              <input className="hp-form-input hp-flex-1" placeholder="Doc Type (e.g. CV)" value={doc.document_type || ""} onChange={(e) => handleChange(documents, setDocuments, i, "document_type", e.target.value)} />
              <input className="hp-form-input hp-flex-2" placeholder="file_path (from storage)" value={doc.file_path || ""} onChange={(e) => handleChange(documents, setDocuments, i, "file_path", e.target.value)} />
              <button type="button" className="hp-btn-x" onClick={() => removeItem(documents, setDocuments, i, "Document")}>×</button>
            </div>
          ) : (
            <div className="hp-doc-view-group">
              <span className="hp-doc-label">📄 {doc.document_type || "Attachment"}</span>
              <a href={`https://hrms-owyj.onrender.com/storage/${doc.file_path}`} target="_blank" rel="noreferrer" className="hp-btn-view-doc">
                VIEW FILE
              </a>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="hp-card hp-tabs-card">
      {/* TABS NAVIGATION */}
      <div className="hp-tabs-nav">
        {["education", "experience", "biography", "documents"].map((t) => (
          <button 
            key={t}
            type="button"
            onClick={() => setActiveTab(t)}
            className={`hp-tab-btn ${activeTab === t ? 'active' : ''}`}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {/* CONTENT AREA */}
      <div className="hp-tabs-content">
        {activeTab === "education" && renderEducation()}
        {activeTab === "experience" && renderExperience()}
        {activeTab === "biography" && renderBiography()}
        {activeTab === "documents" && renderDocuments()}
      </div>
    </div>
  );
}