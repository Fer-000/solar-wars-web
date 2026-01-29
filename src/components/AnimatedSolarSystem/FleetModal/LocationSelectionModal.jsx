import React, { useState } from "react";

const WORLDS = [
  "Mercury",
  "Venus",
  "Earth",
  "Luna",
  "Mars",
  "Ceres",
  "Asteroid Belt Area A",
  "Asteroid Belt Area B",
  "Asteroid Belt Area C",
  "Jupiter",
  "Io",
  "Europa",
  "Ganymede",
  "Callisto",
  "Saturn",
  "Mimas",
  "Enceladus",
  "Tethys",
  "Dione",
  "Rhea",
  "Titan",
  "Iapetus",
  "Uranus",
  "Miranda",
  "Ariel",
  "Umbriel",
  "Titania",
  "Oberon",
  "Neptune",
  "Triton",
  "Proteus",
  "Nereid",
  "Pluto",
  "Charon",
  // Corelli worlds
  "Barcas",
  "Deo Gloria",
  "Novai",
  "Asteroid Belt Area 1",
  "Asteroid Belt Area 2",
  "Asteroid Belt Area 3",
  "Asteroid Belt Area 4",
  "Scipios",
];

export default function LocationSelectionModal({
  currentLocation,
  onSelectLocation,
  onClose,
}) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredWorlds = WORLDS.filter((world) =>
    world.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0, 0, 0, 0.9)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "rgba(12, 12, 14, 0.98)",
          border: "1px solid rgba(0, 245, 255, 0.4)",
          boxShadow: "0 0 40px rgba(0, 245, 255, 0.2)",
          borderRadius: "12px",
          width: "600px",
          maxWidth: "90vw",
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 25px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            background: "rgba(0, 0, 0, 0.3)",
          }}
        >
          <h2
            style={{
              margin: 0,
              color: "#00f5ff",
              fontSize: "1.5rem",
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            Select Destination
          </h2>
          <p style={{ margin: "8px 0 0 0", color: "#888", fontSize: "0.9rem" }}>
            Current: <span style={{ color: "#fff" }}>{currentLocation}</span>
          </p>
        </div>

        {/* Search */}
        <div
          style={{
            padding: "15px 25px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <input
            type="text"
            placeholder="Search planets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 15px",
              background: "rgba(0, 0, 0, 0.4)",
              border: "1px solid rgba(0, 245, 255, 0.3)",
              borderRadius: "6px",
              color: "#fff",
              fontSize: "1rem",
              outline: "none",
            }}
            onFocus={(e) => {
              e.target.style.border = "1px solid rgba(0, 245, 255, 0.6)";
            }}
            onBlur={(e) => {
              e.target.style.border = "1px solid rgba(0, 245, 255, 0.3)";
            }}
          />
        </div>

        {/* Worlds List */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "10px",
          }}
        >
          {filteredWorlds.map((world) => (
            <button
              key={world}
              onClick={() => onSelectLocation(world)}
              disabled={world === currentLocation}
              style={{
                width: "100%",
                padding: "12px 15px",
                margin: "4px 0",
                background:
                  world === currentLocation
                    ? "rgba(0, 245, 255, 0.1)"
                    : "rgba(255, 255, 255, 0.05)",
                border:
                  world === currentLocation
                    ? "1px solid rgba(0, 245, 255, 0.4)"
                    : "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "6px",
                color: world === currentLocation ? "#00f5ff" : "#fff",
                fontSize: "1rem",
                cursor: world === currentLocation ? "not-allowed" : "pointer",
                textAlign: "left",
                transition: "all 0.2s",
                opacity: world === currentLocation ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if (world !== currentLocation) {
                  e.currentTarget.style.background = "rgba(0, 245, 255, 0.15)";
                  e.currentTarget.style.border =
                    "1px solid rgba(0, 245, 255, 0.6)";
                }
              }}
              onMouseLeave={(e) => {
                if (world !== currentLocation) {
                  e.currentTarget.style.background =
                    "rgba(255, 255, 255, 0.05)";
                  e.currentTarget.style.border =
                    "1px solid rgba(255, 255, 255, 0.1)";
                }
              }}
            >
              {world}
              {world === currentLocation && (
                <span
                  style={{
                    marginLeft: "10px",
                    fontSize: "0.8rem",
                    color: "#666",
                  }}
                >
                  (Current)
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "15px 25px",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            background: "rgba(0, 0, 0, 0.3)",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "10px 20px",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "6px",
              color: "#fff",
              fontSize: "0.9rem",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
