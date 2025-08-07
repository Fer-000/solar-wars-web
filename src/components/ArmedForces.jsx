import React, { useState, useEffect } from "react";
import StarField from "./StarField";
import TacticalMap from "./TacticalMap";
import databaseService from "../services/database";
import globalDB from "../services/GlobalDB";
import "./CenterPage.css";
import "./ArmedForces.css";

const ArmedForces = ({ onBack, nationName = "athena", dbLoaded }) => {
  if (!dbLoaded) {
    return (
      <div className="armed-forces">
        <div style={{ textAlign: "center", padding: "80px" }}>
          <h2>Loading database...</h2>
        </div>
      </div>
    );
  }
  const [editUnitName, setEditUnitName] = useState("");
  const [editUnitType, setEditUnitType] = useState("");
  const [editUnitLocation, setEditUnitLocation] = useState("");
  const [totalHexes, setTotalHexes] = useState(0);
  // For vehicle transfer UI
  const [transferTargetFleetId, setTransferTargetFleetId] = useState(null);
  const [transferAmounts, setTransferAmounts] = useState({});
  const [inputAmountsSource, setInputAmountsSource] = useState({});
  const [inputAmountsDest, setInputAmountsDest] = useState({});
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [units, setUnits] = useState([]);
  const [vehicleAssets, setVehicleAssets] = useState({});
  const [availableWorlds, setAvailableWorlds] = useState([]);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showVehiclesOverviewModal, setShowVehiclesOverviewModal] =
    useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [allVehicles, setAllVehicles] = useState([]);
  const [showTacticalMap, setShowTacticalMap] = useState(false);
  const [nationInfo, setNationInfo] = useState({
    name: nationName,
    territory: 0,
    population: 0,
    controlledWorlds: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load faction data from Discord bot database
  useEffect(() => {
    const loadFactionData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Debug: Test Firebase connection
        console.log("🚀 Testing Discord bot database connection...");
        await databaseService.debugConnection();

        // Get faction data from Discord bot database
        const factionData = await databaseService.getFactionInfo(
          "The Solar Wars",
          nationName
        );

        if (factionData) {
          // Update nation info
          setNationInfo({
            name: factionData.name,
            territory: factionData.territory,
            population: factionData.population,
            controlledWorlds: factionData.controlledWorlds || 0,
          });

          // Calculate total hexes (sum all Hexes from all worlds in maps)
          const maps = factionData.maps || {};
          const totalHexesCount = Object.values(maps).reduce((sum, info) => {
            // info can be a number (old format) or object (new format)
            if (
              typeof info === "object" &&
              info !== null &&
              typeof info.Hexes === "number"
            ) {
              return sum + info.Hexes;
            } else if (typeof info === "number") {
              return sum + info;
            }
            return sum;
          }, 0);
          setTotalHexes(totalHexesCount);

          // Convert Discord bot fleets to UI format
          const convertedUnits = databaseService.convertFleetsToUnits(
            factionData.fleets,
            factionData.vehicles
          );
          setUnits(convertedUnits);

          // Store all vehicles for modal details
          setAllVehicles(factionData.vehicles);

          // Calculate vehicle totals from fleets
          const totals = databaseService.calculateVehicleTotalsFromFleets(
            factionData.fleets,
            factionData.vehicles
          );
          setVehicleAssets(totals);

          // Get available worlds
          const worlds = await databaseService.getAvailableWorlds(
            "The Solar Wars"
          );
          setAvailableWorlds(worlds);
        } else {
          // Faction doesn't exist, show placeholder data
          setError(`Nation "${nationName}" not found in database`);
          setUnits([]);
          setVehicleAssets({
            fighters: 0,
            cruisers: 0,
            battleships: 0,
            destroyers: 0,
            carriers: 0,
            scouts: 0,
          });
        }
      } catch (err) {
        console.error("Error loading faction data:", err);
        setError("Failed to connect to Discord bot database");
        // Keep placeholder data for now
        setUnits(placeholderUnits);
        setVehicleAssets(placeholderVehicleAssets);
      } finally {
        setLoading(false);
      }
    };

    loadFactionData();
  }, [nationName]);

  // Placeholder data for when database is not available
  const placeholderUnits = [
    {
      id: 1,
      name: "1st Solar Fleet",
      ships: 45,
      status: "Patrol",
      location: "Mars Orbit",
      commander: "Admiral Chen",
      readiness: 95,
    },
    {
      id: 2,
      name: "Defense Squadron",
      ships: 23,
      status: "Active",
      location: "Earth Orbit",
      commander: "Captain Rodriguez",
      readiness: 88,
    },
  ];

  const placeholderVehicleAssets = {
    fighters: 234,
    cruisers: 67,
    battleships: 12,
    destroyers: 89,
    carriers: 8,
    scouts: 156,
  };

  // Placeholder maps for hex calculation (simulate EconomicMap logic)
  const placeholderMaps = {
    Mars: { Hexes: 12 },
    Earth: { Hexes: 8 },
    Venus: { Hexes: 5 },
    Jupiter: { Hexes: 0 },
  };

  useEffect(() => {
    if (!dbLoaded) {
      // Calculate total hexes from placeholderMaps
      const totalHexesCount = Object.values(placeholderMaps).reduce(
        (sum, info) => {
          if (
            typeof info === "object" &&
            info !== null &&
            typeof info.Hexes === "number"
          ) {
            return sum + info.Hexes;
          } else if (typeof info === "number") {
            return sum + info;
          }
          return sum;
        },
        0
      );
      setTotalHexes(totalHexesCount);
    }
  }, [dbLoaded]);

  const openUnitModal = (unit) => {
    setEditUnitName(unit.name || "");
    setEditUnitType(unit.type || "Space");
    setEditUnitLocation(unit.location || "");
    setSelectedUnit(unit);
    // Reset transfer state when opening modal
    setTransferTargetFleetId(null);
    setTransferAmounts({});
    setInputAmountsSource({});
    setInputAmountsDest({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUnit(null);
  };

  const createNewUnit = async () => {
    try {
      // Get current fleets from database
      const currentFleets = await databaseService.getFleets(
        "The Solar Wars",
        nationName
      );

      // Create new fleet in Discord bot format
      const newFleet = {
        ID: currentFleets.length,
        Name: `Fleet ${currentFleets.length}`,
        Type: "Space",
        Vehicles: [], // Empty fleet to start
        Value: {
          CM: 0,
          CS: 0,
          EL: 0,
          ER: 0,
        },
        State: {
          Action: "Defense",
          Location: "Earth",
        },
        CSCost: 0,
      };

      // Add to fleets array
      const updatedFleets = [...currentFleets, newFleet];

      // Update database
      const success = await databaseService.updateFleets(
        "The Solar Wars",
        nationName,
        updatedFleets
      );

      if (success) {
        // Add to local state
        const newUnit = {
          id: newFleet.ID,
          name: newFleet.Name,
          ships: 0,
          status: "Active",
          state: "Defense",
          location: newFleet.State.Location,
          type: newFleet.Type,
          vehicleLabel: "Vehicles",
          commander: `Commander ${newFleet.ID}`,
          readiness: 100,
        };
        setUnits((prev) => [...prev, newUnit]);

        // Reload database data to refresh everything else
        const factionData = await databaseService.getFactionInfo(
          "The Solar Wars",
          nationName
        );
        if (factionData) {
          const convertedUnits = databaseService.convertFleetsToUnits(
            factionData.fleets,
            factionData.vehicles
          );
          setUnits(convertedUnits);

          const totals = databaseService.calculateVehicleTotalsFromFleets(
            factionData.fleets,
            factionData.vehicles
          );
          setVehicleAssets(totals);
        }

        console.log("New fleet created successfully");
      } else {
        console.error("Failed to create new fleet");
      }
    } catch (error) {
      console.error("Error creating new unit:", error);
    }
  };

  const openMap = () => {
    // TODO: Implement map functionality
    console.log("Opening tactical map...");
  };

  const openVehicleModal = (vehicleName) => {
    const vehicleDetails = databaseService.getVehicleDetailsByName(
      vehicleName,
      allVehicles
    );
    if (vehicleDetails) {
      setSelectedVehicle(vehicleDetails);
      setShowVehicleModal(true);
    } else {
      alert(`No details found for vehicle: ${vehicleName}`);
    }
  };

  const closeVehicleModal = () => {
    setShowVehicleModal(false);
    setSelectedVehicle(null);
  };

  // Save changes to unit (name, type, location)
  const handleSaveUnitEdit = async () => {
    if (!selectedUnit) return;
    try {
      // Find the fleet in the database
      const fleets = await databaseService.getFleets(
        "The Solar Wars",
        nationName
      );
      const fleetIndex = fleets.findIndex((f) => f.ID === selectedUnit.id);
      if (fleetIndex === -1) return;

      // Update fleet properties
      fleets[fleetIndex].Name = editUnitName;
      fleets[fleetIndex].Type = editUnitType;
      fleets[fleetIndex].State = {
        ...fleets[fleetIndex].State,
        Location: editUnitLocation || fleets[fleetIndex].State.Location,
      };

      // If transferTargetFleetId is set, perform vehicle transfer
      if (transferTargetFleetId && Object.keys(transferAmounts).length > 0) {
        const targetFleetIndex = fleets.findIndex(
          (f) => f.ID === transferTargetFleetId
        );
        if (targetFleetIndex !== -1) {
          // Initialize fleet values if not present
          if (!fleets[fleetIndex].Value) {
            fleets[fleetIndex].Value = { CM: 0, CS: 0, EL: 0, ER: 0 };
          }
          if (!fleets[targetFleetIndex].Value) {
            fleets[targetFleetIndex].Value = { CM: 0, CS: 0, EL: 0, ER: 0 };
          }
          if (!fleets[fleetIndex].CSCost) {
            fleets[fleetIndex].CSCost = 0;
          }
          if (!fleets[targetFleetIndex].CSCost) {
            fleets[targetFleetIndex].CSCost = 0;
          }

          // For each vehicle type, move the specified amount
          Object.entries(transferAmounts).forEach(([vehicleName, amount]) => {
            if (amount <= 0) return; // Skip if no transfer

            // Find vehicle by name in allVehicles to get ID and cost data
            const vehicleData = allVehicles.find((v) => v.name === vehicleName);
            if (!vehicleData) return;

            // Calculate value and CS cost for the transferred vehicles
            const vehicleValue = {
              CM: (vehicleData.cost?.CM || 0) * amount,
              CS: (vehicleData.cost?.CS || 0) * amount,
              EL: (vehicleData.cost?.EL || 0) * amount,
              ER: (vehicleData.cost?.ER || 0) * amount,
            };
            const vehicleCSCost = Math.floor(
              ((vehicleData.cost?.CS || 0) * amount) / 6
            );

            // Remove from source fleet
            const sourceVehicle = fleets[fleetIndex].Vehicles.find(
              (v) => v.ID === vehicleData.ID
            );
            if (sourceVehicle && sourceVehicle.count >= amount) {
              sourceVehicle.count -= amount;

              // Remove value from source fleet
              fleets[fleetIndex].Value.CM -= vehicleValue.CM;
              fleets[fleetIndex].Value.CS -= vehicleValue.CS;
              fleets[fleetIndex].Value.EL -= vehicleValue.EL;
              fleets[fleetIndex].Value.ER -= vehicleValue.ER;
              fleets[fleetIndex].CSCost -= vehicleCSCost;

              // Remove vehicle entry if count becomes 0
              if (sourceVehicle.count === 0) {
                fleets[fleetIndex].Vehicles = fleets[
                  fleetIndex
                ].Vehicles.filter((v) => v.ID !== vehicleData.ID);
              }
            }

            // Add to target fleet
            let targetVehicle = fleets[targetFleetIndex].Vehicles.find(
              (v) => v.ID === vehicleData.ID
            );
            if (!targetVehicle) {
              // If not present, add new vehicle entry
              targetVehicle = { ID: vehicleData.ID, count: 0 };
              fleets[targetFleetIndex].Vehicles.push(targetVehicle);
            }
            targetVehicle.count += amount;

            // Add value to target fleet
            fleets[targetFleetIndex].Value.CM += vehicleValue.CM;
            fleets[targetFleetIndex].Value.CS += vehicleValue.CS;
            fleets[targetFleetIndex].Value.EL += vehicleValue.EL;
            fleets[targetFleetIndex].Value.ER += vehicleValue.ER;
            fleets[targetFleetIndex].CSCost += vehicleCSCost;
          });
        }
      }
      // Write to database
      await databaseService.updateFleets("The Solar Wars", nationName, fleets);

      // Reset transfer state
      setTransferTargetFleetId(null);
      setTransferAmounts({});

      // Reload faction data to refresh all fleet information
      const factionData = await databaseService.getFactionInfo(
        "The Solar Wars",
        nationName
      );
      if (factionData) {
        const convertedUnits = databaseService.convertFleetsToUnits(
          factionData.fleets,
          factionData.vehicles
        );
        setUnits(convertedUnits);

        const totals = databaseService.calculateVehicleTotalsFromFleets(
          factionData.fleets,
          factionData.vehicles
        );
        setVehicleAssets(totals);
      }

      setShowEditModal(false);
      console.log("Unit changes saved successfully");
    } catch (err) {
      console.error("Failed to save unit changes:", err);
    }
  };

  // Move unit to a new location
  const handleMoveUnit = async (world) => {
    if (!selectedUnit) return;
    try {
      // Find the fleet in the database
      const fleets = await databaseService.getFleets(
        "The Solar Wars",
        nationName
      );
      const fleetIndex = fleets.findIndex((f) => f.ID === selectedUnit.id);
      if (fleetIndex === -1) return;

      // Update fleet location
      fleets[fleetIndex].State = {
        ...fleets[fleetIndex].State,
        Location: world,
      };

      // Write to database
      await databaseService.updateFleets("The Solar Wars", nationName, fleets);

      // Update local state
      setUnits((prev) =>
        prev.map((u) =>
          u.id === selectedUnit.id ? { ...u, location: world } : u
        )
      );
      setShowMoveModal(false);
      console.log(`Fleet ${selectedUnit.name} moved to ${world} successfully`);
    } catch (err) {
      console.error("Failed to move unit:", err);
    }
  };

  // Update unit action (Defense, Attack, Patrol, Idle)
  const handleUpdateAction = async (action) => {
    if (!selectedUnit) return;
    try {
      const fleets = await databaseService.getFleets(
        "The Solar Wars",
        nationName
      );
      const fleetIndex = fleets.findIndex((f) => f.ID === selectedUnit.id);
      if (fleetIndex === -1) return;

      // Map 'Activate' to 'Idle', 'Attack' to 'Battle'
      let mappedAction = action;
      if (action === "Activate") mappedAction = "Idle";
      if (action === "Attack") mappedAction = "Battle";

      fleets[fleetIndex].State = {
        ...fleets[fleetIndex].State,
        Action: mappedAction,
      };

      await databaseService.updateFleets("The Solar Wars", nationName, fleets);

      setUnits((prev) =>
        prev.map((u) =>
          u.id === selectedUnit.id
            ? { ...u, state: mappedAction, status: mappedAction }
            : u
        )
      );
      setShowModal(false); // <-- Close the modal after action
      console.log(`Fleet ${selectedUnit.name} action set to ${mappedAction}`);
    } catch (err) {
      console.error("Failed to update unit action:", err);
    }
  };

  // Update unit status (Active, Mothballed)
  const handleUpdateStatus = async (status) => {
    if (!selectedUnit) return;
    try {
      const fleets = await databaseService.getFleets(
        "The Solar Wars",
        nationName
      );
      const fleetIndex = fleets.findIndex((f) => f.ID === selectedUnit.id);
      if (fleetIndex === -1) return;

      fleets[fleetIndex].Status = status;

      await databaseService.updateFleets("The Solar Wars", nationName, fleets);

      setUnits((prev) =>
        prev.map((u) =>
          u.id === selectedUnit.id ? { ...u, status: status } : u
        )
      );
      console.log(`Fleet ${selectedUnit.name} status set to ${status}`);
    } catch (err) {
      console.error("Failed to update unit status:", err);
    }
  };

  const openVehiclesOverviewModal = () => {
    setShowVehiclesOverviewModal(true);
  };

  const closeVehiclesOverviewModal = () => {
    setShowVehiclesOverviewModal(false);
  };

  const openTacticalMap = () => {
    setShowTacticalMap(true);
  };

  const closeTacticalMap = () => {
    setShowTacticalMap(false);
  };

  // Mobile responsive helper
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  return (
    <div className="armed-forces">
      <StarField density={120} />
      <div className="armed-forces-container">
        <div className="header-section">
          <button className="back-button" onClick={onBack}>
            ← Back to Homepage
          </button>
        </div>
        <p className="center-subtitle">
          {nationInfo.name.charAt(0).toUpperCase() + nationInfo.name.slice(1)}{" "}
          Military Operations
        </p>

        {error && (
          <div
            className="error-message"
            style={{
              background: "rgba(244, 67, 54, 0.2)",
              border: "1px solid #f44336",
              borderRadius: "8px",
              padding: "15px",
              margin: "20px 0",
              color: "#f44336",
              textAlign: "center",
            }}
          >
            {error}
            <br />
            <small>Showing placeholder data for demonstration</small>
          </div>
        )}

        <div className="armed-forces-content">
          <div className="left-sidebar">
            <div className="sidebar-card">
              <h4>Nation Info</h4>
              <div className="nation-info">
                <div className="info-item">
                  <span className="info-label">Nation:</span>
                  <span className="info-value">
                    {loading
                      ? "Loading..."
                      : nationInfo.name.charAt(0).toUpperCase() +
                        nationInfo.name.slice(1)}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Population:</span>
                  <span className="info-value">
                    {loading
                      ? "Loading..."
                      : nationInfo.population.toLocaleString()}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Total Hexes:</span>
                  <span className="info-value">
                    {loading
                      ? "Loading..."
                      : typeof totalHexes === "number"
                      ? totalHexes.toLocaleString()
                      : totalHexes || "0"}
                  </span>
                </div>
              </div>
            </div>

            <div className="sidebar-card" style={{ marginTop: "15px" }}>
              <button
                className="tactical-map-btn"
                onClick={openTacticalMap}
                disabled={loading}
                style={{
                  width: "100%",
                  background: "linear-gradient(45deg, #00f5ff, #ff6b6b)",
                  border: "none",
                  borderRadius: "10px",
                  padding: "15px",
                  color: "white",
                  fontSize: "16px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  textShadow: "0 1px 2px rgba(0, 0, 0, 0.5)",
                  boxShadow: "0 4px 15px rgba(0, 245, 255, 0.3)",
                }}
              >
                Tactical Map
              </button>
            </div>
          </div>

          <div className="center-grid">
            <div className="center-card">
              <h3>Unit Status</h3>
              <div className="units-scroll-container">
                {loading ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "40px",
                      color: "#666",
                    }}
                  >
                    Loading fleet data from Discord bot database...
                  </div>
                ) : units.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "40px",
                      color: "#666",
                    }}
                  >
                    No fleets found. Create your first fleet to get started.
                  </div>
                ) : (
                  units.map((unit) => (
                    <button
                      key={unit.id}
                      className="unit-button"
                      onClick={() => openUnitModal(unit)}
                    >
                      <div className="unit-header">
                        <h4>{unit.name}</h4>
                        <span
                          className={`unit-status ${unit.state.toLowerCase()}`}
                        >
                          {unit.state}
                        </span>
                      </div>
                      <div className="unit-details">
                        <span>
                          {unit.vehicleLabel}:{" "}
                          {(() => {
                            // If fleet is in Attack mode, reveal stealth ships
                            if (
                              unit.state === "Attack" &&
                              unit.vehicles &&
                              allVehicles.length > 0
                            ) {
                              // Count all vehicles, including stealth
                              return unit.vehicles.reduce(
                                (sum, v) => sum + v.count,
                                0
                              );
                            } else if (
                              unit.vehicles &&
                              allVehicles.length > 0
                            ) {
                              // Hide stealth ships unless in Attack mode
                              return unit.vehicles.reduce((sum, v) => {
                                const vehicleData = allVehicles.find(
                                  (av) => av.ID === v.ID
                                );
                                const isStealth =
                                  vehicleData?.stealth ||
                                  vehicleData?.data?.stealth;
                                return isStealth ? sum : sum + v.count;
                              }, 0);
                            } else {
                              // Fallback
                              return unit.ships;
                            }
                          })()}
                        </span>
                      </div>
                      <p className="unit-location">{unit.location}</p>
                    </button>
                  ))
                )}
              </div>
              <button
                className="create-unit-btn"
                onClick={createNewUnit}
                disabled={loading}
              >
                {loading ? "Loading..." : "+ Create New Unit"}
              </button>
            </div>
          </div>

          <div className="right-sidebar">
            <div className="center-card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "15px",
                }}
              >
                <h3>Vehicles by Class</h3>
              </div>
              <div className="vehicles-scroll-container">
                {Object.keys(vehicleAssets).length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "20px",
                      color: "#666",
                    }}
                  >
                    No vehicles found
                  </div>
                ) : (
                  Object.entries(vehicleAssets).map(([vehicleName, count]) => (
                    <div
                      key={vehicleName}
                      className="vehicle-asset-item clickable"
                      onClick={() => openVehicleModal(vehicleName)}
                    >
                      <span>{vehicleName}</span>
                      <span className="asset-value">{count}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Unit Control Modal */}
        {showModal && selectedUnit && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="unit-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{selectedUnit.name}</h2>
                <button className="close-btn" onClick={closeModal}>
                  ✕
                </button>
              </div>
              <div className="modal-content">
                <div className="unit-info-grid">
                  <div className="info-section">
                    <h4>Unit Details</h4>
                    <p>
                      <strong>{selectedUnit.vehicleLabel}:</strong>{" "}
                      {selectedUnit.ships}
                    </p>
                    <p>
                      <strong>Location:</strong> {selectedUnit.location}
                    </p>
                    <p>
                      <strong>Status:</strong> {selectedUnit.status}
                    </p>
                    <p>
                      <strong>State:</strong> {selectedUnit.state}
                    </p>
                    <p>
                      <strong>Type:</strong> {selectedUnit.type}
                    </p>
                    {selectedUnit.value &&
                      selectedUnit.value !== "No additional info" && (
                        <div style={{ marginTop: "8px" }}>
                          <strong>Value:</strong>
                          <div style={{ marginLeft: "10px" }}>
                            {(() => {
                              function formatCurrency(val) {
                                if (typeof val === "number") {
                                  return val
                                    .toString()
                                    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
                                }
                                if (
                                  typeof val === "string" &&
                                  /^\d+$/.test(val)
                                ) {
                                  return val.replace(
                                    /\B(?=(\d{3})+(?!\d))/g,
                                    " "
                                  );
                                }
                                return val;
                              }
                              try {
                                const valueObj = JSON.parse(selectedUnit.value);
                                return Object.entries(valueObj).map(
                                  ([key, val]) => (
                                    <div key={key}>
                                      {key}: {formatCurrency(val)}
                                    </div>
                                  )
                                );
                              } catch {
                                return <div>{selectedUnit.value}</div>;
                              }
                            })()}
                          </div>
                        </div>
                      )}
                  </div>
                  <div className="controls-section">
                    <h4>Unit Commands</h4>
                    <button
                      className="command-btn move"
                      onClick={() => setShowMoveModal(true)}
                    >
                      Move Unit
                    </button>
                    {selectedUnit.status === "Mothballed" && (
                      <button
                        className="command-btn activate"
                        onClick={() => handleUpdateAction("Activate")}
                      >
                        Activate
                      </button>
                    )}
                    <button
                      className="command-btn mothball"
                      disabled={selectedUnit.status === "Mothballed"}
                      onClick={() => handleUpdateStatus("Mothballed")}
                    >
                      Mothball
                    </button>
                    <button
                      className="command-btn defense"
                      onClick={() => handleUpdateAction("Defense")}
                    >
                      Defense
                    </button>
                    <button
                      className="command-btn battle"
                      onClick={() => handleUpdateAction("Battle")}
                    >
                      Battle
                    </button>
                    <button
                      className="command-btn patrol"
                      onClick={() => handleUpdateAction("Patrol")}
                    >
                      Patrol
                    </button>
                    <button
                      className="command-btn idle"
                      onClick={() => handleUpdateAction("Idle")}
                    >
                      Idle
                    </button>
                  </div>
                </div>
                <div className="modal-actions">
                  <button
                    className="edit-btn"
                    onClick={() => setShowEditModal(true)}
                  >
                    Edit Unit
                  </button>
                  <button
                    className="delete-btn"
                    onClick={async () => {
                      if (!selectedUnit) return;
                      try {
                        // Get fleets from database
                        const fleets = await databaseService.getFleets(
                          "The Solar Wars",
                          nationName
                        );
                        // Remove the selected fleet
                        const updatedFleets = fleets.filter(
                          (f) => f.ID !== selectedUnit.id
                        );
                        await databaseService.updateFleets(
                          "The Solar Wars",
                          nationName,
                          updatedFleets
                        );
                        // Update local state
                        setUnits((prev) =>
                          prev.filter((u) => u.id !== selectedUnit.id)
                        );
                        setShowModal(false);
                        setSelectedUnit(null);
                        console.log(
                          `Fleet ${selectedUnit.name} disbanded successfully`
                        );
                      } catch (err) {
                        console.error("Failed to disband unit:", err);
                      }
                    }}
                  >
                    Disband Unit
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Move Unit Modal */}
        {showMoveModal && selectedUnit && (
          <div
            className="modal-overlay"
            onClick={() => setShowMoveModal(false)}
          >
            <div className="move-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Move {selectedUnit.name}</h3>
                <button
                  className="close-btn"
                  onClick={() => setShowMoveModal(false)}
                >
                  ✕
                </button>
              </div>
              <div className="modal-content">
                <h4>Select Destination World:</h4>
                <div className="worlds-list">
                  {availableWorlds.map((world) => (
                    <button
                      key={world}
                      className="world-btn"
                      onClick={() => handleMoveUnit(world)}
                    >
                      {world}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Unit Modal */}
        {showEditModal && selectedUnit && (
          <div
            className="modal-overlay"
            onClick={() => setShowEditModal(false)}
          >
            <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Edit {selectedUnit.name}</h3>
                <button
                  className="close-btn"
                  onClick={() => setShowEditModal(false)}
                >
                  ✕
                </button>
              </div>
              <div className="modal-content">
                <div className="edit-section">
                  <h4>Unit Name</h4>
                  <input
                    type="text"
                    className="unit-name-input"
                    value={editUnitName}
                    onChange={(e) => setEditUnitName(e.target.value)}
                    placeholder="Enter unit name"
                  />
                </div>
                <div className="edit-section">
                  <h4>Unit Type</h4>
                  <select
                    className="unit-type-select"
                    value={editUnitType}
                    onChange={(e) => setEditUnitType(e.target.value)}
                  >
                    <option value="Space">Space</option>
                    <option value="Ground">Ground</option>
                  </select>
                </div>

                <div className="edit-section">
                  <h4>Transfer Vehicles</h4>
                  <p>
                    Select destination fleet and move vehicles between fleets.
                  </p>
                  <div
                    className="vehicle-transfer-ui"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "16px",
                    }}
                  >
                    <div style={{ minWidth: "200px" }}>
                      <strong>Destination Fleet:</strong>
                      <select
                        value={transferTargetFleetId || ""}
                        onChange={(e) => {
                          setTransferTargetFleetId(Number(e.target.value));
                          setTransferAmounts({}); // Reset transfer amounts when changing fleet
                          setInputAmountsSource({});
                          setInputAmountsDest({});
                        }}
                        style={{
                          width: "100%",
                          marginTop: "8px",
                          padding: "6px",
                          borderRadius: "4px",
                          border: "1px solid #444",
                        }}
                      >
                        <option value="">Select destination fleet...</option>
                        {units
                          .filter((u) => u.id !== selectedUnit.id)
                          .map((fleet) => (
                            <option key={fleet.id} value={fleet.id}>
                              {fleet.name} ({fleet.ships} vehicles)
                            </option>
                          ))}
                      </select>
                    </div>
                    {transferTargetFleetId &&
                      selectedUnit.vehicles &&
                      selectedUnit.vehicles.length > 0 && (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "24px",
                            border: "1px solid #444",
                            borderRadius: "8px",
                            padding: "16px",
                            background: "rgba(0,0,0,0.2)",
                          }}
                        >
                          {/* Source fleet vehicles */}
                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                fontWeight: "bold",
                                marginBottom: "12px",
                                textAlign: "center",
                                borderBottom: "1px solid #444",
                                paddingBottom: "8px",
                                background: "rgba(0, 123, 255, 0.1)",
                                padding: "8px",
                                borderRadius: "4px",
                              }}
                            >
                              Source: {selectedUnit.name}
                            </div>
                            {selectedUnit.vehicles.map((vehicle) => {
                              // Get vehicle name from allVehicles database
                              const vehicleData = allVehicles.find(
                                (v) => v.ID === vehicle.ID
                              );
                              const vehicleName =
                                vehicleData?.name || `Vehicle ${vehicle.ID}`;
                              const currentCount =
                                vehicle.count -
                                (transferAmounts[vehicleName] || 0);
                              const inputAmount =
                                inputAmountsSource[vehicleName] || 1;
                              return (
                                <div
                                  key={vehicle.ID}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    margin: "8px 0",
                                    padding: "6px",
                                    background: "rgba(255,255,255,0.05)",
                                    borderRadius: "4px",
                                  }}
                                >
                                  <span style={{ flex: 1 }}>{vehicleName}</span>
                                  <span
                                    style={{
                                      minWidth: "40px",
                                      textAlign: "center",
                                      fontWeight: "bold",
                                      color:
                                        currentCount <= 0 ? "#666" : "#fff",
                                    }}
                                  >
                                    {currentCount}
                                  </span>
                                  <input
                                    type="number"
                                    min={1}
                                    max={currentCount}
                                    value={inputAmount}
                                    onChange={(e) => {
                                      let val = Number(e.target.value);
                                      if (isNaN(val) || val < 1) val = 1;
                                      if (val > currentCount)
                                        val = currentCount;
                                      setInputAmountsSource((prev) => ({
                                        ...prev,
                                        [vehicleName]: val,
                                      }));
                                    }}
                                    style={{
                                      width: "50px",
                                      marginLeft: "8px",
                                      padding: "2px 6px",
                                      borderRadius: "4px",
                                      border: "1px solid #888",
                                      background: "#222",
                                      color: "#fff",
                                    }}
                                  />
                                  <button
                                    disabled={currentCount <= 0}
                                    onClick={() => {
                                      setTransferAmounts((prev) => ({
                                        ...prev,
                                        [vehicleName]:
                                          (prev[vehicleName] || 0) +
                                          inputAmount,
                                      }));
                                    }}
                                    style={{
                                      marginLeft: "8px",
                                      padding: "4px 8px",
                                      background:
                                        currentCount > 0 ? "#4CAF50" : "#666",
                                      border: "none",
                                      borderRadius: "4px",
                                      color: "white",
                                      cursor:
                                        currentCount > 0
                                          ? "pointer"
                                          : "not-allowed",
                                    }}
                                  >
                                    →
                                  </button>
                                </div>
                              );
                            })}
                          </div>

                          {/* Transfer summary */}
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "center",
                              gap: "8px",
                              padding: "12px",
                              background: "rgba(255, 193, 7, 0.1)",
                              border: "1px solid rgba(255, 193, 7, 0.3)",
                              borderRadius: "8px",
                              minHeight: "50px",
                            }}
                          >
                            {Object.entries(transferAmounts).some(
                              ([, amount]) => amount > 0
                            ) ? (
                              <>
                                <div
                                  style={{
                                    width: "100%",
                                    textAlign: "center",
                                    fontWeight: "bold",
                                    marginBottom: "8px",
                                  }}
                                >
                                  Transferring:
                                </div>
                                {Object.entries(transferAmounts).map(
                                  ([vehicleName, amount]) =>
                                    amount > 0 && (
                                      <div
                                        key={vehicleName}
                                        style={{
                                          background: "rgba(255, 193, 7, 0.3)",
                                          padding: "4px 8px",
                                          borderRadius: "4px",
                                          fontSize: "14px",
                                          fontWeight: "bold",
                                        }}
                                      >
                                        {amount}x {vehicleName}
                                      </div>
                                    )
                                )}
                              </>
                            ) : (
                              <div
                                style={{
                                  color: "#666",
                                  fontSize: "14px",
                                  textAlign: "center",
                                  width: "100%",
                                }}
                              >
                                No transfers pending
                              </div>
                            )}
                          </div>

                          {/* Destination fleet vehicles */}
                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                fontWeight: "bold",
                                marginBottom: "12px",
                                textAlign: "center",
                                borderBottom: "1px solid #444",
                                paddingBottom: "8px",
                                background: "rgba(76, 175, 80, 0.1)",
                                padding: "8px",
                                borderRadius: "4px",
                              }}
                            >
                              Destination:{" "}
                              {units.find((u) => u.id === transferTargetFleetId)
                                ?.name || "Unknown Fleet"}
                            </div>
                            {(() => {
                              const destFleet = units.find(
                                (u) => u.id === transferTargetFleetId
                              );
                              // Get all vehicle names from source fleet for combined display
                              const sourceVehicleNames =
                                selectedUnit.vehicles.map((v) => {
                                  const vehicleData = allVehicles.find(
                                    (vd) => vd.ID === v.ID
                                  );
                                  return vehicleData?.name || `Vehicle ${v.ID}`;
                                });

                              // Create a combined list of all vehicle types that exist in either fleet
                              const destVehicleNames =
                                destFleet?.vehicles?.map((v) => {
                                  const vehicleData = allVehicles.find(
                                    (vd) => vd.ID === v.ID
                                  );
                                  return vehicleData?.name || `Vehicle ${v.ID}`;
                                }) || [];

                              const allVehicleTypes = new Set([
                                ...sourceVehicleNames,
                                ...destVehicleNames,
                              ]);

                              return Array.from(allVehicleTypes).map(
                                (vehicleName) => {
                                  const destVehicle = destFleet?.vehicles?.find(
                                    (v) => {
                                      const vehicleData = allVehicles.find(
                                        (vd) => vd.ID === v.ID
                                      );
                                      return (
                                        (vehicleData?.name ||
                                          `Vehicle ${v.ID}`) === vehicleName
                                      );
                                    }
                                  );
                                  const currentCount =
                                    (destVehicle?.count || 0) +
                                    (transferAmounts[vehicleName] || 0);
                                  const isReceiving =
                                    (transferAmounts[vehicleName] || 0) > 0;
                                  const maxRemove =
                                    transferAmounts[vehicleName] || 0;
                                  const inputAmount =
                                    inputAmountsDest[vehicleName] || 1;
                                  return (
                                    <div
                                      key={vehicleName}
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        margin: "8px 0",
                                        padding: "6px",
                                        background: isReceiving
                                          ? "rgba(76, 175, 80, 0.1)"
                                          : "rgba(255,255,255,0.05)",
                                        borderRadius: "4px",
                                      }}
                                    >
                                      <button
                                        disabled={maxRemove <= 0}
                                        onClick={() => {
                                          setTransferAmounts((prev) => ({
                                            ...prev,
                                            [vehicleName]: Math.max(
                                              0,
                                              (prev[vehicleName] || 0) -
                                                inputAmount
                                            ),
                                          }));
                                        }}
                                        style={{
                                          marginRight: "8px",
                                          padding: "4px 8px",
                                          background:
                                            maxRemove > 0 ? "#f44336" : "#666",
                                          border: "none",
                                          borderRadius: "4px",
                                          color: "white",
                                          cursor:
                                            maxRemove > 0
                                              ? "pointer"
                                              : "not-allowed",
                                        }}
                                      >
                                        ←
                                      </button>
                                      <input
                                        type="number"
                                        min={1}
                                        max={maxRemove}
                                        value={inputAmount}
                                        onChange={(e) => {
                                          let val = Number(e.target.value);
                                          if (isNaN(val) || val < 1) val = 1;
                                          if (val > maxRemove) val = maxRemove;
                                          setInputAmountsDest((prev) => ({
                                            ...prev,
                                            [vehicleName]: val,
                                          }));
                                        }}
                                        style={{
                                          width: "50px",
                                          marginRight: "8px",
                                          padding: "2px 6px",
                                          borderRadius: "4px",
                                          border: "1px solid #888",
                                          background: "#222",
                                          color: "#fff",
                                        }}
                                      />
                                      <span
                                        style={{
                                          minWidth: "40px",
                                          textAlign: "center",
                                          fontWeight: "bold",
                                          color: isReceiving
                                            ? "#4CAF50"
                                            : "#fff",
                                        }}
                                      >
                                        {currentCount}
                                      </span>
                                      <span
                                        style={{ flex: 1, textAlign: "right" }}
                                      >
                                        {vehicleName}
                                      </span>
                                    </div>
                                  );
                                }
                              );
                            })()}
                          </div>
                        </div>
                      )}
                    {transferTargetFleetId &&
                      (!selectedUnit.vehicles ||
                        selectedUnit.vehicles.length === 0) && (
                        <div
                          style={{
                            textAlign: "center",
                            padding: "20px",
                            color: "#666",
                            border: "1px dashed #444",
                            borderRadius: "8px",
                          }}
                        >
                          This fleet has no vehicles to transfer
                        </div>
                      )}
                  </div>
                </div>
                <div className="modal-actions">
                  <button className="save-btn" onClick={handleSaveUnitEdit}>
                    Save Changes
                  </button>
                  <button
                    className="cancel-btn"
                    onClick={() => setShowEditModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Vehicle Detail Modal */}
        {showVehicleModal && selectedVehicle && (
          <div className="modal-overlay" onClick={closeVehicleModal}>
            <div className="unit-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{selectedVehicle.name || "Vehicle Details"}</h2>
                <button className="close-btn" onClick={closeVehicleModal}>
                  ✕
                </button>
              </div>
              <div className="modal-content">
                {Object.keys(selectedVehicle).length === 0 ? (
                  <div
                    style={{
                      padding: "24px",
                      textAlign: "center",
                      color: "#f44336",
                    }}
                  >
                    No details available for this vehicle.
                  </div>
                ) : (
                  <div className="vehicle-info-grid">
                    <div className="info-section">
                      <h4>Cost Information</h4>
                      {selectedVehicle.cost && (
                        <div>
                          {Object.entries(selectedVehicle.cost).map(
                            ([key, val]) => (
                              <p key={key}>
                                <strong>{key}:</strong>{" "}
                                {typeof val === "number"
                                  ? val
                                      .toString()
                                      .replace(/\B(?=(\d{3})+(?!\d))/g, " ")
                                  : typeof val === "string"
                                  ? val
                                  : Array.isArray(val)
                                  ? val.join(", ")
                                  : typeof val === "object" && val !== null
                                  ? JSON.stringify(val)
                                  : String(val)}
                              </p>
                            )
                          )}
                        </div>
                      )}
                    </div>
                    <div className="info-section">
                      <h4>Technical Data</h4>
                      {selectedVehicle.data && (
                        <div>
                          {Object.entries(selectedVehicle.data).map(
                            ([key, val]) => (
                              <p key={key}>
                                <strong>{key}:</strong>{" "}
                                {typeof val === "number"
                                  ? val
                                      .toString()
                                      .replace(/\B(?=(\d{3})+(?!\d))/g, " ")
                                  : typeof val === "string"
                                  ? val
                                  : Array.isArray(val)
                                  ? val.join(", ")
                                  : typeof val === "object" && val !== null
                                  ? JSON.stringify(val)
                                  : String(val)}
                              </p>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tactical Map Modal */}
      {showTacticalMap && (
        <TacticalMap
          onClose={closeTacticalMap}
          currentFaction={nationName}
          dbLoaded={dbLoaded}
        />
      )}
    </div>
  );
};

export default ArmedForces;
