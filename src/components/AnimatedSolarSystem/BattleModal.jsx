import React, { useState } from "react";

export default function BattleModal({
  show,
  battleData, // { factionA: {name, fleets:[]}, factionB: {name, fleets:[]} }
  onClose,
  onStartBattle, // The function that redirects to the external site
  getFactionColor,
  onFleetClick, // New prop to handle fleet clicks
}) {
  if (!show || !battleData) return null;

  const { factionA, factionB } = battleData;
  const colorA = getFactionColor?.(factionA?.name) || "#888";
  const colorB = getFactionColor?.(factionB?.name) || "#888";

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0, 0, 0, 0.85)",
        backdropFilter: "blur(5px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "800px",
          maxWidth: "90vw",
          height: "60vh",
          display: "flex",
          position: "relative",
          background:
            "linear-gradient(90deg, rgba(20,20,30,0.95) 0%, rgba(10,10,15,0.95) 50%, rgba(20,20,30,0.95) 100%)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "12px",
          boxShadow: "0 0 50px rgba(0,0,0,0.8)",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* LEFT FACTION */}
        <FactionColumn
          faction={factionA}
          color={colorA}
          align="left"
          onFleetClick={onFleetClick}
        />

        {/* CENTER VS AREA */}
        <div
          style={{
            width: "140px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
            background: "rgba(0,0,0,0.4)",
            borderLeft: "1px solid rgba(255,255,255,0.05)",
            borderRight: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <div
            style={{
              fontSize: "3rem",
              fontWeight: "900",
              fontStyle: "italic",
              color: "#fff",
              textShadow: "0 0 20px rgba(255,255,255,0.5)",
              marginBottom: "30px",
            }}
          >
            VS
          </div>

          <button
            onClick={() => onStartBattle(battleData)}
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              border: "2px solid #fff",
              background: "rgba(244, 67, 54, 0.8)",
              color: "#fff",
              fontSize: "14px",
              fontWeight: "bold",
              cursor: "pointer",
              boxShadow: "0 0 20px rgba(244, 67, 54, 0.4)",
              transition: "transform 0.2s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "scale(1.1)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            FIGHT
          </button>
        </div>

        {/* RIGHT FACTION */}
        <FactionColumn
          faction={factionB}
          color={colorB}
          align="right"
          onFleetClick={onFleetClick}
        />

        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            background: "transparent",
            border: "none",
            color: "#666",
            fontSize: "24px",
            cursor: "pointer",
            zIndex: 20,
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}

const FactionColumn = ({ faction, color, align, onFleetClick }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const safeFaction = faction || { name: "Unknown Faction", fleets: [] };

  return (
    <div
      style={{
        flex: 1,
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        textAlign: align,
        borderTop: `4px solid ${color}`,
        background: `linear-gradient(${
          align === "left" ? "90deg" : "-90deg"
        }, ${color}10, transparent)`,
      }}
    >
      <h2
        style={{
          color: color,
          margin: "0 0 10px 0",
          fontSize: "1.8rem",
          textTransform: "uppercase",
        }}
      >
        {safeFaction.name}
      </h2>
      <div style={{ color: "#888", marginBottom: "20px", fontSize: "0.9rem" }}>
        {safeFaction.fleets?.length || 0} Active Fleets
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "none",
            color: "#ccc",
            padding: "10px",
            width: "100%",
            textAlign: align,
            cursor: "pointer",
            marginBottom: "10px",
            borderRadius: "4px",
          }}
        >
          {isCollapsed ? "Show Fleet List ▼" : "Hide Fleet List ▲"}
        </button>

        {!isCollapsed && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {(safeFaction.fleets || []).map((fleet, _idx) => (
              <div
                key={fleet?.ID || `${safeFaction.name || "fleet"}_${_idx}`}
                onClick={() => onFleetClick && onFleetClick(fleet)}
                style={{
                  background: "rgba(0,0,0,0.3)",
                  padding: "10px",
                  borderRadius: "4px",
                  borderLeft: align === "left" ? `2px solid ${color}` : "none",
                  borderRight:
                    align === "right" ? `2px solid ${color}` : "none",
                  cursor: onFleetClick ? "pointer" : "default",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (onFleetClick)
                    e.currentTarget.style.background = "rgba(0,0,0,0.5)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(0,0,0,0.3)";
                }}
              >
                <div style={{ color: "#fff", fontWeight: "bold" }}>
                  {fleet?.Name || `Fleet ${fleet?.ID || _idx}`}
                </div>
                <div style={{ fontSize: "0.8rem", color: "#666" }}>
                  {fleet?.Type || ""} • {fleet?.State?.Action || ""}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
