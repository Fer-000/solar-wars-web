import React from "react";

export default function WarningToast({ message, opacity }) {
  if (!message) return null;
  return (
    <div
      style={{
        position: "absolute",
        bottom: "40px",
        left: "50%",
        transform: "translateX(-50%)",
        color: "#FFD700",
        pointerEvents: "none",
        fontSize: "16px",
        fontWeight: "bold",
        textAlign: "center",
        textShadow: "0 0 10px rgba(255, 215, 0, 0.8), 2px 2px 4px #000",
        opacity: opacity,
        transition: "opacity 0.5s ease-in-out",
        maxWidth: "80%",
        padding: "12px 24px",
        background: "rgba(0, 0, 0, 0.8)",
        borderRadius: "8px",
        border: "1px solid rgba(255, 215, 0, 0.6)",
        boxShadow: "0 0 20px rgba(255, 215, 0, 0.2)",
        zIndex: 999,
      }}
    >
      {message}
    </div>
  );
}
