import React, { useState } from "react";
import InputField from "./InputField";
import "./RateCalculator.css";

const MissileCalculator = () => {
  const [values, setValues] = useState({});
  const [result, setResult] = useState(null);
  const [userName, setUserName] = useState("");
  const [showRegister, setShowRegister] = useState(false);

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
      label: "Length",
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
      label: "Nuclear Yield (kilotons)",
      num_type: "uint",
      type: "number",
      default: 0,
    },
    systems: {
      id: "systems",
      label: "Systems",
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

  const handleRate = () => {
    if (userName.trim()) {
      setShowRegister(true);
    }
  };

  const handleRegister = () => {
    alert(`Missile rated and registered for ${userName}!`);
    setShowRegister(false);
  };

  return (
    <div className="rate-calculator">
      <div className="calculator-header">
        <h2>🚀 Missile Rate Calculator</h2>
        <p>Calculate the cost and resources for your missile systems</p>
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
        Calculate Missile Cost
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

export default MissileCalculator;
