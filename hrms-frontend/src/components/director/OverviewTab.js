import React, { useState } from "react";

export default function OverviewTab() {
  const [date, setDate] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const [systemStatus, setSystemStatus] = useState("");
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Grab the badge from the browser
    const token = localStorage.getItem("auth_token");

    try {
      const res = await fetch("https://hrms-owyj.onrender.com/api/overview", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}` // ✅ Added Authorization header
        },
        body: JSON.stringify({ 
          date, 
          announcement, 
          system_status: systemStatus 
        })
      });

      if (res.ok) {
        setMsg("✅ Published");
        setDate(""); 
        setAnnouncement(""); 
        setSystemStatus("");
      } else { 
        setMsg("❌ Error"); 
      }
    } catch (err) { 
      setMsg("❌ Error"); 
    }
  };

  return (
    <div className="centered-form-view">
      <div className="form-card">
        <h2>Daily Overview</h2>
        <form className="overview-form" onSubmit={handleSubmit}>
          <input 
            type="date" 
            value={date} 
            onChange={e => setDate(e.target.value)} 
            required 
          />
          <textarea 
            value={announcement} 
            onChange={e => setAnnouncement(e.target.value)} 
            required 
            placeholder="Announcement..." 
          />
          <input 
            type="text" 
            value={systemStatus} 
            onChange={e => setSystemStatus(e.target.value)} 
            required 
            placeholder="System Status" 
          />
          <button type="submit" className="btn-submit">Update Dashboard</button>
        </form>
        {msg && <p className="status-msg">{msg}</p>}
      </div>
    </div>
  );
}