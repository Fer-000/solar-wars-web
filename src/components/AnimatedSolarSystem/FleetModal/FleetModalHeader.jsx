import React from "react";

export default function FleetModalHeader({
  selectedFleet,
  allFactions,
  getFactionColor,
  onClose,
}) {
  return (
    <div
      style={{
        padding: "20px 25px",
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        background: "rgba(255, 255, 255, 0.02)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexShrink: 0,
      }}
    >
      <div>
        <h2
          style={{
            margin: 0,
            color: "#fff",
            fontSize: "1.8rem",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <span style={{ color: getFactionColor(selectedFleet.factionName) }}>
            {selectedFleet.Name || `Fleet ${selectedFleet.ID}`}
          </span>
        </h2>
        <div
          style={{
            color: "#888",
            fontSize: "0.9rem",
            marginTop: "5px",
            textTransform: "uppercase",
            letterSpacing: "1px",
          }}
        >
          {allFactions[selectedFleet.factionName]?.name ||
            selectedFleet.factionName}{" "}
          Command
        </div>
      </div>
      <button
        onClick={() => onClose && onClose()}
        style={{
          background: "transparent",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          color: "#fff",
          width: "36px",
          height: "36px",
          borderRadius: "50%",
          fontSize: "18px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#f44336";
          e.currentTarget.style.borderColor = "#f44336";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
        }}
      >
        ✕
      </button>
    </div>
  );
}
