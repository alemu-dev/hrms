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

  // ✅ PERFORMANCE: Filter logic
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

  return (
    <div className="hp-card hp-list-card">
      {/* --- HEADER --- */}
      <div className="hp-list-header">
        <h2>Employee Directory</h2>
        <button className="hp-btn-primary" onClick={() => openProfile(null)}>
          + Add New Staff
        </button>
      </div>

      {/* --- SEARCH BAR --- */}
      <div className="hp-search-container">
        <input
          className="hp-search-input"
          type="text"
          placeholder="Search by name, department, or position..."
          value={searchTerm || ""}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* --- TABLE --- */}
      <div className="hp-table-responsive">
        <table className="hp-employee-table">
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Department</th>
              <th>Position</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan="4" className="hp-no-data">
                  No employees found matching "{searchTerm}"
                </td>
              </tr>
            ) : (
              paginated.map(emp => {
                const isSelected = selectedEmployee && selectedEmployee.id === emp.id;
                // Status class logic
                const statusClass = `hp-status-pill hp-status-${(emp.status || 'active').toLowerCase()}`;

                return (
                  <tr
                    key={emp.id}
                    onClick={() => openProfile(emp)}
                    className={isSelected ? "hp-row-selected" : ""}
                  >
                    <td className="hp-col-bold">{emp.full_name || "N/A"}</td>
                    <td>{emp.department || "N/A"}</td>
                    <td>{emp.position || "N/A"}</td>
                    <td>
                      <span className={statusClass}>
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
      <div className="hp-pagination">
        <div className="hp-pagination-info">
          Showing <strong>{(currentPage - 1) * pageSize + 1}</strong> to <strong>{Math.min(currentPage * pageSize, filtered.length)}</strong> of <strong>{filtered.length}</strong> employees
        </div>
        
        <div className="hp-pagination-btns">
          <button
            className="hp-btn-secondary"
            disabled={currentPage === 1}
            onClick={(e) => { e.stopPropagation(); setCurrentPage(prev => Math.max(prev - 1, 1)); }}
          >
            Previous
          </button>

          <button
            className="hp-btn-secondary"
            disabled={currentPage >= totalPages}
            onClick={(e) => { e.stopPropagation(); setCurrentPage(prev => prev + 1); }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}