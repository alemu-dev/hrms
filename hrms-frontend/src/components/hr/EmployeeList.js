import React, { useMemo } from "react";

export default function EmployeeList({
  employees = [],
  openProfile,
  selectedEmployee,
  searchTerm,
  setSearchTerm,
  pageSize = 10,
  currentPage,
  setCurrentPage
}) {

  // ✅ PERFORMANCE: Filter logic (memoized to prevent lag on large lists)
  const filtered = useMemo(() => {
    const term = (searchTerm || "").toLowerCase();
    return employees.filter(e =>
      (e.full_name || "").toLowerCase().includes(term) ||
      (e.department || "").toLowerCase().includes(term) ||
      (e.position || "").toLowerCase().includes(term)
    );
  }, [employees, searchTerm]);

  // ✅ PAGINATION LOGIC
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  // Helper for status pill colors
  const getStatusStyle = (status) => {
    const s = status?.toLowerCase();
    switch (s) {
      case 'active': return { backgroundColor: '#dcfce7', color: '#166534' };
      case 'on-leave': return { backgroundColor: '#fef3c7', color: '#92400e' };
      case 'inactive': return { backgroundColor: '#f3f4f6', color: '#374151' };
      case 'suspended': return { backgroundColor: '#fee2e2', color: '#991b1b' };
      default: return { backgroundColor: '#f1f5f9', color: '#475569' };
    }
  };

  return (
    <div className="card hp-list-card" style={{ padding: '25px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
      {/* --- HEADER --- */}
      <div className="list-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, color: '#1e293b', fontSize: '1.5rem' }}>Employee Directory</h2>
        <button
          className="btn-primary"
          onClick={() => openProfile(null)}
          style={{ backgroundColor: '#2563eb', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600' }}
        >
          + Add New Staff
        </button>
      </div>

      {/* --- SEARCH BAR --- */}
      <div className="search-container" style={{ marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative' }}>
          <input
            className="search-input"
            type="text"
            placeholder="Search by name, department, or position..."
            value={searchTerm || ""}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to page 1 when searching
            }}
            style={{ 
              padding: '12px 15px', 
              fontSize: '0.95rem', 
              width: '100%', 
              borderRadius: '8px', 
              border: '1px solid #e2e8f0',
              boxSizing: 'border-box',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
          />
        </div>
      </div>

      {/* --- TABLE --- */}
      <div className="table-responsive" style={{ overflowX: 'auto' }}>
        <table className="employee-table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9', color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.025em' }}>
              <th style={{ padding: '12px 15px' }}>Full Name</th>
              <th style={{ padding: '12px 15px' }}>Department</th>
              <th style={{ padding: '12px 15px' }}>Position</th>
              <th style={{ padding: '12px 15px' }}>Status</th>
            </tr>
          </thead>

          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: "center", padding: '3rem', color: '#94a3b8', fontSize: '0.95rem' }}>
                  No employees found matching "{searchTerm}"
                </td>
              </tr>
            ) : (
              paginated.map(emp => {
                const isSelected = selectedEmployee && selectedEmployee.id === emp.id;
                const statusStyles = getStatusStyle(emp.status);

                return (
                  <tr
                    key={emp.id}
                    onClick={() => openProfile(emp)}
                    style={{ 
                      cursor: "pointer", 
                      borderBottom: '1px solid #f8fafc',
                      backgroundColor: isSelected ? '#f1f5f9' : 'transparent',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => !isSelected && (e.currentTarget.style.backgroundColor = '#f8fafc')}
                    onMouseLeave={(e) => !isSelected && (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '15px', fontWeight: '600', color: '#1e293b' }}>{emp.full_name || "N/A"}</td>
                    <td style={{ padding: '15px', color: '#475569' }}>{emp.department || "N/A"}</td>
                    <td style={{ padding: '15px', color: '#475569' }}>{emp.position || "N/A"}</td>
                    <td style={{ padding: '15px' }}>
                      <span style={{ 
                        padding: '4px 12px', 
                        borderRadius: '20px', 
                        fontSize: '0.75rem', 
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        ...statusStyles
                      }}>
                        {emp.status || "Active"}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* --- PAGINATION CONTROLS --- */}
      <div className="pagination" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
        <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
          Showing <strong>{(currentPage - 1) * pageSize + 1}</strong> to <strong>{Math.min(currentPage * pageSize, filtered.length)}</strong> of <strong>{filtered.length}</strong> employees
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className="btn-secondary"
            disabled={currentPage === 1}
            onClick={(e) => { e.stopPropagation(); setCurrentPage(prev => Math.max(prev - 1, 1)); }}
            style={{ 
              padding: '8px 16px', 
              borderRadius: '6px', 
              border: '1px solid #e2e8f0', 
              backgroundColor: currentPage === 1 ? '#f8fafc' : '#fff',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              color: '#475569',
              fontWeight: '500'
            }}
          >
            Previous
          </button>

          <button
            className="btn-secondary"
            disabled={currentPage >= totalPages}
            onClick={(e) => { e.stopPropagation(); setCurrentPage(prev => prev + 1); }}
            style={{ 
              padding: '8px 16px', 
              borderRadius: '6px', 
              border: '1px solid #e2e8f0', 
              backgroundColor: currentPage >= totalPages ? '#f8fafc' : '#fff',
              cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
              color: '#475569',
              fontWeight: '500'
            }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}