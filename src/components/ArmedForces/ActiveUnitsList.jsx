import React from "react";

export default function ActiveUnitsList({
  units,
  allVehicles,
  loading,
  onSelect,
  onCreate,
}) {
  return (
    <div className="center-card">
      <div className="tech-corners" />
      <h3>Active Units</h3>

      <div className="units-scroll-container">
        {loading ? (
          <div
            style={{
              textAlign: "center",
              padding: "40px",
              color: "#00f5ff",
              fontFamily: "monospace",
            }}
          >
            DOWNLOADING FLEET DATA...
          </div>
        ) : units.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "40px",
              color: "#666",
              fontFamily: "monospace",
            }}
          >
            NO ACTIVE UNITS DETECTED
          </div>
        ) : (
          units.map((unit) => {
            const count =
              unit.vehicles && allVehicles.length > 0
                ? unit.vehicles.reduce((sum, v) => sum + v.count, 0)
                : unit.ships;

            return (
              <button
                key={unit.id}
                className="unit-button"
                onClick={() => onSelect(unit)}
              >
                <div className="unit-header">
                  <h4>{unit.name}</h4>
                  <span
                    className={`unit-status ${unit.state ? unit.state.toLowerCase() : ""}`}
                  >
                    {unit.state}
                  </span>
                </div>

                <div className="unit-details" style={{ marginTop: "5px" }}>
                  <span style={{ color: "#888", fontSize: "0.8rem" }}>
                    ASSETS:{" "}
                    <span style={{ color: "#fff", fontWeight: "bold" }}>
                      {count}
                    </span>
                  </span>
                </div>

                <p
                  className="unit-location"
                  style={{
                    color: "#00f5ff",
                    fontSize: "0.8rem",
                    marginTop: "5px",
                    margin: 0,
                  }}
                >
                  LOCATION:{" "}
                  {unit.location ? unit.location.toUpperCase() : "UNKNOWN"}
                </p>
              </button>
            );
          })
        )}
      </div>

      <button className="create-unit-btn" onClick={onCreate} disabled={loading}>
        + INITIALIZE NEW FLEET
      </button>
    </div>
  );
}
