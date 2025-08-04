import React, { useState } from "react";
import StarField from "./StarField";
import "./Settings.css";

const Settings = ({ onBack, userSettings = {}, onSettingsChange }) => {
  const [treatment, setTreatment] = useState(
    userSettings.treatment || "Commander"
  );
  const [nationName, setNationName] = useState(
    userSettings.nationName || "Nation ID"
  );
  const [themeColor, setThemeColor] = useState(
    userSettings.themeColor || "#646cff"
  );

  const handleSave = () => {
    if (onSettingsChange) {
      onSettingsChange({ treatment, nationName, themeColor });
    }
    onBack();
  };

  return (
    <div className="settings">
      <StarField density={100} />
      <div className="settings-content">
        <div className="settings-header">
          <button className="back-button" onClick={onBack}>
            ← Back
          </button>
          <h1>Settings</h1>
        </div>

        <div className="settings-grid">
          <div className="setting-card">
            <h3>Personal</h3>
            <div className="setting-option">
              <label>Treatment</label>
              <input
                type="text"
                value={treatment}
                onChange={(e) => setTreatment(e.target.value)}
                placeholder="Commander"
              />
            </div>
            <div className="setting-option">
              <label>Nation Name</label>
              <input
                type="text"
                value={nationName}
                onChange={(e) => setNationName(e.target.value)}
                placeholder="Nation ID"
              />
            </div>
          </div>

          <div className="setting-card">
            <h3>Display</h3>
            <div className="setting-option">
              <label>Theme Color</label>
              <input
                type="color"
                value={themeColor}
                onChange={(e) => setThemeColor(e.target.value)}
              />
            </div>
            <div className="setting-option">
              <label>Theme</label>
              <select defaultValue="dark">
                <option value="dark">Dark Mode</option>
              </select>
            </div>
          </div>

          <div className="setting-card">
            <h3>Credits</h3>
            <div className="setting-option">
              <label>Created by Fer0</label>
            </div>
            <div className="setting-option">
              <label>SW Bot by Fer0 and Syndicationus</label>
            </div>
            <div className="setting-option">
              <label>Inspired by Proxy's SW Rater website</label>
            </div>
            <div className="setting-option">
              <label>v0.3w</label>
            </div>
          </div>
        </div>

        <div className="settings-actions">
          <button className="save-button" onClick={handleSave}>
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
