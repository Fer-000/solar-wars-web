import React, { useState } from "react";
import InputField from "./InputField";
import splitCurrency from "../utils/splitCurrency";
import "./RateCalculator.css";

const AircraftCalculator = () => {
  const [values, setValues] = useState({});
  const [result, setResult] = useState(null);
  const [userName, setUserName] = useState("");
  const [showRegister, setShowRegister] = useState(false);

  const aircraftTypes = {
    fighter: "Fighter",
    bomber: "Bomber",
    transport: "Transport",
    drone: "Drone",
    gunship: "Gunship",
  };

  const params = {
    length: {
      id: "length",
      label: "Length of Aircraft",
      type: "number",
      num_type: "ufloat",
      default: 20,
    },
    type: {
      id: "type",
      label: "Aircraft Type",
      type: "select",
      options: aircraftTypes,
      default: "fighter",
    },
    weapons: {
      id: "weapons",
      label: "Weapon Systems",
      type: "number",
      num_type: "uint",
      default: 0,
    },
    armor: {
      id: "armor",
      label: "Armor Rating",
      type: "number",
      num_type: "uint",
      range: { min: 0, max: 10 },
      default: 0,
    },
    stealth: {
      id: "stealth",
      label: "Stealth Technology",
      type: "bool",
      default: false,
    },
    engines: {
      id: "engines",
      label: "Engines (format: '2S 1M')",
      type: "text",
      default: "1S",
    },
    systems: {
      id: "systems",
      label: "Additional Systems",
      type: "number",
      num_type: "uint",
      default: 0,
    },
    cargo: {
      id: "cargo",
      label: "Cargo Capacity",
      type: "number",
      num_type: "ufloat",
      default: 0,
    },
    other: {
      id: "other",
      label: "Other Costs",
      type: "number",
      num_type: "ufloat",
      default: 0,
    },
  };

  const handleChange = (id, value) => {
    setValues((prev) => ({ ...prev, [id]: value }));
  };

  const calculateRate = () => {
    const processedValues = { ...values };
    processedValues.engines = splitCurrency(values.engines || "1S", "S");

    const {
      length = 20,
      type = "fighter",
      weapons = 0,
      armor = 0,
      stealth = false,
      engines = [],
      systems = 0,
      cargo = 0,
      other = 0,
    } = processedValues;

    // Aircraft type modifiers
    const typeModifiers = {
      fighter: { er: 1.2, cm: 1.1, el: 1.3, cs: 1.0 },
      bomber: { er: 1.0, cm: 1.3, el: 1.1, cs: 1.2 },
      transport: { er: 0.8, cm: 1.2, el: 0.9, cs: 1.1 },
      drone: { er: 0.7, cm: 0.9, el: 1.4, cs: 1.3 },
      gunship: { er: 1.3, cm: 1.4, el: 1.2, cs: 1.1 },
    };

    const modifier = typeModifiers[type];

    // ER calculation (simplified aircraft version)
    const baseCost = length * 15;
    const weaponCost = weapons * 8;
    const armorCost = armor * length * 2;
    const stealthCost = stealth ? length * 5 : 0;
    const systemsCost = systems * length * 0.5;
    const cargoCost = cargo * 0.5;

    const engineCosts = { S: 3, M: 5, L: 8 };
    const engineCost = engines.reduce(
      (acc, [count, type]) =>
        isNaN(count) || engineCosts[type] === undefined
          ? acc
          : acc + count * engineCosts[type],
      0
    );

    const erTotal =
      (baseCost +
        weaponCost +
        armorCost +
        stealthCost +
        systemsCost +
        engineCost +
        cargoCost +
        other) *
      modifier.er;

    // CM calculation
    const baseCostCm = length * 25;
    const weaponCostCm = weapons * 30;
    const armorCostCm = armor * length * 3;
    const stealthCostCm = stealth ? length * 10 : 0;
    const systemsCostCm = systems * length;
    const cargoCostCm = cargo * 2;

    const engineCostsCm = { S: 20, M: 35, L: 60 };
    const engineCostCm = engines.reduce(
      (acc, [count, type]) =>
        isNaN(count) || engineCostsCm[type] === undefined
          ? acc
          : acc + count * engineCostsCm[type],
      0
    );

    const cmTotal =
      (baseCostCm +
        weaponCostCm +
        armorCostCm +
        stealthCostCm +
        systemsCostCm +
        engineCostCm +
        cargoCostCm) *
      modifier.cm;

    // EL calculation
    const baseCostEl = stealth ? length * 8 : length * 2;
    const weaponCostEl = weapons * 40;
    const systemsCostEl = systems * length * 1.5;
    const cargoCostEl = cargo * 1;

    const engineCostsEl = { S: 15, M: 25, L: 40 };
    const engineCostEl = engines.reduce(
      (acc, [count, type]) =>
        isNaN(count) || engineCostsEl[type] === undefined
          ? acc
          : acc + count * engineCostsEl[type],
      0
    );

    const elTotal =
      (baseCostEl + weaponCostEl + systemsCostEl + engineCostEl + cargoCostEl) *
      modifier.el;

    // CS calculation
    const baseCostCs = length * 3;
    const weaponCostCs = weapons * 5;
    const systemsCostCs = systems * length;

    const engineCostsCs = { S: 5, M: 10, L: 15 };
    const engineCostCs = engines.reduce(
      (acc, [count, type]) =>
        isNaN(count) || engineCostsCs[type] === undefined
          ? acc
          : acc + count * engineCostsCs[type],
      0
    );

    const csTotal =
      (baseCostCs + weaponCostCs + systemsCostCs + engineCostCs) * modifier.cs;

    setResult({
      er: Math.ceil(erTotal * 1000),
      cm: Math.ceil(cmTotal),
      el: Math.ceil(elTotal),
      cs: Math.ceil(csTotal),
      cs_upkeep: Math.ceil(csTotal / 6),
    });
  };

  const handleRate = () => {
    if (userName.trim()) {
      setShowRegister(true);
    }
  };

  const handleRegister = () => {
    alert(`Aircraft rated and registered for ${userName}!`);
    setShowRegister(false);
  };

  return (
    <div className="rate-calculator">
      <div className="calculator-header">
        <h2>✈️ Aircraft Rate Calculator</h2>
        <p>Calculate the cost and resources for your aircraft designs</p>
      </div>

      <div className="calculator-grid">
        {Object.values(params).map((param) => (
          <InputField
            key={param.id}
            param={param}
            value={values[param.id]}
            onChange={handleChange}
          />
        ))}
      </div>

      <button className="calculate-btn" onClick={calculateRate}>
        Calculate Aircraft Cost
      </button>

      {result && (
        <div className="result-section">
          <h3>📊 Calculation Results</h3>
          <div className="result-grid">
            <div className="result-item">
              <span className="result-label">Energy Resources (ER)</span>
              <span className="result-value">{result.er.toLocaleString()}</span>
            </div>
            <div className="result-item">
              <span className="result-label">Common Materials (CM)</span>
              <span className="result-value">{result.cm.toLocaleString()}</span>
            </div>
            <div className="result-item">
              <span className="result-label">Rare Elements (EL)</span>
              <span className="result-value">{result.el.toLocaleString()}</span>
            </div>
            <div className="result-item">
              <span className="result-label">Specialist Components (CS)</span>
              <span className="result-value">{result.cs.toLocaleString()}</span>
            </div>
            <div className="result-item">
              <span className="result-label">CS Upkeep</span>
              <span className="result-value">
                {result.cs_upkeep.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="name-section">
        <input
          type="text"
          placeholder="Enter vehicle name"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          className="name-input"
        />
        {result && userName.trim() && (
          <button className="register-btn" onClick={handleRegister}>
            Register
          </button>
        )}
      </div>
    </div>
  );
};

export default AircraftCalculator;
