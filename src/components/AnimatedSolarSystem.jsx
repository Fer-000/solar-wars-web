import React, { useRef, useEffect, useState } from "react";
import { getSolarDate } from "../utils/dateUtils";

// Orbital periods in Earth years (for realistic speeds)
const orbitalPeriods = {
  Mercury: 0.24,
  Venus: 0.62,
  Earth: 1.0,
  Mars: 1.88,
  Ceres: 4.6,
  Jupiter: 11.86,
  Saturn: 29.46,
  Uranus: 84.01,
  Neptune: 164.79,
  Pluto: 248.09,
};
// --- NEW BUTTON STYLES ---
const buttonStyle = {
  position: "absolute",
  background: "rgba(10, 15, 20, 0.75)",
  border: "1px solid rgba(0, 245, 255, 0.4)",
  boxShadow: "0 0 10px rgba(0, 245, 255, 0.1)",
  color: "#00f5ff",
  padding: "10px 20px",
  borderRadius: "6px",
  fontSize: "14px",
  fontFamily: "monospace",
  textTransform: "uppercase",
  letterSpacing: "1px",
  cursor: "pointer",
  transition: "all 0.2s ease",
  backdropFilter: "blur(4px)",
  zIndex: 10,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
};

const hoverStyle = {
  background: "rgba(0, 245, 255, 0.15)",
  border: "1px solid rgba(0, 245, 255, 0.8)",
  boxShadow: "0 0 15px rgba(0, 245, 255, 0.3)",
  color: "#fff",
};

// Solar system configuration matching your solarSystems structure
const createSolarSystemHierarchy = (systemName, worldsList) => {
  // Define the hierarchy for Sol system
  if (systemName === "Sol") {
    return {
      name: "Sun",
      color: "#FDB813",
      size: 30,
      dist: 0,
      speed: 0,
      children: [
        {
          name: "Mercury",
          color: "#A5A5A5",
          size: 6,
          dist: 50,
          speed: 0.0002,
          orbitalPeriod: orbitalPeriods.Mercury,
          children: [],
        },
        {
          name: "Venus",
          color: "#E3BB76",
          size: 10,
          dist: 75,
          speed: 0.00008,
          orbitalPeriod: orbitalPeriods.Venus,
          children: [],
        },
        {
          name: "Earth",
          color: "#22A6B3",
          size: 10,
          dist: 105,
          speed: 0.00005,
          orbitalPeriod: orbitalPeriods.Earth,
          children: [
            { name: "Luna", color: "#DDD", size: 3, dist: 25, speed: 0.002 },
          ],
        },
        {
          name: "Mars",
          color: "#EB4D4B",
          size: 8,
          dist: 145,
          speed: 0.000027,
          orbitalPeriod: orbitalPeriods.Mars,
          children: [],
        },
        // Asteroid Belt Areas - Ceres is one of the quadrants, others are fixed positions
        {
          name: "Ceres",
          color: "#999",
          size: 4,
          dist: 200,
          speed: 0.000011,
          angle: Math.PI / 4, // 45° (top-right quadrant)
          orbitalPeriod: orbitalPeriods.Ceres,
          children: [],
        },
        {
          name: "Asteroid Belt Area B",
          color: "#999",
          size: 3,
          dist: 200,
          speed: 0.000011,
          angle: (3 * Math.PI) / 4, // 135° (top-left quadrant)
          children: [],
        },
        {
          name: "Asteroid Belt Area C",
          color: "#999",
          size: 3,
          dist: 200,
          speed: 0.000011,
          angle: (5 * Math.PI) / 4, // 225° (bottom-left quadrant)
          children: [],
        },
        {
          name: "Asteroid Belt Area A",
          color: "#999",
          size: 3,
          dist: 200,
          speed: 0.000011,
          angle: (7 * Math.PI) / 4, // 315° (bottom-right quadrant)
          children: [],
        },
        {
          name: "Jupiter",
          color: "#F0932B",
          size: 22,
          dist: 280,
          speed: 0.0000042,
          orbitalPeriod: orbitalPeriods.Jupiter,
          children: [
            { name: "Io", color: "#F9CA24", size: 2.5, dist: 35, speed: 0.04 },
            {
              name: "Europa",
              color: "#DFF9FB",
              size: 2,
              dist: 45,
              speed: 0.003,
            },
            {
              name: "Ganymede",
              color: "#95AFC0",
              size: 3,
              dist: 55,
              speed: 0.0025,
            },
            {
              name: "Callisto",
              color: "#747D8C",
              size: 2.8,
              dist: 65,
              speed: 0.002,
            },
          ],
        },
        {
          name: "Saturn",
          color: "#F6E58D",
          size: 18,
          dist: 370,
          speed: 0.0000017,
          orbitalPeriod: orbitalPeriods.Saturn,
          children: [
            {
              name: "Mimas",
              color: "#C7ECEE",
              size: 1.5,
              dist: 30,
              speed: 0.005,
            },
            {
              name: "Enceladus",
              color: "#B8E6E8",
              size: 1.8,
              dist: 38,
              speed: 0.004,
            },
            {
              name: "Tethys",
              color: "#A4D4D6",
              size: 2,
              dist: 46,
              speed: 0.0035,
            },
            {
              name: "Dione",
              color: "#DCDDE1",
              size: 2.2,
              dist: 54,
              speed: 0.003,
            },
            {
              name: "Rhea",
              color: "#CFD0D2",
              size: 2.5,
              dist: 62,
              speed: 0.0025,
            },
            {
              name: "Titan",
              color: "#16A085",
              size: 4,
              dist: 75,
              speed: 0.002,
            },
            {
              name: "Iapetus",
              color: "#57606F",
              size: 2.3,
              dist: 88,
              speed: 0.0015,
            },
          ],
        },
        {
          name: "Uranus",
          color: "#7ED6DF",
          size: 14,
          dist: 450,
          speed: 0.0000006,
          orbitalPeriod: orbitalPeriods.Uranus,
          children: [
            {
              name: "Miranda",
              color: "#A4B0BD",
              size: 1.5,
              dist: 25,
              speed: 0.004,
            },
            {
              name: "Ariel",
              color: "#9BA5B1",
              size: 2,
              dist: 32,
              speed: 0.0035,
            },
            {
              name: "Umbriel",
              color: "#8C97A3",
              size: 2,
              dist: 39,
              speed: 0.003,
            },
            {
              name: "Titania",
              color: "#718093",
              size: 2.5,
              dist: 48,
              speed: 0.0025,
            },
            {
              name: "Oberon",
              color: "#69768B",
              size: 2.4,
              dist: 57,
              speed: 0.002,
            },
          ],
        },
        {
          name: "Neptune",
          color: "#4834D4",
          size: 13,
          dist: 520,
          speed: 0.0000003,
          orbitalPeriod: orbitalPeriods.Neptune,
          children: [
            {
              name: "Triton",
              color: "#6C5CE7",
              size: 3,
              dist: 30,
              speed: 0.003,
            },
            {
              name: "Proteus",
              color: "#5F4FD1",
              size: 2,
              dist: 40,
              speed: 0.0025,
            },
            {
              name: "Nereid",
              color: "#5F27CD",
              size: 1.5,
              dist: 55,
              speed: 0.0015,
            },
          ],
        },
        {
          name: "Pluto",
          color: "#CAD3C8",
          size: 5,
          dist: 580,
          speed: 0.0000002,
          orbitalPeriod: orbitalPeriods.Pluto,
          children: [
            {
              name: "Charon",
              color: "#A5B1C2",
              size: 2.5,
              dist: 15,
              speed: 0.04,
            },
          ],
        },
      ],
    };
  } else if (systemName === "Corelli") {
    // Corelli system with realistic speeds
    // Assuming similar orbital mechanics, estimating based on distance
    return {
      name: "Corelli Star",
      color: "#FFD700",
      size: 30,
      dist: 0,
      speed: 0,
      children: [
        {
          name: "Barcas",
          color: "#E74C3C",
          size: 8,
          dist: 90,
          speed: 0.00008, // Similar to Venus distance
          children: [],
        },
        {
          name: "Deo Gloria",
          color: "#3498DB",
          size: 11,
          dist: 130,
          speed: 0.00004, // Between Earth and Mars
          children: [],
        },
        {
          name: "Novai",
          color: "#2ECC71",
          size: 10,
          dist: 220,
          speed: 0.000018, // Similar to Mars-Ceres distance
          children: [],
        },
        // Asteroid Belt Areas - positioned in 4 quadrants
        {
          name: "Asteroid Belt Area 1",
          color: "#999",
          size: 3,
          dist: 170,
          speed: 0.00002,
          angle: Math.PI / 4, // 45° (top-right quadrant)
          children: [],
        },
        {
          name: "Asteroid Belt Area 2",
          color: "#999",
          size: 3,
          dist: 170,
          speed: 0.00002,
          angle: (3 * Math.PI) / 4, // 135° (top-left quadrant)
          children: [],
        },
        {
          name: "Asteroid Belt Area 3",
          color: "#999",
          size: 3,
          dist: 170,
          speed: 0.00002,
          angle: (5 * Math.PI) / 4, // 225° (bottom-left quadrant)
          children: [],
        },
        {
          name: "Asteroid Belt Area 4",
          color: "#999",
          size: 3,
          dist: 170,
          speed: 0.00002,
          angle: (7 * Math.PI) / 4, // 315° (bottom-right quadrant)
          children: [],
        },
        {
          name: "Scipios",
          color: "#9B59B6",
          size: 16,
          dist: 320,
          speed: 0.000004, // Similar to Jupiter distance
          children: [],
        },
      ],
    };
  }
};

const AnimatedSolarSystem = ({
  systemName,
  onWorldClick,
  onFleetClick,
  fleetsAtWorld = {},
  getFactionColor,
  onClose,
  onToggleView,
  refereeMode = {},
  onBackToSystems,
  allFactions = {},
  systemData = {},
  currentFaction = "",
}) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const warningActiveRef = useRef(false);
  const cameraRef = useRef({ x: 0, y: 0, zoom: 0.8 });
  const targetCameraRef = useRef({ x: 0, y: 0, zoom: 0.8 });
  const [stars, setStars] = useState([]);
  const [focusedBody, setFocusedBody] = useState(null); // Body currently focused (planet or moon)
  const [hoveredBody, setHoveredBody] = useState(null); // Body currently hovered by mouse
  const [planetImages, setPlanetImages] = useState({});
  const [warningMessage, setWarningMessage] = useState(null);
  const [warningOpacity, setWarningOpacity] = useState(0);
  const [collapsedFactions, setCollapsedFactions] = useState(new Set()); // Factions collapsed at each world
  const [zoomedWorld, setZoomedWorld] = useState(null); // World detail modal
  const [showFleetModal, setShowFleetModal] = useState(false);
  const [selectedFleet, setSelectedFleet] = useState(null);
  const [isHoveringBack, setIsHoveringBack] = useState(false);
  const [isHoveringGrid, setIsHoveringGrid] = useState(false);
  const [isHoveringClose, setIsHoveringClose] = useState(false);
  const warningTimeoutRef = useRef(null);
  const fleetPositionsRef = useRef([]); // Store fleet icon positions for click detection
  const timeRef = useRef(0);
  const solarSystemRef = useRef(null);
  const initialTimeOffset = useRef(0);

  // Warning messages for extreme zoom/pan
  const warningMessages = [
    "Detecting multiple leviathan class lifeforms in the region. Are you certain whatever you're doing is worth it?",
    "END OF THE UNIVERSE. THANK YOU FOR ALL THE FISH.",
    "Warning: approaching galactic barrier.",
    "You don’t want to know what happens if you cross that.",
    "This is the edge of the system.",
    "OI! You there! Yes, you! Stop poking around where you don’t belong!",
  ];

  // Create solar system once
  if (!solarSystemRef.current) {
    solarSystemRef.current = createSolarSystemHierarchy(systemName);
  }
  const solarSystem = solarSystemRef.current;

  // Calculate time offset based on 1982 planetary alignment
  // 1 IRL month = 1 game year (same as original simulation)
  useEffect(() => {
    // Anchor the alignment to the same real 1982 date but compute offsets
    // in terms of the in-game stardate produced by `getSolarDate()` so
    // the simulation follows the star calendar rather than the host clock.
    const alignment1982 = new Date(1982, 2, 10); // March 10, 1982

    // Get the stardate representation for the alignment and for now
    const alignStar = getSolarDate(alignment1982); // [year, month, day]
    const currentStar = getSolarDate(new Date());

    const [alignYear, alignMonth, alignDay] = alignStar;
    const [curYear, curMonth, curDay] = currentStar;

    // months difference in stardate space
    const totalMonths =
      (curYear - alignYear) * 12 +
      (parseInt(curMonth, 10) - parseInt(alignMonth, 10));

    // approximate fractional month progress using days (stardate day strings may be padded)
    const dayDiff = parseInt(curDay, 10) - parseInt(alignDay, 10);
    const daysInMonthApprox = 30; // use 30 as a reasonable stardate month length
    const monthProgress = dayDiff / daysInMonthApprox;

    // Total game years elapsed = stardate months since alignment (1 IRL month = 1 game year mapping preserved)
    const gameYears = totalMonths + monthProgress;
    const gameDays = gameYears * 365;

    // Keep the existing visual scaling factor to match animation speed
    initialTimeOffset.current = gameDays * 5;
  }, []);

  // Initialize stars
  useEffect(() => {
    const newStars = [];
    // Increased count to 2500 and range to 15000 to cover extreme pans
    for (let i = 0; i < 2500; i++) {
      newStars.push({
        x: (Math.random() - 0.5) * 15000,
        y: (Math.random() - 0.5) * 15000,
        size: Math.random() * 1.5,
        alpha: Math.random(),
      });
    }
    setStars(newStars);
  }, []);

  // Preload images
  useEffect(() => {
    const images = {};
    const loadImage = (name) => {
      const img = new Image();
      img.src = `/solar-wars-web/maps/${name}.png`;
      img.onerror = () => {
        const fallback = new Image();
        fallback.src = "/solar-wars-web/maps/placeholder.png";
        images[name] = fallback;
      };
      images[name] = img;
    };

    const loadAllImages = (body) => {
      loadImage(body.name);
      if (body.children) {
        body.children.forEach((child) => loadAllImages(child));
      }
    };

    loadAllImages(solarSystem);
    setPlanetImages(images);
  }, [solarSystem]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let width = canvas.width;
    let height = canvas.height;

    const resize = () => {
      const parent = canvas.parentElement;
      width = parent.clientWidth;
      height = parent.clientHeight;
      canvas.width = width;
      canvas.height = height;
    };

    resize();
    window.addEventListener("resize", resize);

    // Add wheel listener with passive:false to allow preventDefault
    const wheelHandler = (e) => {
      e.preventDefault();
      // Allow zoom even when focused, just limit the range
      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      const minZoom = focusedBody ? 2 : 0.3; // When focused, min zoom is 2
      const maxZoom = focusedBody ? 20 : 10; // When focused, max zoom is 20
      targetCameraRef.current = {
        ...targetCameraRef.current,
        zoom: Math.max(
          minZoom,
          Math.min(maxZoom, targetCameraRef.current.zoom * zoomFactor)
        ),
      };
    };
    canvas.addEventListener("wheel", wheelHandler, { passive: false });

    const update = () => {
      // Increment time for animations
      timeRef.current += 1;

      // Smooth camera lerp
      cameraRef.current = {
        x:
          cameraRef.current.x +
          (targetCameraRef.current.x - cameraRef.current.x) * 0.1,
        y:
          cameraRef.current.y +
          (targetCameraRef.current.y - cameraRef.current.y) * 0.1,
        zoom:
          cameraRef.current.zoom +
          (targetCameraRef.current.zoom - cameraRef.current.zoom) * 0.1,
      };

      // Keep focused body centered
      if (
        focusedBody &&
        focusedBody.name !== "Sun" &&
        focusedBody.name !== "Corelli Star"
      ) {
        targetCameraRef.current = {
          ...targetCameraRef.current,
          x: focusedBody.currentX,
          y: focusedBody.currentY,
        };
      }

      // --- 1. FIXED EXTREME PAN CHECK ---
      // 1. Calculate Distance
      const distX = Math.abs(cameraRef.current.x);
      const distY = Math.abs(cameraRef.current.y);
      const distance = Math.sqrt(distX * distX + distY * distY);

      const isExtremePan = distance > 20000;

      if (isExtremePan) {
        // --- WE ARE OUTSIDE THE SAFE ZONE ---

        // Check 'warningActiveRef'. If it is true, it means we have ALREADY warned
        // the user about this specific trip, so we do NOTHING (keep it hidden).
        if (!warningActiveRef.current && !focusedBody) {
          // 1. Lock the warning so it doesn't trigger again on the next frame
          warningActiveRef.current = true;

          // 2. Show the message
          const randomMsg =
            warningMessages[Math.floor(Math.random() * warningMessages.length)];
          setWarningMessage(randomMsg);
          setWarningOpacity(1);

          // 3. Set timer to hide it after 5 seconds
          if (warningTimeoutRef.current)
            clearTimeout(warningTimeoutRef.current);

          warningTimeoutRef.current = setTimeout(() => {
            setWarningOpacity(0);
            setTimeout(() => setWarningMessage(null), 500);

            // CRITICAL FIX: Do NOT set 'warningActiveRef.current = false' here.
            // We want the lock to STAY active so the warning doesn't come back
            // while you are still floating out here.
          }, 5000);
        }
      } else {
        // --- WE ARE INSIDE THE SAFE ZONE ---

        // Only now do we reset the lock. This ensures the warning is ready
        // for the *next* time you leave the safe zone.
        if (warningActiveRef.current) {
          warningActiveRef.current = false;

          // Optional: Hide immediately if they return early
          if (warningTimeoutRef.current)
            clearTimeout(warningTimeoutRef.current);
          setWarningOpacity(0);
          setWarningMessage(null);
        }
      }

      draw();
      animationRef.current = requestAnimationFrame(update);
    };

    const draw = () => {
      // Clear screen
      ctx.fillStyle = "#050505";
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.scale(cameraRef.current.zoom, cameraRef.current.zoom);
      ctx.translate(-cameraRef.current.x, -cameraRef.current.y);

      // Draw Stars
      ctx.fillStyle = "white";
      stars.forEach((star) => {
        ctx.globalAlpha = star.alpha;
        ctx.beginPath();
        ctx.arc(
          star.x,
          star.y,
          star.size / cameraRef.current.zoom,
          0,
          Math.PI * 2
        );
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      // Draw Solar System recursively
      // Add initial time offset to place planets at current real-world positions (from 1982 alignment)
      const currentTime = timeRef.current + initialTimeOffset.current;
      drawBody(ctx, solarSystem, 0, 0, currentTime);

      // --- 3. HIGH-FIDELITY ASTEROID BELT ---
      if (
        !focusedBody ||
        focusedBody.name === "Sun" ||
        focusedBody.name === "Corelli Star"
      ) {
        const beltRadius = systemName === "Sol" ? 200 : 170;
        const beltWidth = 50;
        const totalAsteroids = 800; // High count for density

        // Rotational speed of the entire belt
        const beltRotationSpeed = 0.00005;
        const beltOffset = currentTime * beltRotationSpeed;

        ctx.save();

        // Layer 1: Faint Dust Ring (Background Haze)
        ctx.beginPath();
        ctx.arc(0, 0, beltRadius, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(120, 110, 100, 0.06)";
        ctx.lineWidth = beltWidth;
        ctx.stroke();

        // Layer 2: Particulates
        for (let i = 0; i < totalAsteroids; i++) {
          // DETERMINISTIC RANDOMNESS:
          // We use Math.sin(i) to generate consistent "random" numbers for each asteroid index.
          // This ensures they stay the same every frame (no blinking) but look random.
          const r1 = Math.sin(i * 12.9898);
          const r2 = Math.cos(i * 78.233);
          const r3 = Math.sin(i * 43.123);
          const r4 = Math.cos(i * 91.555);

          // 1. ANGLE distribution (Evenly spread around the circle)
          const angle =
            (i / totalAsteroids) * Math.PI * 2 + r1 * 0.1 + beltOffset;

          // 2. DISTANCE distribution (Gaussian-ish: Clustered in center, sparse at edges)
          // Averaging two "random" numbers pushes values toward the center
          const distOffset = ((r2 + r3) / 2) * (beltWidth / 2);
          const radius = beltRadius + distOffset;

          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          // 3. SIZE & TYPE
          // 85% Dust (tiny), 15% Rocks (chunks)
          const isChunk = Math.abs(r4) > 0.85;
          const size = isChunk
            ? 1.5 + Math.abs(r1) * 1.5 // Rocks: 1.5px - 3.0px
            : 0.5 + Math.abs(r2) * 0.5; // Dust: 0.5px - 1.0px

          // 4. COLOR
          // Varied Earthy tones: Grey, Brown, faint Rust
          const baseGrey = 100 + Math.floor(Math.abs(r1) * 60); // 100-160
          const redTint = Math.floor(Math.abs(r2) * 20);
          const alpha = isChunk ? 0.9 : 0.3 + Math.abs(r3) * 0.3; // Dust is transparent

          ctx.fillStyle = `rgba(${baseGrey + redTint}, ${baseGrey}, ${
            baseGrey - 5
          }, ${alpha})`;

          // 5. DRAWING
          if (isChunk) {
            // Draw irregular rock shapes using a deterministic rotation
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(i + currentTime * 0.002); // Slow individual tumble

            ctx.beginPath();
            // Create a jagged shape (pentagon-ish)
            ctx.moveTo(size, 0);
            ctx.lineTo(size * 0.3, size * 0.8);
            ctx.lineTo(-size * 0.8, size * 0.5);
            ctx.lineTo(-size * 0.5, -size * 0.8);
            ctx.lineTo(size * 0.5, -size * 0.5);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
          } else {
            // Draw simple circle for dust
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.restore();
      }

      ctx.restore();
    };
    const drawBody = (
      ctx,
      body,
      cx,
      cy,
      t,
      isMoon = false,
      skipRendering = false
    ) => {
      // Calculate position
      let angle;
      if (body.angle !== undefined) {
        // Fixed angle (asteroid belt areas)
        angle = body.angle;
      } else {
        // Use simple time-based animation for all orbital bodies
        angle = t * body.speed;
      }
      let x = cx + Math.cos(angle) * body.dist;
      let y = cy + Math.sin(angle) * body.dist;

      // Store current position for click detection
      body.currentX = x;
      body.currentY = y;

      // Rendering logic:
      // - When NOT focused: render everything (unless skipRendering)
      // - When focused on a planet: render planet + its moons
      // - When focused on a moon: render parent planet + all its moons (siblings)
      const isFocusedBody = focusedBody === body;
      const isChildOfFocused = focusedBody && body.parent === focusedBody;
      const isParentOfFocused = focusedBody && focusedBody.parent === body;

      let shouldRender = !skipRendering;
      if (focusedBody) {
        // When focused, render: focused body, its children, or its parent (if focused on moon)
        shouldRender =
          !skipRendering &&
          (isFocusedBody || isChildOfFocused || isParentOfFocused);
      }

      // Draw Orbit Line (only when body should be rendered)
      if (shouldRender && body.dist > 0) {
        ctx.beginPath();
        ctx.strokeStyle = isMoon
          ? "rgba(255,255,255,0.15)"
          : "rgba(255,255,255,0.1)";
        ctx.lineWidth = isMoon ? 0.5 : 1;
        ctx.arc(cx, cy, body.dist, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Determine if we should draw children
      let drawChildren = false;
      if (!isMoon && !focusedBody) {
        drawChildren = true; // System overview: draw all planets
      }
      if (focusedBody === body) {
        drawChildren = true; // Focused on this body: draw its moons
      }
      // If focused on a moon, and this body is the parent planet, draw its children (all moons)
      if (focusedBody && focusedBody.parent === body) {
        drawChildren = true;
      }

      // Draw the Body itself (only if should render)
      if (shouldRender) {
        if (body.name === "Sun" || body.name === "Corelli Star") {
          // Always draw sun/star as glowing circle (never use image)
          // Add glow effect
          const gradient = ctx.createRadialGradient(
            x,
            y,
            body.size * 0.5,
            x,
            y,
            body.size * 2
          );
          gradient.addColorStop(0, "rgba(253, 184, 19, 0.8)");
          gradient.addColorStop(1, "rgba(253, 184, 19, 0)");
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(x, y, body.size * 2, 0, Math.PI * 2);
          ctx.fill();

          // Sun/star itself
          ctx.beginPath();
          ctx.fillStyle = body.color;
          ctx.arc(x, y, body.size, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // For planets and moons, use images
          const img = planetImages[body.name];
          if (img && img.complete && img.naturalHeight !== 0) {
            ctx.drawImage(
              img,
              x - body.size,
              y - body.size,
              body.size * 2,
              body.size * 2
            );
          } else {
            // Fallback to circle
            ctx.beginPath();
            ctx.fillStyle = body.color;
            ctx.arc(x, y, body.size, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Draw Label only when hovered
        if (hoveredBody === body) {
          ctx.fillStyle = "white";
          ctx.font = isMoon ? "12px Arial" : "16px Arial";
          ctx.textAlign = "center";
          ctx.strokeStyle = "#000";
          ctx.lineWidth = 3;
          if (cameraRef.current.zoom > 0.5 || !isMoon) {
            ctx.strokeText(body.name, x, y + body.size + 15);
            ctx.fillText(body.name, x, y + body.size + 15);
          }
        }

        // Draw fleet indicators ONLY if focused on this body
        if (focusedBody === body) {
          drawFleetIndicators(ctx, body.name, x, y, body.size);
        }
      }

      // Recursion for children
      if (drawChildren && body.children && body.children.length > 0) {
        body.children.forEach((child) => {
          child.parent = body; // Link parent for logic
          // When drawChildren is true, we WANT to draw them - never skip
          // This handles: 1) overview mode drawing all planets, 2) focused planet drawing its moons
          drawBody(ctx, child, x, y, t * 0.3, true, false);
        });
      }

      // If not drawing children but body has them, still recurse to update positions
      if (
        !drawChildren &&
        !isMoon &&
        body.children &&
        body.children.length > 0
      ) {
        body.children.forEach((child) => {
          child.parent = body;
          // If focusing a moon, don't skip its parent's other children that might be focused
          // If focusing a planet, don't skip its moon children
          const shouldSkipChild =
            focusedBody && child !== focusedBody && focusedBody.parent !== body;
          drawBody(ctx, child, x, y, t * 0.3, true, shouldSkipChild);
        });
      }
    };

    const drawFleetIndicators = (ctx, worldName, x, y, size) => {
      // Determine fleets at this world from provided systemData so we can
      // enforce visibility rules (stealth/intel) in animated view.
      const rawFleets =
        (systemData &&
          Object.entries(systemData).reduce((acc, [factionName, fleets]) => {
            fleets.forEach((fleet) => {
              if (fleet.State?.Location === worldName)
                acc.push({ ...fleet, factionName });
            });
            return acc;
          }, [])) ||
        [];

      // Visibility rules mirror TacticalMap:
      // - If refereeMode => see all fleets
      // - Else if current faction has at least one active combat unit at world => show all fleets
      // - Otherwise show only fleets belonging to current faction
      const fleetsForWorld = rawFleets;
      const currentFactionFleetsWithShips = fleetsForWorld.filter(
        (fleet) =>
          fleet.factionName.toLowerCase() === currentFaction.toLowerCase() &&
          Array.isArray(fleet.Vehicles) &&
          fleet.Vehicles.reduce((s, v) => s + (v.count || 0), 0) > 0
      );
      const currentFactionActiveCombatUnits = fleetsForWorld.filter(
        (fleet) =>
          fleet.factionName.toLowerCase() === currentFaction.toLowerCase() &&
          ["Defense", "Patrol", "Battle", "Activating"].includes(
            fleet.State?.Action
          )
      );

      let fleets = [];
      if (refereeMode?.isReferee) {
        fleets = fleetsForWorld;
      } else if (currentFactionActiveCombatUnits.length > 0) {
        fleets = fleetsForWorld;
      } else if (currentFactionFleetsWithShips.length > 0) {
        // If we have ships at this world but none are in active combat states,
        // still allow visibility (match TacticalMap behavior)
        fleets = fleetsForWorld;
      } else {
        fleets = fleetsForWorld.filter(
          (f) => f.factionName.toLowerCase() === currentFaction.toLowerCase()
        );
      }
      if (fleets.length === 0) return;

      // --- 1. Tighter Orbit Config ---
      // Reduced offset from planet so they hug the world closer
      const spaceOrbitRadius = size + 8;
      const groundOrbitRadius = size + 1;
      const newFleetPositions = [];

      // --- 2. Smaller Icon Definitions ---
      // Coordinates reduced by ~50% to make base icons smaller
      const drawSpaceIcon = (ctx, color) => {
        ctx.beginPath();
        ctx.moveTo(0, -3.5); // Tip
        ctx.lineTo(2.5, 2.5); // Bottom Right
        ctx.lineTo(0, 1); // Center Notch
        ctx.lineTo(-2.5, 2.5); // Bottom Left
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        ctx.lineWidth = 0.3; // Thinner line
        ctx.strokeStyle = "#ffffff";
        ctx.stroke();
      };

      const drawGroundIcon = (ctx, color) => {
        ctx.beginPath();
        // Smaller Shield
        ctx.moveTo(-2.5, -1.5);
        ctx.lineTo(2.5, -1.5);
        ctx.lineTo(2.5, 0.5);
        ctx.lineTo(0, 2.5); // Point down
        ctx.lineTo(-2.5, 0.5);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        ctx.lineWidth = 0.3; // Thinner line
        ctx.strokeStyle = "#ffffff";
        ctx.stroke();
      };

      // --- 3. Miniature Badge ---
      const drawCountBadge = (ctx, count) => {
        // Moved closer to center (3, -3) and smaller radius (2.5)
        ctx.beginPath();
        ctx.arc(3, -3, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = "#ff0000";
        ctx.fill();
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 0.2;
        ctx.stroke();

        ctx.fillStyle = "#fff";
        ctx.font = "bold 4px Arial"; // Tiny font
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(count > 9 ? "+" : count, 3, -2.8);
      };

      // --- Data Processing (Same as before) ---
      const fleetsByFaction = fleets.reduce((acc, fleet) => {
        const factionName = fleet.factionName;
        if (!acc[factionName]) acc[factionName] = [];
        acc[factionName].push(fleet);
        return acc;
      }, {});

      const displayFleets = [];
      Object.entries(fleetsByFaction).forEach(
        ([factionName, factionFleets]) => {
          const collapseKey = `${factionName}-${worldName}`;
          const isCollapsed = collapsedFactions.has(collapseKey);

          if (isCollapsed) {
            const spaceFleets = factionFleets.filter((f) => f.Type === "Space");
            if (spaceFleets.length > 0) {
              displayFleets.push({
                ...spaceFleets[0],
                Type: "Space",
                isCollapsed: true,
                collapsedCount: spaceFleets.length,
              });
            }
            const groundFleets = factionFleets.filter(
              (f) => f.Type === "Ground"
            );
            if (groundFleets.length > 0) {
              displayFleets.push({
                ...groundFleets[0],
                Type: "Ground",
                isCollapsed: true,
                collapsedCount: groundFleets.length,
              });
            }
          } else {
            displayFleets.push(...factionFleets);
          }
        }
      );

      const spaceFleets = displayFleets.filter((f) => f.Type === "Space");
      const groundFleets = displayFleets.filter((f) => f.Type === "Ground");

      // --- Rendering Loop ---
      ctx.save();
      ctx.shadowBlur = 4; // Reduced glow (was 10) so it's less "bloomy"
      ctx.lineJoin = "round";

      // Render Space Fleets
      spaceFleets.forEach((fleet, index) => {
        const totalAngle = Math.PI * 2;
        const angle =
          (index / Math.max(spaceFleets.length, 1)) * totalAngle +
          timeRef.current * 0.0002;

        const fx = x + Math.cos(angle) * spaceOrbitRadius;
        const fy = y + Math.sin(angle) * spaceOrbitRadius;

        const color = getFactionColor
          ? getFactionColor(fleet.factionName)
          : "#00f5ff";

        // --- 4. Reduced Scale Factor ---
        // Was 1.2, now 0.5. Base minimum reduced from 0.6 to 0.3
        const arrowScale = Math.max(0.3, 0.5 / cameraRef.current.zoom);

        ctx.save();
        ctx.translate(fx, fy);
        ctx.scale(arrowScale, arrowScale);
        ctx.shadowColor = color;

        if (fleet.isCollapsed) {
          ctx.save();
          ctx.translate(1.5, 1.5); // Smaller offset for shadow stack
          ctx.globalAlpha = 0.5;
          drawSpaceIcon(ctx, color);
          ctx.restore();
        }

        drawSpaceIcon(ctx, color);

        if (fleet.isCollapsed) {
          ctx.shadowBlur = 0;
          drawCountBadge(ctx, fleet.collapsedCount);
        }

        ctx.restore();

        newFleetPositions.push({
          fleet,
          x: fx,
          y: fy,
          radius: 5 * arrowScale, // Smaller click detection radius
          isCollapsed: fleet.isCollapsed || false,
        });
      });

      // Render Ground Fleets
      groundFleets.forEach((fleet, index) => {
        const totalAngle = Math.PI * 2;
        const angle =
          (index / Math.max(groundFleets.length, 1)) * totalAngle +
          Math.PI +
          timeRef.current * 0.0001;

        const fx = x + Math.cos(angle) * groundOrbitRadius;
        const fy = y + Math.sin(angle) * groundOrbitRadius;

        const color = getFactionColor
          ? getFactionColor(fleet.factionName)
          : "#00f5ff";
        const arrowScale = Math.max(0.3, 0.5 / cameraRef.current.zoom);

        ctx.save();
        ctx.translate(fx, fy);
        ctx.scale(arrowScale, arrowScale);
        ctx.shadowColor = color;

        if (fleet.isCollapsed) {
          ctx.save();
          ctx.translate(1.5, -1.5);
          ctx.globalAlpha = 0.5;
          drawGroundIcon(ctx, color);
          ctx.restore();
        }

        drawGroundIcon(ctx, color);

        if (fleet.isCollapsed) {
          ctx.shadowBlur = 0;
          drawCountBadge(ctx, fleet.collapsedCount);
        }

        ctx.restore();

        newFleetPositions.push({
          fleet,
          x: fx,
          y: fy,
          radius: 5 * arrowScale,
          isCollapsed: fleet.isCollapsed || false,
        });
      });

      ctx.restore();
      fleetPositionsRef.current = newFleetPositions;
    };

    update();

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("wheel", wheelHandler);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (warningTimeoutRef.current) {
        clearInterval(warningTimeoutRef.current);
      }
    };
  }, [
    stars,
    focusedBody,
    hoveredBody,
    planetImages,
    fleetsAtWorld,
    getFactionColor,
    warningMessage,
    collapsedFactions,
  ]);

  // Handle clicks
  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const width = canvas.width;
    const height = canvas.height;
    const worldX =
      (mouseX - width / 2) / cameraRef.current.zoom + cameraRef.current.x;
    const worldY =
      (mouseY - height / 2) / cameraRef.current.zoom + cameraRef.current.y;

    // First, check if we clicked on a fleet icon (only when focused)
    if (focusedBody && fleetPositionsRef.current.length > 0) {
      for (let fleetPos of fleetPositionsRef.current) {
        const dx = worldX - fleetPos.x;
        const dy = worldY - fleetPos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < fleetPos.radius) {
          // If collapsed, toggle the collapse; otherwise open fleet modal
          if (fleetPos.isCollapsed) {
            toggleFactionCollapse(fleetPos.fleet.factionName, focusedBody.name);
          } else {
            setSelectedFleet({
              ...fleetPos.fleet,
              factionName: fleetPos.fleet.factionName,
            });
            setShowFleetModal(true);
          }
          return; // Don't process planet/moon clicks
        }
      }
    }

    let clickedBody = null;

    // Helper to check collision with bodies
    const checkList = (list) => {
      for (let body of list) {
        let dx = worldX - body.currentX;
        let dy = worldY - body.currentY;
        let dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < body.size + 10) {
          return body;
        }

        // Always check children (moons) if they exist
        if (body.children) {
          let childHit = checkList(body.children);
          if (childHit) return childHit;
        }
      }
      return null;
    };

    // Check from Solar System planets
    clickedBody = checkList(solarSystem.children);

    // Also check Sun
    if (!clickedBody) {
      let dx = worldX - solarSystem.currentX;
      let dy = worldY - solarSystem.currentY;
      if (Math.sqrt(dx * dx + dy * dy) < solarSystem.size + 10) {
        clickedBody = solarSystem;
      }
    }

    // Handle body click or empty space click
    if (clickedBody) {
      handleBodyClick(clickedBody);
    } else if (focusedBody) {
      // Clicked on empty space while focused
      // If focused on a moon, return to parent planet view
      // Otherwise return to system overview
      if (
        focusedBody.parent &&
        focusedBody.parent.name !== "Sun" &&
        focusedBody.parent.name !== "Corelli Star"
      ) {
        focusOnBody(focusedBody.parent);
      } else {
        returnToOverview();
      }
    }
  };

  // Helper: get all fleets at a world from systemData (include factionName)
  const getFleetsAtWorld = (worldName) => {
    if (!systemData) return [];
    return Object.entries(systemData).reduce((acc, [factionName, fleets]) => {
      fleets.forEach((fleet) => {
        if (fleet.State?.Location === worldName)
          acc.push({ ...fleet, factionName });
      });
      return acc;
    }, []);
  };

  // Helper: determine whether current faction can zoom into a world
  const canZoomInForWorld = (worldName) => {
    if (refereeMode?.isReferee) return true;
    const fleets = getFleetsAtWorld(worldName);
    const currentFactionActiveCombatUnits = fleets.filter(
      (fleet) =>
        fleet.factionName.toLowerCase() === currentFaction.toLowerCase() &&
        ["Defense", "Patrol", "Battle", "Activating"].includes(
          fleet.State?.Action
        )
    );
    return currentFactionActiveCombatUnits.length > 0;
  };

  const handleBodyClick = (body) => {
    if (!body) return;

    // If we're already focused on this body -> Open world detail modal
    if (focusedBody === body) {
      if (body.name !== "Sun" && body.name !== "Corelli Star") {
        setZoomedWorld(body.name);
      }
    }
    // If we click a new body -> Focus on it
    else {
      // Only allow focusing/zooming into a world if allowed by intel rules
      if (body.name !== "Sun" && body.name !== "Corelli Star") {
        if (!canZoomInForWorld(body.name)) {
          // Not allowed to zoom in — do nothing (could flash a warning)
          setWarningMessage("Insufficient intelligence.");
          setWarningOpacity(1);
          setTimeout(() => {
            setWarningOpacity(0);
            setWarningMessage(null);
          }, 1800);
          return;
        }
      }

      focusOnBody(body);
    }
  };

  const toggleFactionCollapse = (factionName, worldName) => {
    const key = `${factionName}-${worldName}`;
    const newCollapsed = new Set(collapsedFactions);
    if (newCollapsed.has(key)) {
      newCollapsed.delete(key);
    } else {
      newCollapsed.add(key);
    }
    setCollapsedFactions(newCollapsed);
  };

  const focusOnBody = (body) => {
    if (body.name === "Sun" || body.name === "Corelli Star") {
      returnToOverview();
    } else {
      setFocusedBody(body);
      // High zoom level to see planet and moons clearly
      const zoomLevel = body.children && body.children.length > 0 ? 8 : 12;
      targetCameraRef.current = {
        x: body.currentX,
        y: body.currentY,
        zoom: zoomLevel,
      };
    }
  };

  const returnToOverview = () => {
    setFocusedBody(null);
    fleetPositionsRef.current = [];
    targetCameraRef.current = { x: 0, y: 0, zoom: 0.8 };
  };

  const handleBack = () => {
    returnToOverview();
  };

  // Pan and zoom controls (disabled when focused on a body) - handled in useEffect

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    if (focusedBody) return; // Disable pan when focused
    if (e.button === 2 || e.shiftKey) {
      // Right click or shift+click to pan
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      e.preventDefault();
    }
  };

  const handleMouseMove = (e) => {
    // Handle hover detection
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Convert to world coordinates
      const worldX =
        (mouseX - canvas.width / 2) / cameraRef.current.zoom +
        cameraRef.current.x;
      const worldY =
        (mouseY - canvas.height / 2) / cameraRef.current.zoom +
        cameraRef.current.y;

      // Check if hovering over any body
      let foundHover = null;
      const checkBodyHover = (body) => {
        if (!body.currentX || !body.currentY) return;
        const dx = worldX - body.currentX;
        const dy = worldY - body.currentY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        // Larger detection radius, especially when zoomed in
        const detectionRadius =
          body.size + Math.max(8, 15 / cameraRef.current.zoom);
        if (distance < detectionRadius) {
          foundHover = body;
        }
        // Always check children recursively
        if (body.children) {
          body.children.forEach(checkBodyHover);
        }
      };

      if (solarSystemRef.current) {
        checkBodyHover(solarSystemRef.current);
      }
      setHoveredBody(foundHover);
    }

    // Handle panning
    if (focusedBody) return; // Disable pan when focused
    if (isDragging) {
      const dx = (e.clientX - dragStart.x) / cameraRef.current.zoom;
      const dy = (e.clientY - dragStart.y) / cameraRef.current.zoom;
      targetCameraRef.current = {
        ...targetCameraRef.current,
        x: targetCameraRef.current.x - dx,
        y: targetCameraRef.current.y - dy,
      };
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onContextMenu={(e) => e.preventDefault()}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          cursor: isDragging ? "grabbing" : "pointer",
        }}
      />

      {/* --- TOP LEFT: Back Button --- */}
      {focusedBody && (
        <button
          onClick={handleBack}
          style={{
            ...buttonStyle,
            top: "20px",
            left: "20px",
            ...(isHoveringBack ? hoverStyle : {}),
          }}
          onMouseEnter={() => setIsHoveringBack(true)}
          onMouseLeave={() => setIsHoveringBack(false)}
        >
          ← Back to System
        </button>
      )}

      {/* --- TOP RIGHT: Action Buttons --- */}
      <div
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          display: "flex",
          gap: "10px",
          zIndex: 11,
        }}
      >
        <button
          onClick={() => onToggleView && onToggleView()}
          style={{
            ...buttonStyle,
            position: "relative",
            ...(isHoveringGrid ? hoverStyle : {}),
          }}
          onMouseEnter={() => setIsHoveringGrid(true)}
          onMouseLeave={() => setIsHoveringGrid(false)}
        >
          🔳 Grid View
        </button>

        <button
          onClick={() => onClose && onClose()}
          style={{
            ...buttonStyle,
            position: "relative",
            width: "40px",
            padding: 0,
            borderColor: "#f44336",
            color: "#f44336",
            boxShadow: "0 0 10px rgba(244, 67, 54, 0.2)",
            ...(isHoveringClose
              ? { background: "#f44336", color: "#fff" }
              : {}),
          }}
          onMouseEnter={() => setIsHoveringClose(true)}
          onMouseLeave={() => setIsHoveringClose(false)}
        >
          ✕
        </button>
      </div>

      {/* --- TOP LEFT: Back To Systems (when unfocused) --- */}
      {!focusedBody && (
        <button
          onClick={() => onBackToSystems && onBackToSystems()}
          style={{
            ...buttonStyle,
            top: "20px",
            left: "20px",
            position: "absolute",
            zIndex: 12,
            ...(isHoveringBack ? hoverStyle : {}),
          }}
          onMouseEnter={() => setIsHoveringBack(true)}
          onMouseLeave={() => setIsHoveringBack(false)}
        >
          ← Back to Systems
        </button>
      )}

      {/* World Detail Modal */}
      {zoomedWorld && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "rgba(10, 10, 10, 0.95)",
            border: "2px solid rgba(0, 245, 255, 0.5)",
            borderRadius: "10px",
            padding: "30px",
            width: "90vw",
            maxWidth: "1400px",
            height: "85vh",
            display: "flex",
            flexDirection: "column",
            zIndex: 100,
            boxShadow: "0 0 50px rgba(0, 245, 255, 0.4)",
          }}
        >
          {/* --- Header --- */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
              borderBottom: "1px solid rgba(0, 245, 255, 0.2)",
              paddingBottom: "15px",
              flexShrink: 0,
            }}
          >
            <div>
              <h2 style={{ color: "#00f5ff", margin: 0, fontSize: "2rem" }}>
                {zoomedWorld}
              </h2>
              <span style={{ color: "#888", fontSize: "0.9rem" }}>
                World Details & Architecture
              </span>
            </div>

            <button
              onClick={() => setZoomedWorld(null)}
              style={{
                background: "rgba(244, 67, 54, 0.2)",
                border: "1px solid #f44336",
                color: "#f44336",
                width: "40px",
                height: "40px",
                fontSize: "20px",
                cursor: "pointer",
                borderRadius: "5px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#f44336";
                e.currentTarget.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(244, 67, 54, 0.2)";
                e.currentTarget.style.color = "#f44336";
              }}
            >
              ✕
            </button>
          </div>

          {/* --- Content Grid --- */}
          <div
            style={{
              color: "#ccc",
              lineHeight: "1.8",
              overflowY: "auto",
              flex: 1,
              paddingRight: "10px",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
                gap: "20px",
                alignItems: "start", // Ensures cards don't stretch vertically if one is shorter
              }}
            >
              {(() => {
                const factionsWithBuildings = Object.entries(
                  allFactions
                ).filter(([factionName, factionData]) => {
                  const buildingsArr =
                    factionData?.Maps?.[zoomedWorld]?.Buildings;
                  return (
                    Array.isArray(buildingsArr) &&
                    buildingsArr.some(
                      (levels) =>
                        levels &&
                        Object.entries(levels).some(
                          ([key, amount]) => amount > 0
                        )
                    )
                  );
                });

                if (factionsWithBuildings.length === 0) {
                  return (
                    <div
                      style={{
                        color: "#888",
                        fontStyle: "italic",
                        gridColumn: "1 / -1",
                      }}
                    >
                      No building information available for this world.
                    </div>
                  );
                }

                return factionsWithBuildings.map(
                  ([factionName, factionData]) => {
                    const planetBuildings =
                      factionData.Maps[zoomedWorld].Buildings;
                    const buildingDefs = Array.isArray(factionData.Buildings)
                      ? factionData.Buildings
                      : [];
                    const displayName = factionData.name || factionName;

                    return (
                      <details
                        key={factionName}
                        open={true} // Default to open, change to false if you want them closed initially
                        style={{
                          background: "rgba(255, 255, 255, 0.03)",
                          border: `1px solid ${getFactionColor(factionName)}`,
                          borderRadius: "8px",
                          overflow: "hidden", // Keeps content inside border
                          transition: "all 0.2s ease",
                        }}
                      >
                        {/* --- Collapsible Header --- */}
                        <summary
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "15px",
                            cursor: "pointer",
                            background: "rgba(0,0,0,0.2)",
                            userSelect: "none",
                            listStyle: "none", // Hides default triangle in some browsers
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background =
                              "rgba(255,255,255,0.05)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background =
                              "rgba(0,0,0,0.2)")
                          }
                        >
                          <span
                            style={{
                              color: getFactionColor(factionName),
                              fontWeight: "bold",
                              fontSize: "18px",
                            }}
                          >
                            {displayName}
                          </span>
                          <span style={{ fontSize: "12px", opacity: 0.7 }}>
                            ▼
                          </span>
                        </summary>

                        {/* --- Collapsible Content --- */}
                        <div
                          style={{
                            padding: "15px",
                            borderTop: "1px solid rgba(255,255,255,0.05)",
                          }}
                        >
                          <ul
                            style={{
                              paddingLeft: "10px",
                              margin: 0,
                              listStyle: "none",
                            }}
                          >
                            {planetBuildings.map(
                              (buildingLevels, buildingId) => {
                                if (!buildingLevels) return null;
                                const def = buildingDefs[buildingId];
                                if (!def) return null;
                                const name =
                                  def.name ||
                                  def.Name ||
                                  `Building ${buildingId}`;

                                return Object.entries(buildingLevels)
                                  .filter(([key, amount]) => {
                                    if (key === "0" && amount === 0)
                                      return false;
                                    return amount > 0;
                                  })
                                  .map(([key, amount]) => {
                                    let displayLevel = parseInt(key) + 1;
                                    return (
                                      <li
                                        key={name + key}
                                        style={{
                                          marginBottom: "8px",
                                          fontSize: "14px",
                                          display: "flex",
                                          justifyContent: "space-between",
                                          borderBottom:
                                            "1px dashed rgba(255,255,255,0.1)",
                                          paddingBottom: "4px",
                                        }}
                                      >
                                        <span>
                                          <span
                                            style={{
                                              color: "#fff",
                                              fontWeight: "500",
                                            }}
                                          >
                                            {name}
                                          </span>{" "}
                                          <span
                                            style={{
                                              color: "#888",
                                              fontSize: "12px",
                                            }}
                                          >
                                            (Lv.{displayLevel})
                                          </span>
                                        </span>
                                        <span style={{ color: "#00f5ff" }}>
                                          x{amount}
                                        </span>
                                      </li>
                                    );
                                  });
                              }
                            )}
                          </ul>
                        </div>
                      </details>
                    );
                  }
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Right: Instructions - Hidden when focused */}
      {false && (
        <div
          style={{
            position: "absolute",
            bottom: "20px",
            right: "20px",
            color: "#888",
            pointerEvents: "none",
            fontSize: "14px",
            textAlign: "right",
          }}
        >
          Click planet to focus • Scroll to zoom • Right-click to pan
        </div>
      )}

      {/* --- FLEET DETAIL MODAL (Updated) --- */}
      {showFleetModal && selectedFleet && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0, 0, 0, 0.85)",
            backdropFilter: "blur(5px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowFleetModal(false)}
        >
          <div
            style={{
              background: "rgba(12, 12, 14, 0.95)",
              border: `1px solid ${getFactionColor(selectedFleet.factionName)}`,
              boxShadow: `0 0 40px ${getFactionColor(
                selectedFleet.factionName
              )}40`,
              borderRadius: "12px",
              width: "900px",
              maxWidth: "95vw",
              height: "70vh",
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
                background: "rgba(255, 255, 255, 0.02)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexShrink: 0,
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    color: "#fff",
                    fontSize: "1.8rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <span
                    style={{
                      color: getFactionColor(selectedFleet.factionName),
                    }}
                  >
                    {selectedFleet.Name || `Fleet ${selectedFleet.ID}`}
                  </span>
                </h2>
                <div
                  style={{
                    color: "#888",
                    fontSize: "0.9rem",
                    marginTop: "5px",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                  }}
                >
                  {allFactions[selectedFleet.factionName]?.name ||
                    selectedFleet.factionName}{" "}
                  Command
                </div>
              </div>
              <button
                onClick={() => setShowFleetModal(false)}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  color: "#fff",
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  fontSize: "18px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#f44336";
                  e.currentTarget.style.borderColor = "#f44336";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.borderColor =
                    "rgba(255, 255, 255, 0.2)";
                }}
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
              {/* Left Column */}
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
                    Operational Status
                  </div>
                  <div
                    style={{
                      display: "inline-block",
                      padding: "6px 12px",
                      borderRadius: "4px",
                      background:
                        selectedFleet.State?.Action === "Battle"
                          ? "rgba(244, 67, 54, 0.2)"
                          : "rgba(0, 245, 255, 0.1)",
                      border:
                        selectedFleet.State?.Action === "Battle"
                          ? "1px solid #f44336"
                          : "1px solid #00f5ff",
                      color:
                        selectedFleet.State?.Action === "Battle"
                          ? "#f44336"
                          : "#00f5ff",
                      fontWeight: "bold",
                      fontSize: "0.9rem",
                    }}
                  >
                    {selectedFleet.State?.Action === "Activating"
                      ? "ACTIVATING"
                      : (selectedFleet.State?.Action || "IDLE").toUpperCase()}
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
                    Current Location
                  </div>
                  <div
                    style={{
                      fontSize: "1.2rem",
                      color: "#fff",
                      fontWeight: "500",
                    }}
                  >
                    {selectedFleet.State?.Location || "Deep Space"}
                  </div>
                  <div
                    style={{
                      fontSize: "0.9rem",
                      color: "#888",
                      marginTop: "4px",
                    }}
                  >
                    Type: {selectedFleet.Type || "Standard Fleet"}
                  </div>
                </div>
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
                        setShowFleetModal(false);
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
                        e.currentTarget.style.background =
                          "rgba(255, 255, 255, 0.1)";
                        e.currentTarget.style.color = "white";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background =
                          "rgba(255, 255, 255, 0.05)";
                        e.currentTarget.style.color = "#ccc";
                      }}
                    >
                      <span>▼</span> Collapse Faction Presence
                    </button>
                  </div>
                )}
              </div>

              {/* Right Column - Manifest with "Insufficient Intelligence" Logic */}
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  background: "rgba(0,0,0,0.1)",
                }}
              >
                <div
                  style={{
                    padding: "15px 25px",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                    background: "rgba(0,0,0,0.2)",
                  }}
                >
                  <h4
                    style={{
                      margin: 0,
                      color: "#00f5ff",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                    }}
                  >
                    Fleet Manifest
                  </h4>
                </div>
                <div style={{ padding: "0", overflowY: "auto", flex: 1 }}>
                  {(() => {
                    const isCurrentFaction =
                      selectedFleet.factionName.toLowerCase() ===
                      currentFaction.toLowerCase();
                    // ... (Your existing fleet retrieval logic) ...
                    const fleetsAtWorld = Object.entries(systemData).reduce(
                      (acc, [factionName, fleets]) => {
                        const worldFleets = fleets.filter(
                          (f) =>
                            f.State?.Location === selectedFleet.State?.Location
                        );
                        if (worldFleets.length > 0)
                          acc.push(
                            ...worldFleets.map((f) => ({ ...f, factionName }))
                          );
                        return acc;
                      },
                      []
                    );
                    const currentFactionActiveCombatUnits =
                      fleetsAtWorld.filter(
                        (f) =>
                          f.factionName.toLowerCase() ===
                            currentFaction.toLowerCase() &&
                          [
                            "Defense",
                            "Patrol",
                            "Battle",
                            "Activating",
                          ].includes(f.State?.Action)
                      );

                    const hasActiveUnit =
                      currentFactionActiveCombatUnits.length > 0;
                    const hasIntel = isCurrentFaction || hasActiveUnit;
                    const totalShips = Array.isArray(selectedFleet.Vehicles)
                      ? selectedFleet.Vehicles.reduce(
                          (sum, v) => sum + (v.count || 0),
                          0
                        )
                      : 0;

                    if (hasIntel) {
                      // --- CASE A: WE HAVE INTEL (Standard List) ---
                      return (
                        <>
                          <div
                            style={{
                              padding: "15px 25px",
                              background: "rgba(0, 245, 255, 0.02)",
                              borderBottom: "1px solid rgba(255,255,255,0.05)",
                              color: "#aaa",
                              fontSize: "0.9rem",
                            }}
                          >
                            Total Unit Count:{" "}
                            <span style={{ color: "#fff", fontWeight: "bold" }}>
                              {totalShips}
                            </span>
                          </div>
                          {Array.isArray(selectedFleet.Vehicles) &&
                          selectedFleet.Vehicles.length > 0 ? (
                            (() => {
                              const isCurrentFaction =
                                selectedFleet.factionName.toLowerCase() ===
                                currentFaction.toLowerCase();

                              // Filter vehicles for intelligence/stealth rules
                              const visibleVehicles = refereeMode?.isReferee
                                ? selectedFleet.Vehicles
                                : selectedFleet.Vehicles.filter((vehicle) => {
                                    if (isCurrentFaction) return true;
                                    const factionVehicles =
                                      allFactions[selectedFleet.factionName]
                                        ?.Vehicles || [];
                                    const vehicleRecord = factionVehicles.find(
                                      (v) => v.ID === vehicle.ID
                                    );
                                    const isStealth =
                                      vehicleRecord?.stealth === true ||
                                      vehicleRecord?.data?.stealth === true;
                                    // Stealth units are hidden unless fleet is in Battle
                                    if (
                                      isStealth &&
                                      selectedFleet.State?.Action !== "Battle"
                                    ) {
                                      return false;
                                    }
                                    return true;
                                  });

                              // If there are ships but none are visible due to stealth filters,
                              // show the Insufficient Intelligence view (Case B) instead of empty structure.
                              if (
                                !isCurrentFaction &&
                                !refereeMode?.isReferee &&
                                visibleVehicles.length === 0 &&
                                totalShips > 0
                              ) {
                                return (
                                  <div
                                    style={{
                                      height: "100%",
                                      display: "flex",
                                      flexDirection: "column",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      background:
                                        "repeating-linear-gradient(45deg, rgba(0,0,0,0.2), rgba(0,0,0,0.2) 10px, rgba(0,0,0,0.3) 10px, rgba(0,0,0,0.3) 20px)",
                                    }}
                                  >
                                    <div
                                      style={{
                                        fontSize: "3rem",
                                        color: "#f44336",
                                        opacity: 0.5,
                                        marginBottom: "10px",
                                      }}
                                    >
                                      ⚠
                                    </div>

                                    <h3
                                      style={{
                                        color: "#f44336",
                                        margin: 0,
                                        textTransform: "uppercase",
                                        letterSpacing: "2px",
                                      }}
                                    >
                                      Insufficient Intelligence
                                    </h3>

                                    <p
                                      style={{
                                        color: "#888",
                                        maxWidth: "80%",
                                        textAlign: "center",
                                        marginTop: "10px",
                                      }}
                                    >
                                      Long-range sensors cannot resolve
                                      individual ship signatures. <br />
                                      Deploy a patrol or defense fleet to this
                                      sector to gather intelligence.
                                    </p>
                                    <div
                                      style={{
                                        marginTop: "20px",
                                        padding: "8px 16px",
                                        border: "1px solid #555",
                                        color: "#555",
                                        borderRadius: "4px",
                                        fontFamily: "monospace",
                                      }}
                                    >
                                      EST. SIGNAL MASS:{" "}
                                      {totalShips > 0
                                        ? `~${totalShips} UNITS`
                                        : "UNKNOWN"}
                                    </div>
                                  </div>
                                );
                              }

                              return (
                                <div style={{ padding: "10px 25px" }}>
                                  {visibleVehicles.length > 0 ? (
                                    visibleVehicles.map((vehicle, index) => {
                                      const vehicleData = allFactions[
                                        selectedFleet.factionName
                                      ]?.Vehicles?.find(
                                        (v) => v.ID === vehicle.ID
                                      );
                                      return (
                                        <div
                                          key={index}
                                          style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            padding: "12px 0",
                                            borderBottom:
                                              "1px dashed rgba(255,255,255,0.1)",
                                          }}
                                        >
                                          <div>
                                            <div
                                              style={{
                                                color: "#fff",
                                                fontWeight: "500",
                                                fontSize: "1rem",
                                              }}
                                            >
                                              {vehicleData?.name ||
                                                `Class-ID ${vehicle.ID}`}
                                            </div>
                                            {vehicleData?.data?.length && (
                                              <div
                                                style={{
                                                  fontSize: "0.8rem",
                                                  color: "#666",
                                                }}
                                              >
                                                Length:{" "}
                                                {vehicleData.data.length}m
                                              </div>
                                            )}
                                          </div>
                                          <div
                                            style={{
                                              background:
                                                "rgba(255,255,255,0.1)",
                                              padding: "4px 10px",
                                              borderRadius: "4px",
                                              color: "#00f5ff",
                                              fontWeight: "bold",
                                              fontFamily: "monospace",
                                              fontSize: "1.1rem",
                                            }}
                                          >
                                            {vehicle.count || 0}
                                          </div>
                                        </div>
                                      );
                                    })
                                  ) : (
                                    <div
                                      style={{
                                        padding: "30px",
                                        textAlign: "center",
                                        color: "#666",
                                      }}
                                    >
                                      Empty Fleet Structure
                                    </div>
                                  )}
                                </div>
                              );
                            })()
                          ) : (
                            <div
                              style={{
                                padding: "30px",
                                textAlign: "center",
                                color: "#666",
                              }}
                            >
                              Empty Fleet Structure
                            </div>
                          )}
                        </>
                      );
                    } else {
                      // --- CASE B: INSUFFICIENT INTELLIGENCE (With Rare Mocking) ---

                      // Deterministic mock based on fleet name to prevent flickering
                      const fleetHash = (selectedFleet.Name || "")
                        .split("")
                        .reduce((a, b) => a + b.charCodeAt(0), 0);
                      const isMocked = fleetHash % 20 === 0; // 5% chance

                      const mockingTitles = [
                        "Nice Try",
                        "Not For You",
                        "Clearance: None",
                        "Skill Issue",
                        "Nothing To See",
                      ];
                      const mockTitle =
                        mockingTitles[fleetHash % mockingTitles.length];

                      return (
                        <div
                          style={{
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            background:
                              "repeating-linear-gradient(45deg, rgba(0,0,0,0.2), rgba(0,0,0,0.2) 10px, rgba(0,0,0,0.3) 10px, rgba(0,0,0,0.3) 20px)",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "3rem",
                              color: "#f44336",
                              opacity: 0.5,
                              marginBottom: "10px",
                            }}
                          >
                            ⚠
                          </div>

                          <h3
                            style={{
                              color: "#f44336",
                              margin: 0,
                              textTransform: "uppercase",
                              letterSpacing: "2px",
                            }}
                          >
                            {isMocked ? mockTitle : "Insufficient Intelligence"}
                          </h3>

                          <p
                            style={{
                              color: "#888",
                              maxWidth: "80%",
                              textAlign: "center",
                              marginTop: "10px",
                            }}
                          >
                            Sensors cannot resolve individual ship signatures.{" "}
                            <br />
                            Assess threat level based on fleet activity.
                          </p>
                          <div
                            style={{
                              marginTop: "20px",
                              padding: "8px 16px",
                              border: "1px solid #555",
                              color: "#555",
                              borderRadius: "4px",
                              fontFamily: "monospace",
                            }}
                          >
                            EST. SIGNAL MASS:{" "}
                            {totalShips > 0
                              ? `~${totalShips} UNITS`
                              : "UNKNOWN"}
                          </div>
                        </div>
                      );
                    }
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Warning Message */}
      {warningMessage && (
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            left: "50%",
            transform: "translateX(-50%)",
            color: "#FFD700",
            pointerEvents: "none",
            fontSize: "16px",
            fontWeight: "bold",
            textAlign: "center",
            textShadow: "0 0 10px rgba(255, 215, 0, 0.8), 2px 2px 4px #000",
            opacity: warningOpacity,
            transition: "opacity 0.5s ease-in-out",
            maxWidth: "80%",
            padding: "12px 24px",
            background: "rgba(0, 0, 0, 0.8)",
            borderRadius: "8px",
            border: "1px solid rgba(255, 215, 0, 0.6)",
            boxShadow: "0 0 20px rgba(255, 215, 0, 0.2)",
            zIndex: 999,
          }}
        >
          {warningMessage}
        </div>
      )}
    </div>
  );
};

export default AnimatedSolarSystem;
