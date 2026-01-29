import React, { useState } from "react";
import "./RateCalculator.css";

// Helper Component to render specific input types with new styling
const TechInput = ({ param, value, onChange }) => {
  const handleChange = (e) => {
    const val =
      param.type === "bool"
        ? e.target.checked
        : param.num_type === "uint"
        ? parseInt(e.target.value) || 0
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

  // Number or Text
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

const InfantryCalculator = ({ nationName, onRegister }) => {
  const [values, setValues] = useState({});
  const [result, setResult] = useState(null);
  const [vehicleName, setVehicleName] = useState("");

  const speciesOptions = {
    human: "Human",
    robot: "Robot",
    catperson: "Catperson",
  };

  const primaryWeaponOptions = {
    assaultrifle: "Assault Rifle",
    machinegun: "Machine Gun",
    sniperrifle: "Sniper Rifle",
    sword: "Sword",
    staff: "Staff",
  };

  const camoOptions = {
    none: "None",
    regular: "Regular",
    semiactive: "Semi-Active",
    active: "Active",
  };

  const secondaryWeaponOptions = {
    none: "None",
    pistol: "Pistol",
    shotgun: "Shotgun",
    rocketlauncher: "Rocket Launcher",
    missilelauncher: "Missile Launcher",
    knife: "Knife/Bayonet",
  };

  const params = {
    species: {
      id: "species",
      label: "Species",
      type: "select",
      options: speciesOptions,
      default: "human",
    },
    training_time: {
      id: "training_time",
      label: "Training time (months)",
      type: "number",
      num_type: "uint",
      default: 0,
    },
    primary: {
      id: "primary",
      label: "Primary Weapon",
      type: "select",
      options: primaryWeaponOptions,
      default: "assaultrifle",
    },
    secondary: {
      id: "secondary",
      label: "Secondary Weapon",
      type: "select",
      options: secondaryWeaponOptions,
      default: "none",
    },
    armor: {
      id: "armor",
      label: "Armor Rating (0-10)",
      type: "number",
      num_type: "uint",
      range: { min: 0, max: 10 },
      default: 0,
    },
    camoflauge: {
      id: "camoflauge",
      label: "Camouflage",
      type: "select",
      options: camoOptions,
      default: "none",
    },
    grenades: {
      id: "grenades",
      label: "Grenades",
      type: "number",
      num_type: "uint",
      default: 0,
    },
    missiles: {
      id: "missiles",
      label: "Missiles",
      type: "number",
      num_type: "uint",
      default: 0,
    },
    rockets: {
      id: "rockets",
      label: "Rockets",
      type: "number",
      num_type: "uint",
      default: 0,
    },
    special_forces: {
      id: "special_forces",
      label: "Special Forces Training",
      type: "bool",
      default: false,
    },
    power_suit: {
      id: "power_suit",
      label: "Power Suit",
      type: "bool",
      default: false,
    },
    shield: {
      id: "shield",
      label: "Shielding Device",
      type: "bool",
      default: false,
    },
    chemical_adaptations: {
      id: "chemical_adaptations",
      label: "Chem. Adaptations",
      type: "number",
      num_type: "uint",
      default: 0,
    },
    physical_adaptations: {
      id: "physical_adaptations",
      label: "Phys. Adaptations",
      type: "number",
      num_type: "uint",
      default: 0,
    },
    other: {
      id: "other",
      label: "Misc. Costs",
      type: "number",
      num_type: "uint",
      default: 0,
    },
  };

  const handleChange = (id, value) => {
    setValues((prev) => ({ ...prev, [id]: value }));
  };

  const calculateRate = () => {
    const {
      species = "human",
      training_time = 0,
      special_forces = false,
      chemical_adaptations = 0,
      physical_adaptations = 0,
      power_suit = false,
      armor = 0,
      camoflauge = "none",
      shield = false,
      grenades = 0,
      missiles = 0,
      rockets = 0,
      primary = "assaultrifle",
      secondary = "none",
      other = 0,
    } = values;

    // --- Calculation Logic (Preserved) ---
    const bodyCost = species === "human" ? 10 : 100;
    const trainCost = training_time * 0;
    const specialCost = special_forces ? 1.1 : 1.0;
    const chemicalCost = chemical_adaptations * 15;
    const physicalCost = physical_adaptations * 25;
    const powersuitCost = power_suit ? 50 : 0;
    const armorCost = armor + 1;
    const camoCost =
      camoflauge === "active"
        ? 25
        : camoflauge === "semiactive"
        ? 1
        : camoflauge === "regular"
        ? 0.1
        : 0;
    const shieldCost = shield ? 5 : 0;

    const grenadeCost = grenades * 0.05;
    const missileCost = missiles * 5;
    const rocketCost = rockets * 1;

    let primaryCost = 0;
    if (primary === "assaultrifle") primaryCost = 1;
    else if (primary === "machinegun") primaryCost = 50;
    else if (primary === "sniperrifle") primaryCost = 1;
    else if (primary === "sword") primaryCost = 15;
    else if (primary === "staff") primaryCost = 30;

    let secondaryCost = 0;
    if (secondary === "pistol") secondaryCost = 0.5;
    else if (secondary === "shotgun") secondaryCost = 0.675;
    else if (secondary === "rocketlauncher") secondaryCost = 15;
    else if (secondary === "missilelauncher") secondaryCost = 125;
    else if (secondary === "knife") secondaryCost = 0.05;

    const totalCost =
      (bodyCost +
        trainCost +
        chemicalCost +
        physicalCost +
        powersuitCost +
        armorCost +
        shieldCost +
        armorCost +
        camoCost +
        grenadeCost +
        rocketCost +
        missileCost +
        primaryCost +
        secondaryCost +
        other) *
      specialCost;

    setResult({
      time: training_time,
      er: Math.ceil(totalCost * 1000),
    });
  };

  const handleRegisterSubmit = () => {
    if (vehicleName.trim() && result && onRegister) {
      onRegister({
        name: vehicleName,
        domain: "Infantry",
        cost: result.er,
        data: values,
      });
      setVehicleName(""); // Reset after submit
      setResult(null); // Optional: Reset result
    }
  };

  return (
    <div className="rate-calculator">
      <div className="calculator-header">
        <h2>INFANTRY RATER</h2>
        <p>Unit Specifications & Cost Analysis</p>
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
              <span className="result-label">ESTIMATED TRAINING</span>
              <span className="result-value">{result.time} MO</span>
            </div>
            <div className="result-item">
              <span className="result-label">ER</span>
              <span className="result-value">{result.er.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {result && (
        <div className="name-section">
          <input
            type="text"
            className="name-input"
            placeholder="ENTER UNIT DESIGNATION..."
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

export default InfantryCalculator;
