import React, { useState, useEffect } from "react";
import databaseService from "../services/database";
import "./TacticalMap.css";

const TacticalMap = ({ onClose, currentFaction }) => {
  const [selectedSystem, setSelectedSystem] = useState(null);
  const [systemData, setSystemData] = useState({});
  const [allFactions, setAllFactions] = useState({});
  const [selectedFleet, setSelectedFleet] = useState(null);
  const [showFleetModal, setShowFleetModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const solarSystems = {
    Sol: [
      "Mercury",
      "Venus",
      "Earth",
      "Luna",
      "Mars",
      "Ceres",
      "Jupiter",
      "Ganymede",
      "Callisto",
      "Europa",
      "Io",
      "Saturn",
      "Rhea",
      "Titan",
      "Enceladus",
      "Tethys",
      "Mimas",
      "Dione",
      "Iapetus",
      "Uranus",
      "Oberon",
      "Titania",
      "Miranda",
      "Neptune",
      "Triton",
      "Pluto",
      "Charon",
    ],
    Corelli: ["Barcas", "Deo Gloria", "Novai", "Scipios"],
  };

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
  const randomColorCache = {};
  function getRandomColor(factionName) {
    if (randomColorCache[factionName]) return randomColorCache[factionName];
    // Generate pastel random color
    const hue = Math.floor(Math.random() * 360);
    const color = `hsl(${hue}, 70%, 65%)`;
    randomColorCache[factionName] = color;
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
                  <div className="system-icon">🌌</div>
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
              <div className="worlds-grid">
                {solarSystems[selectedSystem].map((worldName) => {
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

                  return (
                    <div key={worldName} className="world-container">
                      <div className="world-circle">
                        <div className="world-name">{worldName}</div>
                        <div className="world-center">🪐</div>

                        {/* Fleet markers around the world */}
                        <div className="fleet-markers">
                          {fleetsAtWorld.map((fleet, index) => {
                            const angle = (360 / fleetsAtWorld.length) * index;
                            const radius = 85; // match .world-circle size
                            const x =
                              Math.cos((angle * Math.PI) / 180) * radius;
                            const y =
                              Math.sin((angle * Math.PI) / 180) * radius;

                            return (
                              <div
                                key={`${fleet.factionName}-${fleet.ID}`}
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
                          {fleetsAtWorld.length} fleet
                          {fleetsAtWorld.length !== 1 ? "s" : ""}
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
                      <div className="vehicles-list">
                        {selectedFleet.Vehicles.map((vehicle, index) => {
                          const vehicleData = allFactions[
                            selectedFleet.factionName
                          ]?.Vehicles?.find((v) => v.ID === vehicle.ID);
                          return (
                            <div key={index} className="vehicle-item">
                              <span className="vehicle-name">
                                {vehicleData?.name || `Vehicle ${vehicle.ID}`}
                              </span>
                              <span className="">{vehicle.count || 0}</span>
                            </div>
                          );
                        })}
                      </div>
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
