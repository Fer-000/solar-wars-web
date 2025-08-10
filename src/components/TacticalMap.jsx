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
  const [zoomedWorld, setZoomedWorld] = useState(null); // { name, animate }
  const [collapsedFactions, setCollapsedFactions] = useState(new Set());
  const [scrollPosition, setScrollPosition] = useState(0);

  const solarSystems = {
    Sol: [
      // Ordered by distance from the Sun
      "Mercury",
      "Venus",
      "Earth",
      "Luna",
      "Mars",
      "Ceres",
      "Asteroid Belt Area A",
      "Asteroid Belt Area B",
      "Asteroid Belt Area C",
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
      "Proteus",
      "Nereid",
      "Pluto",
      "Charon",
    ],
    Corelli: [
      "Barcas",
      "Deo Gloria",
      "Novai",
      "Asteroid Belt Area A",
      "Asteroid Belt Area B",
      "Asteroid Belt Area C",
      "Asteroid Belt Area D",
      "Scipios",
    ],
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
    // First check if faction has a color in the database
    const faction = allFactions[factionName];
    if (faction && faction.color) {
      return faction.color;
    }

    // Fallback to predefined colors for current faction
    if (factionName.toLowerCase() === currentFaction.toLowerCase()) {
      return factionColors[factionName.toLowerCase()] || "#00f5ff";
    }

    // Fallback to random color for other factions
    return getRandomColor(factionName);
  };

  const toggleFactionCollapse = (factionName, worldName) => {
    const key = `${factionName}-${worldName}`;
    const newCollapsed = new Set(collapsedFactions);
    if (newCollapsed.has(key)) {
      newCollapsed.delete(key);
    } else {
      newCollapsed.add(key);
    }
    setCollapsedFactions(newCollapsed);
  };

  // Save scroll position before zooming
  const handleZoomIn = (worldName) => {
    const container = document.querySelector(".worlds-grid");
    if (container) {
      setScrollPosition(container.scrollTop);
    }
    setZoomedWorld({ name: worldName });
  };

  // Restore scroll position when going back
  const handleBackToMap = () => {
    setZoomedWorld(null);
    // Restore scroll position after state update
    setTimeout(() => {
      const container = document.querySelector(".worlds-grid");
      if (container) {
        container.scrollTop = scrollPosition;
      }
    }, 0);
  };

  return (
    <div className="tactical-map-overlay">
      <div className="tactical-map-container">
        <div className="tactical-map-header">
          <h2>🗺️ Tactical Map</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Zoomed-in planet view */}
        {zoomedWorld ? (
          <div
            className="zoomed-planet-area"
            style={{
              display: "flex",
              flexDirection: "row",
              minHeight: "400px",
              overflow: "hidden",
              position: "relative",
            }}
          >
            {/* Left: Buildings info, scroll bar on left, button at top */}
            <div
              style={{
                flex: 1,
                padding: "32px 16px 32px 32px",
                zIndex: 2,
                position: "relative",
              }}
            >
              <button onClick={() => setZoomedWorld(null)}>
                ← Back to Map
              </button>
              <h3 style={{ marginBottom: "16px", marginTop: "48px" }}>
                {zoomedWorld.name} - Buildings
              </h3>
              <div
                style={{
                  maxHeight: "550px",
                  overflowY: "auto",
                  paddingLeft: "8px",
                  direction: "rtl",
                }}
              >
                <div style={{ direction: "ltr" }}>
                  {(() => {
                    const factionsWithBuildings = Object.entries(
                      allFactions
                    ).filter(([factionName, factionData]) => {
                      const buildingsArr =
                        factionData?.Maps?.[zoomedWorld.name]?.Buildings;
                      // Only include if there is at least one building with nonzero amount
                      return (
                        Array.isArray(buildingsArr) &&
                        buildingsArr.some(
                          (levels) =>
                            levels &&
                            Object.entries(levels).some(
                              ([key, amount]) => amount > 0
                            )
                        )
                      );
                    });

                    if (factionsWithBuildings.length === 0) {
                      return (
                        <div style={{ color: "#888", fontStyle: "italic" }}>
                          No building information available for this world.
                          <br />
                          <small>
                            Debug: Looking for buildings in {zoomedWorld.name}
                          </small>
                        </div>
                      );
                    }

                    return factionsWithBuildings.map(
                      ([factionName, factionData]) => {
                        const planetBuildings =
                          factionData.Maps[zoomedWorld.name].Buildings;
                        const buildingDefs = Array.isArray(
                          factionData.Buildings
                        )
                          ? factionData.Buildings
                          : [];
                        // Only show if there is at least one building with nonzero amount
                        const hasBuildings =
                          Array.isArray(planetBuildings) &&
                          planetBuildings.some(
                            (levels) =>
                              levels &&
                              Object.entries(levels).some(
                                ([key, amount]) => amount > 0
                              )
                          );
                        if (!hasBuildings) return null;
                        const displayName = factionData.name || factionName;
                        return (
                          <details
                            key={factionName}
                            style={{ marginBottom: "12px" }}
                            open={false}
                          >
                            <summary
                              style={{
                                color: getFactionColor(factionName),
                                fontWeight: "bold",
                                fontSize: "16px",
                                cursor: "pointer",
                              }}
                            >
                              {displayName}
                            </summary>
                            <ul
                              style={{ marginLeft: "16px", marginTop: "8px" }}
                            >
                              {planetBuildings.map(
                                (buildingLevels, buildingId) => {
                                  if (!buildingLevels) return null;
                                  const def = buildingDefs[buildingId];
                                  if (!def) return null;
                                  const name =
                                    def.name ||
                                    def.Name ||
                                    `Building ${buildingId}`;
                                  const type = def.type || def.Type || "";
                                  // buildingLevels: { [level]: amount }, key 0 = level 1, key 9 = level 10
                                  return Object.entries(buildingLevels)
                                    .filter(([key, amount]) => {
                                      // Hide key 0 if amount is 0
                                      if (key === "0" && amount === 0)
                                        return false;
                                      return amount > 0;
                                    })
                                    .map(([key, amount]) => {
                                      let displayLevel = parseInt(key) + 1;
                                      return (
                                        <li
                                          key={name + key}
                                          style={{ marginBottom: "4px" }}
                                        >
                                          <span style={{ fontWeight: "bold" }}>
                                            {name}
                                          </span>
                                          {type && (
                                            <span
                                              style={{
                                                marginLeft: "8px",
                                                color: "#888",
                                              }}
                                            >
                                              ({type})
                                            </span>
                                          )}
                                          <span
                                            style={{
                                              marginLeft: "8px",
                                              color: "#00f5ff",
                                            }}
                                          >
                                            Lvl {displayLevel}
                                          </span>
                                          <span
                                            style={{
                                              marginLeft: "8px",
                                              color: "#fff",
                                            }}
                                          >
                                            x {amount}
                                          </span>
                                        </li>
                                      );
                                    });
                                }
                              )}
                            </ul>
                          </details>
                        );
                      }
                    );
                  })()}
                </div>
              </div>
            </div>
            {/* Right: Planet image, half hidden */}
            <div
              style={{
                flex: 1,
                position: "relative",
                overflow: "hidden",
                minHeight: "400px",
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
              }}
            >
              <div
                style={{
                  width: "900px",
                  height: "900px",
                  marginLeft: "30%",
                  marginTop: "-70px",
                  overflow: "hidden",
                }}
              >
                <img
                  src={`maps/${zoomedWorld.name}.png`}
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "5%",
                    objectPosition: "left",
                    objectFit: "cover",
                  }}
                  onError={(e) => {
                    e.target.src = "maps/placeholder.png";
                  }}
                  alt={zoomedWorld.name}
                />
              </div>
            </div>
          </div>
        ) : !selectedSystem ? (
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
                  // ...existing code...
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

                  // Determine if current faction has at least one active unit (Defense, Patrol, Attack)
                  const currentFactionFleetsWithShips = fleetsAtWorld.filter(
                    (fleet) =>
                      fleet.factionName.toLowerCase() ===
                        currentFaction.toLowerCase() &&
                      fleet.Vehicles &&
                      fleet.Vehicles.reduce(
                        (sum, v) => sum + (v.count || 0),
                        0
                      ) > 0
                  );

                  const currentFactionActiveCombatUnits =
                    currentFactionFleetsWithShips.filter((fleet) =>
                      ["Defense", "Patrol", "Battle", "Activating"].includes(
                        fleet.State?.Action === "Activating"
                          ? "Idle"
                          : fleet.State?.Action
                      )
                    );

                  // Only show fleet pointers if current faction has fleets with ships > 0
                  const currentFactionHasValidFleetHere =
                    currentFactionFleetsWithShips.length > 0;
                  const visibleFleets = currentFactionHasValidFleetHere
                    ? fleetsAtWorld
                    : fleetsAtWorld.filter(
                        (fleet) =>
                          fleet.factionName.toLowerCase() ===
                          currentFaction.toLowerCase()
                      );

                  // Group fleets by faction for collapse feature
                  const fleetsByFaction = visibleFleets.reduce((acc, fleet) => {
                    if (!acc[fleet.factionName]) acc[fleet.factionName] = [];
                    acc[fleet.factionName].push(fleet);
                    return acc;
                  }, {});

                  // Create display fleets (collapsed or expanded)
                  const displayFleets = [];
                  Object.entries(fleetsByFaction).forEach(
                    ([factionName, factionFleets]) => {
                      const collapseKey = `${factionName}-${worldName}`;
                      if (
                        collapsedFactions.has(collapseKey) &&
                        factionFleets.length > 1
                      ) {
                        // Show single collapsed fleet
                        displayFleets.push({
                          ...factionFleets[0],
                          isCollapsed: true,
                          collapsedCount: factionFleets.length,
                          factionName,
                        });
                      } else {
                        // Show all fleets normally
                        factionFleets.forEach((fleet) =>
                          displayFleets.push(fleet)
                        );
                      }
                    }
                  );

                  // Separate ground and space units from display fleets
                  const groundUnits = displayFleets.filter(
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

                  const spaceUnits = displayFleets.filter(
                    (fleet) =>
                      fleet.Type === "Space" &&
                      (!fleet.Vehicles ||
                        !fleet.Vehicles.some((v) => {
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

                  // --- PATCH: Make planet image clickable if current faction has active combat units ---
                  const canZoomIn = currentFactionActiveCombatUnits.length > 0;

                  return (
                    <div key={worldName} className="world-container">
                      <div className="world-circle">
                        <div className="world-name">{worldName}</div>
                        <div className="world-center">
                          {/* Greyscale if current faction has no units here (fog of war) */}
                          <div
                            style={{
                              cursor: canZoomIn ? "pointer" : "default",
                            }}
                            onClick={() => {
                              if (canZoomIn) handleZoomIn(worldName);
                            }}
                          >
                            <PlanetImageOrEmoji
                              planetName={worldName}
                              grayscale={
                                currentFactionActiveCombatUnits.length === 0
                              }
                            />
                          </div>
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
                            // If collapsed, show number of fleets and arrow, and clicking uncollapses
                            if (fleet.isCollapsed) {
                              return (
                                <div
                                  key={`ground-${fleet.factionName}-collapsed`}
                                  className="fleet-marker"
                                  style={{
                                    transform: `translate(${x}px, ${y}px)`,
                                    color: getFactionColor(fleet.factionName),
                                    cursor: "pointer",
                                    fontWeight: "bold",
                                    fontSize: "18px",
                                    background: "#222b",
                                    borderRadius: "50%",
                                    padding: "2px 8px",
                                    border: "1px solid #444",
                                  }}
                                  onClick={() =>
                                    toggleFactionCollapse(
                                      fleet.factionName,
                                      worldName
                                    )
                                  }
                                  title={`${fleet.collapsedCount} ${
                                    allFactions[fleet.factionName]?.name ||
                                    fleet.factionName
                                  } fleets (click to expand)`}
                                >
                                  {fleet.collapsedCount}↑
                                </div>
                              );
                            }
                            // Normal fleet marker
                            return (
                              <div
                                key={`ground-${fleet.factionName}-${fleet.ID}-normal`}
                                className="fleet-marker"
                                style={{
                                  transform: `translate(${x}px, ${y}px)`,
                                  color: getFactionColor(fleet.factionName),
                                  cursor: "pointer",
                                }}
                                onClick={() =>
                                  openFleetModal(fleet, fleet.factionName)
                                }
                                title={`${
                                  allFactions[fleet.factionName]?.name ||
                                  fleet.factionName
                                } - ${fleet.Name || `Fleet ${fleet.ID}`}`}
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
                            if (fleet.isCollapsed) {
                              return (
                                <div
                                  key={`space-${fleet.factionName}-collapsed`}
                                  className="fleet-marker"
                                  style={{
                                    transform: `translate(${x}px, ${y}px)`,
                                    color: getFactionColor(fleet.factionName),
                                    cursor: "pointer",
                                    fontWeight: "bold",
                                    fontSize: "18px",
                                    background: "#222b",
                                    borderRadius: "50%",
                                    padding: "2px 8px",
                                    border: "1px solid #444",
                                  }}
                                  onClick={() =>
                                    toggleFactionCollapse(
                                      fleet.factionName,
                                      worldName
                                    )
                                  }
                                  title={`${fleet.collapsedCount} ${
                                    allFactions[fleet.factionName]?.name ||
                                    fleet.factionName
                                  } fleets (click to expand)`}
                                >
                                  {fleet.collapsedCount}↑
                                </div>
                              );
                            }
                            return (
                              <div
                                key={`space-${fleet.factionName}-${fleet.ID}-normal`}
                                className="fleet-marker"
                                style={{
                                  transform: `translate(${x}px, ${y}px)`,
                                  color: getFactionColor(fleet.factionName),
                                  cursor: "pointer",
                                }}
                                onClick={() =>
                                  openFleetModal(fleet, fleet.factionName)
                                }
                                title={`${
                                  allFactions[fleet.factionName]?.name ||
                                  fleet.factionName
                                } - ${fleet.Name || `Fleet ${fleet.ID}`}`}
                              >
                                {getFleetIcon(fleet)}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="world-info">
                        <div className="world-fleets-count">
                          {currentFactionHasValidFleetHere
                            ? `${
                                groundUnits.filter((f) => !f.isCollapsed)
                                  .length +
                                groundUnits
                                  .filter((f) => f.isCollapsed)
                                  .reduce((sum, f) => sum + f.collapsedCount, 0)
                              } ground unit${
                                groundUnits.length !== 1 ? "s" : ""
                              }, ${
                                spaceUnits.filter((f) => !f.isCollapsed)
                                  .length +
                                spaceUnits
                                  .filter((f) => f.isCollapsed)
                                  .reduce((sum, f) => sum + f.collapsedCount, 0)
                              } space unit${spaceUnits.length !== 1 ? "s" : ""}`
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
                  {allFactions[selectedFleet.factionName]?.name ||
                    selectedFleet.factionName}{" "}
                  - {selectedFleet.Name || `Fleet ${selectedFleet.ID}`}
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
                      {selectedFleet.State?.Action === "Activating"
                        ? "Activating"
                        : selectedFleet.State?.Action || "Unknown"}
                    </p>
                    <p>
                      <strong>Type:</strong> {selectedFleet.Type || "Unknown"}
                    </p>
                  </div>
                  <div className="fleet-vehicles">
                    <h4>Fleet Composition:</h4>
                    {Array.isArray(selectedFleet.Vehicles) &&
                    selectedFleet.Vehicles.length > 0 ? (
                      (() => {
                        const isCurrentFaction =
                          selectedFleet.factionName.toLowerCase() ===
                          currentFaction.toLowerCase();
                        const totalShips = selectedFleet.Vehicles.reduce(
                          (sum, v) => sum + (v.count || 0),
                          0
                        );
                        // Find the fleets at the selected fleet's world
                        const fleetsAtWorld = Object.entries(systemData).reduce(
                          (acc, [factionName, fleets]) => {
                            const worldFleets = fleets.filter(
                              (fleet) =>
                                fleet.State?.Location ===
                                selectedFleet.State?.Location
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
                        // Determine if current faction has at least one active unit (Defense, Patrol, Attack) at this world
                        const currentFactionActiveCombatUnits =
                          fleetsAtWorld.filter(
                            (fleet) =>
                              fleet.factionName.toLowerCase() ===
                                currentFaction.toLowerCase() &&
                              [
                                "Defense",
                                "Patrol",
                                "Battle",
                                "Activating",
                              ].includes(
                                fleet.State?.Action === "Activating"
                                  ? "Idle"
                                  : fleet.State?.Action
                              )
                          );
                        const hasActiveUnit =
                          currentFactionActiveCombatUnits.length > 0;
                        if (isCurrentFaction || hasActiveUnit) {
                          // For enemy fleets, show composition but hide stealth ships unless fleet is attacking
                          const visibleVehicles = selectedFleet.Vehicles.filter(
                            (vehicle) => {
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
                            }
                          );
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
                                    ]?.Vehicles?.find(
                                      (v) => v.ID === vehicle.ID
                                    );
                                    return (
                                      <div key={index} className="vehicle-item">
                                        <span className="vehicle-name">
                                          {vehicleData?.name ||
                                            `Vehicle ${vehicle.ID}`}
                                          {(() => {
                                            const length =
                                              vehicleData?.data?.length;
                                            console.log(length);
                                            return length
                                              ? ` (${length}m)`
                                              : " (error)";
                                          })()}
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
                        }
                        // Otherwise, show only total and intelligence insufficient
                        return (
                          <div
                            style={{ fontWeight: "bold", marginBottom: "8px" }}
                          >
                            Total Ships: {totalShips}
                            <div
                              style={{ fontStyle: "italic", marginTop: "4px" }}
                            >
                              Intelligence insufficient.
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      <p>No vehicles in this fleet</p>
                    )}
                  </div>
                </div>

                {/* Add the Collapse Nation button for enemy fleets */}
                {selectedFleet.factionName.toLowerCase() !==
                  currentFaction.toLowerCase() && (
                  <div style={{ marginTop: "16px", textAlign: "center" }}>
                    <button
                      onClick={() => {
                        toggleFactionCollapse(
                          selectedFleet.factionName,
                          selectedFleet.State?.Location
                        );
                        closeFleetModal();
                      }}
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "#444",
                        color: "white",
                        border: "1px solid #666",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "14px",
                      }}
                    >
                      Collapse Nation
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TacticalMap;
