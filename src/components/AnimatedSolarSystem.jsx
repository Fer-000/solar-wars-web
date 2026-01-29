import React, { useRef, useEffect, useState } from "react";

// --- IMPORTS: DATA & CONFIG ---
import { createSolarSystemHierarchy } from "../data/SolarSystemConfig"; //
import { getSolarDate, formatSolarDate } from "../utils/dateUtils";
import databaseService from "../services/database";

// --- IMPORTS: HOOKS ---
import { useSpaceBattle } from "../hooks/UseSpaceBattle"; //

// --- IMPORTS: RENDERER & UTILS ---
import {
  updateBodyPositions,
  renderSystemTree,
} from "./AnimatedSolarSystem/SolarSystemRenderer"; //
import { drawStars, drawConnectionLine } from "./AnimatedSolarSystem/drawUtils"; //
import {
  lerpCamera,
  screenToWorld,
  worldToScreen,
} from "./AnimatedSolarSystem/camera";
import { getFleetsAtWorld } from "./AnimatedSolarSystem/fleetUtils";

// --- IMPORTS: SUB-COMPONENTS ---
import BackButton from "./AnimatedSolarSystem/BackButton";
import ActionButtons from "./AnimatedSolarSystem/ActionButtons";
import NavigationButtons from "./AnimatedSolarSystem/NavigationButtons";
import HexMapEditor from "./PlanetMap/HexMapEditor";
import BattleModal from "./AnimatedSolarSystem/BattleModal";
import FleetModal from "./AnimatedSolarSystem/FleetModal";
import WarningToast from "./AnimatedSolarSystem/WarningToast";
import MobileControls from "./AnimatedSolarSystem/MobileControls";
import WorldDetailModal from "./AnimatedSolarSystem/WorldDetailModal";
import DateCalculatorModal from "./AnimatedSolarSystem/DateCalculatorModal";

const AnimatedSolarSystem = ({
  systemName,
  onWorldClick,
  onFleetClick,
  fleetsAtWorld = {},
  getFactionColor,
  onClose,
  onToggleView,
  onSettings,
  onShipyard,
  onArmedForces,
  refereeMode = {},
  onBackToSystems,
  onSystemChange,
  allFactions = {},
  systemData = {},
  currentFaction = "",
  timeScale = 0.0008,
  animationSettings = { level: "total" },
}) => {
  // --- REFS & STATE ---
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const solarSystemsRef = useRef(null);

  // Camera State
  const cameraRef = useRef({ x: 0, y: 0, zoom: 0.8 });
  const targetCameraRef = useRef({ x: 0, y: 0, zoom: 0.8 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // Simulation State
  const timeRef = useRef(0);
  const initialTimeOffset = useRef(0);
  const fleetPositionsRef = useRef([]); // Populated by the Renderer for click detection
  const systemPositions = useRef({
    Sol: { x: 0, y: 0 },
    Corelli: {
      x: 4200 * Math.cos(Math.PI / 6),
      y: 4200 * Math.sin(Math.PI / 6),
    },
  });

  // UI State
  const [showFleetModal, setShowFleetModal] = useState(false);
  const [selectedFleet, setSelectedFleet] = useState(null);
  const [focusedBody, setFocusedBody] = useState(null);
  const [hoveredBody, setHoveredBody] = useState(null);
  const [warningMessage, setWarningMessage] = useState(null);
  const lastFocusedBodyRef = useRef(null);
  const [warningOpacity, setWarningOpacity] = useState(0);
  const [zoomedWorld, setZoomedWorld] = useState(null);
  const [collapsedFactions, setCollapsedFactions] = useState(new Set());
  const [showHexEditor, setShowHexEditor] = useState(false);
  const [pendingWorld, setPendingWorld] = useState(null);
  const [mapData, setMapData] = useState(null);
  const [stars, setStars] = useState([]);
  const [planetImages, setPlanetImages] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const warningTimeoutRef = useRef(null);
  const warningActiveRef = useRef(false);
  const warningMessages = [
    "Detecting multiple leviathan class lifeforms in the region. Are you certain whatever you're doing is worth it?",
    "END OF THE UNIVERSE. THANK YOU FOR ALL THE FISH.",
    "Warning: approaching galactic barrier.",
    "You don't want to know what happens if you cross that.",
    "This is the edge of the system.",
    "OI! You there! Yes, you! Stop poking around where you don't belong!",
  ];
  const [showBattleModal, setShowBattleModal] = useState(false);
  const [selectedBattle, setSelectedBattle] = useState(null);
  const [showDateCalculator, setShowDateCalculator] = useState(false);
  const [localAnimationSettings, setLocalAnimationSettings] =
    useState(animationSettings);

  // Calculate user's resources
  const userResources =
    currentFaction && allFactions[currentFaction.toLowerCase()]
      ? allFactions[currentFaction.toLowerCase()].Resources || {}
      : {};

  // --- CUSTOM HOOKS ---
  // Battle Logic separated into hook
  const {
    updateBattle,
    drawBattle,
    checkBattleZoneClick,
    getActiveSkirmishes,
    clearBattles,
  } = useSpaceBattle(getFactionColor, localAnimationSettings);

  // Expose a debug getter to the window for inspection when needed (non-noisy)
  useEffect(() => {
    try {
      window.__getActiveSkirmishes = getActiveSkirmishes;
    } catch (e) {}
    return () => {
      try {
        delete window.__getActiveSkirmishes;
      } catch (e) {}
    };
  }, [getActiveSkirmishes]);

  // Controlled, low-rate console logging (non-spammy)
  const SKIRMISH_LOG_INTERVAL = 5000; // ms
  const lastSkirmishHashRef = useRef("");
  const lastSkirmishPrintRef = useRef(0);

  // --- INITIALIZATION ---

  // 1. Initialize Systems
  if (!solarSystemsRef.current) {
    solarSystemsRef.current = {
      Sol: createSolarSystemHierarchy("Sol"), //
      Corelli: createSolarSystemHierarchy("Corelli"), //
    };
  }

  // 2. Initialize Date/Time Offset
  useEffect(() => {
    // March 10, 1982: Alignment reference (Year 0 in our calendar)
    // All planets/moons start at angle 0 on this date
    const alignment1982GameYear = 0;

    // Get current game date (getSolarDate returns [year, month, day])
    const [currentGameYear, currentGameMonth, currentGameDay] = getSolarDate();

    // Calculate game years elapsed since alignment
    const gameYearsElapsed = currentGameYear - alignment1982GameYear;

    // Add fractional year based on month and day progress
    // Each game year has 365 days (366 on leap years)
    const isLeapYear =
      currentGameYear % 4 === 0 &&
      (currentGameYear % 100 !== 0 || currentGameYear % 400 === 0);
    const daysInYear = isLeapYear ? 366 : 365;

    // Approximate day of year from month and day
    const monthDays = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
    const dayOfYear = monthDays[currentGameMonth - 1] + currentGameDay;
    const yearProgress = dayOfYear / daysInYear;

    const totalGameYears = gameYearsElapsed + yearProgress;

    // Earth completes 1 orbit per game year
    // Earth's speed = 0.00005 radians per tick
    // Full orbit = 2π radians
    // Ticks per orbit = 2π / 0.00005 ≈ 125,663.7
    const TICKS_PER_YEAR = (Math.PI * 2) / 0.00005;

    initialTimeOffset.current = totalGameYears * TICKS_PER_YEAR;
    // Stars
    const newStars = [];
    for (let i = 0; i < 5000; i++) {
      newStars.push({
        x: (Math.random() - 0.5) * 30000,
        y: (Math.random() - 0.5) * 30000,
        size: Math.random() * 1.5,
        alpha: Math.random(),
      });
    }
    setStars(newStars);

    // Images
    const images = {};
    const loadImage = (name) => {
      const img = new Image();
      img.src = `/solar-wars-web/maps/${name}.png`;
      img.onerror = () => {
        images[name] = new Image();
        images[name].src = "/solar-wars-web/maps/placeholder.png";
      };
      images[name] = img;
    };
    const loadRec = (body) => {
      loadImage(body.name);
      if (body.children) body.children.forEach(loadRec);
    };
    loadRec(solarSystemsRef.current.Sol);
    loadRec(solarSystemsRef.current.Corelli);
    setPlanetImages(images);

    // Mobile Check
    const checkMobile = () =>
      setIsMobile(window.innerWidth <= 768 || "ontouchstart" in window);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // 4. Handle System Switching
  useEffect(() => {
    const pos = systemPositions.current[systemName];
    if (pos) {
      targetCameraRef.current = { x: pos.x, y: pos.y, zoom: 0.8 };
      setFocusedBody(null);
      fleetPositionsRef.current = [];
    }
  }, [systemName]);

  // --- MAIN ANIMATION LOOP ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let width, height;

    const resize = () => {
      width = canvas.parentElement.clientWidth;
      height = canvas.parentElement.clientHeight;
      canvas.width = width;
      canvas.height = height;
    };
    resize();
    window.addEventListener("resize", resize);

    // Zoom Handler
    const wheelHandler = (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      const minZoom = focusedBody ? 2 : 0.3;
      const maxZoom = focusedBody ? 20 : 10;
      targetCameraRef.current.zoom = Math.max(
        minZoom,
        Math.min(maxZoom, targetCameraRef.current.zoom * zoomFactor),
      );
    };
    canvas.addEventListener("wheel", wheelHandler, { passive: false });

    const update = () => {
      timeRef.current += timeScale;
      const currentTime = timeRef.current + initialTimeOffset.current;

      // Camera Lerp
      cameraRef.current = lerpCamera(
        cameraRef.current,
        targetCameraRef.current,
        0.1,
      );

      // Lock to focused body
      if (
        focusedBody &&
        focusedBody.name !== "Sun" &&
        focusedBody.name !== "Corelli Star"
      ) {
        targetCameraRef.current.x = focusedBody.currentX;
        targetCameraRef.current.y = focusedBody.currentY;
      }

      // Warning Logic for Extreme Pan
      const dist = Math.hypot(cameraRef.current.x, cameraRef.current.y);
      if (dist > 20000 && !warningActiveRef.current && !focusedBody) {
        warningActiveRef.current = true;
        const msg =
          warningMessages[Math.floor(Math.random() * warningMessages.length)];
        setWarningMessage(msg);
        setWarningOpacity(1);
        clearTimeout(warningTimeoutRef.current);
        warningTimeoutRef.current = setTimeout(() => {
          setWarningOpacity(0);
          setTimeout(() => setWarningMessage(null), 500);
        }, 5000);
      } else if (dist <= 20000 && warningActiveRef.current) {
        warningActiveRef.current = false;
        setWarningOpacity(0);
      }

      // 1. UPDATE PHYSICS (Calculates x/y for all bodies)
      const solPos = systemPositions.current.Sol;
      const corPos = systemPositions.current.Corelli;
      updateBodyPositions(
        solarSystemsRef.current.Sol,
        currentTime,
        solPos.x,
        solPos.y,
      );
      updateBodyPositions(
        solarSystemsRef.current.Corelli,
        currentTime,
        corPos.x,
        corPos.y,
      );

      // 2. UPDATE BATTLE (Calculates particles/projectiles)
      // We pass fleetPositionsRef.current which was populated in the LAST draw frame
      // 2. UPDATE BATTLE
      // Pass radius (default 20 if undefined, or body size)
      const fBodyRadius = focusedBody ? focusedBody.size : 20;
      updateBattle(
        fleetPositionsRef.current,
        currentTime,
        !!focusedBody,
        fBodyRadius,
        focusedBody?.currentX,
        focusedBody?.currentY,
      );

      draw(currentTime);
      animationRef.current = requestAnimationFrame(update);
    };

    const draw = (currentTime) => {
      // Clear
      ctx.fillStyle = "#050505";
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.scale(cameraRef.current.zoom, cameraRef.current.zoom);
      ctx.translate(-cameraRef.current.x, -cameraRef.current.y);

      // Draw Background
      drawStars(ctx, stars, cameraRef.current.zoom);
      // Only draw connection line when not focused on any body
      if (!focusedBody) {
        drawConnectionLine(
          ctx,
          systemPositions.current.Sol,
          systemPositions.current.Corelli,
          cameraRef.current.zoom,
        );
      }

      // Clear Fleet Detection for this frame
      fleetPositionsRef.current = [];

      // Render Options Bundle
      const renderOptions = {
        focusedBody,
        hoveredBody,
        planetImages,
        zoom: cameraRef.current.zoom,
        systemData,
        currentFaction,
        refereeMode,
        collapsedFactions,
        getFactionColor,
        fleetPositions: fleetPositionsRef.current, // Renderer will push {x,y,fleet} here
        activeSkirmishes: getActiveSkirmishes(),
      };

      // Draw Asteroid Belts (only when animated and when not focused or focused on star)
      if (
        localAnimationSettings.level === "total" &&
        (!focusedBody ||
          focusedBody.name === "Sun" ||
          focusedBody.name === "Corelli Star")
      ) {
        drawAsteroidBelt(
          ctx,
          systemPositions.current.Sol.x,
          systemPositions.current.Sol.y,
          200,
          currentTime,
        );
        drawAsteroidBelt(
          ctx,
          systemPositions.current.Corelli.x,
          systemPositions.current.Corelli.y,
          170,
          currentTime,
        );
      }

      // RENDER TREES
      renderSystemTree(ctx, solarSystemsRef.current.Sol, renderOptions);
      renderSystemTree(ctx, solarSystemsRef.current.Corelli, renderOptions);

      // Non-noisy debug: expose last active skirmishes and fleet positions for inspection
      try {
        window.__lastActiveSkirmishes =
          typeof getActiveSkirmishes === "function"
            ? getActiveSkirmishes()
            : [];
        window.__lastFleetPositions = fleetPositionsRef.current.slice();
      } catch (e) {}

      // Low-rate, non-spammy console logging when active skirmishes change
      try {
        const now = Date.now();
        const sk = Array.isArray(window.__lastActiveSkirmishes)
          ? window.__lastActiveSkirmishes
          : [];
        const hash = sk
          .map(
            (z) =>
              `${z.attacker?.fleet?.ID || "?"}-${
                z.defender?.fleet?.ID || "?"
              }-${z.phase || "?"}`,
          )
          .sort()
          .join("|");
        if (
          hash !== lastSkirmishHashRef.current &&
          now - lastSkirmishPrintRef.current > SKIRMISH_LOG_INTERVAL
        ) {
          lastSkirmishHashRef.current = hash;
          lastSkirmishPrintRef.current = now;
          console.info("Active skirmishes:", sk);
        }
      } catch (e) {}

      // Draw Battle Overlay (on top of planets, needs planet position)
      // Don't draw battles when focused on a moon (child of a planet)
      // because those battles belong to the parent planet
      const isMoon =
        focusedBody &&
        focusedBody.parent &&
        focusedBody.parent.name !== "Sun" &&
        focusedBody.parent.name !== "Corelli Star";

      // Track focused body changes and clear battles when switching planets
      // Battles are tied to specific planet coordinates, so they need to be cleared
      if (focusedBody !== lastFocusedBodyRef.current) {
        clearBattles(); // Clear all battles when changing focus
        lastFocusedBodyRef.current = focusedBody;
      }

      if (
        focusedBody &&
        !isMoon &&
        Number.isFinite(focusedBody.currentX) &&
        Number.isFinite(focusedBody.currentY)
      ) {
        ctx.save();
        ctx.translate(focusedBody.currentX, focusedBody.currentY);
        drawBattle(ctx, cameraRef.current.zoom);
        ctx.restore();
      }

      ctx.restore();
    };

    const drawAsteroidBelt = (
      ctx,
      centerX,
      centerY,
      beltRadius,
      currentTime,
    ) => {
      const beltWidth = 50;
      const totalAsteroids = 800;
      const beltRotationSpeed = 0.00005;
      const beltOffset = currentTime * beltRotationSpeed;

      ctx.save();
      ctx.translate(centerX, centerY);

      // Draw faint belt ring
      ctx.beginPath();
      ctx.arc(0, 0, beltRadius, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(120, 110, 100, 0.06)";
      ctx.lineWidth = beltWidth;
      ctx.stroke();

      // Draw asteroids
      for (let i = 0; i < totalAsteroids; i++) {
        const r1 = Math.sin(i * 12.9898);
        const r2 = Math.cos(i * 78.233);
        const r3 = Math.sin(i * 43.123);
        const r4 = Math.cos(i * 91.555);

        const angle =
          (i / totalAsteroids) * Math.PI * 2 + r1 * 0.1 + beltOffset;
        const distOffset = ((r2 + r3) / 2) * (beltWidth / 2);
        const radius = beltRadius + distOffset;

        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        const isChunk = Math.abs(r4) > 0.85;
        const size = isChunk
          ? 1.5 + Math.abs(r1) * 1.5
          : 0.5 + Math.abs(r2) * 0.5;
        const baseGrey = 100 + Math.floor(Math.abs(r1) * 60);
        const redTint = Math.floor(Math.abs(r2) * 20);
        const alpha = isChunk ? 0.9 : 0.3 + Math.abs(r3) * 0.3;

        ctx.fillStyle = `rgba(${baseGrey + redTint}, ${baseGrey}, ${
          baseGrey - 5
        }, ${alpha})`;

        if (isChunk) {
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(i + currentTime * 0.002);
          ctx.beginPath();
          ctx.moveTo(size, 0);
          ctx.lineTo(size * 0.3, size * 0.8);
          ctx.lineTo(-size * 0.8, size * 0.5);
          ctx.lineTo(-size * 0.5, -size * 0.8);
          ctx.lineTo(size * 0.5, -size * 0.5);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        } else {
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();
    };

    update();
    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("wheel", wheelHandler);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    };
  }, [
    stars,
    focusedBody,
    hoveredBody,
    planetImages,
    collapsedFactions,
    localAnimationSettings,
  ]);

  // --- INTERACTION HANDLERS ---

  const canZoomInForWorld = (worldName) => {
    if (refereeMode?.isReferee) return true;
    // Helper to get fleets without filtering for "current system" only
    const fleets = getFleetsAtWorld(systemData, worldName) || [];
    const active = fleets.filter(
      (f) =>
        f.factionName.toLowerCase() === currentFaction.toLowerCase() &&
        ["Defense", "Patrol", "Battle", "Activating"].includes(f.State?.Action),
    );
    return (
      active.length > 0 ||
      fleets.some(
        (f) => f.factionName.toLowerCase() === currentFaction.toLowerCase(),
      )
    );
  };

  const handleCanvasClick = (e) => {
    const { x, y } = screenToWorld(
      e.clientX,
      e.clientY,
      canvasRef.current,
      cameraRef.current,
    );

    if (focusedBody && fleetPositionsRef.current.length > 0) {
      for (const fleetPos of fleetPositionsRef.current) {
        const dx = x - fleetPos.x;
        const dy = y - fleetPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const clickRadius = fleetPos.radius || 12; // Use radius from renderer

        if (distance < clickRadius) {
          if (onFleetClick) {
            onFleetClick(fleetPos.fleet);
          } else {
            // Handle internally if no callback provided
            setSelectedFleet(fleetPos.fleet);
            setShowFleetModal(true);
          }
          return; // Stop propagation
        }
      }
    }

    // 1.5 CLICK CHECK: BATTLE ZONES (VS Button)
    if (focusedBody) {
      const battleClick = checkBattleZoneClick(
        x,
        y,
        focusedBody.currentX,
        focusedBody.currentY,
      );
      if (battleClick) {
        setSelectedBattle(battleClick);
        setShowBattleModal(true);
        return; // Stop propagation
      }
    }

    // 2. CLICK CHECK: BODIES
    // Helper to check if a body is a descendant of the focused body
    const isDescendantOf = (body, ancestor) => {
      if (!ancestor) return true; // No focus = all bodies clickable
      let current = body;
      while (current) {
        if (current === ancestor) return true;
        current = current.parent;
      }
      return false;
    };

    const checkList = (list) => {
      for (let body of list) {
        // Skip bodies that aren't visible (not focused body or its descendants)
        if (
          focusedBody &&
          !isDescendantOf(body, focusedBody) &&
          body !== focusedBody
        ) {
          if (body.children) {
            const c = checkList(body.children);
            if (c) return c;
          }
          continue;
        }

        // Use currentX/Y calculated in physics step
        const dx = x - body.currentX;
        const dy = y - body.currentY;
        if (Math.hypot(dx, dy) < body.size + 10) return body;
        if (body.children) {
          const c = checkList(body.children);
          if (c) return c;
        }
      }
      return null;
    };

    let clickedBody = null;

    // Check Suns first (always clickable to return to system view)
    if (
      Math.hypot(
        x - solarSystemsRef.current.Sol.currentX,
        y - solarSystemsRef.current.Sol.currentY,
      ) <
      solarSystemsRef.current.Sol.size + 10
    ) {
      clickedBody = solarSystemsRef.current.Sol;
    } else if (
      Math.hypot(
        x - solarSystemsRef.current.Corelli.currentX,
        y - solarSystemsRef.current.Corelli.currentY,
      ) <
      solarSystemsRef.current.Corelli.size + 10
    ) {
      clickedBody = solarSystemsRef.current.Corelli;
    }

    // Check other bodies if sun wasn't clicked
    if (!clickedBody) {
      clickedBody = checkList(solarSystemsRef.current.Sol.children);
      if (!clickedBody)
        clickedBody = checkList(solarSystemsRef.current.Corelli.children);
    }

    // Handle Body Selection
    if (clickedBody) {
      if (
        focusedBody === clickedBody &&
        clickedBody.name !== "Sun" &&
        clickedBody.name !== "Corelli Star"
      ) {
        // On mobile, show world detail modal instead of hex editor
        if (isMobile) {
          setZoomedWorld(clickedBody.name);
        } else {
          // Load map data from database for hex editor
          const loadMapData = async () => {
            try {
              const placeData = await databaseService.getPlaceData(
                "The Solar Wars",
                clickedBody.name,
              );
              if (placeData) {
                // Parse the Claims JSON string if it exists
                let parsedMapData = {};
                console.log("Place Data Claims:", placeData);
                if (placeData.Claims) {
                  try {
                    parsedMapData = JSON.parse(placeData.Claims);
                  } catch (e) {
                    console.error("Error parsing Claims JSON:", e);
                  }
                }
                setMapData({
                  ...parsedMapData,
                  imageUrl: placeData.Image,
                  worldName: clickedBody.name,
                });
              } else {
                setMapData({ worldName: clickedBody.name });
              }
            } catch (error) {
              console.error("Error loading map data:", error);
              setMapData({ worldName: clickedBody.name });
            }
            setShowHexEditor(true);
          };
          loadMapData();
        }
      } else {
        // Intel Check
        if (
          clickedBody.name !== "Sun" &&
          clickedBody.name !== "Corelli Star" &&
          !canZoomInForWorld(clickedBody.name)
        ) {
          setWarningMessage("Insufficient intelligence.");
          setWarningOpacity(1);
          setTimeout(() => {
            setWarningOpacity(0);
            setWarningMessage(null);
          }, 1800);
          // Still focus so they can see the "Denied" icons if any
        }

        // Focus Logic
        if (clickedBody.name === "Sun" || clickedBody.name === "Corelli Star") {
          // When clicking a star, go back to system selection
          if (onBackToSystems) {
            onBackToSystems();
          } else {
            setFocusedBody(null);
            const sys = clickedBody.name === "Sun" ? "Sol" : "Corelli";
            const pos = systemPositions.current[sys];
            targetCameraRef.current = { x: pos.x, y: pos.y, zoom: 0.8 };
          }
        } else {
          setFocusedBody(clickedBody);
          targetCameraRef.current = {
            x: clickedBody.currentX,
            y: clickedBody.currentY,
            zoom:
              clickedBody.children && clickedBody.children.length > 0 ? 8 : 12,
          };
        }
      }
    } else if (focusedBody) {
      // Clicked void while focused -> Go up one level or reset
      if (
        focusedBody.parent &&
        focusedBody.parent.name !== "Sun" &&
        focusedBody.parent.name !== "Corelli Star"
      ) {
        setFocusedBody(focusedBody.parent);
        targetCameraRef.current = {
          x: focusedBody.parent.currentX,
          y: focusedBody.parent.currentY,
          zoom: 8,
        };
      } else {
        setFocusedBody(null);
        // Determine which system the focused body belongs to
        const findRootSystem = (body) => {
          if (!body) return systemName;
          if (body.name === "Sun") return "Sol";
          if (body.name === "Corelli Star") return "Corelli";
          if (body.parent) return findRootSystem(body.parent);
          return systemName;
        };
        const targetSystem = findRootSystem(focusedBody);
        const pos = systemPositions.current[targetSystem];
        targetCameraRef.current = { x: pos.x, y: pos.y, zoom: 0.8 };
      }
    }
  };

  // Debug: track showHexEditor changes and pending world
  // debug logging removed to avoid noisy output

  const handleMouseMove = (e) => {
    // Mouse Dragging
    if (isDragging.current && !focusedBody) {
      const dx = (e.clientX - dragStart.current.x) / cameraRef.current.zoom;
      const dy = (e.clientY - dragStart.current.y) / cameraRef.current.zoom;
      targetCameraRef.current.x -= dx;
      targetCameraRef.current.y -= dy;
      dragStart.current = { x: e.clientX, y: e.clientY };
      return;
    }

    // Hover Detection
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const localX = e.clientX - rect.left;
      const localY = e.clientY - rect.top;

      let found = null;
      let bestDist = Infinity;

      // Robust screen-space hover check
      const check = (b) => {
        if (!b || !Number.isFinite(b.currentX)) return;
        const sp = worldToScreen(
          b.currentX,
          b.currentY,
          canvas,
          cameraRef.current,
        );
        const d = Math.hypot(localX - sp.x, localY - sp.y);
        const rad = Math.max(12, 14); // Hitbox size
        if (d < rad && d < bestDist) {
          bestDist = d;
          found = b;
        }
        if (b.children) b.children.forEach(check);
      };

      if (solarSystemsRef.current) {
        check(solarSystemsRef.current.Sol);
        check(solarSystemsRef.current.Corelli);
      }
      setHoveredBody(found);
    }
  };

  const handleMouseDown = (e) => {
    if (focusedBody) return;
    if (e.button === 2 || e.shiftKey || e.button === 0) {
      // Allow left click drag if not clicking body
      isDragging.current = true;
      dragStart.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  // Mobile Control Helpers
  const handleZoomIn = () => {
    targetCameraRef.current.zoom = Math.min(
      10,
      targetCameraRef.current.zoom * 1.12,
    );
  };
  const handleZoomOut = () => {
    targetCameraRef.current.zoom = Math.max(
      0.3,
      targetCameraRef.current.zoom * 0.92,
    );
  };
  const handlePan = (dx, dy) => {
    targetCameraRef.current.x += dx / cameraRef.current.zoom;
    targetCameraRef.current.y += dy / cameraRef.current.zoom;
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
        onMouseLeave={handleMouseUp}
        onContextMenu={(e) => e.preventDefault()}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          cursor: isDragging.current ? "grabbing" : "pointer",
        }}
      />

      <BackButton
        focusedBody={focusedBody}
        resources={userResources}
        onBack={() => {
          if (
            focusedBody.parent &&
            focusedBody.parent.name !== "Sun" &&
            focusedBody.parent.name !== "Corelli Star"
          ) {
            setFocusedBody(focusedBody.parent);
          } else {
            setFocusedBody(null);
            // Determine which system the focused body belongs to
            const findRootSystem = (body) => {
              if (!body) return systemName;
              if (body.name === "Sun") return "Sol";
              if (body.name === "Corelli Star") return "Corelli";
              if (body.parent) return findRootSystem(body.parent);
              // Fallback: check if body is in Sol or Corelli system
              const isInSol = solarSystemsRef.current.Sol.children.some(
                (child) => child === body || child.children?.includes(body),
              );
              return isInSol ? "Sol" : "Corelli";
            };
            const targetSystem = findRootSystem(focusedBody);
            const pos = systemPositions.current[targetSystem];
            targetCameraRef.current = { x: pos.x, y: pos.y, zoom: 0.8 };
          }
        }}
        onBackToSystems={onBackToSystems}
      />

      {!showHexEditor && (
        <ActionButtons
          animationLevel={localAnimationSettings.level}
          onAnimationToggle={() => {
            setLocalAnimationSettings((prev) => ({
              ...prev,
              level: prev.level === "total" ? "none" : "total",
            }));
          }}
          onSettings={onSettings || onToggleView}
          onWiki={() => {
            window.open("https://fer-000.github.io/solar-wars-wiki", "_blank");
          }}
          onShipyard={onShipyard}
        />
      )}

      {!showHexEditor && (
        <NavigationButtons
          onShipyard={onShipyard}
          onArmedForces={onArmedForces}
        />
      )}

      {/* Game Date Display - Top Right */}
      {!showHexEditor && (
        <div
          onClick={() => setShowDateCalculator(true)}
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            padding: "12px 20px",
            background: "rgba(0, 0, 0, 0.7)",
            borderRadius: "6px",
            color: "#fff",
            fontSize: "1rem",
            fontFamily: "monospace",
            cursor: "pointer",
            transition: "all 0.2s",
            zIndex: 100,
            userSelect: "none",
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "rgba(0, 0, 0, 0.85)";
            e.target.style.borderColor = "rgba(0, 245, 255, 0.6)";
            e.target.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "rgba(0, 0, 0, 0.7)";
            e.target.style.borderColor = "rgba(255, 255, 255, 0.3)";
            e.target.style.transform = "scale(1)";
          }}
        >
          {formatSolarDate()}
        </div>
      )}

      {showHexEditor && mapData && (
        <HexMapEditor
          width={mapData.width || 90}
          height={mapData.height || 60}
          initialData={mapData}
          backgroundImage={mapData.imageUrl}
          worldName={mapData.worldName || "Unknown World"}
          userFactionId={allFactions[currentFaction?.toLowerCase()]?.id || null}
          isRef={refereeMode?.isReferee || false}
          allFactions={allFactions}
          onShowWorldDetail={() => {
            setShowHexEditor(false);
            setZoomedWorld(mapData.worldName);
          }}
          onClose={() => {
            setShowHexEditor(false);
            setMapData(null);
          }}
          onSave={async (data) => {
            try {
              // Save to database
              const claimsData = JSON.stringify(data);
              await databaseService.setFaction("The Solar Wars", "settings", {
                [`Places.${mapData.worldName}.Claims`]: claimsData,
              });
              console.log("Map data saved successfully");
              // Optionally close the editor after saving
              // setShowHexEditor(false);
              // setMapData(null);
            } catch (error) {
              console.error("Error saving map data:", error);
            }
          }}
          readOnly={true}
        />
      )}

      {zoomedWorld && (
        <WorldDetailModal
          zoomedWorld={zoomedWorld}
          setZoomedWorld={setZoomedWorld}
          allFactions={allFactions}
          getFactionColor={getFactionColor}
        />
      )}

      <FleetModal
        show={showFleetModal}
        selectedFleet={selectedFleet}
        onClose={() => setShowFleetModal(false)}
        getFactionColor={getFactionColor}
        allFactions={allFactions}
        systemData={systemData}
        currentFaction={currentFaction}
        refereeMode={refereeMode}
        toggleFactionCollapse={(f, w) => {
          const k = `${f}-${w}`;
          const s = new Set(collapsedFactions);
          s.has(k) ? s.delete(k) : s.add(k);
          setCollapsedFactions(s);
        }}
      />

      <BattleModal
        show={showBattleModal}
        battleData={selectedBattle}
        onClose={() => setShowBattleModal(false)}
        getFactionColor={getFactionColor}
        onFleetClick={(fleet) => {
          setSelectedFleet(fleet);
          setShowFleetModal(true);
          setShowBattleModal(false);
        }}
        onStartBattle={(data) => {
          window.open("https://sws-development-a5cb2.web.app/", "_blank");
        }}
      />

      <WarningToast message={warningMessage} opacity={warningOpacity} />

      {showDateCalculator && (
        <DateCalculatorModal
          currentDate={formatSolarDate()}
          onClose={() => setShowDateCalculator(false)}
        />
      )}

      {isMobile && (
        <MobileControls
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onPanUp={() => handlePan(0, -60)}
          onPanDown={() => handlePan(0, 60)}
          onPanLeft={() => handlePan(-60, 0)}
          onPanRight={() => handlePan(60, 0)}
        />
      )}
    </div>
  );
};

export default AnimatedSolarSystem;
