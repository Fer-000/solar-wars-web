import React, { useState, useEffect } from "react";
import StarField from "./StarField";
import TacticalMap from "./TacticalMap";
import databaseService from "../services/database";
import "./CenterPage.css";
import "./ArmedForces.css";

const ArmedForces = ({ onBack, nationName = "athena" }) => {
  const [editUnitName, setEditUnitName] = useState("");
  const [editUnitType, setEditUnitType] = useState("");
  const [editUnitLocation, setEditUnitLocation] = useState("");
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

  const openUnitModal = (unit) => {
    setEditUnitName(unit.name || "");
    setEditUnitType(unit.type || "Space");
    setEditUnitLocation(unit.location || "");
    setSelectedUnit(unit);
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
        State: {
          Action: "Defense",
          Location: "Earth",
        },
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
    setSelectedVehicle(vehicleDetails);
    setShowVehicleModal(true);
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

      // Write to database
      await databaseService.updateFleets("The Solar Wars", nationName, fleets);

      // Update local state
      setUnits((prev) =>
        prev.map((u) =>
          u.id === selectedUnit.id
            ? {
                ...u,
                name: editUnitName,
                type: editUnitType,
                location: editUnitLocation,
              }
            : u
        )
      );
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

      fleets[fleetIndex].State = {
        ...fleets[fleetIndex].State,
        Action: action,
      };

      await databaseService.updateFleets("The Solar Wars", nationName, fleets);

      setUnits((prev) =>
        prev.map((u) =>
          u.id === selectedUnit.id ? { ...u, state: action, status: action } : u
        )
      );
      console.log(`Fleet ${selectedUnit.name} action set to ${action}`);
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

  return (
    <div className="armed-forces">
      <StarField density={120} />
      <div className="armed-forces-container">
        <div className="header-section">
          <button className="back-button" onClick={onBack}>
            ← Back to Homepage
          </button>
          <h2>⚔️ Armed Forces Command</h2>
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
                          {unit.vehicleLabel}: {unit.ships}
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
                    <button
                      className="command-btn activate"
                      disabled={selectedUnit.status === "Active"}
                      onClick={() => handleUpdateStatus("Active")}
                    >
                      Activate
                    </button>
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
                      className="command-btn attack"
                      onClick={() => handleUpdateAction("Attack")}
                    >
                      Attack
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
                  <button className="delete-btn">Disband Unit</button>
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
                  <h4>Unit Location</h4>
                  <input
                    type="text"
                    className="unit-location-input"
                    value={editUnitLocation}
                    onChange={(e) => setEditUnitLocation(e.target.value)}
                    placeholder="Enter location (e.g. Mars Orbit)"
                  />
                </div>
                <div className="edit-section">
                  <h4>Transfer Vehicles</h4>
                  <p>
                    Select destination fleet and vehicle amounts to transfer
                  </p>
                  {/* TODO: Add vehicle transfer interface */}
                  <div className="transfer-placeholder">
                    Vehicle transfer interface will be implemented here
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
                <h2>{selectedVehicle.name}</h2>
                <button className="close-btn" onClick={closeVehicleModal}>
                  ✕
                </button>
              </div>
              <div className="modal-content">
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
                                : val}
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
                                : val}
                            </p>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tactical Map Modal */}
      {showTacticalMap && (
        <TacticalMap onClose={closeTacticalMap} currentFaction={nationName} />
      )}
    </div>
  );
};

export default ArmedForces;
