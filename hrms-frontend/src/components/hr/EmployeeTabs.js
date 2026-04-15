import React from "react";
import "./HrPortal.css";
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

  // ✅ SAFE CHANGE HANDLER (FIXED 🔥)
  const handleChange = (list, setter, index, field, value) => {
    const updated = [...list];

    // 🔥 ensure object exists
    if (!updated[index]) {
      updated[index] = {};
    }

    updated[index] = {
      ...updated[index],
      [field]: value
    };

    setter(updated);
  };

  // ✅ REMOVE ITEM
  const removeItem = (list, setter, index) => {
    if (!window.confirm("Delete this item?")) return;

    const updated = list.filter((_, i) => i !== index);
    setter(updated);
  };

  // 🎓 EDUCATION
  const renderEducation = () => (
    <div className="hp-tab-pane">
      <div className="hp-tab-header">
        <h4>Academic History</h4>

        {isEditing && (
          <button
            type="button"
            className="hp-btn-add"
            onClick={() =>
              setEducation([
                {
                  level: "",
                  field: "",
                  institution: "",
                  start_date: "",
                  end_date: "",
                  notes: ""
                },
                ...educationList
              ])
            }
          >
            + Add Education
          </button>
        )}
      </div>

      {educationList.length === 0 && (
        <p>No academic records found.</p>
      )}

      {educationList.map((edu, i) => (
        <div key={i} className="hp-data-card">
          {isEditing ? (
            <div className="hp-grid-2">
              <input
                className="hp-form-input"
                placeholder="Level"
                value={edu.level || ""}
                onChange={(e) =>
                  handleChange(educationList, setEducation, i, "level", e.target.value)
                }
              />

              <input
                className="hp-form-input"
                placeholder="Field"
                value={edu.field || ""}
                onChange={(e) =>
                  handleChange(educationList, setEducation, i, "field", e.target.value)
                }
              />

              <input
                className="hp-form-input hp-grid-full"
                placeholder="Institution"
                value={edu.institution || ""}
                onChange={(e) =>
                  handleChange(educationList, setEducation, i, "institution", e.target.value)
                }
              />

              <input
                type="date"
                className="hp-form-input"
                value={edu.start_date || ""}
                onChange={(e) =>
                  handleChange(educationList, setEducation, i, "start_date", e.target.value)
                }
              />

              <input
                type="date"
                className="hp-form-input"
                value={edu.end_date || ""}
                onChange={(e) =>
                  handleChange(educationList, setEducation, i, "end_date", e.target.value)
                }
              />

              <textarea
                className="hp-form-input hp-grid-full"
                placeholder="Notes"
                value={edu.notes || ""}
                onChange={(e) =>
                  handleChange(educationList, setEducation, i, "notes", e.target.value)
                }
              />

              <button
                className="hp-btn-delete-small"
                onClick={() => removeItem(educationList, setEducation, i)}
              >
                Delete
              </button>
            </div>
          ) : (
            <div>
              <strong>{edu.level}</strong> in {edu.field}
              <div>{edu.institution}</div>
              <small>{edu.start_date} — {edu.end_date}</small>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  // 💼 EXPERIENCE
  const renderExperience = () => (
    <div className="hp-tab-pane">
      <div className="hp-tab-header">
        <h4>Work Experience</h4>

        {isEditing && (
          <button
            className="hp-btn-add"
            onClick={() =>
              setExperience([
                {
                  company: "",
                  role: "",
                  responsibilities: "",
                  start_date: "",
                  end_date: ""
                },
                ...experienceList
              ])
            }
          >
            + Add Experience
          </button>
        )}
      </div>

      {experienceList.map((exp, i) => (
        <div key={i} className="hp-data-card">
          {isEditing ? (
            <>
              <input
                className="hp-form-input"
                placeholder="Company"
                value={exp.company || ""}
                onChange={(e) =>
                  handleChange(experienceList, setExperience, i, "company", e.target.value)
                }
              />

              <input
                className="hp-form-input"
                placeholder="Role"
                value={exp.role || ""}
                onChange={(e) =>
                  handleChange(experienceList, setExperience, i, "role", e.target.value)
                }
              />

              <textarea
                className="hp-form-input"
                placeholder="Responsibilities"
                value={exp.responsibilities || ""}
                onChange={(e) =>
                  handleChange(experienceList, setExperience, i, "responsibilities", e.target.value)
                }
              />

              <button
                onClick={() => removeItem(experienceList, setExperience, i)}
              >
                Delete
              </button>
            </>
          ) : (
            <div>
              <strong>{exp.role}</strong> at {exp.company}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  // 📝 BIOGRAPHY (FIXED 🔥 BIG ISSUE HERE)
  const renderBiography = () => {
    const bio = biographyList[0] || { bio_text: "" };

    return (
      <div className="hp-tab-pane">
        <h4>Professional Biography</h4>

        {isEditing ? (
          <textarea
            className="hp-form-input"
            value={bio.bio_text || ""}
            onChange={(e) =>
              setBiography([{ bio_text: e.target.value }])
            }
          />
        ) : (
          <p>{bio.bio_text || "No biography"}</p>
        )}
      </div>
    );
  };

  // 📁 DOCUMENTS
  const renderDocuments = () => (
    <div className="hp-tab-pane">
      <div className="hp-tab-header">
        <h4>Documents</h4>

        {isEditing && (
          <button
            onClick={() =>
              setDocuments([
                ...documents,
                { document_type: "", file_path: "" }
              ])
            }
          >
            + Add
          </button>
        )}
      </div>

      {documents.map((doc, i) => (
        <div key={i}>
          {isEditing ? (
            <>
              <input
                value={doc.document_type || ""}
                placeholder="Type"
                onChange={(e) =>
                  handleChange(documents, setDocuments, i, "document_type", e.target.value)
                }
              />

              <input
                value={doc.file_path || ""}
                placeholder="File path"
                onChange={(e) =>
                  handleChange(documents, setDocuments, i, "file_path", e.target.value)
                }
              />

              <button onClick={() => removeItem(documents, setDocuments, i)}>
                Delete
              </button>
            </>
          ) : (
            <div>{doc.document_type}</div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="hp-card">
      {/* TABS */}
      <div className="hp-tabs-nav">
        {["education", "experience", "biography", "documents"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={activeTab === tab ? "active" : ""}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <div className="hp-tabs-content">
        {activeTab === "education" && renderEducation()}
        {activeTab === "experience" && renderExperience()}
        {activeTab === "biography" && renderBiography()}
        {activeTab === "documents" && renderDocuments()}
      </div>
    </div>
  );
}