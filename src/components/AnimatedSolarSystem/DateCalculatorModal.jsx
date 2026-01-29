import React, { useState } from "react";
import { getSolarDate, formatSolarDate } from "../../utils/dateUtils";

export default function DateCalculatorModal({ currentDate, onClose }) {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [selectedTime, setSelectedTime] = useState("12:00");

  const calculateGameDate = () => {
    const irlDateTime = new Date(`${selectedDate}T${selectedTime}`);
    return formatSolarDate(irlDateTime);
  };

  const calculatedDate = calculateGameDate();

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
          padding: "30px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          style={{
            color: "#00f5ff",
            fontSize: "1.8rem",
            marginBottom: "10px",
            fontFamily: "monospace",
            textTransform: "uppercase",
          }}
        >
          DATE CALCULATOR
        </h2>

        <div
          style={{
            color: "#888",
            fontSize: "0.9rem",
            marginBottom: "30px",
            fontFamily: "monospace",
          }}
        >
          Calculate the game date for any real-world date and time
        </div>

        {/* Current Date Display */}
        <div
          style={{
            background: "rgba(0, 245, 255, 0.1)",
            border: "1px solid rgba(0, 245, 255, 0.3)",
            borderRadius: "8px",
            padding: "15px",
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              color: "#888",
              fontSize: "0.85rem",
              marginBottom: "5px",
              fontFamily: "monospace",
            }}
          >
            CURRENT GAME DATE:
          </div>
          <div
            style={{
              color: "#00f5ff",
              fontSize: "1.2rem",
              fontFamily: "monospace",
              fontWeight: "bold",
            }}
          >
            {currentDate}
          </div>
        </div>

        {/* Date Input */}
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
            IRL Date:
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
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
          />
        </div>

        {/* Time Input */}
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
            IRL Time:
          </label>
          <input
            type="time"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
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
          />
        </div>

        {/* Result Display */}
        <div
          style={{
            background: "rgba(0, 0, 0, 0.4)",
            border: "1px solid rgba(0, 245, 255, 0.4)",
            borderRadius: "8px",
            padding: "20px",
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              color: "#888",
              fontSize: "0.85rem",
              marginBottom: "8px",
              fontFamily: "monospace",
            }}
          >
            CALCULATED GAME DATE:
          </div>
          <div
            style={{
              color: "#fff",
              fontSize: "1.4rem",
              fontFamily: "monospace",
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            {calculatedDate}
          </div>
          <div
            style={{
              color: "#666",
              fontSize: "0.8rem",
              marginTop: "8px",
              fontFamily: "monospace",
              textAlign: "center",
            }}
          >
            {selectedDate} at {selectedTime}
          </div>
        </div>

        {/* Close Button */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "12px 30px",
              background: "rgba(0, 245, 255, 0.2)",
              border: "1px solid rgba(0, 245, 255, 0.4)",
              borderRadius: "4px",
              color: "#00f5ff",
              fontSize: "0.9rem",
              fontFamily: "monospace",
              cursor: "pointer",
              transition: "all 0.2s",
              textTransform: "uppercase",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(0, 245, 255, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgba(0, 245, 255, 0.2)";
            }}
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}
