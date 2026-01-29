import React, { useState } from "react";
import "./RateCalculator.css";

// Reusable TechInput component (can be moved to a separate file later)
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
        min={param.range?.min}
        max={param.range?.max}
      />
    </div>
  );
};

const MissileCalculator = ({ nationName, onRegister }) => {
  const [values, setValues] = useState({});
  const [result, setResult] = useState(null);
  const [vehicleName, setVehicleName] = useState("");

  const missileTypes = {
    cruise: "Cruise",
    gto: "Ground to Orbit",
    ip: "Interplanetary",
    ballistic: "Ballistic",
    interceptor: "Interceptor",
  };

  const params = {
    length: {
      id: "length",
      label: "Length (m)",
      num_type: "ufloat",
      type: "number",
      default: 5,
    },
    type: {
      id: "type",
      label: "Missile Type",
      type: "select",
      options: missileTypes,
      default: "cruise",
    },
    nuclear: {
      id: "nuclear",
      label: "Nuclear Yield (kT)",
      num_type: "uint",
      type: "number",
      default: 0,
    },
    systems: {
      id: "systems",
      label: "Internal Systems",
      num_type: "uint",
      type: "number",
      default: 0,
    },
  };

  const typeCosts = {
    interceptor: { ER: 4.2, CM: 23, EL: 19, CS: 18 },
    ballistic: { ER: 67, CM: 89, EL: 52, CS: 62 },
    ip: { ER: 79, CM: 87, EL: 65, CS: 72 },
    gto: { ER: 67, CM: 45, EL: 54, CS: 42 },
    cruise: { ER: 1.5, CM: 45, EL: 13, CS: 6 },
  };

  const handleChange = (id, value) => {
    setValues((prev) => ({ ...prev, [id]: value }));
  };

  const calculateRate = () => {
    const { length = 5, type = "cruise", nuclear = 0, systems = 0 } = values;

    // ER calculation
    const lengthCostER = length * 1.7;
    const typeCostER = typeCosts[type].ER;
    const nuclearER = nuclear * 8.6;
    const erTotal = Math.ceil((lengthCostER + typeCostER + nuclearER) / 2);

    // CM calculation
    const lengthCostCM = length * 3.8;
    const typeCostCM = typeCosts[type].CM;
    const nuclearCM = nuclear * 16;
    const cmTotal = Math.ceil((lengthCostCM + typeCostCM + nuclearCM) / 2);

    // EL calculation
    const typeCostEL = typeCosts[type].EL;
    const nuclearEL = nuclear * 8;
    const systemsEL = 2.5 * typeCosts[type].EL * systems;
    const elTotal = Math.ceil((typeCostEL + nuclearEL + systemsEL) / 2);

    // CS calculation
    const lengthCostCS = length * 1.6;
    const typeCostCS = typeCosts[type].CS;
    const nuclearCS = nuclear * 3.5;
    const csTotal = Math.ceil((lengthCostCS + typeCostCS + nuclearCS) / 2);

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
        domain: "Missile",
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
        <h2>MISSILE RATER</h2>
        <p>Missile Systems Analysis</p>
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
            placeholder="MISSILE DESIGNATION..."
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

export default MissileCalculator;
