import React, { useState } from "react";
import StarField from "./StarField";
import databaseService from "../services/database";
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

  // Automatically load name, leader, and color when login is done
  React.useEffect(() => {
    async function fetchFactionInfo() {
      if (userSettings.factionId) {
        try {
          console.log("Fetching faction data for:", userSettings.factionId);
          const faction = await databaseService.getFaction(
            "The Solar Wars",
            userSettings.factionId
          );
          console.log("Loaded faction data:", faction);

          if (faction) {
            if (faction.leader) {
              console.log("Setting treatment from DB:", faction.leader);
              setTreatment(faction.leader);
            }
            if (faction.name) {
              console.log("Setting nation name from DB:", faction.name);
              setNationName(faction.name);
            }
            if (faction.color) {
              console.log("Setting theme color from DB:", faction.color);
              setThemeColor(faction.color);
            }

            // Update parent component with loaded data
            if (onSettingsChange) {
              onSettingsChange({
                treatment: faction.leader || treatment,
                nationName: faction.name || nationName,
                themeColor: faction.color || themeColor,
              });
            }
          } else {
            console.log("No faction data found");
          }
        } catch (error) {
          console.error("Error loading faction data:", error);
        }
      } else {
        console.log("No factionId in userSettings");
      }
    }
    fetchFactionInfo();
  }, [userSettings.factionId]);

  const handleSave = async () => {
    // Update user profile in the database (setFaction)
    if (userSettings.factionId) {
      try {
        console.log("Saving to database:", {
          leader: treatment,
          name: nationName,
          color: themeColor,
        });

        const result = await databaseService.setFaction(
          "The Solar Wars",
          userSettings.factionId,
          {
            leader: treatment,
            name: nationName,
            color: themeColor,
          }
        );

        if (result) {
          console.log("Settings saved to database successfully");
        } else {
          console.error("Failed to save settings to database");
        }
      } catch (error) {
        console.error("Error saving settings to database:", error);
      }
    } else {
      console.error("No factionId provided in userSettings");
    }
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
              <label>v0.5w</label>
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
