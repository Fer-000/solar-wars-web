import React, { useState, useEffect, useRef } from "react";
import databaseService from "../services/database";
import globalDB from "../services/GlobalDB";
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
  const [selectedSystem, setSelectedSystem] = useState(null);
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
          let fleetsInSystem = factionData.Fleets.filter((fleet) =>
            worlds.includes(fleet.State?.Location)
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

    return isGroundFleet ? "↓" : "↑";
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

  const maxPirateFleetsPerSystem = 10;
  const pirateFleetLevels = [
    {
      name: "Pirate Raiders",
      min: 1,
      max: 3,
      minLength: 0,
      maxLength: 60,
    },
    {
      name: "Pirate Squadron",
      min: 4,
      max: 8,
      minLength: 0,
      maxLength: 120,
    },
    {
      name: "Pirate Flotilla",
      min: 9,
      max: 18,
      minLength: 0,
      maxLength: 200,
    },
    {
      name: "Pirate Fleet",
      min: 19,
      max: 40,
      minLength: 0,
      maxLength: 400,
    },
    {
      name: "Pirate Armada",
      min: 50,
      max: 80,
      minLength: 0,
      maxLength: 9999,
    },
  ];

  const pirateSpawnWorlds = (systemName) =>
    solarSystems[systemName].filter(
      (w) =>
        w.toLowerCase().replace(/\s+/g, "").includes("asteroidbelt") ||
        w.toLowerCase() === "ceres"
    );

  // Helper to get random vehicles for pirates, weighted by level
  function getRandomPirateVehicles(pirateFaction, levelIdx) {
    if (!pirateFaction?.Vehicles) return [];
    const level = pirateFleetLevels[levelIdx];
    // Filter vehicles by length for this level
    const eligible = pirateFaction.Vehicles.filter((v) => {
      const len = v.data?.length || v.length || 0;
      return len >= (level.minLength || 0) && len <= (level.maxLength || 9999);
    });
    // Sort by length ascending
    eligible.sort(
      (a, b) =>
        (a.data?.length || a.length || 0) - (b.data?.length || b.length || 0)
    );
    // For higher levels, allow more large ships
    let numShips =
      Math.floor(Math.random() * (level.max - level.min + 1)) + level.min;
    let ships = [];
    let remaining = numShips;
    // Distribute: lower levels get mostly small ships, higher levels get more big ships
    for (let i = eligible.length - 1; i >= 0 && remaining > 0; i--) {
      // For level 1, only 0-1 of the largest ship, for level 5, allow more
      let maxThisType = Math.max(
        1,
        Math.floor((levelIdx + 1) * 0.5 * (eligible.length - i))
      );
      let count = Math.min(
        remaining,
        Math.floor(Math.random() * maxThisType) + 1
      );
      if (count > 0) {
        ships.push({ ID: eligible[i].ID, count });
        remaining -= count;
      }
    }
    // If still remaining, fill with smallest ships
    if (remaining > 0 && eligible.length > 0) {
      ships.push({ ID: eligible[0].ID, count: remaining });
    }
    return ships;
  }

  async function generateAndPersistPirateFleets() {
    if (!dbLoaded || !Object.keys(allFactions).length) return;
    const pirateFaction = allFactions["pirates"];
    if (!pirateFaction) return;

    const newFactions = { ...allFactions };
    let changed = false;
    let fleetsGenerated = 0;

    Object.keys(solarSystems).forEach((systemName) => {
      const pirateWorlds = pirateSpawnWorlds(systemName);
      const pirateFleets =
        pirateFaction.Fleets?.filter((fleet) =>
          pirateWorlds.includes(fleet.State?.Location)
        ) || [];
      const currentCount = pirateFleets.length;

      if (currentCount < maxPirateFleetsPerSystem) {
        // Chance to spawn decreases as fleet count increases
        const spawnChance =
          (maxPirateFleetsPerSystem - currentCount) / maxPirateFleetsPerSystem;
        if (Math.random() < spawnChance) {
          // Weighted random for fleet level (higher levels less likely)
          const levelWeights = [0.3, 0.25, 0.2, 0.15, 0.1];
          const r = Math.random();
          let levelIdx = 0,
            acc = 0;
          for (let i = 0; i < levelWeights.length; i++) {
            acc += levelWeights[i];
            if (r < acc) {
              levelIdx = i;
              break;
            }
          }
          const level = pirateFleetLevels[levelIdx];
          const world =
            pirateWorlds[Math.floor(Math.random() * pirateWorlds.length)];
          const newFleet = {
            ID:
              "pirate-" + Date.now() + "-" + Math.floor(Math.random() * 10000),
            Name: level.name,
            Type: "Space",
            State: {
              Location: world,
              Action: "Patrolling", // <-- set to Patrolling
            },
            Vehicles: getRandomPirateVehicles(pirateFaction, levelIdx),
            Value: { CM: 0, CS: 0, EL: 0, ER: 0 },
            CSCost: 0,
          };
          if (!newFactions["pirates"].Fleets)
            newFactions["pirates"].Fleets = [];
          newFactions["pirates"].Fleets.push(newFleet);
          changed = true;
          fleetsGenerated++;
          console.log(
            `[PirateGen] Generated ${level.name} at ${world} in ${systemName}:`,
            newFleet
          );
        } else {
          console.log(
            `[PirateGen] No fleet spawned in ${systemName} (current: ${currentCount}, chance: ${(
              spawnChance * 100
            ).toFixed(1)}%)`
          );
        }
      }
    });

    if (changed) {
      await databaseService.updateFleets(
        "The Solar Wars",
        "pirates",
        newFactions["pirates"].Fleets
      );
      const factions = await databaseService.getFactions("The Solar Wars");
      setAllFactions(factions);
      console.log(
        `[PirateGen] Total new pirate fleets generated: ${fleetsGenerated}`
      );
    } else {
      console.log(
        "[PirateGen] No new pirate fleets generated (already at max or chance failed)."
      );
    }
  }

  useEffect(() => {
    if (dbLoaded && Object.keys(allFactions).length > 0) {
      console.log(
        "[PirateGen] useEffect triggered, dbLoaded:",
        dbLoaded,
        "allFactions loaded:",
        Object.keys(allFactions)
      );
      generateAndPersistPirateFleets();
    }
    // eslint-disable-next-line
  }, [dbLoaded, allFactions]);

  async function handleEngagePirates(playerFleet, pirateFleet) {
    // Get vehicle stats for both fleets
    const getFleetPower = (fleet, faction) => {
      if (!fleet.Vehicles || !faction?.Vehicles) return 0;
      return fleet.Vehicles.reduce((sum, v) => {
        const vDef = faction.Vehicles.find((def) => def.ID === v.ID);
        if (!vDef || !vDef.data) return sum;
        const d = vDef.data;
        const power =
          (d.main || 0) +
          (d.lances || 0) +
          (d.pdc || 0) +
          (d.torpedoes || 0) +
          (d.shield ? 20 : 0) +
          (d.length || 0) / 10;
        return sum + power * (v.count || 1);
      }, 0);
    };

    const playerFaction = allFactions[currentFaction.toLowerCase()];
    console.log("Player faction:", playerFaction);
    const pirateFaction = allFactions["pirates"];
    const playerPower = getFleetPower(playerFleet, playerFaction);
    const piratePower = getFleetPower(pirateFleet, pirateFaction);

    let playerWins = playerPower >= piratePower * (0.8 + Math.random() * 0.4);
    let resourceReward = {
      "U-CM": 0,
      "U-EL": 0,
      "U-CS": 0,
      CM: 0,
      EL: 0,
      CS: 0,
      ER: 0,
    };
    let playerLosses = [];
    let pirateLosses = [];

    if (playerWins) {
      // Player wins: destroy pirate fleet, reward, lose a few ships
      resourceReward = {
        "U-CM": Math.floor(10 + Math.random() * 10),
        "U-EL": Math.floor(10 + Math.random() * 10),
        "U-CS": Math.floor(10 + Math.random() * 10),
        CM: Math.floor(100 + Math.random() * 100),
        EL: Math.floor(100 + Math.random() * 100),
        CS: Math.floor(100 + Math.random() * 100),
        ER: Math.floor(20 + Math.random() * 20),
      };
      // Remove pirate fleet
      const newPirateFleets = pirateFaction.Fleets.filter(
        (f) => f.ID !== pirateFleet.ID
      );
      await databaseService.updateFleets(
        "The Solar Wars",
        "pirates",
        newPirateFleets
      );
      // Remove a few ships from player fleet
      const newPlayerFleet = { ...playerFleet };
      newPlayerFleet.Vehicles = newPlayerFleet.Vehicles.map((v) => {
        const loss = Math.floor(Math.random() * 2);
        playerLosses.push({ ID: v.ID, lost: loss });
        return { ...v, count: Math.max(0, v.count - loss) };
      });
      // Update player fleet in DB
      const newPlayerFleets = playerFaction.Fleets.map((f) =>
        f.ID === playerFleet.ID ? newPlayerFleet : f
      );
      await databaseService.updateFleets(
        "The Solar Wars",
        currentFaction,
        newPlayerFleets
      );
      pirateLosses = pirateFleet.Vehicles.map((v) => ({
        ID: v.ID,
        lost: v.count,
      }));
    } else {
      // Player loses: heavy losses, pirates may lose some too
      // Remove many ships from player fleet
      const newPlayerFleet = { ...playerFleet };
      newPlayerFleet.Vehicles = newPlayerFleet.Vehicles.map((v) => {
        const loss = Math.floor(v.count * (0.5 + Math.random() * 0.4));
        playerLosses.push({ ID: v.ID, lost: loss });
        return { ...v, count: Math.max(0, v.count - loss) };
      });
      // Remove some ships from pirates
      const newPirateFleet = { ...pirateFleet };
      newPirateFleet.Vehicles = newPirateFleet.Vehicles.map((v) => {
        const loss = Math.floor(v.count * (0.2 + Math.random() * 0.3));
        pirateLosses.push({ ID: v.ID, lost: loss });
        return { ...v, count: Math.max(0, v.count - loss) };
      });
      // Update both fleets in DB
      const newPlayerFleets = playerFaction.Fleets.map((f) =>
        f.ID === playerFleet.ID ? newPlayerFleet : f
      );
      const newPirateFleets = pirateFaction.Fleets.map((f) =>
        f.ID === pirateFleet.ID ? newPirateFleet : f
      );
      await databaseService.updateFleets(
        "The Solar Wars",
        currentFaction,
        newPlayerFleets
      );
      await databaseService.updateFleets(
        "The Solar Wars",
        "pirates",
        newPirateFleets
      );
    }

    await loadAllFactionsData();
    setBattleResult({
      win: playerWins,
      playerLosses,
      pirateLosses,
      resourceReward,
      playerFleet,
      pirateFleet,
    });
    setShowFleetModal(false);
  }

  return (
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
                      // Apply referee filtering for buildings view
                      if (refereeMode?.isReferee) {
                        const { nations, worlds: refWorlds } = refereeMode;

                        if (refWorlds.length > 0 && nations.length === 0) {
                          // Show all nations but only on specified worlds
                          if (!refWorlds.includes(zoomedWorld.name)) {
                            return false;
                          }
                        } else if (
                          nations.length > 0 &&
                          refWorlds.length === 0
                        ) {
                          // Show only specified nations on all worlds
                          if (!nations.includes(factionName.toLowerCase())) {
                            return false;
                          }
                        } else if (nations.length > 0 && refWorlds.length > 0) {
                          // Show specified nations on all worlds + all nations on specified worlds
                          const isSpecifiedNation = nations.includes(
                            factionName.toLowerCase()
                          );
                          const isSpecifiedWorld = refWorlds.includes(
                            zoomedWorld.name
                          );

                          if (!isSpecifiedNation && !isSpecifiedWorld) {
                            return false;
                          }
                        }
                      }

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
              <div
                className="worlds-grid"
                ref={mapScrollRef}
                style={{ paddingBottom: "48px", overflowY: "auto" }}
              >
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
                  const currentFactionHasValidFleetHere = refereeMode?.isReferee
                    ? fleetsAtWorld.length > 0 // Referee can see all fleets
                    : currentFactionFleetsWithShips.length > 0;
                  const visibleFleets = refereeMode?.isReferee
                    ? fleetsAtWorld // Referee sees all fleets
                    : currentFactionHasValidFleetHere
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

                  // --- PATCH: Make planet image clickable if current faction has active combat units OR referee mode ---
                  const canZoomIn =
                    refereeMode?.isReferee ||
                    currentFactionActiveCombatUnits.length > 0;

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
                        if (
                          isCurrentFaction ||
                          hasActiveUnit ||
                          refereeMode?.isReferee
                        ) {
                          // For referee mode, show all vehicles without stealth filtering
                          const visibleVehicles = refereeMode?.isReferee
                            ? selectedFleet.Vehicles // Referee sees everything
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

                {selectedFleet.factionName === "pirates" &&
                  (() => {
                    // Find all player fleets at this location
                    const playerFleets =
                      Array.isArray(systemData[currentFaction.toLowerCase()]) &&
                      selectedFleet?.State?.Location
                        ? systemData[currentFaction.toLowerCase()].filter(
                            (fleet) =>
                              fleet.State?.Location ===
                                selectedFleet.State.Location &&
                              fleet.Vehicles &&
                              fleet.Vehicles.reduce(
                                (sum, v) => sum + (v.count || 0),
                                0
                              ) > 0
                          )
                        : [];
                    // --- PATCH: If only one fleet and not set, set selectedPlayerFleetId ---

                    if (playerFleets.length === 0) return null;
                    return (
                      <div style={{ marginTop: "16px", textAlign: "center" }}>
                        <div style={{ marginBottom: "8px" }}>
                          <label>
                            <strong>Select your fleet to engage:</strong>
                            <select
                              style={{ marginLeft: "8px", padding: "4px" }}
                              value={
                                selectedPlayerFleetId ||
                                (playerFleets.length === 1
                                  ? playerFleets[0].ID
                                  : "")
                              }
                              onChange={(e) =>
                                setSelectedPlayerFleetId(e.target.value)
                              }
                            >
                              {playerFleets.map((fleet) => (
                                <option key={fleet.ID} value={fleet.ID}>
                                  {fleet.Name || `Fleet ${fleet.ID}`} (
                                  {fleet.Vehicles.reduce(
                                    (sum, v) => sum + (v.count || 0),
                                    0
                                  )}{" "}
                                  ships)
                                </option>
                              ))}
                            </select>
                          </label>
                        </div>
                        <button
                          onClick={async () => {
                            const fleetId =
                              selectedPlayerFleetId ||
                              (playerFleets.length === 1
                                ? playerFleets[0].ID
                                : null);
                            const playerFleet = playerFleets.find(
                              (f) => f.ID === fleetId
                            );
                            if (playerFleet) {
                              console.log(
                                "Engaging pirates with fleet:",
                                playerFleet
                              );
                              console.log("Selected fleet:", selectedFleet);
                              await handleEngagePirates(
                                playerFleet,
                                selectedFleet
                              );
                            }
                          }}
                          style={{
                            padding: "8px 16px",
                            backgroundColor: "#b00",
                            color: "white",
                            border: "1px solid #800",
                            borderRadius: "4px",
                            cursor:
                              selectedPlayerFleetId ||
                              (playerFleets.length === 1
                                ? "pointer"
                                : "not-allowed"),
                            fontSize: "14px",
                            opacity:
                              selectedPlayerFleetId || playerFleets.length === 1
                                ? 1
                                : 0.6,
                          }}
                          disabled={
                            //!selectedPlayerFleetId && playerFleets.length !== 1
                            true
                          }
                        >
                          Engage Pirates DON'T USE
                        </button>
                        <br />
                        you'll lose ships without any gain
                      </div>
                    );
                  })()}
              </div>
            </div>
          </div>
        )}

        {/* Battle Result Modal */}
        {battleResult && (
          <div
            className="fleet-modal-overlay"
            onClick={() => setBattleResult(null)}
          >
            <div className="fleet-modal" onClick={(e) => e.stopPropagation()}>
              <div className="fleet-modal-header">
                <h3>{battleResult.win ? "Victory!" : "Defeat!"}</h3>
                <button
                  className="close-btn"
                  onClick={() => setBattleResult(null)}
                >
                  ✕
                </button>
              </div>
              <div className="fleet-modal-content">
                <h4>Your Losses:</h4>
                <ul>
                  {battleResult.playerLosses.map((loss) => {
                    const vDef = allFactions[currentFaction]?.Vehicles?.find(
                      (v) => v.ID === loss.ID
                    );
                    if (!loss.lost) return null;
                    return (
                      <li key={loss.ID}>
                        {vDef?.name || `Ship ${loss.ID}`}: -{loss.lost}
                      </li>
                    );
                  })}
                </ul>
                <h4>Pirate Losses:</h4>
                <ul>
                  {battleResult.pirateLosses.map((loss) => {
                    const vDef = allFactions["pirates"]?.Vehicles?.find(
                      (v) => v.ID === loss.ID
                    );
                    if (!loss.lost) return null;
                    return (
                      <li key={loss.ID}>
                        {vDef?.name || `Ship ${loss.ID}`}: -{loss.lost}
                      </li>
                    );
                  })}
                </ul>
                {battleResult.win && (
                  <>
                    <h4>Resource Reward:</h4>
                    <ul>
                      {Object.entries(battleResult.resourceReward).map(
                        ([k, v]) =>
                          v > 0 ? (
                            <li key={k}>
                              {k}: +{v}
                            </li>
                          ) : null
                      )}
                    </ul>
                  </>
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
