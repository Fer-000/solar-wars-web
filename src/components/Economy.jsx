import React from "react";
import StarField from "./StarField";
import globalDB from "../services/GlobalDB";
import "./CenterPage.css";

const Economy = ({ onBack, nationName, dbLoaded }) => {
  if (!dbLoaded) {
    return (
      <div className="center-page">
        <div style={{ textAlign: "center", padding: "80px" }}>
          <h2>Loading database...</h2>
        </div>
      </div>
    );
  }
  return (
    <div className="center-page">
      <StarField density={120} />
      <div className="center-content">
        <div className="center-header">
          <button className="back-button" onClick={onBack}>
            ← Back to Dashboard
          </button>
          <h1>💰 Economy Center</h1>
          <p className="center-subtitle">{nationName} Economic Overview</p>
        </div>

        <div className="center-grid">
          <div className="center-card">
            <h3>Resources</h3>
            <div className="resource-item">
              <span>Credits</span>
              <span className="resource-value">1,250,000</span>
            </div>
            <div className="resource-item">
              <span>Energy</span>
              <span className="resource-value">850/1000</span>
            </div>
            <div className="resource-item">
              <span>Materials</span>
              <span className="resource-value">650/800</span>
            </div>
            <div className="resource-item">
              <span>Food</span>
              <span className="resource-value">400/500</span>
            </div>
          </div>

          <div className="center-card">
            <h3>Trade Routes</h3>
            <div className="trade-route">
              <span>Mars → Earth</span>
              <span className="route-status active">Active</span>
            </div>
            <div className="trade-route">
              <span>Europa → Titan</span>
              <span className="route-status active">Active</span>
            </div>
            <div className="trade-route">
              <span>Ceres → Venus</span>
              <span className="route-status inactive">Inactive</span>
            </div>
          </div>

          <div className="center-card">
            <h3>Economic Stats</h3>
            <div className="stat-item">
              <span>GDP Growth</span>
              <span className="stat-positive">+3.2%</span>
            </div>
            <div className="stat-item">
              <span>Unemployment</span>
              <span className="stat-neutral">2.1%</span>
            </div>
            <div className="stat-item">
              <span>Inflation</span>
              <span className="stat-negative">-0.5%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Economy;
