import React, { useState, useEffect } from "react";

export default function LeavesTab({ employees }) {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    async function loadLeaves() {
      const token = localStorage.getItem("auth_token");
      try {
        const res = await fetch("http://hrms-backend.test/api/leave-requests", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Bearer ${token}` 
          }
        });

        const data = await res.json();
        if (Array.isArray(data) || data?.data) {
          const raw = data?.data || data;
          // Ensure names are mapped correctly from employees list
          const withNames = raw.map(req => {
            const employee = employees.find(e => Number(e.user_id) === Number(req.user_id));
            return {
              ...req,
              user_name: req.user_name || employee?.full_name || "Unknown Staff"
            };
          });
          setLeaveRequests(withNames);
        } else {
          throw new Error("Invalid format");
        }
      } catch (err) {
        const allLeaves = [];
        for (const emp of employees) {
          if (!emp.user_id) continue;
          try {
            const res = await fetch(`http://hrms-backend.test/api/leave-requests/${emp.user_id}`, {
              headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (Array.isArray(data)) {
              data.forEach(l => allLeaves.push({ ...l, user_name: emp.full_name }));
            }
          } catch (e) { console.error(e); }
        }
        setLeaveRequests(allLeaves);
      }
    }
    if (employees && employees.length > 0) loadLeaves();
  }, [employees]);

  const handleDecision = async (id, decision) => {
    const request = leaveRequests.find(r => r.id === id);
    const employeeName = request ? request.user_name : "this employee";
    if (!window.confirm(`Are you sure you want to ${decision} the leave request for ${employeeName}?`)) return; 

    const token = localStorage.getItem("auth_token");
    try {
      const res = await fetch(`http://hrms-backend.test/api/leave-requests/${id}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: decision })
      });

      if (res.ok) {
        setLeaveRequests(prev => prev.map(r => r.id === id ? { ...r, status: decision } : r));
        if (request) {
          setLeaveHistory(prev => [...prev, { ...request, status: decision, decisionDate: new Date() }]);
        }
      } else {
        alert("Failed to update leave status on the server.");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const stats = {
    pending: leaveRequests.filter(r => r.status === "pending").length,
    approved: leaveRequests.filter(r => r.status === "approved").length,
    rejected: leaveRequests.filter(r => r.status === "rejected").length,
  };

  const filteredData = leaveRequests.filter(req => {
    const name = (req.user_name || "").toLowerCase();
    const matchesSearch = name.includes(searchTerm.toLowerCase().trim());
    const matchesStatus = filterStatus === "all" ? true : req.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="full-width-view" style={{ position: 'relative', padding: '20px' }}>
      
      {/* --- MINI STICKY HEADER --- */}
      <div style={{ 
        position: 'sticky', 
        top: '-20px', 
        backgroundColor: 'white', 
        zIndex: 100, 
        paddingBottom: '15px', 
        borderBottom: '2px solid #f1f5f9' 
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h2 style={{ margin: 0, fontSize: '1.4rem' }}>Leave Management</h2>
          
          {/* Mini Colored Stats */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ background: '#fef3c7', color: '#92400e', padding: '6px 15px', borderRadius: '8px', border: '1px solid #f59e0b33', textAlign: 'center', minWidth: '85px' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 'bold', textTransform: 'uppercase', display: 'block' }}>Pending</span>
              <span style={{ fontSize: '1.2rem', fontWeight: '800' }}>{stats.pending}</span>
            </div>
            <div style={{ background: '#dcfce7', color: '#166534', padding: '6px 15px', borderRadius: '8px', border: '1px solid #10b98133', textAlign: 'center', minWidth: '85px' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 'bold', textTransform: 'uppercase', display: 'block' }}>Approved</span>
              <span style={{ fontSize: '1.2rem', fontWeight: '800' }}>{stats.approved}</span>
            </div>
            <div style={{ background: '#fee2e2', color: '#991b1b', padding: '6px 15px', borderRadius: '8px', border: '1px solid #ef444433', textAlign: 'center', minWidth: '85px' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 'bold', textTransform: 'uppercase', display: 'block' }}>Rejected</span>
              <span style={{ fontSize: '1.2rem', fontWeight: '800' }}>{stats.rejected}</span>
            </div>
          </div>
        </div>

        {/* Search & Filter Row */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <div className="style-selector-container" style={{ flex: 1, padding: '8px 15px' }}>
            <span>🔍</span>
            <input 
              type="text" 
              placeholder="Type staff name to search..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ border: 'none', outline: 'none', width: '100%', background: 'transparent', fontWeight: '600', marginLeft: '8px' }}
            />
          </div>
          <div className="style-selector-container" style={{ padding: '0 10px' }}>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ fontWeight: '700' }}>
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* --- TABLE SECTION --- */}
      <div className="table-container" style={{ marginTop: '20px' }}>
        <table>
          <thead>
            <tr><th>Name</th><th>Reason</th><th>Dates</th><th>Status</th><th>Action</th></tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? filteredData.map(req => (
              <tr key={req.id}>
                <td><strong>{req.user_name}</strong></td>
                <td>{req.reason}</td>
                <td>{req.start_date} → {req.end_date}</td>
                <td><span className={`badge ${req.status}`}>{req.status}</span></td>
                <td>
                  {req.status === "pending" && (
                    <div className="btn-group">
                      <button className="btn-approve" onClick={() => handleDecision(req.id, "approved")}>Approve</button>
                      <button className="btn-reject" onClick={() => handleDecision(req.id, "rejected")}>Reject</button>
                    </div>
                  )}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '50px', color: '#94a3b8' }}>
                   No leave requests found matching "{searchTerm}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <button className="btn-history-toggle" onClick={() => setShowHistory(!showHistory)} style={{ marginTop: '30px' }}>
        {showHistory ? "Hide History" : "Show History Archive"}
      </button>

      {showHistory && (
        <div className="history-section" style={{ marginTop: '20px' }}>
          <h3>Archive</h3>
          <table>
            <thead>
              <tr><th>Name</th><th>Status</th><th>Decision Date</th></tr>
            </thead>
            <tbody>
              {leaveHistory.map((h, i) => (
                <tr key={i}>
                  <td>{h.user_name}</td>
                  <td><span className={`badge ${h.status}`}>{h.status}</span></td>
                  <td>{new Date(h.decisionDate).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}