import React from "react";
import { Icons } from "./Icons";

const SCIFI_CYAN = "#00f3ff";

const SciFiOverlay = ({
  onClose,
  currentTool,
  onToggleTool,
  mode,
  onToggleMode,
  onSave,
  onShowWorldDetail,
}) => {
  const toolIcon = {
    brush: <Icons.Brush />,
    bucket: <Icons.Bucket />,
    eraser: <Icons.Eraser />,
  };

  return (
    <div style={overlayContainerStyle}>
      {/* Top Bar: Just the Close Button now */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end", // Align to right
          padding: "20px",
          pointerEvents: "none", // Ensure clicks pass through empty space
        }}
      >
        <button onClick={onClose} style={sciFiBtnStyle}>
          <Icons.Close />
        </button>
      </div>

      {/* Bottom Controls: All functional buttons here */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "flex-end",
          gap: "10px", // Slightly tighter gap for the icon row
          padding: "20px",
        }}
      >
        {/* Save Button (only in edit mode) */}
        {mode === "edit" && onSave && (
          <button
            onClick={onSave}
            style={{ ...sciFiBtnStyle, color: SCIFI_CYAN }}
            title="Save Changes"
          >
            <Icons.Save />
          </button>
        )}

        {/* World Detail Button */}
        {onShowWorldDetail && (
          <button
            onClick={onShowWorldDetail}
            style={{ ...sciFiBtnStyle, color: SCIFI_CYAN }}
            title="Show World Details"
          >
            <Icons.Anim />
          </button>
        )}

        {/* Mode Toggle (Edit/View Eye Icon) - Moved Here, No Text */}
        <button
          onClick={onToggleMode}
          style={{
            ...sciFiBtnStyle,
            color: mode === "edit" ? SCIFI_CYAN : "#555",
          }}
          title={
            mode === "edit" ? "Switch to View Mode" : "Switch to Edit Mode"
          }
        >
          {mode === "edit" ? <Icons.Edit /> : <Icons.Eye />}
        </button>

        {/* Tool Selector HUD (Only visible in Edit Mode) */}
        {mode === "edit" && (
          <div style={hudContainerStyle}>
            <div style={sysTextStyle}>Tool: {currentTool}</div>
            <button onClick={onToggleTool} style={bigBtnStyle}>
              {toolIcon[currentTool]}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Internal Styles
const overlayContainerStyle = {
  position: "absolute",
  inset: 0,
  pointerEvents: "none",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
};

const sciFiBtnStyle = {
  pointerEvents: "auto",
  background: "rgba(0, 20, 40, 0.85)",
  border: `1px solid ${SCIFI_CYAN}`,
  color: SCIFI_CYAN,
  width: "42px", // Fixed width for square icon look
  height: "42px", // Fixed height
  padding: "0", // Remove padding to center icon
  cursor: "pointer",
  clipPath: "polygon(10% 0, 100% 0, 100% 90%, 90% 100%, 0 100%, 0 10%)",
  boxShadow: `0 0 8px rgba(0, 243, 255, 0.1)`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "all 0.2s ease",
};

const bigBtnStyle = {
  ...sciFiBtnStyle,
  width: "60px",
  height: "60px",
  borderRadius: "0",
  fontSize: "1.2rem",
};

const hudContainerStyle = {
  pointerEvents: "auto",
  background: "rgba(0,0,0,0.7)",
  borderTop: `2px solid ${SCIFI_CYAN}`,
  padding: "15px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  clipPath: "polygon(15% 0, 100% 0, 100% 100%, 0 100%, 0 15%)",
  backdropFilter: "blur(4px)",
  marginLeft: "10px", // Add separation from the small buttons
};

const sysTextStyle = {
  fontSize: "10px",
  color: SCIFI_CYAN,
  marginBottom: "5px",
  textTransform: "uppercase",
};

export { SciFiOverlay };
export default SciFiOverlay;
