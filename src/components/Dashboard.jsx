import React from "react";
import StarField from "./StarField";
import { formatSolarDate } from "../utils/dateUtils";
import "./Dashboard.css";

const Dashboard = ({
  nationId,
  onNavigation,
  onSettings,
  userSettings = {},
}) => {
  const { treatment = "Commander", nationName = nationId } = userSettings;
  const mainActions = [
    {
      id: "economy",
      title: "Economy",
      description: "Manage your nation's economy",
      icon: "💰",
      gradient: "linear-gradient(45deg, #646cff, #61dafb)",
    },
    {
      id: "shipyards",
      title: "Shipyards",
      description: "Rate your vehicles",
      icon: "🏭",
      gradient: "linear-gradient(45deg, #ff6b6b, #ffd93d)",
    },
    {
      id: "armed-forces",
      title: "Armed Forces Command",
      description: "Manage your military operations",
      icon: "⚔️",
      gradient: "linear-gradient(45deg, #74b9ff, #a29bfe)",
    },
  ];

  return (
    <div className="dashboard">
      {/* StarField must be rendered first to ensure it is visually in the background */}
      <StarField density={120} />
      {/* Content wrapper must have position: relative and higher z-index */}
      <div className="dashboard-content">
        <div className="stardate-top">{formatSolarDate()}</div>

        <div className="welcome-section">
          <h1>Welcome, {treatment}</h1>
          <p className="nation-info">
            <span className="nation-id">{nationName}</span>
          </p>
        </div>

        <div className="action-grid">
          {mainActions.map((action) => (
            <button
              key={action.id}
              className="action-card"
              onClick={() => onNavigation(action.id)}
              style={{ "--gradient": action.gradient }}
            >
              <div className="action-icon">{action.icon}</div>
              <h3 className="action-title">{action.title}</h3>
              <p className="action-description">{action.description}</p>
              <div className="action-arrow">→</div>
            </button>
          ))}
        </div>

        <button className="settings-button-bottom" onClick={onSettings}>
          ⚙️
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
