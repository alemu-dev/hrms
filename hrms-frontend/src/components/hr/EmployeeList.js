import React, { useMemo } from "react";
import "./HrPortal.css";

export default function EmployeeList({
  employees = [],
  openProfile,
  selectedEmployee,
  searchTerm,
  setSearchTerm,
  pageSize = 10,
  currentPage = 1,
  setCurrentPage
}) {

  // 🔍 FILTER
  const filtered = useMemo(() => {
    const term = (searchTerm || "").toLowerCase();

    return employees.filter(e =>
      (e.full_name || "").toLowerCase().includes(term) ||
      (e.department || "").toLowerCase().includes(term) ||
      (e.position || "").toLowerCase().includes(term)
    );
  }, [employees, searchTerm]);

  // 📄 PAGINATION
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(Math.max(currentPage || 1, 1), totalPages);

  const paginated = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safePage, pageSize]);

  // 🔥 FIXED: REPORT INSIDE HR PORTAL
  const openReport = (emp) => {
    if (!emp?.user_id) {
      alert("❌ Cannot generate report: missing user_id");
      return;
    }

    // 👉 send special object to parent (HrPortal)
    openProfile({
      type: "report",
      user_id: emp.user_id
    });
  };

  return (
    <div className="hp-card hp-list-card">

      {/* HEADER */}
      <div className="hp-list-header">
        <h2>Employee Directory</h2>
        <button
          className="hp-btn-primary"
          onClick={() => openProfile(null)}
        >
          + Add New Staff
        </button>
      </div>

      {/* SEARCH */}
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

      {/* TABLE */}
      <div className="hp-table-responsive">
        <table className="hp-employee-table">
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Department</th>
              <th>Position</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan="5" className="hp-no-data">
                  No employees found
                </td>
              </tr>
            ) : (
              paginated.map(emp => {
                const isSelected =
                  selectedEmployee && selectedEmployee.id === emp.id;

                const statusClass = `hp-status-pill hp-status-${(emp.status || 'active').toLowerCase()}`;

                return (
                  <tr
                    key={emp.id}
                    className={isSelected ? "hp-row-selected" : ""}
                  >
                    <td className="hp-col-bold">
                      {emp.full_name || "N/A"}
                    </td>

                    <td>{emp.department || "N/A"}</td>

                    <td>{emp.position || "N/A"}</td>

                    <td>
                      <span className={statusClass}>
                        {emp.status || "Active"}
                      </span>
                    </td>

                    {/* ACTION BUTTONS */}
                    <td style={{ textAlign: "right" }}>
                      <div className="hp-action-buttons">

                        <button
                          className="hp-btn-small"
                          onClick={(e) => {
                            e.stopPropagation();
                            openProfile(emp);
                          }}
                        >
                          👤 View
                        </button>

                        <button
                          className="hp-btn-small hp-btn-report"
                          onClick={(e) => {
                            e.stopPropagation();
                            openReport(emp);
                          }}
                        >
                          📄 Report
                        </button>

                      </div>
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="hp-pagination">
        <div className="hp-pagination-info">
          Showing{" "}
          <strong>
            {filtered.length === 0 ? 0 : (safePage - 1) * pageSize + 1}
          </strong>{" "}
          to{" "}
          <strong>
            {Math.min(safePage * pageSize, filtered.length)}
          </strong>{" "}
          of <strong>{filtered.length}</strong> employees
        </div>

        <div className="hp-pagination-btns">
          <button
            className="hp-btn-secondary"
            disabled={safePage === 1}
            onClick={(e) => {
              e.stopPropagation();
              setCurrentPage(prev => Math.max((prev || 1) - 1, 1));
            }}
          >
            Previous
          </button>

          <button
            className="hp-btn-secondary"
            disabled={safePage >= totalPages}
            onClick={(e) => {
              e.stopPropagation();
              setCurrentPage(prev => Math.min((prev || 1) + 1, totalPages));
            }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}