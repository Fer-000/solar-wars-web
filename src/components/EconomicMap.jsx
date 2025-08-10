import React, { useEffect, useState } from "react";
import databaseService from "../services/database";
import "./EconomicMap.css";

// EconomicMap: shows worlds with forces/hexes for the faction, and planet view with buildings
const EconomicMap = ({ nationName, onHexesUpdate }) => {
  const [worlds, setWorlds] = useState([]);
  const [selectedWorld, setSelectedWorld] = useState(null);
  const [buildings, setBuildings] = useState([]);
  const [totalHexes, setTotalHexes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortMode, setSortMode] = useState("hexes"); // "hexes" or "alpha"
  const [buildingDefs, setBuildingDefs] = useState([]); // Store building definitions

  // Cache planet image error states to avoid rerendering and lag
  const planetImageErrorCache = React.useRef({});

  function PlanetImageOrEmoji({ planetName, selected }) {
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

    return error ? (
      <img
        src={"maps/placeholder.png"}
        style={{
          width: 180,
          height: 180,
          borderRadius: "50%",
          display: "inline-block",
          marginTop: "15px",
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
          marginTop: "15px",
        }}
        onError={handleError}
      />
    );
  }

  useEffect(() => {
    const fetchWorlds = async () => {
      setLoading(true);
      setError(null);
      try {
        // Get all factions
        const allFactions = await databaseService.getFactions("The Solar Wars");
        const factionEntry = Object.entries(allFactions).find(
          ([key, value]) =>
            value?.name?.toLowerCase() === nationName.toLowerCase()
        );
        const factionId = factionEntry ? factionEntry[0] : null;
        if (!factionId) throw new Error("Faction not found");
        const factionData = await databaseService.getFactionInfo(
          "The Solar Wars",
          factionId
        );

        // Store building definitions
        const buildingDefs = factionData.Buildings;
        setBuildingDefs(buildingDefs);
        console.log("Building definitions loaded:", buildingDefs);

        // Find worlds with forces or hexes
        const maps = factionData.maps || factionData.Maps || {};
        const worldsWithPresence = Object.entries(maps)
          .filter(
            ([planet, info]) =>
              info.Hexes > 0 || (info.Forces && info.Forces.length > 0)
          )
          .map(([planet, info]) => {
            // Calculate total units for this world for the player faction
            const forces = info.Forces || [];
            const totalUnits = forces.reduce((sum, force) => {
              return (
                sum +
                (force.Vehicles || []).reduce(
                  (unitSum, vehicle) => unitSum + (vehicle.count || 0),
                  0
                )
              );
            }, 0);

            // Count fleets for additional display info
            const totalFleets = forces.length;

            return {
              name: planet,
              hexes: info.Hexes || 0,
              forces: forces,
              totalUnits,
              totalFleets,
              buildings: info.Buildings || [], // Include buildings for each world
              rawInfo: info, // For debugging
            };
          });
        setWorlds(worldsWithPresence);

        // Calculate total hexes across all worlds
        const totalHexesCount = worldsWithPresence.reduce(
          (sum, world) => sum + world.hexes,
          0
        );
        setTotalHexes(totalHexesCount);

        // Notify parent component about hexes count
        if (onHexesUpdate) {
          onHexesUpdate(totalHexesCount);
        }
      } catch (err) {
        setError("Failed to load worlds: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchWorlds();
  }, [nationName]);

  useEffect(() => {
    const fetchBuildings = async () => {
      if (!selectedWorld) return;
      setLoading(true);
      setError(null);
      try {
        // Get all factions
        const allFactions = await databaseService.getFactions("The Solar Wars");
        const factionEntry = Object.entries(allFactions).find(
          ([key, value]) =>
            value?.name?.toLowerCase() === nationName.toLowerCase()
        );
        const factionId = factionEntry ? factionEntry[0] : null;
        if (!factionId) throw new Error("Faction not found");
        const factionData = await databaseService.getFactionInfo(
          "The Solar Wars",
          factionId
        );
        // Get building definitions
        const buildingDefs = factionData.buildings;
        setBuildingDefs(buildingDefs);
        // Get world buildings
        const mapInfo =
          (factionData.maps && factionData.maps[selectedWorld]) ||
          (factionData.Maps && factionData.Maps[selectedWorld]);
        const worldBuildings = mapInfo?.Buildings || [];
        // Use the same formatting as in formatWorldBuildings
        const formatted = formatWorldBuildings(worldBuildings, buildingDefs);
        console.log(
          "World buildings raw:",
          worldBuildings,
          "Defs:",
          buildingDefs,
          "Formatted:",
          formatted
        );
        setBuildings(formatted);
      } catch (err) {
        setError("Failed to load buildings: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBuildings();
  }, [selectedWorld, nationName]);

  // Function to format buildings for a world
  const formatWorldBuildings = (worldBuildings, buildingDefs) => {
    if (!Array.isArray(worldBuildings) || !Array.isArray(buildingDefs)) {
      return [];
    }

    return worldBuildings
      .map((levelsObj, buildingIdx) => {
        if (!levelsObj || typeof levelsObj !== "object") return null;
        const def = buildingDefs[buildingIdx];
        if (!def) return null;
        const name = def.name || def.Name || `Building ${buildingIdx}`;
        const type = def.type || def.Type || "";

        // levelsObj: { [level]: amount }, key 0 = level 1, key 9 = level 10
        return Object.entries(levelsObj)
          .filter(([levelKey, amount]) => {
            // Only show if amount > 0, and skip level 1 if amount is 0
            if (levelKey === "0" && amount === 0) return false;
            return amount > 0;
          })
          .map(([levelKey, amount]) => ({
            name,
            type,
            level: parseInt(levelKey) + 1,
            amount,
          }));
      })
      .flat()
      .filter(Boolean);
  };

  if (loading) return <div>Loading economic map...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div>
      {selectedWorld ? (
        // Planet details view
        <div className="economic-map-planet-details">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <button
              onClick={() => setSelectedWorld(null)}
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                color: "white",
                padding: "10px 20px",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                marginRight: "15px",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "rgba(0, 245, 255, 0.2)";
                e.target.style.borderColor = "#00f5ff";
                e.target.style.color = "#00f5ff";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "rgba(255, 255, 255, 0.1)";
                e.target.style.borderColor = "rgba(255, 255, 255, 0.2)";
                e.target.style.color = "white";
              }}
            >
              ← Back to Worlds
            </button>
            <div style={{ display: "flex", alignItems: "center" }}>
              <PlanetImageOrEmoji planetName={selectedWorld} selected={true} />
              <strong
                style={{
                  fontSize: "1.3em",
                  color: "#00f5ff",
                  marginLeft: "18px",
                }}
              >
                {selectedWorld}
              </strong>
            </div>
          </div>
          <div className="economic-map-buildings-panel">
            <h4 className="economic-map-buildings-title">Buildings</h4>
            <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
              <button
                style={{
                  padding: "6px 14px",
                  background: "#00f5ff",
                  color: "#222",
                  border: "none",
                  borderRadius: "4px",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
                onClick={() => alert("Buy building (not implemented)")}
              >
                + Buy Building
              </button>
              <button
                style={{
                  padding: "6px 14px",
                  background: "#444",
                  color: "#fff",
                  border: "1px solid #00f5ff",
                  borderRadius: "4px",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
                onClick={() => alert("Set capital (not implemented)")}
              >
                Set Capital
              </button>
            </div>
            {buildings.length === 0 ? (
              <div className="economic-map-no-buildings">
                No buildings found for this world.
              </div>
            ) : (
              <div style={{ marginLeft: "16px", marginTop: "8px" }}>
                {buildings.map((b, idx) => (
                  <div
                    key={`${b.name}-${b.level}-${idx}`}
                    className="economic-map-building-item"
                    style={{
                      marginBottom: "8px",
                      padding: "8px",
                      background: "rgba(0, 245, 255, 0.1)",
                      borderRadius: "4px",
                      border: "1px solid rgba(0, 245, 255, 0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "12px",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: "bold", color: "#00f5ff" }}>
                        {b.name}
                      </div>
                      <div
                        style={{
                          fontSize: "0.9em",
                          color: "#ccc",
                          marginTop: "2px",
                        }}
                      >
                        {b.type && (
                          <span style={{ color: "#888" }}>
                            Type: {b.type} •
                          </span>
                        )}
                        <span style={{ color: "#00f5ff" }}>
                          Level {b.level}
                        </span>
                        <span style={{ color: "#fff", marginLeft: "8px" }}>
                          Amount: {b.amount}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        style={{
                          padding: "4px 8px",
                          background: "#00f5ff",
                          color: "#222",
                          border: "none",
                          borderRadius: "4px",
                          fontWeight: "bold",
                          cursor: "pointer",
                        }}
                        title="Upgrade"
                        onClick={() =>
                          alert(`Upgrade ${b.name} (not implemented)`)
                        }
                      >
                        ↑
                      </button>
                      <button
                        style={{
                          padding: "4px 8px",
                          background: "#444",
                          color: "#fff",
                          border: "1px solid #00f5ff",
                          borderRadius: "4px",
                          fontWeight: "bold",
                          cursor: "pointer",
                        }}
                        title="Downgrade"
                        onClick={() =>
                          alert(`Downgrade ${b.name} (not implemented)`)
                        }
                      >
                        ↓
                      </button>
                      <button
                        style={{
                          padding: "4px 8px",
                          background: "#f55",
                          color: "#fff",
                          border: "none",
                          borderRadius: "4px",
                          fontWeight: "bold",
                          cursor: "pointer",
                        }}
                        title="Sell"
                        onClick={() =>
                          alert(`Sell ${b.name} (not implemented)`)
                        }
                      >
                        Sell
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        // Worlds overview
        <div>
          {/* Sorting dropdown */}
          <div style={{ marginBottom: "12px" }}>
            <label
              htmlFor="sort-mode"
              style={{ marginRight: "8px", color: "#fff" }}
            >
              Sort worlds by:
            </label>
            <select
              id="sort-mode"
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value)}
              style={{
                padding: "4px 10px",
                borderRadius: "6px",
                border: "1px solid #00f5ff",
                background: "#222",
                color: "#00f5ff",
              }}
            >
              <option value="hexes">Most Hexes</option>
              <option value="alpha">Alphabetical</option>
            </select>
          </div>
          <div style={{ marginBottom: "18px" }}>
            <strong style={{ fontSize: "1.1em" }}>
              Worlds with Forces or Hexes:
            </strong>
            <div className="economic-map-worlds">
              {worlds.length === 0 && <span>No worlds with presence.</span>}
              {[...worlds]
                .sort((a, b) => {
                  if (sortMode === "hexes") {
                    return b.hexes - a.hexes;
                  } else {
                    return a.name.localeCompare(b.name);
                  }
                })
                .map((world) => (
                  <div
                    key={world.name}
                    className="world-container"
                    onClick={() => setSelectedWorld(world.name)}
                  >
                    <div className="world-circle">
                      <div className="world-name">{world.name}</div>
                      <div className="world-center">
                        <PlanetImageOrEmoji
                          planetName={world.name}
                          selected={false}
                        />
                      </div>
                    </div>
                    <div className="world-info">
                      <div className="world-fleets-count">
                        {world.hexes} hexes
                        {world.totalFleets > 0 &&
                          ` • ${world.totalFleets} fleets`}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EconomicMap;
