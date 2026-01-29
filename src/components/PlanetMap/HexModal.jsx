import React, { useState, useEffect } from "react";
import databaseService from "../../services/database";

// --- Main Component ---
export default function HexModal({
  data,
  onClose,
  factionName,
  factionData,
  worldName,
  getFactionColor,
  allFactions = {},
}) {
  const [fullFactionData, setFullFactionData] = useState(null);

  // Fetch faction data from database when factionName changes
  useEffect(() => {
    const fetchFactionData = async () => {
      if (!factionName) {
        setFullFactionData(null);
        return;
      }

      try {
        const dbFactionData = await databaseService.getFaction(
          "The Solar Wars",
          factionName
        );
        setFullFactionData(dbFactionData || factionData);
      } catch (error) {
        console.error("Error fetching faction data:", error);
        setFullFactionData(factionData);
      }
    };

    fetchFactionData();
  }, [factionName, factionData]);

  if (!data) return null;

  // Determine core color
  const color =
    factionName && getFactionColor ? getFactionColor(factionName) : "#00f5ff";
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
        zIndex: 1000,
      }}
      onClick={() => onClose && onClose()}
    >
      <div
        style={{
          background: "rgba(12, 12, 14, 0.95)",
          border: `1px solid ${color}`,
          boxShadow: `0 0 40px ${color}40`,
          borderRadius: "12px",
          width: "500px", // Smaller than FleetModal since it's just building info
          maxWidth: "95vw",
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <HexModalHeader
          factionName={factionName}
          factionData={fullFactionData}
          color={color}
          onClose={onClose}
        />

        <HexModalBody
          factionData={fullFactionData}
          worldName={worldName}
          color={color}
        />
      </div>
    </div>
  );
}

// --- Header Sub-Component ---
function HexModalHeader({ factionName, factionData, color, onClose }) {
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
            fontSize: "1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <span style={{ color: color }}>
            {factionData?.name || factionName || "Unknown Signal"}
          </span>
        </h2>
      </div>
      <button
        onClick={() => onClose && onClose()}
        style={{
          background: "transparent",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          color: "#fff",
          width: "32px",
          height: "32px",
          borderRadius: "50%",
          fontSize: "16px",
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

// --- Body Sub-Component ---
function HexModalBody({ factionData, worldName, color }) {
  // Helpers to safely extract building info
  const planetBuildings =
    factionData && worldName && factionData.Maps
      ? factionData.Maps[worldName]?.Buildings || null
      : null;
  const buildingDefs = Array.isArray(factionData?.Buildings)
    ? factionData.Buildings
    : [];

  const hasBuildings = planetBuildings && Array.isArray(planetBuildings);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        overflow: "hidden",
      }}
    >
      {/* Location / Context Bar */}
      <div
        style={{
          padding: "15px 25px",
          background: "rgba(0, 0, 0, 0.2)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      ></div>

      {/* Building List Area */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "0",
          background: "rgba(0,0,0,0.1)",
        }}
      >
        <div
          style={{
            padding: "10px 25px",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
            background: "rgba(255,255,255,0.01)",
          }}
        >
          <h4
            style={{
              margin: 0,
              color: color,
              textTransform: "uppercase",
              letterSpacing: "1px",
              fontSize: "0.9rem",
            }}
          >
            Infrastructure
          </h4>
        </div>

        <div style={{ padding: "10px 25px" }}>
          {hasBuildings ? (
            planetBuildings.map((buildingLevels, buildingId) => {
              if (!buildingLevels) return null;
              const def = buildingDefs[buildingId];
              if (!def) return null;
              const name = def.name || def.Name || `Building ${buildingId}`;

              return Object.entries(buildingLevels)
                .filter(([_, amount]) => amount > 0)
                .map(([key, amount]) => {
                  const displayLevel = parseInt(key) + 1;
                  return (
                    <div
                      key={name + key}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "12px 0",
                        borderBottom: "1px dashed rgba(255,255,255,0.1)",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            color: "#fff",
                            fontWeight: "500",
                            fontSize: "0.95rem",
                          }}
                        >
                          {name}
                        </div>
                        <div
                          style={{
                            fontSize: "0.8rem",
                            color: "#666",
                            fontFamily: "monospace",
                          }}
                        >
                          Level {displayLevel}
                        </div>
                      </div>
                      <div
                        style={{
                          background: "rgba(255,255,255,0.1)",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          color: color,
                          fontWeight: "bold",
                          fontFamily: "monospace",
                          fontSize: "1rem",
                        }}
                      >
                        x{amount}
                      </div>
                    </div>
                  );
                });
            })
          ) : (
            <div
              style={{
                padding: "40px",
                textAlign: "center",
                color: "#666",
                fontStyle: "italic",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <div style={{ fontSize: "2rem", opacity: 0.3 }}>∅</div>
              <div>No planetary infrastructure detected.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
