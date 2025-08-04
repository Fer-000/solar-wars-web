import React, { useState } from "react";
import StarField from "./StarField";
import "./HomePage.css";

const HomePage = ({ onEnter, loadingDb, dbLoaded }) => {
  const [nationId, setNationId] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (nationId.trim() && !loadingDb) {
      onEnter(nationId.trim());
    }
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

        <div className="info-section">
          <p>Enter your nation ID to access your command center</p>
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
