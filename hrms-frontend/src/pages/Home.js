import "./Home.css";

export default function Home() {
  return (
    <div className="home-container">
      <header className="hero">
        <h1 className="hero-title">
          Benishangul Gumuz Regional Science and Technology Information communication Agency
        </h1>
        <p className="hero-subtitle">
          Welcome to the Human Resource Management System (HRMS)
        </p>
        <button className="hero-button">Explore HRMS</button>
      </header>

      <section className="features">
        <div className="feature-card">
          <h2>💼 HR Portal</h2>
          <p>Manage recruitment, employee records, and HR tasks efficiently.</p>
        </div>
        <div className="feature-card">
          <h2>📊 Director Console</h2>
          <p>Access company insights, KPIs, and strategic reports.</p>
        </div>
        <div className="feature-card">
          <h2>👩‍💻 Employee Workspace</h2>
          <p>Stay connected with tasks, updates, and personal profiles.</p>
        </div>
        <div className="feature-card">
          <h2>⚙️ Admin Panel</h2>
          <p>Configure system settings and manage user access securely.</p>
        </div>
      </section>

      <footer className="footer">
        <p>© 2026 Benishangul Gumuz Regional Science and Technology Information communication Agency</p>
      </footer>
    </div>
  );
}
