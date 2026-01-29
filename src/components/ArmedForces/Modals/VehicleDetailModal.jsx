import React from "react";
// import databaseService from "../../../services/database"; // Unused, commented out

export default function VehicleDetailModal({
  vehicleName,
  allVehicles,
  onClose,
}) {
  // Find data in the passed array
  const vehicle = allVehicles.find((v) => v.name === vehicleName) || {};

  // Format numbers with a space every three digits for readability (e.g. 24000 -> "24 000")
  const fmt = (v) => {
    if (typeof v === "number")
      return v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    if (typeof v === "string" && /^\d+$/.test(v))
      return v.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    return String(v);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="unit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{vehicle.name || "UNKNOWN CLASS"}</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-content">
          {!vehicle.name ? (
            <div
              style={{ padding: "40px", textAlign: "center", color: "#666" }}
            >
              NO DATA FOUND
            </div>
          ) : (
            <div className="unit-info-grid">
              {/* Tech Specs */}
              <div className="info-section">
                <h4>SPECIFICATIONS</h4>
                {vehicle.data ? (
                  Object.entries(vehicle.data).map(([key, val]) => (
                    <div
                      key={key}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        borderBottom: "1px dashed rgba(255,255,255,0.1)",
                        padding: "4px 0",
                        fontSize: "0.9rem",
                      }}
                    >
                      <span style={{ color: "#888" }}>{key}:</span>
                      <span style={{ color: "#fff" }}>{String(val)}</span>
                    </div>
                  ))
                ) : (
                  <div style={{ color: "#666" }}>No Specs Available</div>
                )}
              </div>

              {/* Cost */}
              <div className="info-section">
                <h4>MANUFACTURE COST</h4>
                {vehicle.cost ? (
                  ["ER", "CM", "EL", "CS"].map((k) => {
                    const v = vehicle.cost[k];
                    if (v === undefined || v === null) return null;
                    return (
                      <div
                        key={k}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "4px 0",
                          fontSize: "0.9rem",
                        }}
                      >
                        <span style={{ color: "#00f5ff" }}>{k}:</span>
                        <span style={{ color: "#fff", fontWeight: "bold" }}>
                          {fmt(v)}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ color: "#666" }}>No Cost Data</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
