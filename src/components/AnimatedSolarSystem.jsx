import React, { useRef, useEffect, useState } from "react";
import { getSolarDate } from "../utils/dateUtils";
import BackButton from "./AnimatedSolarSystem/BackButton";
import ActionButtons from "./AnimatedSolarSystem/ActionButtons";
import WorldDetailModal from "./AnimatedSolarSystem/WorldDetailModal";
import FleetModal from "./AnimatedSolarSystem/FleetModal";
import WarningToast from "./AnimatedSolarSystem/WarningToast";
import { lerpCamera, screenToWorld } from "./AnimatedSolarSystem/camera";
import {
  drawSpaceIcon,
  drawGroundIcon,
  drawCountBadge,
} from "./AnimatedSolarSystem/drawUtils";
import { getFleetsAtWorld } from "./AnimatedSolarSystem/fleetUtils";

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
            { name: "Io", color: "#F9CA24", size: 2.5, dist: 35, speed: 0.004 },
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
      cameraRef.current = lerpCamera(
        cameraRef.current,
        targetCameraRef.current,
        0.1
      );

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

      // Drawing helpers delegated to drawUtils (imported)

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
      // Debug: expose computed fleet icon positions for click testing
      if (
        typeof process !== "undefined" &&
        process.env &&
        process.env.NODE_ENV === "development"
      ) {
        try {
          console.debug(
            "[AnimatedSolarSystem] fleetPositions",
            newFleetPositions
          );
        } catch (e) {
          // ignore
        }
      }
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

    const { x: worldX, y: worldY } = screenToWorld(
      e.clientX,
      e.clientY,
      canvas,
      cameraRef.current
    );

    // First, check if we clicked on a fleet icon (only when focused)
    if (focusedBody && fleetPositionsRef.current.length > 0) {
      // Debug: log world click coordinates and available fleet positions
      if (
        typeof process !== "undefined" &&
        process.env &&
        process.env.NODE_ENV === "development"
      ) {
        try {
          console.debug("[AnimatedSolarSystem] handleCanvasClick world", {
            worldX,
            worldY,
          });
          console.debug(
            "[AnimatedSolarSystem] available fleetPositions",
            fleetPositionsRef.current
          );
        } catch (e) {}
      }

      for (let fleetPos of fleetPositionsRef.current) {
        const dx = worldX - fleetPos.x;
        const dy = worldY - fleetPos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < fleetPos.radius) {
          // If collapsed, toggle the collapse; otherwise open fleet modal
          if (fleetPos.isCollapsed) {
            toggleFactionCollapse(fleetPos.fleet.factionName, focusedBody.name);
          } else {
            console.debug(
              "[AnimatedSolarSystem] fleet clicked",
              fleetPos.fleet
            );
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
  // Fleet lookup helper delegated to `fleetUtils.getFleetsAtWorld`
  // (kept wrapper here for backward compatibility)
  const getFleetsAtWorldWrapper = (worldName) =>
    getFleetsAtWorld(systemData, worldName);

  // Helper: determine whether current faction can zoom into a world
  const canZoomInForWorld = (worldName) => {
    if (refereeMode?.isReferee) return true;
    const fleets = getFleetsAtWorldWrapper(worldName);
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
        // Also open fleet modal for this world. If there are fleets at this
        // world, show the first one; otherwise open a stubbed selectedFleet
        // so the FleetModal can render the "Insufficient Intelligence" view.
        const fleetsAtThisWorld = getFleetsAtWorldWrapper(body.name) || [];
        if (fleetsAtThisWorld.length > 0) {
          // prefer a fleet belonging to current faction if possible
          const preferred = fleetsAtThisWorld.find(
            (f) => f.factionName.toLowerCase() === currentFaction.toLowerCase()
          );
          const chosen = preferred || fleetsAtThisWorld[0];
          setSelectedFleet({ ...chosen, factionName: chosen.factionName });
        } else {
          // stubbed fleet to trigger Insufficient Intelligence UI
          setSelectedFleet({
            Name: `${body.name} Presence`,
            ID: -1,
            Vehicles: [],
            Type: "Unknown",
            State: { Location: body.name, Action: "Idle" },
            factionName: "Unknown",
          });
        }
        setShowFleetModal(true);
      }
    }
    // If we click a new body -> Focus on it
    else {
      // Only allow focusing/zooming into a world if allowed by intel rules
      if (body.name !== "Sun" && body.name !== "Corelli Star") {
        if (!canZoomInForWorld(body.name)) {
          // Not allowed to zoom in — show warning but still allow focus so
          // users can inspect fleet presence (modal requires focused view).
          setWarningMessage("Insufficient intelligence.");
          setWarningOpacity(1);
          setTimeout(() => {
            setWarningOpacity(0);
            setWarningMessage(null);
          }, 1800);
          // Allow focus so fleet icons are rendered and clickable
          focusOnBody(body);
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
      const { x: worldX, y: worldY } = screenToWorld(
        e.clientX,
        e.clientY,
        canvas,
        cameraRef.current
      );

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

      <BackButton
        focusedBody={focusedBody}
        onBack={handleBack}
        onBackToSystems={onBackToSystems}
      />
      <ActionButtons onToggleView={onToggleView} onClose={onClose} />

      <WorldDetailModal
        zoomedWorld={zoomedWorld}
        setZoomedWorld={setZoomedWorld}
        allFactions={allFactions}
        getFactionColor={getFactionColor}
      />

      {/* Fleet Detail Modal */}
      <FleetModal
        show={showFleetModal}
        selectedFleet={selectedFleet}
        onClose={() => setShowFleetModal(false)}
        getFactionColor={getFactionColor}
        allFactions={allFactions}
        systemData={systemData}
        currentFaction={currentFaction}
        refereeMode={refereeMode}
        toggleFactionCollapse={toggleFactionCollapse}
      />

      <WarningToast message={warningMessage} opacity={warningOpacity} />
    </div>
  );
};

export default AnimatedSolarSystem;
