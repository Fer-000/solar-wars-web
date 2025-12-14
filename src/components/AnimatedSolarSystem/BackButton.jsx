import React, { useState } from "react";

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
  gap: "8px",
};

const hoverStyle = {
  background: "rgba(0, 245, 255, 0.15)",
  border: "1px solid rgba(0, 245, 255, 0.8)",
  boxShadow: "0 0 15px rgba(0, 245, 255, 0.3)",
  color: "#fff",
};

export default function BackButton({ focusedBody, onBack, onBackToSystems }) {
  const [isHovering, setIsHovering] = useState(false);

  if (focusedBody) {
    return (
      <button
        onClick={onBack}
        style={{
          ...buttonStyle,
          top: "20px",
          left: "20px",
          ...(isHovering ? hoverStyle : {}),
        }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        ← Back to System
      </button>
    );
  }

  return (
    <button
      onClick={onBackToSystems}
      style={{
        ...buttonStyle,
        top: "20px",
        left: "20px",
        position: "absolute",
        zIndex: 12,
        ...(isHovering ? hoverStyle : {}),
      }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      ← Back to Systems
    </button>
  );
}
