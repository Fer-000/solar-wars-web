import React from "react";

const MobileControls = ({
  onZoomIn,
  onZoomOut,
  onPanUp,
  onPanDown,
  onPanLeft,
  onPanRight,
}) => {
  const buttonBaseStyle = {
    background: "rgba(10, 15, 20, 0.7)",
    border: "1px solid rgba(0, 245, 255, 0.25)",
    boxShadow: "0 0 6px rgba(0, 245, 255, 0.08)",
    color: "#00f5ff",
    borderRadius: "6px",
    fontSize: "16px",
    fontFamily: "monospace",
    cursor: "pointer",
    transition: "transform 0.12s ease, box-shadow 0.12s ease",
    backdropFilter: "blur(3px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    userSelect: "none",
    WebkitUserSelect: "none",
    touchAction: "manipulation",
  };

  const handleButtonPress = (action) => {
    action();
  };

  return (
    <div
      style={{
        position: "absolute",
        bottom: "90px", // Moved up from 18px to avoid ActionButtons
        left: "50%",
        transform: "translateX(-50%)",
        display: "grid",
        gridTemplateColumns: "repeat(3, 50px)",
        gridTemplateRows: "repeat(2, 50px)",
        gap: "6px",
        zIndex: 20,
        padding: "10px",
        background: "rgba(5, 5, 5, 0.25)",
        borderRadius: "10px",
        border: "1px solid rgba(0, 245, 255, 0.12)",
      }}
    >
      {/* Top Row: Zoom Out, Pan Up, Zoom In */}
      <button
        style={{ ...buttonBaseStyle, gridColumn: "1", gridRow: "1" }}
        onTouchStart={(e) => {
          e.preventDefault();
          handleButtonPress(onZoomOut);
        }}
        onClick={(e) => {
          e.stopPropagation();
          onZoomOut();
        }}
        aria-label="Zoom Out"
      >
        −
      </button>

      <button
        style={{ ...buttonBaseStyle, gridColumn: "2", gridRow: "1" }}
        onTouchStart={(e) => {
          e.preventDefault();
          handleButtonPress(onPanUp);
        }}
        onClick={(e) => {
          e.stopPropagation();
          onPanUp();
        }}
        aria-label="Pan Up"
      >
        ▲
      </button>

      <button
        style={{ ...buttonBaseStyle, gridColumn: "3", gridRow: "1" }}
        onTouchStart={(e) => {
          e.preventDefault();
          handleButtonPress(onZoomIn);
        }}
        onClick={(e) => {
          e.stopPropagation();
          onZoomIn();
        }}
        aria-label="Zoom In"
      >
        +
      </button>

      {/* Bottom Row: Pan Left, Pan Down, Pan Right */}
      <button
        style={{ ...buttonBaseStyle, gridColumn: "1", gridRow: "2" }}
        onTouchStart={(e) => {
          e.preventDefault();
          handleButtonPress(onPanLeft);
        }}
        onClick={(e) => {
          e.stopPropagation();
          onPanLeft();
        }}
        aria-label="Pan Left"
      >
        ◀
      </button>

      <button
        style={{ ...buttonBaseStyle, gridColumn: "2", gridRow: "2" }}
        onTouchStart={(e) => {
          e.preventDefault();
          handleButtonPress(onPanDown);
        }}
        onClick={(e) => {
          e.stopPropagation();
          onPanDown();
        }}
        aria-label="Pan Down"
      >
        ▼
      </button>

      <button
        style={{ ...buttonBaseStyle, gridColumn: "3", gridRow: "2" }}
        onTouchStart={(e) => {
          e.preventDefault();
          handleButtonPress(onPanRight);
        }}
        onClick={(e) => {
          e.stopPropagation();
          onPanRight();
        }}
        aria-label="Pan Right"
      >
        ▶
      </button>
    </div>
  );
};

export default MobileControls;
