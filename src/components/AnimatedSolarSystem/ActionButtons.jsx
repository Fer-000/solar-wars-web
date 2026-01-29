import React, { useState } from "react";

// --- Styles ---
const styles = {
  container: {
    position: "absolute",
    bottom: "20px",
    right: "20px",
    display: "flex",
    flexDirection: "column-reverse",
    gap: "12px",
    zIndex: 1000,
    alignItems: "flex-end",
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
  expandedButton: {
    opacity: 1,
    transform: "scale(1)",
  },
  collapsedButton: {
    opacity: 0,
    transform: "scale(0)",
    pointerEvents: "none",
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

const MenuIcon = () => (
  <svg {...SvgProps}>
    <circle cx="12" cy="12" r="1"></circle>
    <circle cx="12" cy="5" r="1"></circle>
    <circle cx="12" cy="19" r="1"></circle>
  </svg>
);

const CloseIcon = () => (
  <svg {...SvgProps}>
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const SwordIcon = () => (
  <svg {...SvgProps} viewBox="0 0 24 24">
    {/* Simple stylized sword: blade, crossguard, handle, pommel */}
    <path
      d="M12 2 L12 14"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8 12 L16 12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 14 L12 19"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="20" r="1.25" fill="currentColor" />
  </svg>
);

const WallpaperIcon = () => (
  <svg {...SvgProps}>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <circle cx="8.5" cy="8.5" r="1.5"></circle>
    <polyline points="21 15 16 10 5 21"></polyline>
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
  onWallpaperSystem,
  onWallpaperFight,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showWallpaperMenu, setShowWallpaperMenu] = useState(false);
  const isAnimated = animationLevel === "total";

  return (
    <div style={styles.container}>
      {/* Main FAB Button */}
      <IconButton
        label={isExpanded ? "Close Menu" : "Menu"}
        icon={isExpanded ? CloseIcon : MenuIcon}
        onClick={() => {
          setIsExpanded(!isExpanded);
          setShowWallpaperMenu(false);
        }}
      />

      {/* Expanded Buttons */}
      <div style={isExpanded ? styles.expandedButton : styles.collapsedButton}>
        <IconButton label="Settings" icon={SettingsIcon} onClick={onSettings} />
      </div>
      <div style={isExpanded ? styles.expandedButton : styles.collapsedButton}>
        <IconButton label="Open Wiki" icon={WikiIcon} onClick={onWiki} />
      </div>
      <div style={isExpanded ? styles.expandedButton : styles.collapsedButton}>
        <IconButton
          label="Open SWS"
          icon={SwordIcon}
          onClick={() =>
            window.open("https://sws-development-a5cb2.web.app/", "_blank")
          }
        />
      </div>
      <div style={isExpanded ? styles.expandedButton : styles.collapsedButton}>
        <IconButton
          label="Wallpapers"
          icon={WallpaperIcon}
          onClick={() => setShowWallpaperMenu(!showWallpaperMenu)}
        />
      </div>

      {/* Wallpaper Submenu */}
      {showWallpaperMenu && isExpanded && (
        <div
          style={{
            position: "absolute",
            bottom: "0px",
            right: "60px",
            display: "flex",
            gap: "8px",
            background: "rgba(10, 15, 20, 0.95)",
            border: "1px solid rgba(0, 245, 255, 0.4)",
            borderRadius: "8px",
            padding: "8px",
            boxShadow: "0 0 20px rgba(0, 245, 255, 0.2)",
            backdropFilter: "blur(8px)",
          }}
        >
          <button
            onClick={() => {
              if (onWallpaperSystem) {
                onWallpaperSystem();
                setShowWallpaperMenu(false);
                setIsExpanded(false);
              }
            }}
            style={{
              background: "rgba(0, 245, 255, 0.1)",
              border: "1px solid rgba(0, 245, 255, 0.3)",
              color: "#00f5ff",
              padding: "8px 16px",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "500",
              whiteSpace: "nowrap",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(0, 245, 255, 0.2)";
              e.target.style.borderColor = "rgba(0, 245, 255, 0.6)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgba(0, 245, 255, 0.1)";
              e.target.style.borderColor = "rgba(0, 245, 255, 0.3)";
            }}
          >
            Solar System
          </button>
          <button
            onClick={() => {
              if (onWallpaperFight) {
                onWallpaperFight();
                setShowWallpaperMenu(false);
                setIsExpanded(false);
              }
            }}
            style={{
              background: "rgba(0, 245, 255, 0.1)",
              border: "1px solid rgba(0, 245, 255, 0.3)",
              color: "#00f5ff",
              padding: "8px 16px",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "500",
              whiteSpace: "nowrap",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(0, 245, 255, 0.2)";
              e.target.style.borderColor = "rgba(0, 245, 255, 0.6)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgba(0, 245, 255, 0.1)";
              e.target.style.borderColor = "rgba(0, 245, 255, 0.3)";
            }}
          >
            Space Battle
          </button>
        </div>
      )}
    </div>
  );
}
