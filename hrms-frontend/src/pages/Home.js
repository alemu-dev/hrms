import { useState } from "react";
import "./Home.css";

export default function Home() {
  const today = new Date().toLocaleDateString();
  const [showServices, setShowServices] = useState(false);

  return (
    <div className="home-container">

      {/* HERO WITH BACKGROUND IMAGE */}
      <header className="hero">
        <div className="hero-overlay">
          <h1 className="hero-title">
            Benishangul Gumuz Regional State Science and Technology Innovation Agency
          </h1>
          <p className="hero-subtitle">
            Smart Human Resource Management for a Modern Workforce
          </p>
          <button className="hero-button">Enter Dashboard</button>
        </div>
      </header>

      {/* Daily Info */}
      <section className="daily-info card">
        <h2>📅 Today’s Overview</h2>
        <p><b>Date:</b> {today}</p>
        <p><b>📢 Announcement:</b> Staff meeting at 3:00 PM in the main hall.</p>
        <p><b>⚡ System Status:</b> All systems operational</p>
      </section>

      {/* Services */}
      <section className="services card">
        <button
          className="toggle-btn"
          onClick={() => setShowServices(!showServices)}
        >
          {showServices ? "Hide Services" : "Explore Services"}
        </button>

        {showServices && (
          <div className="services-grid">
            <div className="service-card">
              <h2>HR Portal</h2>
              <p>Recruitment, onboarding, and employee lifecycle management.</p>
            </div>
            <div className="service-card">
              <h2> Director Console</h2>
              <p>Real-time analytics, reports, and strategic insights.</p>
            </div>
            <div className="service-card">
              <h2>Employee Workspace</h2>
              <p>Manage tasks, profile, and personal activities.</p>
            </div>
            <div className="service-card">
              <h2>Admin Panel</h2>
              <p>System configuration, roles, and access control.</p>
            </div>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>
          © 2026 Benishangul Gumuz Regional State Science and Technology Innovation Agency
        </p>
      </footer>
    </div>
  );
}