import React, { useEffect, useRef } from "react";
import "./StarField.css";

const StarField = ({ density = 100 }) => {
  const starFieldRef = useRef(null);

  useEffect(() => {
    const starField = starFieldRef.current;
    if (!starField) return;

    // Clear existing stars
    starField.innerHTML = "";

    // Create stars
    for (let i = 0; i < density; i++) {
      const star = document.createElement("div");
      star.className = "star";

      // Random position
      star.style.left = Math.random() * 100 + "%";
      star.style.top = Math.random() * 100 + "%";

      // Random size (2-6px for larger, more visible stars)
      const size = Math.random() * 4 + 2;
      star.style.width = size + "px";
      star.style.height = size + "px";

      // Brighter stars
      star.style.opacity = Math.random() * 0.6 + 0.4;

      // Random animation delay for twinkling
      star.style.animationDelay = Math.random() * 3 + "s";

      starField.appendChild(star);
    }
  }, [density]);

  return <div ref={starFieldRef} className="star-field"></div>;
};

export default StarField;
