import React from "react";
import StarField from "./StarField";
import globalDB from "../services/GlobalDB";
import "./CenterPage.css";

import { useState, useEffect } from "react";
import databaseService from "../services/database";

const Economy = ({ onBack, nationName, dbLoaded }) => {
  const [showStorageModal, setShowStorageModal] = useState(false);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [buyVehicleModal, setBuyVehicleModal] = useState(false);
  const [selectedVehicleType, setSelectedVehicleType] = useState("");
  const [selectedFleetId, setSelectedFleetId] = useState("");
  const [buyAmount, setBuyAmount] = useState(1);
  const [buyStatus, setBuyStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resources, setResources] = useState({});
  const [capacities, setCapacities] = useState({});
  const [storage, setStorage] = useState({});
  const [income, setIncome] = useState({});
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [fleets, setFleets] = useState([]);

  // Load faction data from Discord bot database
  useEffect(() => {
    const loadEconomyData = async () => {
      if (!dbLoaded) return;

      try {
        setLoading(true);
        setError(null);

        // Get faction data from Discord bot database
        const factionData = await databaseService.getFactionInfo(
          "The Solar Wars",
          nationName
        );

        if (factionData) {
          // Set resources (treasury) - using correct property name
          console.log("Raw faction data:", factionData);
          console.log("Resources from faction:", factionData.resources);
          setResources(factionData.resources || {});

          // Set capacities and storage
          setCapacities(factionData.capacities || {});
          setStorage(factionData.storage || {});

          // Calculate income using the same method as bot
          const incomeData = await databaseService.calculateFactionIncome(
            "The Solar Wars",
            nationName
          );
          console.log("Income data calculated:", incomeData);
          setIncome(incomeData || {});

          // Get available vehicle types from vehicles database
          const vehicles = factionData.vehicles || [];
          const vehicleTypesWithCosts = vehicles.map((vehicle) => ({
            id: vehicle.ID,
            name: vehicle.name,
            cost: vehicle.cost ? Object.values(vehicle.cost)[0] || 0 : 0, // Take first cost value
          }));
          setVehicleTypes(vehicleTypesWithCosts);

          // Get fleets for vehicle purchase
          const fleetsData = factionData.fleets || [];
          setFleets(
            fleetsData.map((fleet) => ({
              id: fleet.ID,
              name: fleet.Name,
              vehicles: fleet.Vehicles || [],
            }))
          );
        } else {
          setError(`Nation "${nationName}" not found in database`);
        }
      } catch (err) {
        console.error("Error loading economy data:", err);
        setError("Failed to load economy data from database");
      } finally {
        setLoading(false);
      }
    };

    loadEconomyData();
  }, [nationName, dbLoaded]);

  // Purchase vehicle function
  const handleBuyVehicle = async () => {
    if (!selectedVehicleType || !selectedFleetId) {
      setBuyStatus("Select a vehicle type and fleet.");
      return;
    }

    try {
      const vehicleInfo = vehicleTypes.find(
        (v) => v.id === selectedVehicleType
      );
      const totalCost = vehicleInfo.cost * buyAmount;

      // Check if faction has enough resources (ER = Economic Resources = credits)
      if ((resources.ER || 0) < totalCost) {
        setBuyStatus("Not enough Economic Resources (ER).");
        return;
      }

      // Get current fleets from database
      const currentFleets = await databaseService.getFleets(
        "The Solar Wars",
        nationName
      );
      const fleetIndex = currentFleets.findIndex(
        (f) => f.ID === selectedFleetId
      );

      if (fleetIndex === -1) {
        setBuyStatus("Fleet not found.");
        return;
      }

      // Add vehicles to fleet
      let vehicleEntry = currentFleets[fleetIndex].Vehicles.find(
        (v) => v.ID === vehicleInfo.id
      );
      if (vehicleEntry) {
        vehicleEntry.count += buyAmount;
      } else {
        currentFleets[fleetIndex].Vehicles.push({
          ID: vehicleInfo.id,
          count: buyAmount,
        });
      }

      // Update database with new fleet composition
      await databaseService.updateFleets(
        "The Solar Wars",
        nationName,
        currentFleets
      );

      // Update faction resources (subtract cost)
      const updatedResources = {
        ...resources,
        ER: (resources.ER || 0) - totalCost,
      };
      await databaseService.updateFactionResources(
        "The Solar Wars",
        nationName,
        updatedResources
      );
      setResources(updatedResources);

      setBuyStatus(
        `Purchased ${buyAmount} ${
          vehicleInfo.name
        }(s) for ${totalCost.toLocaleString()} ER and added to ${
          fleets.find((f) => f.id === selectedFleetId)?.name
        }.`
      );

      // Clear selections
      setSelectedVehicleType("");
      setSelectedFleetId("");
      setBuyAmount(1);
    } catch (err) {
      console.error("Error purchasing vehicle:", err);
      setBuyStatus("Failed to purchase vehicle. Check console for details.");
    }
  };

  // Format resource values for display
  const formatResourceValue = (value) => {
    if (typeof value === "number") {
      return value.toLocaleString();
    }
    return value || "0";
  };

  if (!dbLoaded || loading) {
    return (
      <div className="center-page">
        <div style={{ textAlign: "center", padding: "80px" }}>
          <h2>Loading economy data...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="center-page">
      <StarField density={120} />
      <div className="armed-forces-container">
        <div className="header-section">
          <button className="back-button" onClick={onBack}>
            ← Back to Dashboard
          </button>
          <h2>💰 Economy Center</h2>
        </div>
        <p className="center-subtitle">
          {nationName.charAt(0).toUpperCase() + nationName.slice(1)} Economic
          Overview
        </p>

        <div className="armed-forces-content">
          <div className="left-sidebar">
            <div className="sidebar-card">
              <h4>Resources</h4>
              <div className="nation-info">
                {[
                  { key: "ER", label: "ER" },
                  { key: "CM", label: "CM" },
                  { key: "EL", label: "EL" },
                  { key: "CS", label: "CS" },
                  { key: "U-ER", label: "U-ER" },
                  { key: "U-CM", label: "U-CM" },
                  { key: "U-EL", label: "U-EL" },
                  { key: "U-CS", label: "U-CS" },
                  { key: "Population", label: "Population" },
                  { key: "Military", label: "Military" },
                  { key: "Influence", label: "Influence" },
                ].map(({ key, label }) => (
                  <div className="info-item" key={key}>
                    <span className="info-label">{label}:</span>
                    <span className="info-value">
                      {resources[key]?.toLocaleString?.() ??
                        resources[key] ??
                        "0"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="sidebar-card" style={{ marginTop: "15px" }}>
              <h4>Income</h4>
              <div className="nation-info">
                {[
                  { key: "ER", label: "ER" },
                  { key: "CM", label: "CM" },
                  { key: "EL", label: "EL" },
                  { key: "CS", label: "CS" },
                  { key: "U-ER", label: "U-ER" },
                  { key: "U-CM", label: "U-CM" },
                  { key: "U-EL", label: "U-EL" },
                  { key: "U-CS", label: "U-CS" },
                  { key: "Population", label: "Population" },
                  { key: "Military", label: "Military" },
                  { key: "Influence", label: "Influence" },
                ].map(({ key, label }) => (
                  <div className="info-item" key={key}>
                    <span className="info-label">{label}:</span>
                    <span className="info-value">
                      {income[key]?.toLocaleString?.() ?? income[key] ?? "0"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="sidebar-card" style={{ marginTop: "15px" }}>
              <button
                className="tactical-map-btn"
                onClick={() => setShowStorageModal(true)}
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
                Show Capacity & Storage
              </button>
            </div>
          </div>

          <div className="center-grid">
            <div className="center-card">
              <h3>Buy Vehicles</h3>
              <h1>DO NOT USE</h1>
              <div style={{ marginBottom: "10px" }}>
                <select
                  value={selectedVehicleType}
                  onChange={(e) => setSelectedVehicleType(e.target.value)}
                  style={{ width: "100%", padding: "6px", borderRadius: "4px" }}
                >
                  <option value="">Select vehicle type...</option>
                  {vehicleTypes.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.cost.toLocaleString()} ER)
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: "10px" }}>
                <select
                  value={selectedFleetId}
                  onChange={(e) => setSelectedFleetId(e.target.value)}
                  style={{ width: "100%", padding: "6px", borderRadius: "4px" }}
                >
                  <option value="">Select fleet...</option>
                  {fleets.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: "10px" }}>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={buyAmount}
                  onChange={(e) => setBuyAmount(Number(e.target.value))}
                  style={{ width: "80px", marginRight: "8px" }}
                />
                <span>Amount</span>
              </div>
              <button
                onClick={handleBuyVehicle}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  background: "#4CAF50",
                  color: "white",
                  fontWeight: "bold",
                  border: "none",
                }}
              >
                Buy
              </button>
              {buyStatus && (
                <div
                  style={{
                    marginTop: "10px",
                    color: buyStatus.startsWith("Purchased")
                      ? "#4CAF50"
                      : "#f44336",
                  }}
                >
                  {buyStatus}
                </div>
              )}
            </div>
          </div>

          <div className="right-sidebar">
            <div className="center-card">
              <h3>Economic Stats</h3>
              <div className="stat-item">
                <span>GDP Growth</span>
                <span className="stat-positive">+3.2%</span>
              </div>
              <div className="stat-item">
                <span>Unemployment</span>
                <span className="stat-neutral">2.1%</span>
              </div>
              <div className="stat-item">
                <span>Inflation</span>
                <span className="stat-negative">-0.5%</span>
              </div>
            </div>
            <div className="center-card" style={{ marginTop: "20px" }}>
              <h3>Trade Routes</h3>
              <div className="trade-route">
                <span>Mars → Earth</span>
                <span className="route-status active">Active</span>
              </div>
              <div className="trade-route">
                <span>Europa → Titan</span>
                <span className="route-status active">Active</span>
              </div>
              <div className="trade-route">
                <span>Ceres → Venus</span>
                <span className="route-status inactive">Inactive</span>
              </div>
            </div>
          </div>
        </div>

        {/* Storage & Capacity Modal */}
        {showStorageModal && (
          <div
            className="modal-overlay"
            onClick={() => setShowStorageModal(false)}
          >
            <div className="unit-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Storage & Capacity</h2>
                <button
                  className="close-btn"
                  onClick={() => setShowStorageModal(false)}
                >
                  ✕
                </button>
              </div>
              <div className="modal-content">
                <div className="storage-info-grid">
                  <div className="info-section">
                    <h4>Vehicle Storage</h4>
                    <p>
                      <strong>Vehicles:</strong> {storage.vehicles ?? "0"} /{" "}
                      {storage.maxVehicles ?? "0"}
                    </p>
                  </div>
                  <div className="info-section">
                    <h4>Warehouses</h4>
                    <p>
                      <strong>Warehouses:</strong> {storage.warehouses ?? "0"}
                    </p>
                    <p>
                      <strong>Warehouse Capacity:</strong>{" "}
                      {storage.warehouseCapacity ?? "0"}
                    </p>
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

export default Economy;
