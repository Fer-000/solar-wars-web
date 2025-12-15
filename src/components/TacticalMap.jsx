import React, { useState, useEffect, useRef } from "react";
import databaseService from "../services/database";
import globalDB from "../services/GlobalDB";
import AnimatedSolarSystem from "./AnimatedSolarSystem";
import "./TacticalMap.css";

// Add refereeMode prop to component
const TacticalMap = ({ onClose, currentFaction, dbLoaded, refereeMode }) => {
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
  const [selectedSystem, setSelectedSystem] = useState("Sol");
  const [systemData, setSystemData] = useState({});
  const [allFactions, setAllFactions] = useState({});
  const [selectedFleet, setSelectedFleet] = useState(null);
  const [showFleetModal, setShowFleetModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [zoomedWorld, setZoomedWorld] = useState(null); // { name, animate }
  const [collapsedFactions, setCollapsedFactions] = useState(new Set());
  const [scrollPosition, setScrollPosition] = useState(0);
  const [battleResult, setBattleResult] = useState(null);
  const [selectedPlayerFleetId, setSelectedPlayerFleetId] = useState(null);

  // --- PATCH: Add scroll preservation ---
  const mapScrollRef = useRef(null);
  const savedScrollRef = useRef(0);
  // --- End scroll preservation patch ---

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
      "Asteroid Belt Area 1",
      "Asteroid Belt Area 2",
      "Asteroid Belt Area 3",
      "Asteroid Belt Area 4",
      "Scipios",
    ],
  };
  // Cache planet image error states to avoid rerendering and lag
  const planetImageErrorCache = React.useRef({});

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

  useEffect(() => {
    // Load initial system data when allFactions is loaded
    if (
      Object.keys(allFactions).length > 0 &&
      !Object.keys(systemData).length
    ) {
      loadSystemData(selectedSystem);
    }
  }, [allFactions]);

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
    // System selection automatically opens animated view
    await loadSystemData(systemName);
  };

  const loadSystemData = async (systemName) => {
    setLoading(true);

    try {
      // Get ALL faction fleets (not filtered by system) so user can see fleets across both systems
      const systemFleets = {};
      const allWorlds = [...solarSystems.Sol, ...solarSystems.Corelli];

      for (const [factionName, factionData] of Object.entries(allFactions)) {
        if (factionData.Fleets) {
          let fleetsInSystem = factionData.Fleets.filter((fleet) =>
            allWorlds.includes(fleet.State?.Location)
          );

          // Apply referee filtering
          if (refereeMode?.isReferee) {
            const { nations, worlds: refWorlds } = refereeMode;

            if (refWorlds.length > 0 && nations.length === 0) {
              // Show all nations but only in specified worlds
              fleetsInSystem = fleetsInSystem.filter((fleet) =>
                refWorlds.includes(fleet.State?.Location)
              );
            } else if (nations.length > 0 && refWorlds.length === 0) {
              // Show only specified nations in all worlds
              if (!nations.includes(factionName.toLowerCase())) {
                fleetsInSystem = [];
              }
            } else if (nations.length > 0 && refWorlds.length > 0) {
              // Show specified nations everywhere + all nations on specified worlds
              const isSpecifiedNation = nations.includes(
                factionName.toLowerCase()
              );
              const fleetsOnSpecifiedWorlds = fleetsInSystem.filter((fleet) =>
                refWorlds.includes(fleet.State?.Location)
              );

              if (isSpecifiedNation) {
                // Show this nation's fleets everywhere in the system
                // fleetsInSystem already contains all fleets in the system
              } else {
                // Show this nation's fleets only on specified worlds
                fleetsInSystem = fleetsOnSpecifiedWorlds;
              }
            }
          }

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

  // Helper to open fleet modal and save scroll position
  const openFleetModal = (fleet, factionName) => {
    if (mapScrollRef.current) {
      savedScrollRef.current = mapScrollRef.current.scrollTop;
    }
    setSelectedFleet({ ...fleet, factionName });
    setShowFleetModal(true);
  };

  // Helper to close fleet modal
  const closeFleetModal = () => {
    setShowFleetModal(false);
    setSelectedFleet(null);
  };

  // Restore scroll position when modal closes
  useEffect(() => {
    if (!showFleetModal && mapScrollRef.current) {
      requestAnimationFrame(() => {
        if (mapScrollRef.current) {
          mapScrollRef.current.scrollTop = savedScrollRef.current;
        }
      });
    }
  }, [showFleetModal]);

  useEffect(() => {
    if (
      showFleetModal &&
      selectedFleet &&
      selectedFleet.factionName === "pirates"
    ) {
      // Find all player fleets at this location
      const playerFleets =
        Array.isArray(systemData[currentFaction.toLowerCase()]) &&
        selectedFleet?.State?.Location
          ? systemData[currentFaction.toLowerCase()].filter(
              (fleet) =>
                fleet.State?.Location === selectedFleet.State.Location &&
                fleet.Vehicles &&
                fleet.Vehicles.reduce((sum, v) => sum + (v.count || 0), 0) > 0
            )
          : [];
      setSelectedPlayerFleetId(
        playerFleets.length > 0 ? playerFleets[0].ID : null
      );
    } else {
      setSelectedPlayerFleetId(null);
    }
    // eslint-disable-next-line
  }, [showFleetModal, selectedFleet, systemData, currentFaction]);
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

  return (
    <>
      {/* Fullscreen Animated View */}
      {selectedSystem && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 9999,
            background: "#050505",
          }}
        >
          <AnimatedSolarSystem
            systemName={selectedSystem}
            onWorldClick={handleZoomIn}
            onFleetClick={openFleetModal}
            fleetsAtWorld={Object.entries(systemData).reduce(
              (acc, [factionName, fleets]) => {
                fleets.forEach((fleet) => {
                  const location = fleet.State?.Location;
                  if (location) {
                    // Include fleets from both Sol and Corelli systems
                    const inSol = solarSystems.Sol.includes(location);
                    const inCorelli = solarSystems.Corelli.includes(location);
                    if (inSol || inCorelli) {
                      if (!acc[location]) acc[location] = [];
                      acc[location].push({ ...fleet, factionName });
                    }
                  }
                });
                return acc;
              },
              {}
            )}
            getFactionColor={getFactionColor}
            onClose={onClose}
            refereeMode={refereeMode}
            onBackToSystems={() => setSelectedSystem(null)}
            onSystemChange={(systemName) => setSelectedSystem(systemName)}
            allFactions={allFactions}
            systemData={systemData}
            currentFaction={currentFaction}
          />
        </div>
      )}

      {/* Tactical Map Container */}
      <div className="tactical-map-overlay">
        <div className="tactical-map-container">
          <div className="tactical-map-header">
            <h2>
              🗺️ Tactical Map
              {refereeMode?.isReferee && (
                <span
                  style={{
                    color: "#ff6b6b",
                    marginLeft: "8px",
                    fontSize: "14px",
                  }}
                >
                  (REFEREE MODE)
                </span>
              )}
            </h2>
            <button className="close-btn" onClick={onClose}>
              ✕
            </button>
          </div>

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
        </div>
      </div>
    </>
  );
};

export default TacticalMap;
