import React, { useState } from "react";
import ShipCalculator from "./ShipCalculator";
import AircraftCalculator from "./AircraftCalculator";
import GroundCalculator from "./GroundCalculator";
import MissileCalculator from "./MissileCalculator";
import InfantryCalculator from "./InfantryCalculator";
import databaseService from "../services/database";
import "./Shipyards.css";

const Shipyards = ({
  onBack,
  nationName,
  themeColor = "#00f3ff",
  dbLoaded,
}) => {
  if (!dbLoaded) {
    return (
      <div className="shipyards-container loading-state">
        <div className="loading-text">SYSTEM INITIALIZING...</div>
      </div>
    );
  }

  const [activeCategory, setActiveCategory] = useState(0);

  // Reverted to your friend's custom icons
  const categories = [
    { id: "ship", name: "SHIPS", icon: "icons/raters/ship.png" },
    { id: "aircraft", name: "AIR", icon: "icons/raters/air.png" },
    { id: "ground", name: "GROUND", icon: "icons/raters/ground.png" },
    { id: "missile", name: "MISSILE", icon: "icons/raters/missile.png" },
    { id: "infantry", name: "INFANTRY", icon: "icons/raters/infantry.png" },
    { id: "platform", name: "PLATFORM", icon: "icons/raters/platform.png" },
  ];

  const nextCategory = () => {
    setActiveCategory((prev) => (prev + 1) % categories.length);
  };

  const prevCategory = () => {
    setActiveCategory(
      (prev) => (prev - 1 + categories.length) % categories.length,
    );
  };

  const selectCategory = (index) => {
    setActiveCategory(index);
  };

  const handleRegisterVehicle = async ({ name, domain, cost, data }) => {
    if (!name || !domain || !cost) return;

    const factionData = await databaseService.getFaction(
      "The Solar Wars",
      nationName,
    );

    if (!factionData) return alert("Faction not found");

    const vehicles = factionData.Vehicles || [];
    const replaceIdx = vehicles.findIndex((v) => v.name === name);
    const now = new Date();
    const today = Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
    );

    const newVehicle = {
      ID:
        replaceIdx >= 0
          ? vehicles[replaceIdx].ID
          : vehicles.length
            ? Math.max(...vehicles.map((v) => v.ID)) + 1
            : 1,
      name,
      domain,
      cost,
      data,
      date: today,
    };

    let newVehicles;
    if (replaceIdx >= 0) {
      newVehicles = [...vehicles];
      newVehicles[replaceIdx] = newVehicle;
    } else {
      newVehicles = [...vehicles, newVehicle];
    }

    await databaseService.setFaction("The Solar Wars", nationName, {
      Vehicles: newVehicles,
    });
    alert(
      `${
        replaceIdx >= 0 ? "Vehicle updated" : "Vehicle registered"
      } for ${nationName}!`,
    );
  };

  const renderCalculator = () => {
    const commonProps = {
      nationName,
      onRegister: handleRegisterVehicle,
    };

    switch (categories[activeCategory].id) {
      case "ship":
        return <ShipCalculator {...commonProps} />;
      case "aircraft":
        return <AircraftCalculator {...commonProps} />;
      case "ground":
        return <GroundCalculator {...commonProps} />;
      case "missile":
        return <MissileCalculator {...commonProps} />;
      case "infantry":
        return <InfantryCalculator {...commonProps} />;
      case "platform":
        return <ShipCalculator {...commonProps} />;
      default:
        return <ShipCalculator {...commonProps} />;
    }
  };

  return (
    <div className="shipyards-container">
      <div className="grid-overlay"></div>

      <div className="shipyards-content">
        <div className="shipyards-header">
          <button className="back-btn" onClick={onBack}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"
              />
            </svg>
            <span>RETURN</span>
          </button>
          <h1>SHIPYARDS // {categories[activeCategory].name}</h1>
        </div>

        <div className="tech-frame-container">
          <div className="corner-marker top-left"></div>
          <div className="corner-marker top-right"></div>
          <div className="corner-marker bottom-left"></div>
          <div className="corner-marker bottom-right"></div>

          <div className="calculator-viewport">{renderCalculator()}</div>
        </div>

        {/* Carousel Bottom Dock */}
        <div className="carousel-dock">
          <button className="nav-arrow left" onClick={prevCategory}>
            &lt;
          </button>

          <div className="carousel-track">
            {categories.map((cat, index) => {
              const isActive = index === activeCategory;
              const isNeighbor = Math.abs(activeCategory - index) === 1;

              return (
                <div
                  key={cat.id}
                  className={`carousel-item ${isActive ? "active" : ""} ${
                    !isActive && !isNeighbor ? "dimmed" : ""
                  }`}
                  onClick={() => selectCategory(index)}
                >
                  <div className="cat-icon">
                    <img src={cat.icon} alt={cat.name} />
                  </div>
                  <div className="cat-label">{cat.name}</div>
                </div>
              );
            })}
          </div>

          <button className="nav-arrow right" onClick={nextCategory}>
            &gt;
          </button>
        </div>
      </div>
    </div>
  );
};

export default Shipyards;
