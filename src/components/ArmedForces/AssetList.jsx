import React from "react";

export default function AssetList({ assets, onSelect }) {
  const hasAssets = assets && Object.keys(assets).length > 0;

  const fmt = (v) => {
    if (typeof v === "number")
      return v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    if (typeof v === "string" && /^\d+$/.test(v))
      return v.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    return String(v);
  };

  return (
    <div className="sidebar-card">
      <div className="tech-corners" />
      <h4>Total Assets</h4>

      <div className="vehicles-scroll-container">
        {!hasAssets ? (
          <div
            style={{
              textAlign: "center",
              padding: "20px",
              color: "#666",
              fontFamily: "monospace",
            }}
          >
            NO ASSETS IN INVENTORY
          </div>
        ) : (
          Object.entries(assets).map(([name, count]) => (
            <div
              key={name}
              className="vehicle-asset-item"
              style={{
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                padding: "8px",
                borderBottom: "1px solid rgba(255,255,255,0.1)",
              }}
              onClick={() => onSelect(name)}
            >
              <span style={{ color: "#ccc" }}>{name}</span>
              <span
                className="asset-value"
                style={{ color: "#00f5ff", fontWeight: "bold" }}
              >
                {fmt(count)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
