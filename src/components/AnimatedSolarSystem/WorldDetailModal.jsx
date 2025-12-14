import React from "react";

export default function WorldDetailModal({
  zoomedWorld,
  setZoomedWorld,
  allFactions,
  getFactionColor,
}) {
  if (!zoomedWorld) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        background: "rgba(10, 10, 10, 0.95)",
        border: "2px solid rgba(0, 245, 255, 0.5)",
        borderRadius: "10px",
        padding: "30px",
        width: "90vw",
        maxWidth: "1400px",
        height: "85vh",
        display: "flex",
        flexDirection: "column",
        zIndex: 100,
        boxShadow: "0 0 50px rgba(0, 245, 255, 0.4)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          borderBottom: "1px solid rgba(0, 245, 255, 0.2)",
          paddingBottom: "15px",
          flexShrink: 0,
        }}
      >
        <div>
          <h2 style={{ color: "#00f5ff", margin: 0, fontSize: "2rem" }}>
            {zoomedWorld}
          </h2>
          <span style={{ color: "#888", fontSize: "0.9rem" }}>
            World Details & Architecture
          </span>
        </div>

        <button
          onClick={() => setZoomedWorld(null)}
          style={{
            background: "rgba(244, 67, 54, 0.2)",
            border: "1px solid #f44336",
            color: "#f44336",
            width: "40px",
            height: "40px",
            fontSize: "20px",
            cursor: "pointer",
            borderRadius: "5px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#f44336";
            e.currentTarget.style.color = "white";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(244, 67, 54, 0.2)";
            e.currentTarget.style.color = "#f44336";
          }}
        >
          ✕
        </button>
      </div>

      <div
        style={{
          color: "#ccc",
          lineHeight: "1.8",
          overflowY: "auto",
          flex: 1,
          paddingRight: "10px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
            gap: "20px",
            alignItems: "start",
          }}
        >
          {(() => {
            const factionsWithBuildings = Object.entries(allFactions).filter(
              ([factionName, factionData]) => {
                const buildingsArr =
                  factionData?.Maps?.[zoomedWorld]?.Buildings;
                return (
                  Array.isArray(buildingsArr) &&
                  buildingsArr.some(
                    (levels) =>
                      levels &&
                      Object.entries(levels).some(([key, amount]) => amount > 0)
                  )
                );
              }
            );

            if (factionsWithBuildings.length === 0) {
              return (
                <div
                  style={{
                    color: "#888",
                    fontStyle: "italic",
                    gridColumn: "1 / -1",
                  }}
                >
                  No building information available for this world.
                </div>
              );
            }

            return factionsWithBuildings.map(([factionName, factionData]) => {
              const planetBuildings = factionData.Maps[zoomedWorld].Buildings;
              const buildingDefs = Array.isArray(factionData.Buildings)
                ? factionData.Buildings
                : [];
              const displayName = factionData.name || factionName;

              return (
                <details
                  key={factionName}
                  open={true}
                  style={{
                    background: "rgba(255, 255, 255, 0.03)",
                    border: `1px solid ${getFactionColor(factionName)}`,
                    borderRadius: "8px",
                    overflow: "hidden",
                    transition: "all 0.2s ease",
                  }}
                >
                  <summary
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "15px",
                      cursor: "pointer",
                      background: "rgba(0,0,0,0.2)",
                      userSelect: "none",
                      listStyle: "none",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background =
                        "rgba(255,255,255,0.05)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "rgba(0,0,0,0.2)")
                    }
                  >
                    <span
                      style={{
                        color: getFactionColor(factionName),
                        fontWeight: "bold",
                        fontSize: "18px",
                      }}
                    >
                      {displayName}
                    </span>
                    <span style={{ fontSize: "12px", opacity: 0.7 }}>▼</span>
                  </summary>

                  <div
                    style={{
                      padding: "15px",
                      borderTop: "1px solid rgba(255,255,255,0.05)",
                    }}
                  >
                    <ul
                      style={{
                        paddingLeft: "10px",
                        margin: 0,
                        listStyle: "none",
                      }}
                    >
                      {planetBuildings.map((buildingLevels, buildingId) => {
                        if (!buildingLevels) return null;
                        const def = buildingDefs[buildingId];
                        if (!def) return null;
                        const name =
                          def.name || def.Name || `Building ${buildingId}`;

                        return Object.entries(buildingLevels)
                          .filter(([key, amount]) => {
                            if (key === "0" && amount === 0) return false;
                            return amount > 0;
                          })
                          .map(([key, amount]) => {
                            let displayLevel = parseInt(key) + 1;
                            return (
                              <li
                                key={name + key}
                                style={{
                                  marginBottom: "8px",
                                  fontSize: "14px",
                                  display: "flex",
                                  justifyContent: "space-between",
                                  borderBottom:
                                    "1px dashed rgba(255,255,255,0.1)",
                                  paddingBottom: "4px",
                                }}
                              >
                                <span>
                                  <span
                                    style={{ color: "#fff", fontWeight: "500" }}
                                  >
                                    {name}
                                  </span>{" "}
                                  <span
                                    style={{ color: "#888", fontSize: "12px" }}
                                  >
                                    (Lv.{displayLevel})
                                  </span>
                                </span>
                                <span style={{ color: "#00f5ff" }}>
                                  x{amount}
                                </span>
                              </li>
                            );
                          });
                      })}
                    </ul>
                  </div>
                </details>
              );
            });
          })()}
        </div>
      </div>
    </div>
  );
}
