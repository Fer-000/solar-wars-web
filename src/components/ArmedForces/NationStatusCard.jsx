import React from "react";

export default function NationStatusCard({ info, hexes, loading }) {
  return (
    <div className="sidebar-card">
      <div className="tech-corners" />
      <h4>Nation Status</h4>

      <div className="nation-info">
        <div className="info-item">
          <span className="info-label">Faction</span>
          <span className="info-value">
            {loading
              ? "SCANNING..."
              : info.name
                ? info.name.toUpperCase()
                : "UNKNOWN"}
          </span>
        </div>
        <div className="info-item">
          <span className="info-label">Population</span>
          <span className="info-value">
            {loading
              ? "SCANNING..."
              : info.population
                ? info.population.toLocaleString()
                : "0"}
          </span>
        </div>
        <div className="info-item">
          <span className="info-label">Territory</span>
          <span className="info-value">
            {loading
              ? "SCANNING..."
              : `${typeof hexes === "number" ? hexes.toLocaleString() : "0"} Hex`}
          </span>
        </div>
      </div>
    </div>
  );
}
