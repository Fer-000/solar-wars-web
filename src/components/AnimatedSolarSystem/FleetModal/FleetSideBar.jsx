import React from "react";

export default function FleetSideBar({
  selectedFleet,
  currentFaction,
  toggleFactionCollapse,
  onClose,
  operationalMode,
  onOperationalModeChange,
  onLocationClick,
  editMode,
  setEditMode,
  onTransferShips,
  isSaving,
}) {
  const isOwnFleet =
    selectedFleet.factionName.toLowerCase() === currentFaction.toLowerCase();
  const operationalModes = [
    "Idle",
    "Patrol",
    "Defense",
    "Battle",
    "Activating",
    "Transit",
  ];

  const toggleOperationalMode = () => {
    if (!isOwnFleet || isSaving) return;
    const currentIndex = operationalModes.indexOf(operationalMode);
    const nextIndex = (currentIndex + 1) % operationalModes.length;
    const nextMode = operationalModes[nextIndex];
    onOperationalModeChange(nextMode);
  };

  return (
    <div
      style={{
        width: "35%",
        padding: "25px",
        background: "rgba(0, 0, 0, 0.2)",
        borderRight: "1px solid rgba(255, 255, 255, 0.05)",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        overflowY: "auto",
      }}
    >
      <div>
        <div
          style={{
            fontSize: "0.8rem",
            color: "#666",
            textTransform: "uppercase",
            marginBottom: "8px",
          }}
        >
          Operational Status {isOwnFleet && "(Click to change)"}
        </div>
        <div
          onClick={toggleOperationalMode}
          style={{
            display: "inline-block",
            padding: "6px 12px",
            borderRadius: "4px",
            background:
              operationalMode === "Battle"
                ? "rgba(244, 67, 54, 0.2)"
                : "rgba(0, 245, 255, 0.1)",
            border:
              operationalMode === "Battle"
                ? "1px solid #f44336"
                : "1px solid #00f5ff",
            color: operationalMode === "Battle" ? "#f44336" : "#00f5ff",
            fontWeight: "bold",
            fontSize: "0.9rem",
            cursor: isOwnFleet ? "pointer" : "default",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            if (isOwnFleet) {
              e.currentTarget.style.transform = "scale(1.05)";
            }
          }}
          onMouseLeave={(e) => {
            if (isOwnFleet) {
              e.currentTarget.style.transform = "scale(1)";
            }
          }}
        >
          {operationalMode.toUpperCase()}
        </div>
      </div>

      <div>
        <div
          style={{
            fontSize: "0.8rem",
            color: "#666",
            textTransform: "uppercase",
            marginBottom: "8px",
          }}
        >
          Current Location {isOwnFleet && "(Click to change)"}
        </div>
        <div
          onClick={() => isOwnFleet && !isSaving && onLocationClick()}
          style={{
            fontSize: "1.2rem",
            color: "#fff",
            fontWeight: "500",
            cursor: isOwnFleet && !isSaving ? "pointer" : "default",
            transition: "all 0.2s",
            display: "inline-block",
          }}
          onMouseEnter={(e) => {
            if (isOwnFleet && !isSaving) {
              e.currentTarget.style.color = "#00f5ff";
            }
          }}
          onMouseLeave={(e) => {
            if (isOwnFleet && !isSaving) {
              e.currentTarget.style.color = "#fff";
            }
          }}
        >
          {selectedFleet.State?.Location || "Deep Space"}
        </div>
        <div style={{ fontSize: "0.9rem", color: "#888", marginTop: "4px" }}>
          Type: {selectedFleet.Type || "Standard Fleet"}
        </div>
      </div>

      {isOwnFleet && (
        <button
          onClick={() => onTransferShips()}
          disabled={isSaving}
          style={{
            padding: "10px 16px",
            background: "rgba(255, 255, 255, 0.05)",
            color: "#ccc",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "6px",
            cursor: isSaving ? "not-allowed" : "pointer",
            fontSize: "14px",
            fontWeight: "bold",
            transition: "all 0.2s",
            textTransform: "uppercase",
            opacity: isSaving ? 0.5 : 1,
          }}
          onMouseEnter={(e) => {
            if (!isSaving) {
              e.currentTarget.style.background = "rgba(0, 245, 255, 0.15)";
              e.currentTarget.style.color = "#00f5ff";
            }
          }}
          onMouseLeave={(e) => {
            if (!isSaving) {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
              e.currentTarget.style.color = "#ccc";
            }
          }}
        >
          {isSaving ? "Saving..." : "⚙ Transfer Ships"}
        </button>
      )}

      {selectedFleet.factionName.toLowerCase() !==
        currentFaction.toLowerCase() && (
        <div
          style={{
            marginTop: "auto",
            paddingTop: "20px",
            borderTop: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <button
            onClick={() => {
              toggleFactionCollapse(
                selectedFleet.factionName,
                selectedFleet.State?.Location
              );
              onClose && onClose();
            }}
            style={{
              width: "100%",
              padding: "12px",
              background: "rgba(255, 255, 255, 0.05)",
              color: "#ccc",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
              e.currentTarget.style.color = "white";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
              e.currentTarget.style.color = "#ccc";
            }}
          >
            <span>▼</span> Collapse Faction Presence
          </button>
        </div>
      )}
    </div>
  );
}
