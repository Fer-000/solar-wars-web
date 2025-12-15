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

const AircraftCalculator = ({ nationName, onRegister }) => {
  const [values, setValues] = useState({});
  const [result, setResult] = useState(null);
  const [vehicleName, setVehicleName] = useState("");

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
      label: "Length (m)",
      type: "number",
      num_type: "ufloat",
      default: 20,
    },
    wingspan: {
      id: "wingspan",
      label: "Wingspan (m) - (only if longer)",
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
      label: "Has Weapons (hardpoints)",
      type: "bool",
      default: false,
    },
    guns: {
      id: "guns",
      label: "Guns / Cannons (count)",
      type: "number",
      num_type: "uint",
      default: 0,
    },
    stealth: {
      id: "stealth",
      label: "Stealth",
      type: "select",
      options: { none: "None", low: "Low", yes: "Yes" },
      default: "none",
    },
    engines: {
      id: "engines",
      label: "Engines (e.g. '2S 1M')",
      type: "text",
      default: "1S",
    },
    systems: {
      id: "systems",
      label: "Avionics / Systems",
      type: "number",
      num_type: "uint",
      default: 0,
    },
    ordnance_kg: {
      id: "ordnance_kg",
      label: "Ordnance (kg)",
      type: "number",
      num_type: "ufloat",
      default: 0,
    },
    cargo: {
      id: "cargo",
      label: "Cargo Capacity",
      type: "number",
      num_type: "ufloat",
      default: 0,
    },
    helicopter: {
      id: "helicopter",
      label: "Helicopter",
      type: "bool",
      default: false,
    },
    drone: { id: "drone", label: "Drone", type: "bool", default: false },
    radar: {
      id: "radar",
      label: "Radar",
      type: "select",
      options: { none: "None", AEW: "AEW" },
      default: "none",
    },
    flight_type: {
      id: "flight_type",
      label: "Flight Type",
      type: "select",
      options: { air: "Air", hybrid: "Hybrid", space: "Space" },
      default: "air",
    },
    capability: {
      id: "capability",
      label: "Capability",
      type: "select",
      options: { none: "None", STOL: "STOL", VTOL: "VTOL" },
      default: "none",
    },
    speed_mach: {
      id: "speed_mach",
      label: "Speed (Mach)",
      type: "number",
      num_type: "ufloat",
      default: 0.9,
    },
    speed: {
      id: "speed",
      label: "Space Speed",
      type: "select",
      options: {
        na: "n/a",
        slow: "slow",
        medium: "medium",
        fast: "fast",
        very_fast: "very_fast",
      },
      default: "na",
    },
    shield: { id: "shield", label: "Shield", type: "bool", default: false },
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
    const pv = { ...values };
    // defaults and normalization
    const {
      length = 20,
      wingspan = 20,
      type: role = "fighter",
      weapons: has_weapons = false,
      guns = 0,
      ordnance_kg = 0,
      helicopter = false,
      drone = false,
      stealth = "none",
      radar = "none",
      flight_type = "air",
      shield = false,
      systems = 0,
      capability = "none",
      speed_mach = 0.9,
      speed = "na",
      other = 0,
    } = pv;

    // Auto-determine size_basis: use whichever is longer
    const use_length = length >= wingspan;
    const use_wingspan = wingspan > length;

    const size = use_length ? length : wingspan;

    // Base calculations
    let Base_ER = Math.pow(size, 2) / 120 + size * 220000 + 15000000;
    let CS = 0;
    let Base_CM, Base_EL;

    if (role === "fighter") {
      Base_CM = size * 5.4;
      Base_EL = size * 31.88;
    } else {
      Base_CM = size * 1.1;
      Base_EL = size * 2.2;
    }

    // Armament
    if (has_weapons) {
      Base_ER *= 1.6;
      Base_CM *= 1.3;
      CS += 6;
    } else {
      Base_ER *= 0.8;
      Base_CM *= 0.9;
      CS += 2;
    }

    // Helicopter
    if (helicopter) {
      Base_ER *= 0.6;
      Base_CM *= 0.8;
      CS *= 0.9;
    }

    // Drone
    if (drone) {
      Base_ER *= 0.4;
      Base_CM *= 0.4;
      Base_EL *= 0.5;
      CS *= 0.6;
    }

    // Stealth
    if (stealth === "yes") {
      Base_ER *= 2.0;
      Base_EL *= 1.2;
      CS *= 1.2;
    } else if (stealth === "low") {
      Base_ER *= 1.15;
      Base_EL += 10;
      CS += 2;
    }

    // Radar/AEW
    if (radar === "AEW") {
      Base_ER += 4000000;
      Base_CM += 10;
      Base_EL += 20;
      CS += 3;
    }

    // Flight type
    if (flight_type === "air") {
      Base_ER *= 1.0;
      Base_EL *= 1.0;
      CS *= 1.0;
    } else if (flight_type === "hybrid") {
      Base_ER *= 1.2;
      Base_EL *= 1.2;
      CS *= 1.1;
    } else if (flight_type === "space") {
      Base_ER *= 1.5;
      Base_EL *= 1.3;
      CS *= 1.2;
    }

    // Shield
    if (shield) {
      Base_ER += 5000000;
      Base_EL += 10;
      CS += 2;
    }

    // Load capacity (ordnance in kg)
    Base_ER += 150000 * (ordnance_kg / 100);

    // Guns/cannons
    Base_ER += 250000 * (guns || 0);
    Base_EL += 2 * (guns || 0);
    CS += 1 * (guns || 0);

    // Systems
    Base_ER += 300000 * (systems || 0);
    Base_EL += 1.5 * (systems || 0);
    CS += 12 * (systems || 0);

    // Capability
    if (capability === "STOL") {
      Base_ER *= 1.1;
      Base_EL += 5;
      CS += 2;
    } else if (capability === "VTOL") {
      Base_ER *= 1.25;
      Base_EL += 15;
      CS += 5;
    }

    // Speed additions (air/hybrid)
    if (flight_type === "air" || flight_type === "hybrid") {
      if (role === "fighter") {
        if (speed_mach > 2.5) {
          Base_ER *= 1 + Math.pow((speed_mach - 2.5) * 1.1, 2);
        }
      } else if (role === "bomber" || role === "bomber/transport") {
        if (speed_mach > 2.0) {
          Base_ER *= 1 + Math.pow((speed_mach - 2.0) * 1.1, 2);
        }
      } else if (
        role === "transport" ||
        role === "cargo" ||
        role === "tiltrotor"
      ) {
        if (speed_mach > 1.0) {
          Base_ER *= 1 + Math.pow((speed_mach - 1.0) * 1.1, 2);
        }
      } else if (role === "helicopter") {
        if (speed_mach > 1.0) {
          Base_ER *= 1 + Math.pow((speed_mach - 1.0) * 1.1, 2);
        }
      }
    }

    // Mach flat addition
    if (flight_type === "air") {
      Base_ER += speed_mach * 6000000;
    } else if (flight_type === "hybrid") {
      Base_ER += speed_mach * 4000000;
    } else if (flight_type === "space") {
      const speed_dict = {
        slow: 2000000,
        medium: 4000000,
        fast: 7000000,
        very_fast: 11000000,
      };
      Base_ER += speed_dict[speed] || 0;
    }

    // Strategic multiplier for large wingspans
    if (use_wingspan && wingspan >= 30) {
      const base_multiplier =
        1 + Math.pow(wingspan / 45, 2.8) + Math.pow(ordnance_kg / 10000, 2);
      let strategic_multiplier;
      if (role === "bomber" || role === "bomber/transport") {
        strategic_multiplier = Math.min(base_multiplier, 1.3);
      } else {
        strategic_multiplier = base_multiplier;
      }
      Base_ER *= strategic_multiplier;
    }

    // Transport scalar
    if (role === "transport" || role === "cargo" || role === "tiltrotor") {
      Base_ER *= 4.0;
    }

    // Helicopter scalar
    if (helicopter) {
      Base_ER *= 1.15;
    }

    const ER = Base_ER + (other || 0);
    const CM = Base_CM;
    const EL = Base_EL;
    const csVal = CS;

    setResult({
      er: Math.ceil(ER),
      cm: Math.ceil(CM),
      el: Math.ceil(EL),
      cs: Math.ceil(csVal),
      cs_upkeep: Math.ceil(csVal / 6),
    });
  };

  const handleRegisterSubmit = () => {
    if (vehicleName.trim() && result && onRegister) {
      onRegister({
        name: vehicleName,
        domain: "Aircraft",
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
        <h2>AIR RATER</h2>
        <p>Aircraft Systems Analysis</p>
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
            placeholder="AIRCRAFT DESIGNATION..."
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

export default AircraftCalculator;
