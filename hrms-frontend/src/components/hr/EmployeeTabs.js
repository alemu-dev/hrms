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
    // Special check for biography to ensure we don't try to spread undefined
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
    <div className="tab-pane">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h4 style={{ margin: 0, color: '#1e293b' }}>Academic History</h4>
        {isEditing && (
          <button type="button" onClick={() => setEducation([{ level: "", field: "", institution: "", start_date: "", end_date: "", notes: "" }, ...educationList])} style={{ background: '#2563eb', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>
            + Add Education
          </button>
        )}
      </div>
      
      {educationList.length === 0 && <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>No academic records found.</p>}

      {educationList.map((edu, i) => (
        <div key={i} style={{ marginBottom: '20px', padding: '15px', border: '1px solid #f1f5f9', borderRadius: '8px' }}>
          {isEditing ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <input placeholder="Level (e.g. BA, MSc)" value={edu.level || ""} onChange={(e) => handleChange(educationList, setEducation, i, "level", e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
              <input placeholder="Field of Study" value={edu.field || ""} onChange={(e) => handleChange(educationList, setEducation, i, "field", e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
              <input placeholder="Institution Name" style={{ gridColumn: 'span 2', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} value={edu.institution || ""} onChange={(e) => handleChange(educationList, setEducation, i, "institution", e.target.value)} />
              <input type="date" value={edu.start_date || ""} onChange={(e) => handleChange(educationList, setEducation, i, "start_date", e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
              <input type="date" value={edu.end_date || ""} onChange={(e) => handleChange(educationList, setEducation, i, "end_date", e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
              <textarea placeholder="Additional Notes" style={{ gridColumn: 'span 2', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} value={edu.notes || ""} onChange={(e) => handleChange(educationList, setEducation, i, "notes", e.target.value)} />
              <button type="button" onClick={() => removeItem(educationList, setEducation, i, "Education")} style={{ color: '#ef4444', border: '1px solid #ef4444', background: 'none', padding: '4px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', width: 'fit-content' }}>Delete Entry</button>
            </div>
          ) : (
            <div className="view-mode">
              <div style={{ fontWeight: '700', fontSize: '1.05rem', color: '#1e293b' }}>{edu.level || "Degree"} in {edu.field || "Not Specified"}</div>
              <div style={{ color: '#2563eb', fontWeight: '600' }}>{edu.institution || "Institution Name"}</div>
              <div style={{ color: '#64748b', fontSize: '0.85rem' }}>{edu.start_date} — {edu.end_date || "Present"}</div>
              {edu.notes && <p style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '8px', fontStyle: 'italic', background: '#f8fafc', padding: '10px' }}>{edu.notes}</p>}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  // 💼 RENDER EXPERIENCE
  const renderExperience = () => (
    <div className="tab-pane">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h4 style={{ margin: 0, color: '#1e293b' }}>Work Experience</h4>
        {isEditing && (
          <button type="button" onClick={() => setExperience([{ company: "", role: "", responsibilities: "", start_date: "", end_date: "" }, ...experienceList])} style={{ background: '#2563eb', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>
            + Add Experience
          </button>
        )}
      </div>

      {experienceList.map((exp, i) => (
        <div key={i} style={{ marginBottom: '20px', padding: '15px', border: '1px solid #f1f5f9', borderRadius: '8px' }}>
          {isEditing ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <input placeholder="Company Name" value={exp.company || ""} onChange={(e) => handleChange(experienceList, setExperience, i, "company", e.target.value)} style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
              <input placeholder="Job Role" value={exp.role || ""} onChange={(e) => handleChange(experienceList, setExperience, i, "role", e.target.value)} style={{ padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} />
              <input type="date" value={exp.start_date || ""} onChange={(e) => handleChange(experienceList, setExperience, i, "start_date", e.target.value)} style={{ padding: '8px', border: '1px solid #cbd5e1' }} />
              <input type="date" value={exp.end_date || ""} onChange={(e) => handleChange(experienceList, setExperience, i, "end_date", e.target.value)} style={{ padding: '8px', border: '1px solid #cbd5e1' }} />
              <textarea placeholder="Responsibilities" rows="3" style={{ gridColumn: 'span 2', padding: '8px', border: '1px solid #cbd5e1' }} value={exp.responsibilities || ""} onChange={(e) => handleChange(experienceList, setExperience, i, "responsibilities", e.target.value)} />
              <button type="button" onClick={() => removeItem(experienceList, setExperience, i, "Experience")} style={{ color: '#ef4444', border: '1px solid #ef4444', background: 'none', padding: '4px', borderRadius: '4px' }}>Remove</button>
            </div>
          ) : (
            <div className="view-mode">
              <div style={{ fontWeight: '700', color: '#1e293b' }}>{exp.role || "Job Title"}</div>
              <div style={{ color: '#2563eb', fontWeight: '600' }}>{exp.company}</div>
              <div style={{ color: '#64748b', fontSize: '0.85rem' }}>{exp.start_date} — {exp.end_date || "Present"}</div>
              <p style={{ fontSize: '0.95rem', color: '#475569', marginTop: '8px' }}>{exp.responsibilities}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  // 📝 RENDER BIOGRAPHY
  const renderBiography = () => (
    <div className="tab-pane">
      <h4 style={{ marginBottom: '15px', color: '#1e293b' }}>Professional Biography</h4>
      {isEditing ? (
        <textarea 
          rows={10} 
          style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontFamily: 'inherit' }}
          placeholder="Write a brief professional summary..."
          value={biographyList[0]?.bio_text || ""} 
          onChange={(e) => handleChange(biographyList, setBiography, 0, "bio_text", e.target.value)} 
        />
      ) : (
        <p style={{ lineHeight: '1.7', color: '#334155', whiteSpace: 'pre-wrap', backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          {biographyList[0]?.bio_text || "No professional biography written yet."}
        </p>
      )}
    </div>
  );

  // 📁 RENDER DOCUMENTS (Aligned with database)
  const renderDocuments = () => (
    <div className="tab-pane">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h4 style={{ margin: 0, color: '#1e293b' }}>Official Documents</h4>
        {isEditing && (
          <button type="button" onClick={() => setDocuments([...documents, { document_type: "", file_path: "" }])} style={{ background: '#2563eb', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>
            + Add Document Row
          </button>
        )}
      </div>
      
      {documents.map((doc, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '12px', background: '#f8fafc', borderRadius: '8px', marginBottom: '10px', border: '1px solid #e2e8f0' }}>
          {isEditing ? (
            <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
              <input placeholder="Doc Type (e.g. CV)" style={{ flex: 1, padding: '8px' }} value={doc.document_type || ""} onChange={(e) => handleChange(documents, setDocuments, i, "document_type", e.target.value)} />
              <input placeholder="file_path (from storage)" style={{ flex: 2, padding: '8px' }} value={doc.file_path || ""} onChange={(e) => handleChange(documents, setDocuments, i, "file_path", e.target.value)} />
              <button type="button" onClick={() => removeItem(documents, setDocuments, i, "Document")} style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', padding: '0 12px', cursor: 'pointer' }}>×</button>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
              <span style={{ color: '#1e293b', fontWeight: '600' }}>📄 {doc.document_type || "Attachment"}</span>
              <a 
                href={`http://hrms-backend.test/storage/${doc.file_path}`} 
                target="_blank" 
                rel="noreferrer" 
                style={{ color: '#2563eb', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '700', padding: '4px 12px', background: '#fff', border: '1px solid #2563eb', borderRadius: '4px' }}
              >
                VIEW FILE
              </a>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="card" style={{ padding: '25px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      {/* TABS NAVIGATION */}
      <div style={{ display: 'flex', gap: '20px', borderBottom: '1px solid #e2e8f0', marginBottom: '25px' }}>
        {["education", "experience", "biography", "documents"].map((t) => (
          <button 
            key={t}
            type="button"
            onClick={() => setActiveTab(t)}
            style={{ 
              paddingBottom: '12px', 
              border: 'none', 
              background: 'none', 
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '0.85rem',
              color: activeTab === t ? '#2563eb' : '#64748b',
              borderBottom: activeTab === t ? '3px solid #2563eb' : '3px solid transparent',
              transition: 'all 0.2s'
            }}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {/* CONTENT AREA */}
      <div style={{ minHeight: '300px' }}>
        {activeTab === "education" && renderEducation()}
        {activeTab === "experience" && renderExperience()}
        {activeTab === "biography" && renderBiography()}
        {activeTab === "documents" && renderDocuments()}
      </div>
    </div>
  );
}