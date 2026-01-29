import React, { useState, useEffect } from "react";

const styles = {
  container: {
    position: "absolute",
    top: "20px",
    left: "20px",
    borderRadius: "4px",
    padding: "10px 20px",
    display: "flex",
    // --- UPDATED LINES ---
    flexWrap: "wrap", // Allows items to drop to the next line
    maxWidth: "calc(100vw - 40px)", // Constrains width to viewport so it wraps
    boxSizing: "border-box", // Ensures padding is included in width calc
    // ---------------------
    gap: "20px",
    fontFamily: "monospace",
    zIndex: 100,
    backdropFilter: "blur(5px)",
    minWidth: "300px",
    justifyContent: "center",
    transition: "all 0.3s ease",
  },
  item: {
    display: "flex",
    alignItems: "baseline",
    gap: "6px",
    fontSize: "1rem",
    fontWeight: "bold",
    textShadow: "0 0 5px rgba(0,0,0,0.5)",
    // Optional: ensures individual items don't break their own lines weirdly
    whiteSpace: "nowrap",
  },
  label: {
    fontSize: "0.85rem",
    opacity: 0.8,
    fontWeight: "normal",
  },
};

const ResourceCarousel = ({ resources = {} }) => {
  const [showRefined, setShowRefined] = useState(true);
  const [fade, setFade] = useState(1);

  // Toggle every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // Simple fade out/in effect logic
      setFade(0);
      setTimeout(() => {
        setShowRefined((prev) => !prev);
        setFade(1);
      }, 200);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num) => {
    if (!num) return "0";
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return Math.floor(num).toString();
  };

  const refinedData = [
    { label: "ER", value: resources.ER || 0, color: "#ffe066" },
    { label: "CM", value: resources.CM || 0, color: "#ff9f43" },
    { label: "EL", value: resources.EL || 0, color: "#54a0ff" },
    { label: "CS", value: resources.CS || 0, color: "#1dd1a1" },
    { label: "Pop", value: resources.Population || 0, color: "#a29bfe" },
  ];

  const unrefVal = (short) => {
    const uKey = `U-${short}`;
    const altKey = `${short} Unrefined`;
    return (
      resources[uKey] ??
      resources[altKey] ??
      resources[uKey.toLowerCase()] ??
      resources[altKey.toLowerCase()] ??
      0
    );
  };

  const unrefinedData = [
    { label: "U-CM", value: unrefVal("CM"), color: "#c07838" },
    { label: "U-EL", value: unrefVal("EL"), color: "#3868c0" },
    { label: "U-CS", value: unrefVal("CS"), color: "#388c57" },
  ];

  const currentData = showRefined ? refinedData : unrefinedData;

  return (
    <div style={styles.container}>
      {currentData.map((item) => (
        <div
          key={item.label}
          style={{
            ...styles.item,
            color: item.color,
            opacity: fade,
            transition: "opacity 0.2s ease",
          }}
        >
          <span>{formatNumber(item.value)}</span>
          <span style={styles.label}>{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export default ResourceCarousel;
