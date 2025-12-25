import React, { useState } from "react";

// --- Styles ---
const styles = {
  container: {
    position: "absolute",
    bottom: "20px",
    right: "20px",
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
    width: "44px",
    height: "44px",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
    outline: "none",
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

const SettingsIcon = () => (
  <svg {...SvgProps}>
    {/* Geometric 8-tooth Cog (Material Style) */}
    <path d="M12 15c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3Z" />
    <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.56-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .43-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58ZM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6Z" />
  </svg>
);

const WikiIcon = () => (
  <svg {...SvgProps}>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
  </svg>
);

const ShipyardIcon = () => (
  <svg {...SvgProps}>
    {/* Main Hull */}
    <path d="M12 2L4 18.5 5.5 22 12 18l6.5 4 1.5-3.5L12 2z" />
    {/* Engine Center Line */}
    <path d="M12 12v6" />
  </svg>
);

// --- Internal Helper ---
const IconButton = ({ icon: IconComponent, onClick, label }) => {
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
    </button>
  );
};

export default function ActionButtons({
  animationLevel,
  onAnimationToggle,
  onSettings,
  onWiki,
  onShipyard,
}) {
  const isAnimated = animationLevel === "total";

  return (
    <div style={styles.container}>
      <IconButton label="Shipyard" icon={ShipyardIcon} onClick={onShipyard} />
      <IconButton label="Open Wiki" icon={WikiIcon} onClick={onWiki} />
      <IconButton label="Settings" icon={SettingsIcon} onClick={onSettings} />
    </div>
  );
}
