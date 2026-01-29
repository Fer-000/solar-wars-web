import React, { useState } from "react";
import splitCurrency from "../utils/splitCurrency";
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

const ShipCalculator = ({ nationName, onRegister }) => {
  const [values, setValues] = useState({});
  const [result, setResult] = useState(null);
  const [vehicleName, setVehicleName] = useState("");

  const ftlTypes = {
    EXT: "External FTL",
    INT: "Internal FTL",
    NONE: "None",
  };

  const params = {
    length: {
      id: "length",
      label: "Length (m)",
      type: "number",
      num_type: "ufloat",
      default: 100,
    },
    main: {
      id: "main",
      label: "Primary Weapons",
      type: "number",
      num_type: "uint",
      default: 0,
    },
    secondary: {
      id: "secondary",
      label: "Secondary Weapons",
      type: "number",
      num_type: "uint",
      default: 0,
    },
    lances: {
      id: "lances",
      label: "Lance Weapons",
      type: "number",
      num_type: "uint",
      default: 0,
    },
    pdc: {
      id: "pdc",
      label: "PDC Count",
      type: "number",
      num_type: "uint",
      default: 0,
    },
    torpedoes: {
      id: "torpedoes",
      label: "Torpedo Tubes",
      type: "number",
      num_type: "uint",
      default: 0,
    },
    shield: {
      id: "shield",
      label: "Shield Generator",
      type: "bool",
      default: false,
    },
    stealth: {
      id: "stealth",
      label: "Stealth Systems",
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
    engines: {
      id: "engines",
      label: "Engines (e.g., '4S 2M 1L')",
      type: "text",
      default: "0",
    },
    ftl: {
      id: "ftl",
      label: "FTL Drive",
      type: "select",
      options: ftlTypes,
      default: "NONE",
    },
    cargo: {
      id: "cargo",
      label: "Cargo (m³)",
      type: "number",
      num_type: "ufloat",
      default: 0,
    },
    drone: {
      id: "drone",
      label: "Drone Automation",
      type: "bool",
      default: false,
    },
    boat: { id: "boat", label: "Surface Vessel", type: "bool", default: false },
    other: {
      id: "other",
      label: "Misc Costs",
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
    processedValues.engines = splitCurrency(values.engines || "0", "M");

    const {
      length = 100,
      main = 0,
      secondary = 0,
      lances = 0,
      pdc = 0,
      torpedoes = 0,
      shield = false,
      stealth = false,
      systems = 0,
      engines = [],
      ftl = "NONE",
      cargo = 0,
      drone = false,
      other = 0,
      boat = false,
    } = processedValues;

    // --- Calculation Logic (Preserved) ---
    // ER calculation
    const ftlModifier = ftl === "NONE" ? 0 : 1500;
    const lCost = length * (24 + (stealth ? 2 : 0) + ftlModifier);
    const mCost = main * 15;
    const seCost = secondary * 10;
    const lanCost = lances * 50;
    const pCost = pdc * 5;
    const tCost = torpedoes * 5;
    const sCost = shield ? 300 : 0;
    const sysCost = systems * length;
    const cargoCost = cargo * 1;
    const droneDiscount = drone ? 0.85 : 1;

    const engineCosts = { S: 5.5, M: 7.5, L: 10.5 };
    const engineCost = engines.reduce(
      (acc, [count, type]) =>
        isNaN(count) || engineCosts[type] === undefined
          ? acc
          : acc + count * engineCosts[type],
      0
    );

    const erTotal =
      ((lCost +
        mCost +
        seCost +
        lanCost +
        pCost +
        tCost +
        sCost +
        sysCost +
        engineCost +
        other +
        cargoCost) *
        droneDiscount) /
      1000;

    // CM calculation
    const ftlModifierCm = ftl === "NONE" ? 0 : ftl === "INT" ? 60 : 40;
    const lCostCm = length * (50 + (stealth ? 20 : 0) + ftlModifierCm);
    const mCostCm = main * 100;
    const seCostCm = secondary * 50;
    const lanCostCm = lances * 300;
    const pCostCm = pdc * 25;
    const tCostCm = torpedoes * 25;
    const sCostCm = shield ? 1000 : 0;
    const sysCostCm = systems * length;
    const cargoCostCm = cargo * 10;
    const droneDiscountCm = drone ? 1.2 : 1;

    const engineCostsCm = { S: 50, M: 70, L: 100 };
    const engineCostCm = engines.reduce(
      (acc, [count, type]) =>
        isNaN(count) || engineCostsCm[type] === undefined
          ? acc
          : acc + count * engineCostsCm[type],
      0
    );

    const cmTotal =
      (lCostCm +
        mCostCm +
        seCostCm +
        lanCostCm +
        pCostCm +
        tCostCm +
        sCostCm +
        sysCostCm +
        engineCostCm +
        cargoCostCm) *
      droneDiscountCm;

    // EL calculation
    const ftlModifierEl = ftl === "NONE" ? 0 : ftl === "INT" ? 20 : 10;
    const lCostEl = length * ((stealth ? 10 : 0) + ftlModifierEl);
    const mCostEl = main * 100;
    const seCostEl = secondary * 100;
    const lanCostEl = lances * 200;
    const pCostEl = pdc * 100;
    const tCostEl = torpedoes * 100;
    const sCostEl = shield ? 1000 : 0;
    const sysCostEl = systems * length * 2;
    const cargoCostEl = cargo * 5;
    const droneDiscountEl = drone ? 1.5 : 1;

    const engineCostsEl = { S: 50, M: 70, L: 100 };
    const engineCostEl = engines.reduce(
      (acc, [count, type]) =>
        isNaN(count) || engineCostsEl[type] === undefined
          ? acc
          : acc + count * engineCostsEl[type],
      0
    );

    const elTotal =
      (lCostEl +
        mCostEl +
        seCostEl +
        lanCostEl +
        pCostEl +
        tCostEl +
        sCostEl +
        sysCostEl +
        engineCostEl +
        cargoCostEl) *
      droneDiscountEl;

    // CS calculation
    const ftlModifierCs = ftl === "NONE" ? 0 : 10;
    const lCostCs = length * (5 + ftlModifierCs);
    const mCostCs = main * 10;
    const seCostCs = secondary * 10;
    const lanCostCs = lances * 20;
    const pCostCs = pdc * 10;
    const sysCostCs = systems * length * 2;
    const droneDiscountCs = drone ? 0.5 : 1;

    const engineCostsCs = { S: 10, M: 20, L: 30 };
    const engineCostCs = engines.reduce(
      (acc, [count, type]) =>
        isNaN(count) || engineCostsCs[type] === undefined
          ? acc
          : acc + count * engineCostsCs[type],
      0
    );

    const csTotal =
      (lCostCs +
        mCostCs +
        seCostCs +
        lanCostCs +
        pCostCs +
        sysCostCs +
        engineCostCs) *
      droneDiscountCs;

    const multiplier = boat ? 0.85 : 1;

    setResult({
      er: Math.ceil(erTotal * 10 ** 9 * multiplier),
      cm: Math.ceil(cmTotal * multiplier),
      cs: Math.ceil(csTotal * multiplier),
      el: Math.ceil(elTotal * multiplier),
      cs_upkeep: Math.ceil((csTotal * multiplier) / 6),
    });
  };

  const handleRegisterSubmit = () => {
    if (vehicleName.trim() && result && onRegister) {
      onRegister({
        name: vehicleName,
        domain: "Ship",
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
        <h2>ship rater</h2>
        <p>Ship Design & Costing</p>
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
        CALCULATE
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
            placeholder="SHIP NAME / CLASS..."
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

export default ShipCalculator;
