import React, { useState } from "react";
import "./RateCalculator.css";

// Helper Component
const TechInput = ({ param, value, onChange }) => {
  const handleChange = (e) => {
    const val =
      param.type === "bool"
        ? e.target.checked
        : param.num_type === "uint" || param.num_type === "ufloat"
        ? parseFloat(e.target.value) || 0
        : e.target.value;
    onChange(param.id, val);
  };

  if (param.type === "bool") {
    return (
      <div className="input-group">
        <label className="tech-checkbox-wrapper">
          <span className="input-label">{param.label}</span>
          <input
            type="checkbox"
            className="tech-checkbox"
            checked={!!value}
            onChange={handleChange}
          />
        </label>
      </div>
    );
  }

  if (param.type === "select") {
    return (
      <div className="input-group">
        <label className="input-label">{param.label}</label>
        <select
          className="tech-select"
          value={value || param.default}
          onChange={handleChange}
        >
          {Object.entries(param.options).map(([optKey, optLabel]) => (
            <option key={optKey} value={optKey}>
              {optLabel}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="input-group">
      <label className="input-label">{param.label}</label>
      <input
        type={param.type === "number" ? "number" : "text"}
        className="tech-input"
        value={value ?? param.default}
        onChange={handleChange}
      />
    </div>
  );
};

const GroundCalculator = ({ nationName, onRegister }) => {
  const [values, setValues] = useState({});
  const [result, setResult] = useState(null);
  const [vehicleName, setVehicleName] = useState("");

  const armorOptions = {
    none: "None",
    light: "Light",
    medium: "Medium",
    heavy: "Heavy",
  };

  const protectionOptions = {
    none: "None",
    soft: "Soft-kill",
    hard: "Hard-kill APS",
    both: "Soft-kill and Hard-kill APS",
  };

  const params = {
    length: {
      id: "length",
      label: "Length (m)",
      type: "number",
      num_type: "ufloat",
      default: 10,
    },
    armor: {
      id: "armor",
      label: "Chassis Armor",
      type: "select",
      options: armorOptions,
      default: "none",
    },
    protection: {
      id: "protection",
      label: "Active Protection",
      type: "select",
      options: protectionOptions,
      default: "none",
    },
    heavy: {
      id: "heavy",
      label: "Heavy Weapons",
      type: "number",
      num_type: "uint",
      default: 0,
    },
    medium: {
      id: "medium",
      label: "Medium Weapons",
      type: "number",
      num_type: "uint",
      default: 0,
    },
    light: {
      id: "light",
      label: "Light Weapons",
      type: "number",
      num_type: "uint",
      default: 0,
    },
    rocket: {
      id: "rocket",
      label: "Rocket Systems",
      type: "number",
      num_type: "uint",
      default: 0,
    },
    shield: {
      id: "shield",
      label: "Shield Gen.",
      type: "bool",
      default: false,
    },
    systems: {
      id: "systems",
      label: "Auxiliary Systems",
      type: "number",
      num_type: "uint",
      default: 0,
    },
  };

  const armorCosts = {
    heavy: { ER: 24, CM: 90, EL: 30, CS: 40 },
    medium: { ER: 26, CM: 50, EL: 20, CS: 30 },
    light: { ER: 40, CM: 30, EL: 12.5, CS: 20 },
    none: { ER: 100, CM: 20, EL: 10, CS: 10 },
  };

  const protectionCosts = {
    both: { ER: 0.3, CM: 20, EL: 25 },
    hard: { ER: 0.15, CM: 10, EL: 10 },
    soft: { ER: 0.1, CM: 5, EL: 15 },
    none: { ER: 0, CM: 0, EL: 0 },
  };

  const handleChange = (id, value) => {
    setValues((prev) => ({ ...prev, [id]: value }));
  };

  const calculateRate = () => {
    const {
      length = 10,
      armor = "none",
      protection = "none",
      heavy = 0,
      medium = 0,
      light = 0,
      rocket = 0,
      systems = 0,
      shield = false,
    } = values;

    // --- Calculation Logic (Preserved) ---
    // ER calculation
    const weaponSystemCost = heavy > 0 ? 7 : medium > 0 ? 3 : 0;
    const lengthCostER =
      Math.pow(length, 2) / (armorCosts[armor].ER - weaponSystemCost);
    const heavyCostER = heavy * 0.9;
    const mediumCostER = medium * 0.3;
    const lightCostER = light * 0.03;
    const rocketCostER = rocket * 0.08;
    const shieldCostER = shield ? 1 : 0;
    const systemCostER = 1 + systems * 0.1 + protectionCosts[protection].ER;

    const erTotal =
      Math.ceil(
        systemCostER *
          (lengthCostER +
            heavyCostER +
            mediumCostER +
            lightCostER +
            rocketCostER +
            shieldCostER) *
          100
      ) / 100;

    // CM calculation
    const lengthCostCM =
      Math.pow(length, 2) / 8.5 +
      armorCosts[armor].CM +
      protectionCosts[protection].CM;
    const heavyCostCM = heavy * 10;
    const mediumCostCM = medium * 2;
    const lightCostCM = light * 0.3;
    const rocketCostCM = rocket;
    const shieldCostCM = shield ? 5 : 0;
    const systemCostCM = systems + 1;

    const cmTotal = Math.ceil(
      Math.ceil(
        systemCostCM *
          (lengthCostCM +
            heavyCostCM +
            mediumCostCM +
            lightCostCM +
            rocketCostCM +
            shieldCostCM) *
          20
      ) / 100
    );

    // EL calculation
    const lengthCostEL =
      3 *
      (Math.pow(length, 2) / 85 +
        armorCosts[armor].EL +
        protectionCosts[protection].EL);
    const heavyCostEL = heavy * 6;
    const mediumCostEL = medium * 10;
    const lightCostEL = light * 0.2;
    const rocketCostEL = rocket * 0.2;
    const systemCostEL = systems * 1.5 + 1;

    const finalEL = shield
      ? systemCostEL *
          (lengthCostEL +
            heavyCostEL +
            mediumCostEL +
            lightCostEL +
            rocketCostEL) *
          1.1 +
        30
      : systemCostEL *
        (lengthCostEL +
          heavyCostEL +
          mediumCostEL +
          lightCostEL +
          rocketCostEL);

    const elTotal = Math.ceil(Math.ceil(finalEL * 20) / 100);

    // CS calculation
    const CSCostID =
      heavy > 0 || rocket > 0 ? 4 : medium > 0 ? 3 : light > 0 ? 2 : 1;
    const lengthCostCS =
      CSCostID === 4 || armorCosts[armor].CS === 4
        ? 50
        : CSCostID === 3 || armorCosts[armor].CS === 3
        ? 30
        : CSCostID === 2 || armorCosts[armor].CS === 2
        ? 15
        : 10;
    const systemCostCS = systems * 2.5;
    const csTotal = Math.ceil(
      Math.ceil(
        (lengthCostCS + systemCostCS + 0.1 * (cmTotal + elTotal)) * 20
      ) / 100
    );

    setResult({
      er: Math.ceil(erTotal * 10 ** 6),
      cm: cmTotal,
      el: elTotal,
      cs: csTotal,
      cs_upkeep: Math.ceil(csTotal / 6),
    });
  };

  const handleRegisterSubmit = () => {
    if (vehicleName.trim() && result && onRegister) {
      onRegister({
        name: vehicleName,
        domain: "Ground",
        cost: result.er,
        data: values,
      });
      setVehicleName("");
      setResult(null);
    }
  };

  return (
    <div className="rate-calculator">
      <div className="calculator-header">
        <h2>GROUND RATER</h2>
        <p>Vehicle Chassis Analysis</p>
      </div>

      <div className="calculator-grid">
        {Object.values(params).map((param) => (
          <TechInput
            key={param.id}
            param={param}
            value={values[param.id]}
            onChange={handleChange}
          />
        ))}
      </div>

      <button className="calculate-btn" onClick={calculateRate}>
        CALCULATE COST
      </button>

      {result && (
        <div className="result-section">
          <h3>RESULT</h3>
          <div className="result-grid">
            <div className="result-item">
              <span className="result-label">ER</span>
              <span className="result-value">{result.er.toLocaleString()}</span>
            </div>
            <div className="result-item">
              <span className="result-label">CM</span>
              <span className="result-value">{result.cm.toLocaleString()}</span>
            </div>
            <div className="result-item">
              <span className="result-label">EL</span>
              <span className="result-value">{result.el.toLocaleString()}</span>
            </div>
            <div className="result-item">
              <span className="result-label">CS</span>
              <span className="result-value">{result.cs.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {result && (
        <div className="name-section">
          <input
            type="text"
            className="name-input"
            placeholder="VEHICLE DESIGNATION..."
            value={vehicleName}
            onChange={(e) => setVehicleName(e.target.value)}
          />
          <button
            className="register-btn"
            onClick={handleRegisterSubmit}
            disabled={!vehicleName.trim()}
          >
            REGISTER
          </button>
        </div>
      )}
    </div>
  );
};

export default GroundCalculator;
