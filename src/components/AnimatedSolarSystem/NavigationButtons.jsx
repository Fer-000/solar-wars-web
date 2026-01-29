import React, { useState } from "react";

// --- Styles ---
const styles = {
  container: {
    position: "absolute",
    bottom: "20px",
    left: "20px",
    display: "flex",
    flexDirection: "row",
    gap: "12px",
    zIndex: 1000,
  },
  button: {
    background: "rgba(10, 15, 20, 0.85)",
    border: "1px solid rgba(0, 245, 255, 0.4)",
    boxShadow: "0 0 10px rgba(0, 245, 255, 0.1)",
    color: "#00f5ff",
    height: "44px",
    padding: "0 16px",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    outline: "none",
    fontSize: "14px",
    fontWeight: "600",
    whiteSpace: "nowrap",
  },
  hover: {
    background: "rgba(0, 245, 255, 0.15)",
    border: "1px solid rgba(0, 245, 255, 0.8)",
    boxShadow: "0 0 15px rgba(0, 245, 255, 0.3)",
    color: "#fff",
    transform: "translateY(-2px)",
  },
};

// --- SVG Icons ---
const SvgProps = {
  xmlns: "http://www.w3.org/2000/svg",
  width: "20",
  height: "20",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

const ShipyardIcon = () => (
  <svg {...SvgProps}>
    {/* Main Hull */}
    <path d="M12 2L4 18.5 5.5 22 12 18l6.5 4 1.5-3.5L12 2z" />
    {/* Engine Center Line */}
    <path d="M12 12v6" />
  </svg>
);

const ArmedForcesIcon = () => (
  <svg {...SvgProps}>
    {/* Shield outline */}
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
    {/* Cross inside shield */}
    <path d="M12 8v8"></path>
    <path d="M8 12h8"></path>
  </svg>
);

// --- Internal Helper ---
const NavButton = ({ icon: IconComponent, onClick, label }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick && onClick();
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={label}
      aria-label={label}
      style={{
        ...styles.button,
        ...(isHovered ? styles.hover : {}),
      }}
    >
      <IconComponent />
      <span>{label}</span>
    </button>
  );
};

export default function NavigationButtons({ onShipyard, onArmedForces }) {
  return (
    <div style={styles.container}>
      <NavButton label="Shipyards" icon={ShipyardIcon} onClick={onShipyard} />
      <NavButton
        label="Armed Forces"
        icon={ArmedForcesIcon}
        onClick={onArmedForces}
      />
    </div>
  );
}
