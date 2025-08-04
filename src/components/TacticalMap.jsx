import React, { useState, useEffect } from "react";
import databaseService from "../services/database";
import globalDB from "../services/GlobalDB";
import "./TacticalMap.css";

const TacticalMap = ({ onClose, currentFaction, dbLoaded }) => {
  if (!dbLoaded) {
    return (
      <div className="tactical-map-overlay">
        <div className="tactical-map-container">
          <div style={{ textAlign: "center", padding: "80px" }}>
            <h2>Loading database...</h2>
          </div>
        </div>
      </div>
    );
  }
  const [selectedSystem, setSelectedSystem] = useState(null);
  const [systemData, setSystemData] = useState({});
  const [allFactions, setAllFactions] = useState({});
  const [selectedFleet, setSelectedFleet] = useState(null);
  const [showFleetModal, setShowFleetModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const solarSystems = {
    Sol: [
      // Ordered by distance from the Sun
      "Mercury",
      "Venus",
      "Earth",
      "Luna",
      "Mars",
      "Jupiter",
      "Io",
      "Europa",
      "Ganymede",
      "Callisto",
      "Saturn",
      "Mimas",
      "Enceladus",
      "Tethys",
      "Dione",
      "Rhea",
      "Titan",
      "Iapetus",
      "Uranus",
      "Miranda",
      "Ariel",
      "Umbriel",
      "Titania",
      "Oberon",
      "Neptune",
      "Triton",
      "Pluto",
      "Charon",
    ],
    Corelli: ["Barcas", "Deo Gloria", "Novai", "Scipios"],
  };
  // Cache planet image error states to avoid rerendering and lag
  const planetImageErrorCache = React.useRef({});
  function PlanetImageOrEmoji({ planetName }) {
    const [error, setError] = useState(
      planetImageErrorCache.current[planetName] || false
    );
    const src = `maps/${planetName}.png`;
    useEffect(() => {
      setError(planetImageErrorCache.current[planetName] || false);
    }, [planetName]);
    const handleError = () => {
      planetImageErrorCache.current[planetName] = true;
      setError(true);
    };
    // Accept grayscale as a prop
    return error ? (
      <img
        src={"maps/placeholder.png"}
        style={{
          width: 180,
          height: 180,
          borderRadius: "50%",
          display: "inline-block",
          marginTop: "16px",
        }}
        onError={handleError}
      />
    ) : (
      <img
        src={src}
        style={{
          width: 180,
          height: 180,
          borderRadius: "50%",
          display: "inline-block",
          marginTop: "16px",
        }}
        onError={handleError}
      />
    );
  }

  // Faction colors
  const factionColors = {
    athena: "#00f5ff",
    europa: "#ff6b6b",
    ganymede: "#4caf50",
    callisto: "#ff9800",
    io: "#9c27b0",
    dione: "#ffeb3b",
    jupiter: "#795548",
  };

  // Generate a random color for a faction if not the current player
  const randomColorCache = React.useRef({});
  function getRandomColor(factionName) {
    if (randomColorCache.current[factionName])
      return randomColorCache.current[factionName];
    // Generate pastel random color
    const hue = Math.floor(Math.random() * 360);
    const color = `hsl(${hue}, 70%, 65%)`;
    randomColorCache.current[factionName] = color;
    return color;
  }

  useEffect(() => {
    loadAllFactionsData();
  }, []);

  const loadAllFactionsData = async () => {
    try {
      setLoading(true);
      const factions = await databaseService.getFactions("The Solar Wars");
      setAllFactions(factions);
    } catch (error) {
      console.error("Error loading faction data:", error);
    } finally {
      setLoading(false);
    }
  };

  const selectSystem = async (systemName) => {
    setSelectedSystem(systemName);
    setLoading(true);

    try {
      // Get all faction fleets positioned in this system's worlds
      const systemFleets = {};
      const worlds = solarSystems[systemName];

      for (const [factionName, factionData] of Object.entries(allFactions)) {
        if (factionData.Fleets) {
          const fleetsInSystem = factionData.Fleets.filter((fleet) =>
            worlds.includes(fleet.State?.Location)
          );

          if (fleetsInSystem.length > 0) {
            systemFleets[factionName] = fleetsInSystem;
          }
        }
      }

      setSystemData(systemFleets);
    } catch (error) {
      console.error("Error loading system data:", error);
    } finally {
      setLoading(false);
    }
  };

  const openFleetModal = (fleet, factionName) => {
    setSelectedFleet({ ...fleet, factionName });
    setShowFleetModal(true);
  };

  const closeFleetModal = () => {
    setShowFleetModal(false);
    setSelectedFleet(null);
  };

  const getFleetIcon = (fleet) => {
    // Determine if space or ground fleet
    const isGroundFleet =
      fleet.Type !== "Space" ||
      (fleet.Vehicles &&
        fleet.Vehicles.some((v) => {
          const vehicle = allFactions[
            selectedFleet?.factionName
          ]?.Vehicles?.find((veh) => veh.ID === v.ID);
          return (
            vehicle &&
            vehicle.name &&
            (vehicle.name.toLowerCase().includes("tank") ||
              vehicle.name.toLowerCase().includes("infantry") ||
              vehicle.name.toLowerCase().includes("artillery"))
          );
        }));

    return isGroundFleet ? "↓" : "↑ ";
  };

  const getFactionColor = (factionName) => {
    if (factionName.toLowerCase() === currentFaction.toLowerCase()) {
      return factionColors[factionName.toLowerCase()] || "#00f5ff";
    }
    return getRandomColor(factionName);
  };

  return (
    <div className="tactical-map-overlay">
      <div className="tactical-map-container">
        <div className="tactical-map-header">
          <h2>🗺️ Tactical Map - Solar Systems</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {!selectedSystem ? (
          <div className="system-selection">
            <h3>Select Solar System:</h3>
            <div className="system-buttons">
              {Object.keys(solarSystems).map((systemName) => (
                <button
                  key={systemName}
                  className="system-btn"
                  onClick={() => selectSystem(systemName)}
                  disabled={loading}
                >
                  <div className="system-name">{systemName}</div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="system-view">
            <div className="system-header">
              <button
                className="back-system-btn"
                onClick={() => setSelectedSystem(null)}
              >
                ← Back to Systems
              </button>
              <h3>{selectedSystem} System</h3>
            </div>

            {loading ? (
              <div className="loading-system">Loading system data...</div>
            ) : (
              <div className="worlds-grid" style={{ paddingBottom: "48px" }}>
                {solarSystems[selectedSystem].map((worldName) => {
                  // Get all fleets at this world
                  const fleetsAtWorld = Object.entries(systemData).reduce(
                    (acc, [factionName, fleets]) => {
                      const worldFleets = fleets.filter(
                        (fleet) => fleet.State?.Location === worldName
                      );
                      if (worldFleets.length > 0) {
                        acc.push(
                          ...worldFleets.map((fleet) => ({
                            ...fleet,
                            factionName,
                          }))
                        );
                      }
                      return acc;
                    },
                    []
                  );

                  // Fog of war: only fleets with Action 'Defense', 'Patrol', or 'Attack' count for revealing
                  const currentFactionActiveUnits = fleetsAtWorld.filter(
                    (fleet) =>
                      fleet.factionName.toLowerCase() ===
                        currentFaction.toLowerCase() &&
                      [
                        "Defense",
                        "Patrol",
                        "Attack",
                        "Idle",
                        "Mothballed",
                      ].includes(fleet.State?.Action)
                  );
                  // Always show all fleets of the current faction
                  const currentFactionAllUnits = fleetsAtWorld.filter(
                    (fleet) =>
                      fleet.factionName.toLowerCase() ===
                      currentFaction.toLowerCase()
                  );
                  // For other factions, only show if current faction has active units here
                  const visibleFleets =
                    currentFactionActiveUnits.length > 0
                      ? fleetsAtWorld
                      : currentFactionAllUnits;

                  // Separate ground and space units
                  const groundUnits = visibleFleets.filter(
                    (fleet) =>
                      fleet.Type !== "Space" ||
                      (fleet.Vehicles &&
                        fleet.Vehicles.some((v) => {
                          const vehicle = allFactions[
                            fleet.factionName
                          ]?.Vehicles?.find((veh) => veh.ID === v.ID);
                          return (
                            vehicle &&
                            vehicle.name &&
                            (vehicle.name.toLowerCase().includes("tank") ||
                              vehicle.name.toLowerCase().includes("infantry") ||
                              vehicle.name.toLowerCase().includes("artillery"))
                          );
                        }))
                  );
                  const spaceUnits = visibleFleets.filter(
                    (fleet) =>
                      fleet.Type === "Space" &&
                      !(
                        fleet.Vehicles &&
                        fleet.Vehicles.some((v) => {
                          const vehicle = allFactions[
                            fleet.factionName
                          ]?.Vehicles?.find((veh) => veh.ID === v.ID);
                          return (
                            vehicle &&
                            vehicle.name &&
                            (vehicle.name.toLowerCase().includes("tank") ||
                              vehicle.name.toLowerCase().includes("infantry") ||
                              vehicle.name.toLowerCase().includes("artillery"))
                          );
                        })
                      )
                  );

                  return (
                    <div key={worldName} className="world-container">
                      <div className="world-circle">
                        <div className="world-name">{worldName}</div>
                        <div className="world-center">
                          {/* Greyscale if current faction has no units here (fog of war) */}
                          <PlanetImageOrEmoji
                            planetName={worldName}
                            grayscale={currentFactionActiveUnits.length === 0}
                          />
                        </div>

                        {/* Ground units inner ring */}
                        <div className="fleet-markers ground-ring">
                          {groundUnits.map((fleet, index) => {
                            const angle = (360 / groundUnits.length) * index;
                            const radius = 65; // inner ring
                            const x =
                              Math.cos((angle * Math.PI) / 180) * radius;
                            const y =
                              Math.sin((angle * Math.PI) / 180) * radius;
                            return (
                              <div
                                key={`ground-${fleet.factionName}-${fleet.ID}`}
                                className="fleet-marker"
                                style={{
                                  transform: `translate(${x}px, ${y}px)`,
                                  color: getFactionColor(fleet.factionName),
                                  cursor: "pointer",
                                }}
                                onClick={() =>
                                  openFleetModal(fleet, fleet.factionName)
                                }
                                title={`${fleet.factionName} - ${
                                  fleet.Name || `Fleet ${fleet.ID}`
                                }`}
                              >
                                {getFleetIcon(fleet)}
                              </div>
                            );
                          })}
                        </div>
                        {/* Space units outer ring */}
                        <div className="fleet-markers space-ring">
                          {spaceUnits.map((fleet, index) => {
                            const angle = (360 / spaceUnits.length) * index;
                            const radius = 90; // outer ring
                            const x =
                              Math.cos((angle * Math.PI) / 180) * radius;
                            const y =
                              Math.sin((angle * Math.PI) / 180) * radius;
                            return (
                              <div
                                key={`space-${fleet.factionName}-${fleet.ID}`}
                                className="fleet-marker"
                                style={{
                                  transform: `translate(${x}px, ${y}px)`,
                                  color: getFactionColor(fleet.factionName),
                                  cursor: "pointer",
                                }}
                                onClick={() =>
                                  openFleetModal(fleet, fleet.factionName)
                                }
                                title={`${fleet.factionName} - ${
                                  fleet.Name || `Fleet ${fleet.ID}`
                                }`}
                              >
                                {getFleetIcon(fleet)}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="world-info">
                        <div className="world-fleets-count">
                          {currentFactionAllUnits.length > 0
                            ? `${groundUnits.length} ground unit${
                                groundUnits.length !== 1 ? "s" : ""
                              }, ${spaceUnits.length} space unit${
                                spaceUnits.length !== 1 ? "s" : ""
                              }`
                            : "? units"}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Fleet Detail Modal */}
        {showFleetModal && selectedFleet && (
          <div className="fleet-modal-overlay" onClick={closeFleetModal}>
            <div className="fleet-modal" onClick={(e) => e.stopPropagation()}>
              <div className="fleet-modal-header">
                <h3
                  style={{ color: getFactionColor(selectedFleet.factionName) }}
                >
                  {selectedFleet.factionName} -{" "}
                  {selectedFleet.Name || `Fleet ${selectedFleet.ID}`}
                </h3>
                <button className="close-btn" onClick={closeFleetModal}>
                  ✕
                </button>
              </div>

              <div className="fleet-modal-content">
                <div className="fleet-details">
                  <div className="fleet-basic-info">
                    <p>
                      <strong>Location:</strong>{" "}
                      {selectedFleet.State?.Location || "Unknown"}
                    </p>
                    <p>
                      <strong>Status:</strong>{" "}
                      {selectedFleet.State?.Action || "Unknown"}
                    </p>
                    <p>
                      <strong>Type:</strong> {selectedFleet.Type || "Unknown"}
                    </p>
                  </div>

                  <div className="fleet-vehicles">
                    <h4>Fleet Composition:</h4>
                    {selectedFleet.Vehicles &&
                    selectedFleet.Vehicles.length > 0 ? (
                      (() => {
                        const isCurrentFaction =
                          selectedFleet.factionName.toLowerCase() ===
                          currentFaction.toLowerCase();
                        // Filter out stealth ships (only for enemy factions)
                        // visibleVehicles: only non-stealth ships for composition
                        const visibleVehicles = selectedFleet.Vehicles.filter(
                          (vehicle) => {
                            // If it's the current faction, show all vehicles including stealth
                            if (isCurrentFaction) {
                              return true;
                            }
                            // For enemy factions, filter out stealth ships
                            const factionVehicles =
                              allFactions[selectedFleet.factionName]
                                ?.Vehicles || [];
                            const vehicleRecord = factionVehicles.find(
                              (v) => v.ID === vehicle.ID
                            );
                            // Debug log to see what's happening
                            console.log("Vehicle check:", {
                              vehicleID: vehicle.ID,
                              vehicleRecord,
                              stealth: vehicleRecord?.stealth,
                              dataStealth: vehicleRecord?.data?.stealth,
                              isCurrentFaction,
                              shouldShow:
                                isCurrentFaction ||
                                !(
                                  vehicleRecord?.stealth === true ||
                                  vehicleRecord?.data?.stealth === true
                                ),
                            });
                            return !(
                              vehicleRecord?.stealth === true ||
                              vehicleRecord?.data?.stealth === true
                            );
                          }
                        );
                        // totalShips: all ships, including stealth
                        const totalShips = selectedFleet.Vehicles.reduce(
                          (sum, v) => sum + (v.count || 0),
                          0
                        );
                        // If not current faction and fleet is Idle or Mothballed, show only total ships
                        if (
                          !isCurrentFaction &&
                          ["Idle", "Mothballed"].includes(
                            selectedFleet.State?.Action
                          )
                        ) {
                          return (
                            <div
                              style={{
                                fontWeight: "bold",
                                marginBottom: "8px",
                              }}
                            >
                              Total Ships: {totalShips}
                              <div
                                style={{
                                  fontStyle: "italic",
                                  marginTop: "4px",
                                }}
                              >
                                Intelligence insufficient.
                              </div>
                            </div>
                          );
                        }
                        // If not current faction and all fleets at world are Idle/Mothballed, hide composition
                        if (!isCurrentFaction) {
                          const fleetsAtWorld = Object.entries(
                            systemData
                          ).reduce((acc, [factionName, fleets]) => {
                            if (factionName === selectedFleet.factionName) {
                              acc.push(
                                ...fleets.filter(
                                  (fleet) =>
                                    fleet.State?.Location ===
                                    selectedFleet.State?.Location
                                )
                              );
                            }
                            return acc;
                          }, []);
                          if (
                            fleetsAtWorld.length > 0 &&
                            fleetsAtWorld.every((fleet) =>
                              ["Idle", "Mothballed"].includes(
                                fleet.State?.Action
                              )
                            )
                          ) {
                            return (
                              <>
                                <div
                                  style={{
                                    fontWeight: "bold",
                                    marginBottom: "8px",
                                  }}
                                >
                                  Total Ships: {totalShips}
                                </div>
                                <div
                                  style={{
                                    fontStyle: "italic",
                                    marginTop: "4px",
                                  }}
                                >
                                  Ship composition is hidden.
                                </div>
                              </>
                            );
                          }
                        }
                        // Otherwise, show full composition
                        return (
                          <>
                            <div
                              style={{
                                fontWeight: "bold",
                                marginBottom: "8px",
                              }}
                            >
                              Total Ships: {totalShips}
                            </div>
                            {visibleVehicles.length > 0 ? (
                              <div className="vehicles-list">
                                {visibleVehicles.map((vehicle, index) => {
                                  const vehicleData = allFactions[
                                    selectedFleet.factionName
                                  ]?.Vehicles?.find((v) => v.ID === vehicle.ID);
                                  return (
                                    <div key={index} className="vehicle-item">
                                      <span className="vehicle-name">
                                        {vehicleData?.name ||
                                          `Vehicle ${vehicle.ID}`}
                                      </span>
                                      <span className="">
                                        {vehicle.count || 0}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <p>No visible ships in this fleet</p>
                            )}
                          </>
                        );
                      })()
                    ) : (
                      <p>No vehicles in this fleet</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TacticalMap;
