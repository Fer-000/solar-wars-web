import React from "react";

export default function FleetManifest({
  selectedFleet,
  currentFaction,
  systemData,
  allFactions,
  refereeMode,
  totalShips,
}) {
  return (
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
                acc.push(...worldFleets.map((f) => ({ ...f, factionName })));
              return acc;
            },
            []
          );

          const currentFactionActiveCombatUnits = fleetsAtWorld.filter(
            (f) =>
              f.factionName.toLowerCase() === currentFaction.toLowerCase() &&
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
          const mockTitle = mockingTitles[fleetHash % mockingTitles.length];

          const hasActiveUnit = currentFactionActiveCombatUnits.length > 0;
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
                            allFactions[selectedFleet.factionName]?.Vehicles ||
                            [];
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
                            Sensors cannot resolve individual ship signatures.{" "}
                            <br />
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
  );
}
