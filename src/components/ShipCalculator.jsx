import React, { useState } from "react";
import InputField from "./InputField";
import splitCurrency from "../utils/splitCurrency";
import "./RateCalculator.css";

const ShipCalculator = () => {
  const [values, setValues] = useState({});
  const [result, setResult] = useState(null);
  const [userName, setUserName] = useState("");
  const [showRegister, setShowRegister] = useState(false);

  const ftlTypes = {
    EXT: "External FTL",
    INT: "Internal FTL",
    NONE: "None",
  };

  const params = {
    length: {
      id: "length",
      label: "Length of the Ship",
      type: "number",
      num_type: "ufloat",
      default: 100,
    },
    main: {
      id: "main",
      label: "Primary Weapon Count",
      type: "number",
      num_type: "uint",
      default: 0,
    },
    secondary: {
      id: "secondary",
      label: "Secondary Weapon Count",
      type: "number",
      num_type: "uint",
      default: 0,
    },
    lances: {
      id: "lances",
      label: "Lance-like Weapon Count",
      type: "number",
      num_type: "uint",
      default: 0,
    },
    pdc: {
      id: "pdc",
      label: "PDC-like Weapon Count",
      type: "number",
      num_type: "uint",
      default: 0,
    },
    torpedoes: {
      id: "torpedoes",
      label: "Torpedo/Missile Count",
      type: "number",
      num_type: "uint",
      default: 0,
    },
    shield: {
      id: "shield",
      label: "Has a Shield",
      type: "bool",
      default: false,
    },
    stealth: {
      id: "stealth",
      label: "Has Stealth",
      type: "bool",
      default: false,
    },
    systems: {
      id: "systems",
      label: "Additional systems",
      type: "number",
      num_type: "uint",
      default: 0,
    },
    engines: {
      id: "engines",
      label: "Engines (format: '4S 2M 1L')",
      type: "text",
      default: "0",
    },
    ftl: {
      id: "ftl",
      label: "FTL Type",
      type: "select",
      options: ftlTypes,
      default: "NONE",
    },
    cargo: {
      id: "cargo",
      label: "Cargo Space (1 unit per meter)",
      type: "number",
      num_type: "ufloat",
      default: 0,
    },
    drone: { id: "drone", label: "Is a drone", type: "bool", default: false },
    other: {
      id: "other",
      label: "Other Costs",
      type: "number",
      num_type: "ufloat",
      default: 0,
    },
    boat: { id: "boat", label: "Is a boat", type: "bool", default: false },
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
  const handleRate = () => {
    if (userName.trim()) {
      setShowRegister(true);
    }
  };

  const handleRegister = () => {
    // Here you would normally submit to a backend
    alert(`Ship rated and registered for ${userName}!`);
    setShowRegister(false);
  };

  return (
    <div className="rate-calculator">
      <div className="calculator-header">
        <h2>🚢 Ship Rate Calculator</h2>
        <p>Calculate the cost and resources needed for your ship design</p>
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
        Calculate Ship Cost
      </button>

      {result && (
        <div className="result-section">
          <h3>Calculation Results</h3>
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

export default ShipCalculator;
