import React from "react";
import StarField from "./StarField";
import EconomicMap from "./EconomicMap";
import TradePanel from "./TradePanel";
import globalDB from "../services/GlobalDB";
import "./CenterPage.css";
import { calculateBotIncome } from "./BotIncomeCalculator";

import { useState, useEffect } from "react";
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
          setCapacities(factionData.capacities || {});
          setStorage(factionData.storage || {});

          // Calculate income using the bot's logic
          const rawFactionData = await databaseService.getFaction(
            "The Solar Wars",
            factionId
          );

          console.log(
            "Raw faction data for income calculation:",
            rawFactionData
          );

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

  const debugIncomeAsync = async () => {
    try {
      // Get all factions and find the faction ID for the given nationName
      const allFactions = await databaseService.getFactions("The Solar Wars");
      const factionEntry = Object.entries(allFactions).find(
        ([key, value]) =>
          value?.name?.toLowerCase() === nationName.toLowerCase()
      );
      const factionId = factionEntry ? factionEntry[0] : null;
      if (!factionId) {
        console.error("Faction ID not found for nation.");
        return;
      }

      // Get full faction group data (all factions, trades, settings)
      const factionGroup = allFactions;
      // Get trades and settings
      const trades =
        (factionGroup.data &&
          factionGroup.data.Trades &&
          factionGroup.data.Trades.Active) ||
        [];
      const settings = factionGroup.settings || {};

      // Get this faction's data using ID
      const faction = factionGroup[factionId];
      if (!faction) {
        console.error("Faction not found in database by ID.");
        return;
      }

      // Import bot's calculation logic
      // --- Unrefined ---
      const {
        Resources = {},
        Capacities = {},
        Usages = {},
        Storage = {},
        Fleets = [],
        Maps = {},
        Trades = [],
      } = faction;
      const allKeys = Object.keys(Resources);
      const split = (resources = []) => {
        const unrefined = resources.filter((v) => v.startsWith("U-"));
        const refined = unrefined.map((str) => str.slice(2));
        const refinedMap = new Set(refined);
        const unique = resources.filter(
          (str) => !refinedMap.has(str) && !refinedMap.has(str.slice(2))
        );
        return [unrefined, refined, unique];
      };
      const [unrefined, refined, unique] = split(allKeys);
      const defaultResources = (keys) =>
        keys.reduce((acc, k) => {
          acc[k] = 0;
          return acc;
        }, {});
      const roundResources = (obj) =>
        Object.fromEntries(
          Object.entries(obj).map(([k, v]) => [k, Math.round(v)])
        );
      // Unrefined income
      const unrefinedIncome = Object.fromEntries(
        unrefined.map((name) => [
          name,
          Math.max((Capacities[name] ?? 0) - (Usages[name] ?? 0), 0),
        ])
      );
      // Refined income
      // Bot logic from incomeMath.js
      // Debug fleet CSCost breakdown - consider mothballed status
      console.log("Fleet CSCost breakdown (considering mothballed status):");
      let totalFleetCSCost = 0;
      Fleets.forEach((f, i) => {
        const baseCost = f.CSCost || 0;
        const isMothballed =
          f.Status === "Mothballed" || f.status === "Mothballed";
        const actualCost = isMothballed ? baseCost * 0.1 : baseCost; // 10% upkeep for mothballed
        totalFleetCSCost += actualCost;
        if (baseCost > 0) {
          console.log(
            `Fleet ${i + 1} (${f.Name || f.ID}): CSCost = ${baseCost}${
              isMothballed ? " (mothballed: " + actualCost + ")" : ""
            }`
          );
        }
      });

      // CSCost = Population/50000 + sum of fleet CSCost (bot logic)
      const populationCSCost = Resources.Population / 50000;
      const CSCost = populationCSCost + totalFleetCSCost;
      console.log("Population CS Cost:", populationCSCost);
      console.log(
        "Total Fleet CS Cost (with mothballed adjustments):",
        totalFleetCSCost
      );
      console.log("Total CS Cost:", CSCost);

      // Apply trades to storage (critical for IM faction)
      const orderedTrades = new Map();
      trades.forEach((trade, index) => orderedTrades.set(trade.ID, trade));

      const tradeResources = faction.Trades.map(
        (id) => orderedTrades.get(id) || null
      )
        .filter((trade) => trade !== null)
        .map((trade) => {
          return trade[factionId]?.Resources || {};
        })
        .reduce((acc, trade) => {
          const result = {};
          Object.keys(trade).forEach((key) => {
            result[key] = (acc[key] || 0) + (trade[key] || 0);
          });
          return result;
        }, {});

      console.log("Trade resources being added to storage:", tradeResources);

      const storage = {
        ...Storage,
        CS: (Storage.CS || 0) + CSCost,
        ...Object.keys(tradeResources).reduce((acc, key) => {
          acc[key] = (Storage[key] || 0) + (tradeResources[key] || 0);
          return acc;
        }, {}),
      };

      console.log("Effective storage after trades:", storage);

      // Refined income calculation - can use unrefined from treasury
      const refinedIncome = Object.fromEntries(
        refined
          .filter((name) => name !== "CS")
          .map((name) => {
            const capacity = (Capacities[name] ?? 0) - (Usages[name] ?? 0);
            const unrefinedFromTreasury = Resources[`U-${name}`] || 0; // Can use from treasury
            const storageSpace = (storage[name] || 0) - (Resources[name] || 0);
            // Bot logic: min of capacity, available storage space
            // Unrefined constraint is from treasury, not production
            return [
              name,
              Math.min(
                capacity,
                storageSpace,
                unrefinedFromTreasury // Can refine from existing treasury stock
              ),
            ];
          })
      );

      // Debug refined income calculation details
      console.log("Refined income calculation details (with trades):");
      refined
        .filter((name) => name !== "CS")
        .forEach((name) => {
          const capacity = (Capacities[name] ?? 0) - (Usages[name] ?? 0);
          const unrefined = Resources[`U-${name}`] || 0;
          const storageAvailable =
            (storage[name] || 0) - (Resources[name] || 0);
          const result = Math.min(capacity, unrefined, storageAvailable);
          console.log(
            `${name}: min(${capacity}, ${unrefined}, ${storageAvailable}) = ${result}`
          );
        });

      // CS calculation - using treasury U-CS and corrected fleet costs
      const csCapacity = (Capacities.CS ?? 0) - (Usages.CS ?? 0);
      const csUnrefinedFromTreasury = Resources[`U-CS`] || 0;
      const csStorageSpace = (storage.CS || 0) - (Resources.CS || 0);

      console.log("CS calculation details:");
      console.log("- CS capacity:", csCapacity);
      console.log("- U-CS from treasury:", csUnrefinedFromTreasury);
      console.log("- CS storage space:", csStorageSpace);
      console.log("- CS cost to subtract:", CSCost);

      refinedIncome.CS =
        Math.min(csCapacity, csStorageSpace, csUnrefinedFromTreasury) - CSCost;

      // Final income - unrefined income MINUS what gets refined (consumed)
      const calculateInfluence = (res, usages, maps) => {
        const hexCount = Object.values(maps || {}).reduce(
          (count, map) => count + (map.Hexes || 0),
          0
        );
        const influenceIncome = (usages && usages.Influence) || 0;
        const influence =
          Math.max(2500 - 0.25 * hexCount, 50) - influenceIncome;
        return Math.min(influence, 10000 - (res.Influence || 0));
      };
      const calculatePopulation = (res) => {
        const consumableInfluence =
          ((res.CS || 0) * 5000) / (res.Population || 1);
        const populationGrowth =
          consumableInfluence <= 0.5
            ? -5
            : consumableInfluence <= 1
            ? (consumableInfluence - 1) * 1
            : consumableInfluence <= 2
            ? (consumableInfluence - 1) * 5
            : 5;
        return ((res.Population || 0) * populationGrowth * 2) / 100;
      };
      const calculateERIncome = (Resources) => {
        const treasury = Resources.ER || 0;
        const workingPopulation =
          (Resources.Population || 0) - (Resources.Military || 0);
        const percentage =
          treasury <= 1000000000000
            ? 100
            : treasury <= 15000000000000
            ? -0.005714 * (treasury / 1000000000 - 1000) + 100
            : 22 - Math.log10(treasury / 1000000000 - 5699) / 2;
        const income =
          (percentage / 100) *
          (workingPopulation <= 250000000
            ? ((245 * workingPopulation) / 210) * 1000 - 41666666666
            : 1000000000 *
              ((1.7 * Math.log10(workingPopulation + 1)) ** 2 + 46.18193));
        return Math.max(Math.round(income), 5000000000);
      };
      const uniqueIncome = {
        Influence: calculateInfluence(Resources, Usages, Maps),
        Population: calculatePopulation(Resources),
        ER: calculateERIncome(Resources),
        Military: 0,
      };
      // Final income - unrefined income MINUS what gets refined (consumed)
      const finalUnrefinedIncome = {};
      unrefined.forEach((name) => {
        const refinedName = name.slice(2); // Remove "U-" prefix
        const produced = unrefinedIncome[name] || 0;
        const consumed = refinedIncome[refinedName] || 0;
        finalUnrefinedIncome[name] = produced - consumed; // Subtract what gets refined
      });
      // Final income
      const totalIncome = {
        ...roundResources(finalUnrefinedIncome),
        ...roundResources(refinedIncome),
        ...roundResources(uniqueIncome),
      };

      // Debug logging
      console.log("=== INCOME CALCULATION DEBUG ===");
      console.log("Faction ID:", factionId);
      console.log("Resources:", Resources);
      console.log("Capacities:", Capacities);
      console.log("Usages:", Usages);
      console.log("Storage:", Storage);
      console.log("Fleets:", Fleets);
      console.log("All keys:", allKeys);
      console.log("Unrefined keys:", unrefined);
      console.log("Refined keys:", refined);
      console.log("Unrefined income:", unrefinedIncome);
      console.log("CS Cost (Fleet + Population/50000):", CSCost);
      console.log("Refined income:", refinedIncome);
      console.log("Final unrefined income:", finalUnrefinedIncome);
      console.log("Unique income:", uniqueIncome);
      console.log(
        "Expected IM: CM=741911, CS=121272, EL=770956, ER=53113069719, Influence=173, Population=60681566, U-CM=12089, U-CS=36655, U-EL=-20956"
      );
      console.log("Bot fleets consume 977937 CS");

      // Debug the key constraint differences
      console.log("=== ANALYZING CONSTRAINT DIFFERENCES ===");
      console.log("CM constraint analysis:");
      console.log(
        "- Capacity available:",
        (Capacities.CM ?? 0) - (Usages.CM ?? 0)
      );
      console.log("- Current U-CM:", Resources["U-CM"] || 0);
      console.log(
        "- Storage available (CM):",
        (storage.CM || 0) - (Resources.CM || 0)
      );
      console.log("- Expected CM income:", "741911");
      console.log("- Current calculation:", refinedIncome.CM);

      console.log("CS constraint analysis:");
      console.log(
        "- Capacity available:",
        (Capacities.CS ?? 0) - (Usages.CS ?? 0)
      );
      console.log("- Current U-CS:", Resources["U-CS"] || 0);
      console.log(
        "- Storage available (CS):",
        (storage.CS || 0) - (Resources.CS || 0)
      );
      console.log("- Fleet CS cost:", totalFleetCSCost);
      console.log("- Expected CS income:", "121272");
      console.log("- Current calculation:", refinedIncome.CS);

      console.log(
        "Bot-style income calculation for faction:",
        factionId,
        totalIncome
      );
    } catch (err) {
      console.error("Income calculation error:", err);
    }
  };

  // Replace the previous code block with a function that calls the async function
  const handleDebugIncome = () => {
    debugIncomeAsync();
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
          <button
            style={{
              marginLeft: "16px",
              background: "#2196F3",
              color: "white",
              fontWeight: "bold",
              borderRadius: "6px",
              padding: "8px 16px",
              border: "none",
            }}
            onClick={handleDebugIncome}
          >
            Debug: Log Bot-style Income
          </button>
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
                  { key: "totalHexes", label: "Total Hexes" },
                ].map(({ key, label }) => (
                  <div className="info-item" key={key}>
                    <span className="info-label">{label}:</span>
                    <span className="info-value">
                      {key === "totalHexes"
                        ? totalHexes.toLocaleString()
                        : resources[key]?.toLocaleString?.() ??
                          resources[key] ??
                          "0"}
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
