import React, { useState } from "react";
import StarField from "./StarField";
import ShipCalculator from "./ShipCalculator";
import AircraftCalculator from "./AircraftCalculator";
import GroundCalculator from "./GroundCalculator";
import MissileCalculator from "./MissileCalculator";
import InfantryCalculator from "./InfantryCalculator";
import "./CenterPage.css";
import "./Shipyards.css";

const Shipyards = ({ onBack, nationName, themeColor = "#646cff" }) => {
  const [activeCategory, setActiveCategory] = useState(0);

  const categories = [
    { id: "ship", name: "Ship", icon: "🚢" },
    { id: "aircraft", name: "Aircraft", icon: "✈️" },
    { id: "ground", name: "Ground", icon: "🚗" },
    { id: "missile", name: "Missile", icon: "🚀" },
    { id: "soldier", name: "Soldier", icon: "🪖" },
    { id: "platform", name: "Platform", icon: "🏗️" },
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

  const renderCalculator = () => {
    switch (categories[activeCategory].id) {
      case "ship":
        return <ShipCalculator />;
      case "aircraft":
        return <AircraftCalculator />;
      case "ground":
        return <GroundCalculator />;
      case "missile":
        return <MissileCalculator />;
      case "soldier":
        return <InfantryCalculator />;
      case "platform":
        return <ShipCalculator />; // Use ship calculator for platforms
      default:
        return <ShipCalculator />;
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
          {categories.map((category, index) => {
            const isActive = index === activeCategory;
            const isVisible =
              Math.abs(index - activeCategory) <= 1 ||
              (activeCategory === 0 && index === categories.length - 1) ||
              (activeCategory === categories.length - 1 && index === 0);

            return (
              <div
                key={category.id}
                className={`category-item ${isActive ? "active" : ""} ${
                  isVisible ? "visible" : "hidden"
                }`}
                onClick={() => selectCategory(index)}
              >
                <div className="category-icon">{category.icon}</div>
                <span className="category-name">{category.name}</span>
              </div>
            );
          })}
        </div>

        <button className="carousel-arrow right" onClick={nextCategory}>
          →
        </button>
      </div>
    </div>
  );
};

export default Shipyards;
