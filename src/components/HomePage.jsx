import React, { useState } from "react";
import StarField from "./StarField";
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

    // Pass referee data to parent component
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

  return (
    <div className="homepage">
      <StarField density={150} />
      <div className="homepage-content">
        <div className="title-section">
          <h1>Solar Wars</h1>
          <p className="subtitle">
            Command Your Nation Across the Solar System
          </p>
        </div>

        {isRefereeMode ? (
          <form
            className="login-form referee-form"
            onSubmit={handleRefereeSubmit}
          >
            <h3 className="referee-title">🎯 Referee Mode</h3>
            <h4>Please specify the nations and/or worlds to view</h4>
            <div className="input-group">
              <input
                type="text"
                value={refereeNations}
                onChange={(e) => setRefereeNations(e.target.value)}
                placeholder="Nations to view (e.g., athena, milita, kkw)"
                className="nation-input"
                disabled={loadingDb}
              />
            </div>

            <div className="input-group">
              <input
                type="text"
                value={refereeWorlds}
                onChange={(e) => setRefereeWorlds(e.target.value)}
                placeholder="Worlds to view (e.g., Earth, Mars, Jupiter)"
                className="nation-input"
                disabled={loadingDb}
              />
            </div>

            <button
              type="submit"
              className="enter-button referee-enter"
              disabled={loadingDb}
            >
              {loadingDb ? "Loading Database..." : "Open Referee View"}
            </button>

            <button
              type="button"
              onClick={handleBackToLogin}
              className="back-button-ref"
              disabled={loadingDb}
            >
              ← Back to Login
            </button>
          </form>
        ) : (
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <input
                type="text"
                value={nationId}
                onChange={(e) => setNationId(e.target.value)}
                placeholder="Enter Nation ID"
                className="nation-input"
                required
                disabled={loadingDb}
              />
            </div>
            <button type="submit" className="enter-button" disabled={loadingDb}>
              {loadingDb ? "Loading Database..." : "Enter Command Center"}
            </button>
          </form>
        )}

        <div className="info-section">
          <p>
            {isRefereeMode
              ? "Configure referee view settings to monitor game state"
              : "Enter your nation ID to access your command center"}
          </p>
          {dbLoaded && !loadingDb && (
            <p style={{ color: "#00f5ff", fontSize: "14px" }}>
              ✓ Database cached and ready
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
