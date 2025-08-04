import React from "react";
import "./HeaderMenu.css";

const HeaderMenu = ({ onNavigation }) => {
  const menuItems = [
    { id: "overview", label: "Overview", icon: "🌍" },
    { id: "fleet", label: "Fleet", icon: "🚀" },
    { id: "diplomacy", label: "Diplomacy", icon: "🤝" },
  ];

  return (
    <header className="header-menu">
      <div className="header-content">
        <div className="logo-section">
          <h2>Solar Wars</h2>
        </div>
        <nav className="nav-section">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className="nav-button"
              onClick={() => onNavigation(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default HeaderMenu;
