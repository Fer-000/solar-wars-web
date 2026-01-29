import React, { useState } from "react";

export default function RenameFleetModal({ unit, onClose, onSave }) {
  const [name, setName] = useState(unit.name || "");
  const [type, setType] = useState(unit.type || "Space");

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim(), type);
    }
  };

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
          width: "500px",
          maxWidth: "90vw",
          padding: "30px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          style={{
            color: "#00f5ff",
            fontSize: "1.5rem",
            marginBottom: "20px",
            fontFamily: "monospace",
            textTransform: "uppercase",
          }}
        >
          // RENAME FLEET
        </h2>

        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              color: "#888",
              marginBottom: "8px",
              fontSize: "0.9rem",
              fontFamily: "monospace",
            }}
          >
            Fleet Name:
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter fleet name"
            autoFocus
            style={{
              width: "100%",
              padding: "12px",
              background: "rgba(0, 0, 0, 0.5)",
              border: "1px solid rgba(0, 245, 255, 0.3)",
              borderRadius: "4px",
              color: "#fff",
              fontSize: "1rem",
              fontFamily: "monospace",
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

        <div style={{ marginBottom: "30px" }}>
          <label
            style={{
              display: "block",
              color: "#888",
              marginBottom: "8px",
              fontSize: "0.9rem",
              fontFamily: "monospace",
            }}
          >
            Fleet Type:
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              background: "rgba(0, 0, 0, 0.5)",
              border: "1px solid rgba(0, 245, 255, 0.3)",
              borderRadius: "4px",
              color: "#fff",
              fontSize: "1rem",
              fontFamily: "monospace",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="Space">Space</option>
            <option value="Ground">Ground</option>
            <option value="Air">Air</option>
          </select>
        </div>

        <div
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "10px 20px",
              background: "rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "4px",
              color: "#fff",
              fontSize: "0.9rem",
              fontFamily: "monospace",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(255, 255, 255, 0.15)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgba(255, 255, 255, 0.1)";
            }}
          >
            CANCEL
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            style={{
              padding: "10px 20px",
              background: name.trim()
                ? "rgba(0, 245, 255, 0.2)"
                : "rgba(100, 100, 100, 0.2)",
              border: name.trim()
                ? "1px solid rgba(0, 245, 255, 0.4)"
                : "1px solid rgba(100, 100, 100, 0.3)",
              borderRadius: "4px",
              color: name.trim() ? "#00f5ff" : "#666",
              fontSize: "0.9rem",
              fontFamily: "monospace",
              cursor: name.trim() ? "pointer" : "not-allowed",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              if (name.trim()) {
                e.target.style.background = "rgba(0, 245, 255, 0.3)";
              }
            }}
            onMouseLeave={(e) => {
              if (name.trim()) {
                e.target.style.background = "rgba(0, 245, 255, 0.2)";
              }
            }}
          >
            SAVE
          </button>
        </div>
      </div>
    </div>
  );
}
