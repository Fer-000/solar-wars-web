import React, { useState } from "react";
import ResourceCarousel from "./ResourceCarousel";

const PlanetIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="7" />
    {/* The ring with lower opacity so it doesn't obscure the planet circle completely */}
    <path
      d="M22 12c0 3-4.5 6-10 6s-10-3-10-6 4.5-6 10-6 10 3 10 6z"
      opacity="0.6"
    />
  </svg>
);

// A sharp, 4-pointed star/sparkle representing a system or sun
const StarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2L14.5 8.5L21 10L14.5 11.5L12 18L9.5 11.5L3 10L9.5 8.5L12 2Z" />
  </svg>
);
const buttonStyle = {
  position: "absolute",
  background: "rgba(10, 15, 20, 0.75)",
  border: "1px solid rgba(0, 245, 255, 0.4)",
  boxShadow: "0 0 10px rgba(0, 245, 255, 0.1)",
  color: "#00f5ff",
  padding: "10px 20px",
  borderRadius: "6px",
  fontSize: "14px",
  fontFamily: "monospace",
  textTransform: "uppercase",
  letterSpacing: "1px",
  cursor: "pointer",
  transition: "all 0.2s ease",
  backdropFilter: "blur(4px)",
  zIndex: 10,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px", // This gap will separate the new icon from the text
};

const hoverStyle = {
  background: "rgba(0, 245, 255, 0.15)",
  border: "1px solid rgba(0, 245, 255, 0.8)",
  boxShadow: "0 0 15px rgba(0, 245, 255, 0.3)",
  color: "#fff",
};

// === COMPONENT ===

export default function BackButton({
  focusedBody,
  onBack,
  onBackToSystems,
  resources,
}) {
  const [isHovering, setIsHovering] = useState(false);

  // State 1: Focused on a specific planet/moon. Back button goes up one level.
  if (focusedBody) {
    return (
      <button
        onClick={(e) => {
          console.log(
            "[BackButton] Clicked while focused on:",
            focusedBody.name
          );
          e.stopPropagation();
          onBack();
        }}
        style={{
          ...buttonStyle,
          top: "20px",
          left: "20px",
          ...(isHovering ? hoverStyle : {}),
        }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <PlanetIcon />
      </button>
    );
  }

  // State 2: Not focused (at solar system view). Show resource carousel.
  return (
    <ResourceCarousel resources={resources} onBackToSystems={onBackToSystems} />
  );
}
