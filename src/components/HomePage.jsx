import React, { useState } from "react";
import "./HomePage.css";

const HomePage = ({ onEnter, loadingDb, dbLoaded }) => {
  const [nationId, setNationId] = useState("");
  const [isRefereeMode, setIsRefereeMode] = useState(false);
  const [refereeNations, setRefereeNations] = useState("");
  const [refereeWorlds, setRefereeWorlds] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (nationId.trim() && !loadingDb) {
      if (nationId.trim().toLowerCase() === "ref") {
        setIsRefereeMode(true);
        return;
      }
      onEnter(nationId.trim());
    }
  };

  const handleRefereeSubmit = (e) => {
    e.preventDefault();
    if (!refereeNations.trim() && !refereeWorlds.trim()) {
      alert("Please specify either nations or worlds to view");
      return;
    }

    onEnter("referee", {
      nations: refereeNations
        .split(",")
        .map((n) => n.trim().toLowerCase())
        .filter((n) => n),
      worlds: refereeWorlds
        .split(",")
        .map((w) => w.trim())
        .filter((w) => w),
    });
  };

  const handleBackToLogin = () => {
    setIsRefereeMode(false);
    setRefereeNations("");
    setRefereeWorlds("");
    setNationId("");
  };

  // Dynamic class for theme switching
  const modeClass = isRefereeMode ? "mode-referee" : "mode-command";

  return (
    <div className={`homepage ${modeClass}`}>
      {/* Background decoration grid */}
      <div className="grid-overlay"></div>

      <div className="homepage-content">
        <div className="title-section">
          <h1>SOLAR WARS</h1>
          <div className="scan-line"></div>
          <p className="subtitle">
            {isRefereeMode
              ? "SYSTEM OVERRIDE: REFEREE ACCESS"
              : "COMMAND YOUR NATION"}
          </p>
        </div>

        <div className="card-container">
          {/* Decorative Corner Markers */}
          <div className="corner-marker top-left"></div>
          <div className="corner-marker top-right"></div>
          <div className="corner-marker bottom-left"></div>
          <div className="corner-marker bottom-right"></div>

          {isRefereeMode ? (
            <form
              className="login-form referee-form"
              onSubmit={handleRefereeSubmit}
            >
              <div className="form-header">
                <h3>ACCESS PARAMETERS</h3>
              </div>

              <div className="input-group">
                <label>TARGET NATIONS</label>
                <input
                  type="text"
                  value={refereeNations}
                  onChange={(e) => setRefereeNations(e.target.value)}
                  placeholder="e.g. athena, kkw"
                  className="tech-input"
                  disabled={loadingDb}
                  autoComplete="off"
                />
                <div className="input-highlight"></div>
              </div>

              <div className="input-group">
                <label>TARGET WORLDS</label>
                <input
                  type="text"
                  value={refereeWorlds}
                  onChange={(e) => setRefereeWorlds(e.target.value)}
                  placeholder="e.g. Earth, Mars"
                  className="tech-input"
                  disabled={loadingDb}
                  autoComplete="off"
                />
                <div className="input-highlight"></div>
              </div>

              <div className="button-row">
                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="tech-button secondary"
                  disabled={loadingDb}
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="tech-button primary"
                  disabled={loadingDb}
                >
                  {loadingDb ? "INITIALIZING..." : "EXECUTE"}
                </button>
              </div>
            </form>
          ) : (
            <form className="login-form" onSubmit={handleSubmit}>
              <div className="input-group">
                <label>IDENTIFICATION CODE</label>
                <input
                  type="text"
                  value={nationId}
                  onChange={(e) => setNationId(e.target.value)}
                  placeholder="ENTER NATION ID"
                  className="tech-input"
                  required
                  disabled={loadingDb}
                  autoComplete="off"
                  autoFocus
                />
                <div className="input-highlight"></div>
              </div>

              <button
                type="submit"
                className="tech-button primary full-width"
                disabled={loadingDb}
              >
                {loadingDb ? "ESTABLISHING LINK..." : "ENTER COMMAND CENTER"}
              </button>
            </form>
          )}
        </div>

        <div className="status-footer">
          <div className="status-item">
            <span className="status-label">SERVER:</span>
            <span className="status-value">ONLINE</span>
          </div>
          <div className="status-item">
            <span className="status-label">DB_CACHE:</span>
            <span className={`status-value ${dbLoaded ? "ready" : "pending"}`}>
              {dbLoaded ? "SYNCED" : "PENDING..."}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
