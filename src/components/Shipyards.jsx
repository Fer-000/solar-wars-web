import React, { useState } from "react";
import StarField from "./StarField";
import ShipCalculator from "./ShipCalculator";
import AircraftCalculator from "./AircraftCalculator";
import GroundCalculator from "./GroundCalculator";
import MissileCalculator from "./MissileCalculator";
import InfantryCalculator from "./InfantryCalculator";
import "./CenterPage.css";
import "./Shipyards.css";

const Shipyards = ({
  onBack,
  nationName,
  themeColor = "#646cff",
  dbLoaded,
}) => {
  if (!dbLoaded) {
    return (
      <div className="center-page shipyards-page">
        <div style={{ textAlign: "center", padding: "80px" }}>
          <h2>Loading database...</h2>
        </div>
      </div>
    );
  }

  const [activeCategory, setActiveCategory] = useState(0);

  const categories = [
    { id: "ship", name: "Ship", icon: "icons/raters/ship.png" },
    { id: "aircraft", name: "Aircraft", icon: "icons/raters/air.png" },
    { id: "ground", name: "Ground", icon: "icons/raters/ground.png" },
    { id: "missile", name: "Missile", icon: "icons/raters/missile.png" },
    { id: "infantry", name: "Infantry", icon: "icons/raters/infantry.png" },
    { id: "platform", name: "Platform", icon: "icons/raters/platform.png" },
  ];

  const vehicles = [
    {
      name: "Interceptor MK-VII",
      type: "Fighter",
      rating: 4.2,
      status: "Active",
      category: "ship",
    },
    {
      name: "Titan Hauler",
      type: "Transport",
      rating: 3.8,
      status: "Active",
      category: "ship",
    },
    {
      name: "Stealth Corvette",
      type: "Stealth",
      rating: 4.7,
      status: "Development",
      category: "ship",
    },
    {
      name: "Mining Drone X1",
      type: "Utility",
      rating: 3.5,
      status: "Active",
      category: "aircraft",
    },
  ];

  const filteredVehicles = vehicles.filter(
    (vehicle) => vehicle.category === categories[activeCategory].id
  );

  const nextCategory = () => {
    setActiveCategory((prev) => (prev + 1) % categories.length);
  };

  const prevCategory = () => {
    setActiveCategory(
      (prev) => (prev - 1 + categories.length) % categories.length
    );
  };

  const selectCategory = (index) => {
    setActiveCategory(index);
  };

  // Registration logic for vehicles, matching bot behavior
  const handleRegisterVehicle = async ({ name, domain, cost, data }) => {
    if (!name || !domain || !cost) return;
    const databaseService = (await import("../services/database")).default;
    // Get current faction data
    const factionData = await databaseService.getFaction(
      "The Solar Wars",
      nationName
    );
    if (!factionData) return alert("Faction not found");
    // Check for existing vehicle
    const vehicles = factionData.Vehicles || [];
    const replaceIdx = vehicles.findIndex((v) => v.name === name);
    const now = new Date();
    const today = Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate()
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
      } for ${nationName}!`
    );
  };

  const renderCalculator = () => {
    switch (categories[activeCategory].id) {
      case "ship":
        return (
          <ShipCalculator
            nationName={nationName}
            onRegister={handleRegisterVehicle}
          />
        );
      case "aircraft":
        return (
          <ShipCalculator
            nationName={nationName}
            onRegister={handleRegisterVehicle}
          />
        );
      case "ground":
        return (
          <GroundCalculator
            nationName={nationName}
            onRegister={handleRegisterVehicle}
          />
        );
      case "missile":
        return (
          <MissileCalculator
            nationName={nationName}
            onRegister={handleRegisterVehicle}
          />
        );
      case "infantry":
        return (
          <InfantryCalculator
            nationName={nationName}
            onRegister={handleRegisterVehicle}
          />
        );
      case "platform":
        return (
          <ShipCalculator
            nationName={nationName}
            onRegister={handleRegisterVehicle}
          />
        ); // Use ship calculator for platforms
      default:
        return (
          <ShipCalculator
            nationName={nationName}
            onRegister={handleRegisterVehicle}
          />
        );
    }
  };

  return (
    <div className="center-page shipyards-page">
      <StarField density={120} />
      <div
        className="blueprint-background"
        data-category={categories[activeCategory].id}
      >
        <div className="blueprint-grid"></div>
        <div className="blueprint-lines"></div>
      </div>
      <div className="center-content">
        <div className="center-header">
          <button className="back-button" onClick={onBack}>
            ← Back to Dashboard
          </button>
          <h1>🏭 Shipyards</h1>
          <p className="center-subtitle">{nationName} Vehicle Management</p>
        </div>

        <div className="center-grid">
          <div className="center-card full-width">{renderCalculator()}</div>
        </div>
      </div>

      {/* Carousel at bottom */}
      <div className="category-carousel">
        <button className="carousel-arrow left" onClick={prevCategory}>
          ←
        </button>

        <div className="carousel-container">
          {(() => {
            const items = [];
            const prevIdx =
              (activeCategory - 1 + categories.length) % categories.length;
            const nextIdx = (activeCategory + 1) % categories.length;
            // Show prev, active, next
            [prevIdx, activeCategory, nextIdx].forEach((idx, i) => {
              const category = categories[idx];
              const isActive = idx === activeCategory;
              items.push(
                <div
                  key={category.id}
                  className={`category-item${isActive ? " active" : ""}`}
                  onClick={() => selectCategory(idx)}
                  style={{
                    opacity: isActive ? 1 : 0.6,
                    transform: isActive ? "scale(1.1)" : "scale(0.95)",
                    zIndex: isActive ? 2 : 1,
                    margin: "0 12px",
                    transition: "all 0.3s",
                  }}
                >
                  <div className="category-icon">
                    {category.icon.endsWith(".png") ? (
                      <img
                        src={category.icon}
                        alt={category.name}
                        style={{ width: 50, height: 50 }}
                        className="category-icon-img"
                      />
                    ) : (
                      <span style={{ fontSize: 50 }}>{category.icon}</span>
                    )}
                  </div>
                  <span className="category-name">{category.name}</span>
                </div>
              );
            });
            return items;
          })()}
        </div>

        <button className="carousel-arrow right" onClick={nextCategory}>
          →
        </button>
      </div>
    </div>
  );
};

export default Shipyards;
