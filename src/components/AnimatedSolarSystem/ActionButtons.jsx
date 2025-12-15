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

export default function ActionButtons({ onClose }) {
  const [isHoveringClose, setIsHoveringClose] = useState(false);

  return (
    <div
      style={{
        position: "absolute",
        top: "20px",
        right: "20px",
        display: "flex",
        gap: "10px",
        zIndex: 11,
      }}
    >
      <button
        onClick={() => onClose && onClose()}
        style={{
          ...buttonStyle,
          position: "relative",
          width: "40px",
          padding: 0,
          borderColor: "#f44336",
          color: "#f44336",
          boxShadow: "0 0 10px rgba(244, 67, 54, 0.2)",
          ...(isHoveringClose ? { background: "#f44336", color: "#fff" } : {}),
        }}
        onMouseEnter={() => setIsHoveringClose(true)}
        onMouseLeave={() => setIsHoveringClose(false)}
      >
        ✕
      </button>
    </div>
  );
}
