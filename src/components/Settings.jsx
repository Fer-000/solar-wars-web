import React, { useState, useEffect } from "react";
import StarField from "./StarField";
import databaseService from "../services/database";
import "./Settings.css";

// Simple Back Arrow Icon
const BackIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"
    />
  </svg>
);

const Settings = ({ onBack, userSettings = {}, onSettingsChange }) => {
  const [treatment, setTreatment] = useState(
    userSettings.treatment || "Commander"
  );
  const [nationName, setNationName] = useState(
    userSettings.nationName || "Nation ID"
  );
  const [themeColor, setThemeColor] = useState(
    userSettings.themeColor || "#00f3ff"
  );
  const [animationLevel, setAnimationLevel] = useState(
    userSettings.animationLevel || "total"
  );

  // --- Database Logic (Preserved) ---
  useEffect(() => {
    async function fetchFactionInfo() {
      if (userSettings.factionId) {
        try {
          const faction = await databaseService.getFaction(
            "The Solar Wars",
            userSettings.factionId
          );
          if (faction) {
            if (faction.leader) setTreatment(faction.leader);
            if (faction.name) setNationName(faction.name);
            if (faction.color) setThemeColor(faction.color);

            if (onSettingsChange) {
              onSettingsChange({
                treatment: faction.leader || treatment,
                nationName: faction.name || nationName,
                themeColor: faction.color || themeColor,
              });
            }
          }
        } catch (error) {
          console.error("Error loading faction data:", error);
        }
      }
    }
    fetchFactionInfo();
  }, [userSettings.factionId]);

  const handleSave = async () => {
    if (userSettings.factionId) {
      try {
        await databaseService.setFaction(
          "The Solar Wars",
          userSettings.factionId,
          {
            leader: treatment,
            name: nationName,
            color: themeColor,
          }
        );
      } catch (error) {
        console.error("Error saving settings to database:", error);
      }
    }
    if (onSettingsChange) {
      onSettingsChange({ treatment, nationName, themeColor, animationLevel });
    }
    onBack();
  };
  // ----------------------------------

  return (
    <div className="settings-container">
      <div className="grid-overlay"></div>
      <StarField density={80} />

      <div className="settings-content">
        {/* Header Section */}
        <div className="settings-header">
          <button className="back-btn" onClick={onBack}>
            <BackIcon />
            <span>RETURN</span>
          </button>
          <h1>SYSTEM CONFIGURATION</h1>
        </div>

        {/* Settings Grid */}
        <div className="settings-grid">
          {/* Card 1: Personal */}
          <div className="tech-card settings-card">
            <div className="corner-marker top-left"></div>
            <div className="corner-marker top-right"></div>
            <div className="corner-marker bottom-left"></div>
            <div className="corner-marker bottom-right"></div>

            <h3>IDENTITY</h3>
            <div className="setting-group">
              <label>LEADER TITLE</label>
              <input
                type="text"
                className="tech-input"
                value={treatment}
                onChange={(e) => setTreatment(e.target.value)}
                placeholder="Commander"
              />
            </div>
            <div className="setting-group">
              <label>NATION NAME</label>
              <input
                type="text"
                className="tech-input"
                value={nationName}
                onChange={(e) => setNationName(e.target.value)}
                placeholder="Nation ID"
              />
            </div>
          </div>

          {/* Card 2: Display */}
          <div className="tech-card settings-card">
            <div className="corner-marker top-left"></div>
            <div className="corner-marker top-right"></div>
            <div className="corner-marker bottom-left"></div>
            <div className="corner-marker bottom-right"></div>

            <h3>VISUAL INTERFACE</h3>
            <div className="setting-group">
              <label>NATIONAL COLOR</label>
              <div className="color-picker-wrapper">
                <input
                  type="color"
                  className="tech-color-input"
                  value={themeColor}
                  onChange={(e) => setThemeColor(e.target.value)}
                />
                <span className="color-value">{themeColor}</span>
              </div>
            </div>
            <div className="setting-group">
              <label>ANIMATION LEVEL</label>
              <select
                className="tech-select"
                value={animationLevel}
                onChange={(e) => setAnimationLevel(e.target.value)}
              >
                <option value="total">FULL ANIMATION</option>
                <option value="none">STATIC VIEW</option>
              </select>
            </div>
            <div className="setting-group">
              <label>INTERFACE MODE</label>
              <select className="tech-select" defaultValue="dark">
                <option value="dark">TACTICAL DARK</option>
                <option value="light">THERE AIN'T ANOTHER OPTION SON</option>
              </select>
            </div>
          </div>

          {/* Card 3: Credits */}
          <div className="tech-card settings-card">
            <div className="corner-marker top-left"></div>
            <div className="corner-marker top-right"></div>
            <div className="corner-marker bottom-left"></div>
            <div className="corner-marker bottom-right"></div>

            <h3>CREDITS</h3>
            <div className="credits-list">
              <div className="credit-item">
                <span className="credit-role">Made By</span>
                <span className="credit-name">Fer0</span>
              </div>
              <div className="credit-item">
                <span className="credit-role">SW Bot by</span>
                <span className="credit-name">Fer0 & Syndicationus</span>
              </div>
              <div className="credit-item">
                <span className="credit-role">Inspired by:</span>
                <span className="credit-name">Proxy's SW Rater website</span>
              </div>
              <div className="credit-item">
                <span className="credit-role"></span>
                <span className="credit-name">
                  Art from Charcoal, Vijasa and omegafleet
                </span>
              </div>
              <div className="credit-item">
                <span className="credit-role">VERSION</span>
                <span className="credit-name">1.0w</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="settings-footer">
          <button className="save-btn" onClick={handleSave}>
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
