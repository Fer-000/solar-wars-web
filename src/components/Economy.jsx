import React, { useState, useEffect, useRef } from "react";
import StarField from "./StarField";
import EconomicMap from "./EconomicMap";
import TradePanel from "./TradePanel";
import globalDB from "../services/GlobalDB";
import "./CenterPage.css";
import { calculateIncome } from "../utils/income.js";

import databaseService from "../services/database";

const Economy = ({ onBack, nationName, dbLoaded }) => {
  // --- Bot-style income processing ---
  const incomePeriod = 7 * 24 * 60 * 60 * 1000;
  const updateDate = (LastUpdated = new Date()) => {
    const today = new Date();
    const incomePeriods = Math.floor((today - LastUpdated) / incomePeriod);
    const updateDay = new Date(
      LastUpdated.getTime() + incomePeriods * incomePeriod
    );
    return { incomePeriods, date: updateDay };
  };

  const handleProcessIncome = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get all factions data for the server (like bot)
      const allFactionsData = await databaseService.getFactions(
        "The Solar Wars"
      );
      if (!allFactionsData) throw new Error("Server not found!");

      // Get last income date from the 'data' object (like bot)
      const lastDateRaw = allFactionsData.data?.date;
      const lastDate = lastDateRaw?.toDate?.() || lastDateRaw || new Date();
      const { incomePeriods, date: newDate } = updateDate(lastDate);
      if (incomePeriods < 1) {
        setError("No income to process yet.");
        setLoading(false);
        return;
      }

      console.log(`Processing ${incomePeriods} income periods...`);

      // This is just a preview - actual processing should be done by the bot
      setError(
        "Income processing is for preview only. Use the Discord bot to actually process income."
      );
    } catch (err) {
      console.error("Error processing income:", err);
      setError("Failed to process income: " + err.message);
    } finally {
      setLoading(false);
    }
  };

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
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [fleets, setFleets] = useState([]);
  const [totalHexes, setTotalHexes] = useState(0);
  const [carouselPage, setCarouselPage] = useState(0); // 0: resources, 1: income, 2: capacities, 3: storage
  const [incomeResult, setIncomeResult] = useState(null);

  // For swipe gesture
  const carouselRef = useRef(null);
  const touchStartX = useRef(null);

  // Load faction data from Discord bot database
  useEffect(() => {
    const loadEconomyData = async () => {
      if (!dbLoaded) return;
      try {
        setLoading(true);
        setError(null);

        // Get faction data from Discord bot database using faction ID
        const allFactions = await databaseService.getFactions("The Solar Wars");
        // Find the faction ID for the given nationName
        const factionEntry = Object.entries(allFactions).find(
          ([key, value]) =>
            value?.name?.toLowerCase() === nationName.toLowerCase()
        );
        const factionId = factionEntry ? factionEntry[0] : null;
        if (!factionId) {
          setError(`Faction for nation "${nationName}" not found in database`);
          setLoading(false);
          return;
        }

        const factionData = await databaseService.getFactionInfo(
          "The Solar Wars",
          factionId
        );

        if (factionData) {
          setResources(factionData.resources || {});

          // Get capacities and storage from their data tables if present
          let capacities = {};
          let storage = {};

          // Capacities: prefer factionData.capacities, else factionData.Capacities, else from a table
          const rawFactionData = await databaseService.getFaction(
            "The Solar Wars",
            factionId
          );
          console.log("Raw faction data:", rawFactionData);
          capacities =
            rawFactionData?.capacities || rawFactionData?.Capacities || {};
          storage = rawFactionData?.storage || rawFactionData?.Storage || {};
          setCapacities(capacities || {});
          console.log("Capacities:", capacities);
          setStorage(storage || {});

          // Get available vehicle types from vehicles database
          const vehicles = factionData.vehicles || [];
          const vehicleTypesWithCosts = vehicles.map((vehicle) => ({
            id: vehicle.ID,
            name: vehicle.name,
            cost: vehicle.cost ? Object.values(vehicle.cost)[0] || 0 : 0,
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
          setError(`Faction ID "${factionId}" not found in database`);
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
    // ...existing code...
  };

  // Swipe handlers
  useEffect(() => {
    const handleTouchStart = (e) => {
      touchStartX.current = e.touches[0].clientX;
    };
    const handleTouchEnd = (e) => {
      if (touchStartX.current === null) return;
      const touchEndX = e.changedTouches[0].clientX;
      const dx = touchEndX - touchStartX.current;
      if (Math.abs(dx) > 40) {
        if (dx < 0 && carouselPage < 3) setCarouselPage(carouselPage + 1);
        if (dx > 0 && carouselPage > 0) setCarouselPage(carouselPage - 1);
      }
      touchStartX.current = null;
    };
    const node = carouselRef.current;
    if (node) {
      node.addEventListener("touchstart", handleTouchStart, { passive: true });
      node.addEventListener("touchend", handleTouchEnd, { passive: true });
    }
    return () => {
      if (node) {
        node.removeEventListener("touchstart", handleTouchStart);
        node.removeEventListener("touchend", handleTouchEnd);
      }
    };
  }, [carouselPage]);

  // Example income calculation for carousel (update as needed)
  const handleCalculateIncomeForCarousel = async () => {
    try {
      const allFactions = await databaseService.getFactions("The Solar Wars");
      const factionEntry = Object.entries(allFactions).find(
        ([key, value]) =>
          value?.name?.toLowerCase() === nationName.toLowerCase()
      );
      const factionId = factionEntry ? factionEntry[0] : null;
      if (!factionId) return;
      const factionData = await databaseService.getFaction(
        "The Solar Wars",
        factionId
      );
      const serverData = await databaseService.getData("The Solar Wars");
      const tradeData = serverData?.Trades?.Active || [];
      const doTrades = tradeData.length > 0;
      const result = calculateIncome(
        factionData,
        tradeData,
        factionId,
        doTrades
      );
      setIncomeResult(result);
    } catch (err) {
      setIncomeResult(null);
    }
  };

  useEffect(() => {
    if (carouselPage === 1 && incomeResult === null) {
      handleCalculateIncomeForCarousel();
    }
    // eslint-disable-next-line
  }, [carouselPage]);

  // Run income calculation on mount (page load)
  useEffect(() => {
    handleCalculateIncomeForCarousel();
    // eslint-disable-next-line
  }, []);

  // Helper to format income like resources
  const formatIncome = (income) => {
    if (!income || typeof income !== "object") return null;
    // Show only top-level numeric fields
    return Object.entries(income)
      .filter(([key, value]) => typeof value === "number")
      .map(([key, value]) => (
        <div className="info-item" key={key}>
          <span className="info-label">{key}:</span>
          <span className="info-value">{value.toLocaleString()}</span>
        </div>
      ));
  };

  // Helper to format data in a specific order
  const orderedKeys = [
    "ER",
    "U-CM",
    "U-EL",
    "U-CS",
    "CM",
    "EL",
    "CS",
    "Influence",
    "Population",
  ];

  const formatOrderedData = (data) => {
    if (!data || typeof data !== "object") return null;
    // Show only numeric or string fields, in the specified order first, then the rest
    const ordered = orderedKeys
      .filter((key) => data[key] !== undefined)
      .map((key) => [key, data[key]]);
    const rest = Object.entries(data).filter(
      ([key, value]) =>
        !orderedKeys.includes(key) &&
        (typeof value === "number" || typeof value === "string")
    );
    return [...ordered, ...rest].map(([key, value]) => (
      <div className="info-item" key={key}>
        <span className="info-label">{key}:</span>
        <span className="info-value">
          {typeof value === "number" ? value.toLocaleString() : value}
        </span>
      </div>
    ));
  };

  // Carousel content
  const carouselContent = [
    // Page 0: Resources
    <div>
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
          { key: "totalHexes", label: "Total Hexes" },
        ].map(({ key, label }) => (
          <div className="info-item" key={key}>
            <span className="info-label">{label}:</span>
            <span className="info-value">
              {key === "totalHexes"
                ? totalHexes.toLocaleString()
                : resources[key]?.toLocaleString?.() ?? resources[key] ?? "0"}
            </span>
          </div>
        ))}
      </div>
    </div>,
    // Page 1: Income (ordered)
    <div>
      <h4>Income</h4>
      <div className="nation-info">
        {incomeResult ? (
          formatOrderedData(incomeResult)
        ) : (
          <span style={{ color: "#888" }}>Calculating...</span>
        )}
      </div>
    </div>,
    // Page 2: Capacities (ordered)
    <div>
      <h4>Capacities</h4>
      <div className="nation-info">
        {Object.entries(capacities).length === 0 ? (
          <span style={{ color: "#888" }}>No capacity data.</span>
        ) : (
          formatOrderedData(capacities)
        )}
      </div>
    </div>,
    // Page 3: Storage (ordered)
    <div>
      <h4>Storage</h4>
      <div className="nation-info">
        {Object.entries(storage).length === 0 ? (
          <span style={{ color: "#888" }}>No storage data.</span>
        ) : (
          formatOrderedData(storage)
        )}
      </div>
    </div>,
  ];

  // Add this helper to detect big screens
  const isBigScreen = window.matchMedia("(min-width: 900px)").matches;

  // Add click handlers for big screens
  const handleCarouselClick = (e) => {
    if (!isBigScreen) return;
    const bounds = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - bounds.left;
    if (x > bounds.width * 0.66 && carouselPage < 3) {
      setCarouselPage(carouselPage + 1);
    } else if (x < bounds.width * 0.33 && carouselPage > 0) {
      setCarouselPage(carouselPage - 1);
    }
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
            <div
              className="sidebar-card"
              ref={carouselRef}
              style={{
                touchAction: "pan-y",
                cursor: isBigScreen ? "pointer" : "auto",
              }}
              onClick={handleCarouselClick}
            >
              {/* Carousel navigation dots */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: 8,
                }}
              >
                {[0, 1, 2, 3].map((idx) => (
                  <span
                    key={idx}
                    onClick={() => setCarouselPage(idx)}
                    style={{
                      display: "inline-block",
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      background: carouselPage === idx ? "#00f5ff" : "#444",
                      margin: "0 4px",
                      cursor: "pointer",
                      border: carouselPage === idx ? "2px solid #fff" : "none",
                      transition: "background 0.2s",
                    }}
                  />
                ))}
              </div>
              {/* Carousel content */}
              {carouselContent[carouselPage]}
            </div>
          </div>

          <div className="center-grid">
            {/* Economic Map - Worlds with Forces/Hexes */}
            <div className="center-card">
              <h3>Economic Map</h3>
              <EconomicMap
                nationName={nationName}
                onHexesUpdate={(hexes) => setTotalHexes(hexes)}
              />
            </div>
          </div>

          <div className="right-sidebar">
            <div className="center-card">
              <h3>Buy Vehicles DO NOT USE</h3>
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
            <div className="center-card" style={{ marginTop: "20px" }}>
              <h3>Trade</h3>
              <TradePanel nationName={nationName} />
            </div>
          </div>
        </div>
      </div>

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
                {/* Capacities Section */}
                <div className="info-section">
                  <h4>Capacities</h4>
                  {Object.entries(capacities).length === 0 ? (
                    <span style={{ color: "#888" }}>No capacity data.</span>
                  ) : (
                    <div>{formatOrderedData(capacities)}</div>
                  )}
                </div>
                {/* Storage Section */}
                <div className="info-section">
                  <h4>Storage</h4>
                  {Object.entries(storage).length === 0 ? (
                    <span style={{ color: "#888" }}>No storage data.</span>
                  ) : (
                    <div>{formatOrderedData(storage)}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Economy;
