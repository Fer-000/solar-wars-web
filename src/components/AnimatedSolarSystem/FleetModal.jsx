import React from "react";

export default function FleetModal({
  show,
  selectedFleet,
  onClose,
  getFactionColor,
  allFactions,
  systemData,
  currentFaction,
  refereeMode,
  toggleFactionCollapse,
}) {
  if (!show || !selectedFleet) return null;

  const totalShips = Array.isArray(selectedFleet.Vehicles)
    ? selectedFleet.Vehicles.reduce((sum, v) => sum + (v.count || 0), 0)
    : 0;

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
          border: `1px solid ${getFactionColor(selectedFleet.factionName)}`,
          boxShadow: `0 0 40px ${getFactionColor(selectedFleet.factionName)}40`,
          borderRadius: "12px",
          width: "900px",
          maxWidth: "95vw",
          height: "70vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
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
              <span
                style={{ color: getFactionColor(selectedFleet.factionName) }}
              >
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

        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          <div
            style={{
              width: "35%",
              padding: "25px",
              background: "rgba(0, 0, 0, 0.2)",
              borderRight: "1px solid rgba(255, 255, 255, 0.05)",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              overflowY: "auto",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "0.8rem",
                  color: "#666",
                  textTransform: "uppercase",
                  marginBottom: "8px",
                }}
              >
                Operational Status
              </div>
              <div
                style={{
                  display: "inline-block",
                  padding: "6px 12px",
                  borderRadius: "4px",
                  background:
                    selectedFleet.State?.Action === "Battle"
                      ? "rgba(244, 67, 54, 0.2)"
                      : "rgba(0, 245, 255, 0.1)",
                  border:
                    selectedFleet.State?.Action === "Battle"
                      ? "1px solid #f44336"
                      : "1px solid #00f5ff",
                  color:
                    selectedFleet.State?.Action === "Battle"
                      ? "#f44336"
                      : "#00f5ff",
                  fontWeight: "bold",
                  fontSize: "0.9rem",
                }}
              >
                {selectedFleet.State?.Action === "Activating"
                  ? "ACTIVATING"
                  : (selectedFleet.State?.Action || "IDLE").toUpperCase()}
              </div>
            </div>

            <div>
              <div
                style={{
                  fontSize: "0.8rem",
                  color: "#666",
                  textTransform: "uppercase",
                  marginBottom: "8px",
                }}
              >
                Current Location
              </div>
              <div
                style={{ fontSize: "1.2rem", color: "#fff", fontWeight: "500" }}
              >
                {selectedFleet.State?.Location || "Deep Space"}
              </div>
              <div
                style={{ fontSize: "0.9rem", color: "#888", marginTop: "4px" }}
              >
                Type: {selectedFleet.Type || "Standard Fleet"}
              </div>
            </div>

            {selectedFleet.factionName.toLowerCase() !==
              currentFaction.toLowerCase() && (
              <div
                style={{
                  marginTop: "auto",
                  paddingTop: "20px",
                  borderTop: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <button
                  onClick={() => {
                    toggleFactionCollapse(
                      selectedFleet.factionName,
                      selectedFleet.State?.Location
                    );
                    onClose && onClose();
                  }}
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: "rgba(255, 255, 255, 0.05)",
                    color: "#ccc",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "14px",
                    transition: "all 0.2s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      "rgba(255, 255, 255, 0.1)";
                    e.currentTarget.style.color = "white";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      "rgba(255, 255, 255, 0.05)";
                    e.currentTarget.style.color = "#ccc";
                  }}
                >
                  <span>▼</span> Collapse Faction Presence
                </button>
              </div>
            )}
          </div>

          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              background: "rgba(0,0,0,0.1)",
            }}
          >
            <div
              style={{
                padding: "15px 25px",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                background: "rgba(0,0,0,0.2)",
              }}
            >
              <h4
                style={{
                  margin: 0,
                  color: "#00f5ff",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                Fleet Manifest
              </h4>
            </div>
            <div style={{ padding: "0", overflowY: "auto", flex: 1 }}>
              {(() => {
                const isCurrentFaction =
                  selectedFleet.factionName.toLowerCase() ===
                  currentFaction.toLowerCase();

                const fleetsAtWorld = Object.entries(systemData).reduce(
                  (acc, [factionName, fleets]) => {
                    const worldFleets = fleets.filter(
                      (f) => f.State?.Location === selectedFleet.State?.Location
                    );
                    if (worldFleets.length > 0)
                      acc.push(
                        ...worldFleets.map((f) => ({ ...f, factionName }))
                      );
                    return acc;
                  },
                  []
                );

                const currentFactionActiveCombatUnits = fleetsAtWorld.filter(
                  (f) =>
                    f.factionName.toLowerCase() ===
                      currentFaction.toLowerCase() &&
                    ["Defense", "Patrol", "Battle", "Activating"].includes(
                      f.State?.Action
                    )
                );

                const fleetHash = (selectedFleet.Name || "")
                  .split("")
                  .reduce((a, b) => a + b.charCodeAt(0), 0);
                const isMocked = fleetHash % 20 === 0;
                const mockingTitles = [
                  "Nice Try",
                  "Not For You",
                  "Clearance: None",
                  "Skill Issue",
                  "Nothing To See",
                ];
                const mockTitle =
                  mockingTitles[fleetHash % mockingTitles.length];

                const hasActiveUnit =
                  currentFactionActiveCombatUnits.length > 0;
                const hasIntel = isCurrentFaction || hasActiveUnit;

                if (hasIntel) {
                  return (
                    <>
                      <div
                        style={{
                          padding: "15px 25px",
                          background: "rgba(0, 245, 255, 0.02)",
                          borderBottom: "1px solid rgba(255,255,255,0.05)",
                          color: "#aaa",
                          fontSize: "0.9rem",
                        }}
                      >
                        Total Unit Count:{" "}
                        <span style={{ color: "#fff", fontWeight: "bold" }}>
                          {totalShips}
                        </span>
                      </div>
                      {Array.isArray(selectedFleet.Vehicles) &&
                      selectedFleet.Vehicles.length > 0 ? (
                        (() => {
                          const visibleVehicles = refereeMode?.isReferee
                            ? selectedFleet.Vehicles
                            : selectedFleet.Vehicles.filter((vehicle) => {
                                if (isCurrentFaction) return true;
                                const factionVehicles =
                                  allFactions[selectedFleet.factionName]
                                    ?.Vehicles || [];
                                const vehicleRecord = factionVehicles.find(
                                  (v) => v.ID === vehicle.ID
                                );
                                const isStealth =
                                  vehicleRecord?.stealth === true ||
                                  vehicleRecord?.data?.stealth === true;
                                if (
                                  isStealth &&
                                  selectedFleet.State?.Action !== "Battle"
                                ) {
                                  return false;
                                }
                                return true;
                              });

                          if (
                            !isCurrentFaction &&
                            !refereeMode?.isReferee &&
                            visibleVehicles.length === 0 &&
                            totalShips > 0
                          ) {
                            return (
                              <div
                                style={{
                                  height: "100%",
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  background:
                                    "repeating-linear-gradient(45deg, rgba(0,0,0,0.2), rgba(0,0,0,0.2) 10px, rgba(0,0,0,0.3) 10px, rgba(0,0,0,0.3) 20px)",
                                }}
                              >
                                <div
                                  style={{
                                    fontSize: "3rem",
                                    color: "#f44336",
                                    opacity: 0.5,
                                    marginBottom: "10px",
                                  }}
                                >
                                  ⚠
                                </div>
                                <h3
                                  style={{
                                    color: "#f44336",
                                    margin: 0,
                                    textTransform: "uppercase",
                                    letterSpacing: "2px",
                                  }}
                                >
                                  {isMocked
                                    ? mockTitle
                                    : "Insufficient Intelligence"}
                                </h3>
                                <p
                                  style={{
                                    color: "#888",
                                    maxWidth: "80%",
                                    textAlign: "center",
                                    marginTop: "10px",
                                  }}
                                >
                                  Sensors cannot resolve individual ship
                                  signatures. <br />
                                  Assess threat level based on fleet activity.
                                </p>
                                <div
                                  style={{
                                    marginTop: "20px",
                                    padding: "8px 16px",
                                    border: "1px solid #555",
                                    color: "#555",
                                    borderRadius: "4px",
                                    fontFamily: "monospace",
                                  }}
                                >
                                  EST. SIGNAL MASS:{" "}
                                  {totalShips > 0
                                    ? `~${totalShips} UNITS`
                                    : "UNKNOWN"}
                                </div>
                              </div>
                            );
                          }

                          return (
                            <div style={{ padding: "10px 25px" }}>
                              {visibleVehicles.length > 0 ? (
                                visibleVehicles.map((vehicle, index) => {
                                  const vehicleData = allFactions[
                                    selectedFleet.factionName
                                  ]?.Vehicles?.find((v) => v.ID === vehicle.ID);
                                  return (
                                    <div
                                      key={index}
                                      style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        padding: "12px 0",
                                        borderBottom:
                                          "1px dashed rgba(255,255,255,0.1)",
                                      }}
                                    >
                                      <div>
                                        <div
                                          style={{
                                            color: "#fff",
                                            fontWeight: "500",
                                            fontSize: "1rem",
                                          }}
                                        >
                                          {vehicleData?.name ||
                                            `Class-ID ${vehicle.ID}`}
                                        </div>
                                        {vehicleData?.data?.length && (
                                          <div
                                            style={{
                                              fontSize: "0.8rem",
                                              color: "#666",
                                            }}
                                          >
                                            Length: {vehicleData.data.length}m
                                          </div>
                                        )}
                                      </div>
                                      <div
                                        style={{
                                          background: "rgba(255,255,255,0.1)",
                                          padding: "4px 10px",
                                          borderRadius: "4px",
                                          color: "#00f5ff",
                                          fontWeight: "bold",
                                          fontFamily: "monospace",
                                          fontSize: "1.1rem",
                                        }}
                                      >
                                        {vehicle.count || 0}
                                      </div>
                                    </div>
                                  );
                                })
                              ) : (
                                <div
                                  style={{
                                    padding: "30px",
                                    textAlign: "center",
                                    color: "#666",
                                  }}
                                >
                                  Empty Fleet Structure
                                </div>
                              )}
                            </div>
                          );
                        })()
                      ) : (
                        <div
                          style={{
                            padding: "30px",
                            textAlign: "center",
                            color: "#666",
                          }}
                        >
                          Empty Fleet Structure
                        </div>
                      )}
                    </>
                  );
                }
                return (
                  <div
                    style={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      background:
                        "repeating-linear-gradient(45deg, rgba(0,0,0,0.2), rgba(0,0,0,0.2) 10px, rgba(0,0,0,0.3) 10px, rgba(0,0,0,0.3) 20px)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "3rem",
                        color: "#f44336",
                        opacity: 0.5,
                        marginBottom: "10px",
                      }}
                    >
                      ⚠
                    </div>
                    <h3
                      style={{
                        color: "#f44336",
                        margin: 0,
                        textTransform: "uppercase",
                        letterSpacing: "2px",
                      }}
                    >
                      {isMocked ? mockTitle : "Insufficient Intelligence"}
                    </h3>
                    <p
                      style={{
                        color: "#888",
                        maxWidth: "80%",
                        textAlign: "center",
                        marginTop: "10px",
                      }}
                    >
                      Sensors cannot resolve individual ship signatures. <br />
                      Assess threat level based on fleet activity.
                    </p>
                    <div
                      style={{
                        marginTop: "20px",
                        padding: "8px 16px",
                        border: "1px solid #555",
                        color: "#555",
                        borderRadius: "4px",
                        fontFamily: "monospace",
                      }}
                    >
                      EST. SIGNAL MASS:{" "}
                      {totalShips > 0 ? `~${totalShips} UNITS` : "UNKNOWN"}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
