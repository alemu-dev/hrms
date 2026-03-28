<div className="leave-history">
  <button onClick={() => setShowHistory(!showHistory)}>
    {showHistory ? "Hide Leave History" : "Show Leave History"}
  </button>

  {showHistory && (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Type</th>
          <th>From</th>
          <th>To</th>
          <th>Status</th>
          <th>Decision Date</th>
        </tr>
      </thead>
      <tbody>
        {leaveHistory.map((h, i) => (
          <tr key={i}>
            <td>{h.employee_name}</td>
            <td>{h.type}</td>
            <td>{h.start_date}</td>
            <td>{h.end_date}</td>
            <td className={`status ${h.status}`}>{h.status}</td>
            <td>{new Date(h.decisionDate).toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )}
</div>
