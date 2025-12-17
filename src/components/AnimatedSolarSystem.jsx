import React, { useRef, useEffect, useState } from "react";
import { getSolarDate } from "../utils/dateUtils";
import BackButton from "./AnimatedSolarSystem/BackButton";
import ActionButtons from "./AnimatedSolarSystem/ActionButtons";
import WorldDetailModal from "./AnimatedSolarSystem/WorldDetailModal";
import FleetModal from "./AnimatedSolarSystem/FleetModal";
import WarningToast from "./AnimatedSolarSystem/WarningToast";
import MobileControls from "./AnimatedSolarSystem/MobileControls";
import {
  lerpCamera,
  screenToWorld,
  worldToScreen,
} from "./AnimatedSolarSystem/camera";
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
  onSystemChange,
  allFactions = {},
  systemData = {},
  currentFaction = "",
  timeScale = 0.0008, // Speed of time progression, 1 for pretty speed, 0.0008 for rp realistic
  // --- NEW: Controls animation level ---
  animationSettings = { level: "total" },
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
  const solarSystemsRef = useRef(null); // { sol: {...}, corelli: {...} }
  const systemPositions = useRef({
    Sol: { x: 0, y: 0 },
    Corelli: {
      x: 4200 * Math.cos(Math.PI / 6),
      y: 4200 * Math.sin(Math.PI / 6),
    }, // 30° (120° clockwise from top) at 4200 units
  });
  const initialTimeOffset = useRef(0);
  const [currentSystemView, setCurrentSystemView] = useState(systemName);

  // --- NEW: Enhanced Battle Animation Refs ---
  const activeSkirmishesRef = useRef([]); // Tracks ships that have left orbit ("hijacked")
  const projectilesRef = useRef([]); // Tracks torpedoes/lasers
  const particlesRef = useRef([]); // Tracks debris/explosions
  const lastSkirmishSpawnTime = useRef(0);

  // Warning messages for extreme zoom/pan
  const warningMessages = [
    "Detecting multiple leviathan class lifeforms in the region. Are you certain whatever you're doing is worth it?",
    "END OF THE UNIVERSE. THANK YOU FOR ALL THE FISH.",
    "Warning: approaching galactic barrier.",
    "You don’t want to know what happens if you cross that.",
    "This is the edge of the system.",
    "OI! You there! Yes, you! Stop poking around where you don’t belong!",
  ];

  // Create both solar systems once
  if (!solarSystemsRef.current) {
    solarSystemsRef.current = {
      Sol: createSolarSystemHierarchy("Sol"),
      Corelli: createSolarSystemHierarchy("Corelli"),
    };
  }
  const solarSystem = solarSystemsRef.current[systemName];

  // --- REPLACED: Date Alignment Logic ---
  useEffect(() => {
    // 1. Calculate Game Years elapsed since alignment
    const alignment1982 = new Date(1982, 2, 10); // March 10, 1982
    const alignStar = getSolarDate(alignment1982);
    const currentStar = getSolarDate(new Date());

    const [alignYear, alignMonth, alignDay] = alignStar;
    const [curYear, curMonth, curDay] = currentStar;

    // Total months elapsed (1 IRL month = 1 Game Year)
    const totalMonths =
      (curYear - alignYear) * 12 +
      (parseInt(curMonth, 10) - parseInt(alignMonth, 10));

    const dayDiff = parseInt(curDay, 10) - parseInt(alignDay, 10);
    // Approximation: 30 days per month
    const monthProgress = dayDiff / 30;

    // Total Game Years elapsed
    const gameYears = totalMonths + monthProgress;

    // 2. Calibrate Offset
    // Earth Speed in config = 0.00005 radians per tick
    // Full Orbit (2 * PI) = 6.28318 radians
    // Ticks per Orbit = 6.28318 / 0.00005 = ~125,663.7
    // So, 1 Game Year = 125,663.7 simulation ticks
    const TICKS_PER_YEAR = 125663.7;

    initialTimeOffset.current = gameYears * TICKS_PER_YEAR;
  }, []);

  // --- HELPERS (Defined first to prevent reference errors) ---

  // 2. SPAWN SALVO
  const spawnSalvo = (source, target) => {
    if (!source || !target) return;
    const count = 3 + Math.floor(Math.random() * 3);
    const groupMiss = Math.random() > 0.5;
    for (let i = 0; i < count; i++) {
      spawnProjectile(source, target, "TORPEDO", groupMiss, i * 8);
    }
  };

  // 3. SPAWN EXPLOSION
  const spawnExplosion = (x, y, scale = 1) => {
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    particlesRef.current.push({
      type: "EXPLOSION",
      x,
      y,
      life: 15,
      size: 2 * scale,
      color: "#FFA500",
    });
    for (let i = 0; i < 3; i++) {
      particlesRef.current.push({
        type: "DEBRIS",
        x,
        y,
        life: 30,
        size: 0.5,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        color: "#FFF",
      });
    }
  };

  // --- UPDATED HELPER: SPAWN PROJECTILE (Tighter Spawn, Tiny Size) ---
  const spawnProjectile = (
    source,
    target,
    type = "TORPEDO",
    forceMiss = null,
    delayOffset = 0
  ) => {
    if (!source || !target) return;

    const isMiss = forceMiss !== null ? forceMiss : Math.random() > 0.6;
    const color = getFactionColor
      ? getFactionColor(source.fleet.factionName)
      : "#fff";

    // Destination Logic
    let staticDestX = target.currentX;
    let staticDestY = target.currentY;

    if (isMiss) {
      staticDestX += (Math.random() - 0.5) * 80;
      staticDestY += (Math.random() - 0.5) * 80;
    } else {
      staticDestX += Math.cos(target.angle) * 10;
      staticDestY += Math.sin(target.angle) * 10;
    }

    if (type === "TORPEDO") {
      // Reduced spread to keep it looking like it comes FROM the ship
      const spreadX = (Math.random() - 0.5) * 2;
      const spreadY = (Math.random() - 0.5) * 2;

      // REMOVED delayOffset calculation that was placing shots behind the ship
      const startX = source.currentX + spreadX;
      const startY = source.currentY + spreadY;

      const angle = Math.atan2(staticDestY - startY, staticDestX - startX);

      projectilesRef.current.push({
        type: "TORPEDO",
        x: startX,
        y: startY,
        targetObj: target,
        missDest: { x: staticDestX, y: staticDestY },
        angle: angle,
        speed: 1.5,
        life: 150,
        color: color,
        isMiss: isMiss,
      });
    } else {
      projectilesRef.current.push({
        type: "LASER",
        sourceObj: source,
        targetObj: target,
        missDest: { x: staticDestX, y: staticDestY },
        life: 8,
        color: color,
        isMiss: isMiss,
      });
      // Instant hit effect (Small spark)
      if (!isMiss) spawnExplosion(staticDestX, staticDestY, 0.8);
    }
  };

  // --- REPLACED: BATTLE LOGIC (Supports Multiple Simultaneous Fights) ---
  const updateBattleLogic = (fleetsOnScreen) => {
    if (animationSettings.level !== "total" || !focusedBody) return;

    const timeSinceLast = timeRef.current - lastSkirmishSpawnTime.current;

    // 1. SPAWN LOGIC
    // Determine dynamic cooldown based on activity
    // If quiet: Wait long (25-50s). If fighting has started: Cascade new fights fast (2-5s)
    const isQuiet = activeSkirmishesRef.current.length === 0;
    const cooldown = isQuiet
      ? Math.random() * 1500 + 1500
      : Math.random() * 200 + 100;

    // Allow up to 5 simultaneous skirmishes
    if (activeSkirmishesRef.current.length < 5 && timeSinceLast > cooldown) {
      // Filter out fleets that are ALREADY fighting
      const busyIds = new Set(
        activeSkirmishesRef.current.flatMap((s) => [
          s.attacker.fleet.ID,
          s.defender.fleet.ID,
        ])
      );

      // Only look at free fleets in Battle mode
      const available = fleetsOnScreen.filter(
        (f) => !busyIds.has(f.fleet.ID) && f.fleet.State?.Action === "Battle"
      );

      const factions = {};
      available.forEach((f) => {
        if (!factions[f.fleet.factionName]) factions[f.fleet.factionName] = [];
        factions[f.fleet.factionName].push(f);
      });

      const factionNames = Object.keys(factions);

      // We need at least 2 different factions present among the FREE fleets
      if (factionNames.length >= 2) {
        const f1 =
          factionNames[Math.floor(Math.random() * factionNames.length)];
        const f2 = factionNames.filter((n) => n !== f1)[
          Math.floor(Math.random() * (factionNames.length - 1))
        ];

        const attacker =
          factions[f1][Math.floor(Math.random() * factions[f1].length)];
        const defender =
          factions[f2][Math.floor(Math.random() * factions[f2].length)];

        // Calculate a random center near the planet, but distinct from other fights
        // Add larger variance (80) so multiple fights don't overlap perfectly
        const midX = (attacker.x + defender.x) / 2 + (Math.random() - 0.5) * 80;
        const midY = (attacker.y + defender.y) / 2 + (Math.random() - 0.5) * 80;
        const axisRotation = Math.random() * Math.PI * 2;

        // Guaranteed Asymmetry
        const tactics = ["FIGURE8", "ORBIT", "DIVING_OVAL", "SINE_WAVE"];
        const t1 = tactics[Math.floor(Math.random() * tactics.length)];
        let t2 = t1;
        while (t2 === t1)
          t2 = tactics[Math.floor(Math.random() * tactics.length)];

        const startPhase = Math.random() < 0.3 ? "HEADON" : "APPROACH";

        activeSkirmishesRef.current.push({
          id: Date.now(),
          phase: startPhase,
          timer: 0,
          duration: 400 + Math.random() * 200,
          center: { x: midX, y: midY },
          axisRotation: axisRotation,
          attacker: {
            ...attacker,
            currentX: attacker.x,
            currentY: attacker.y,
            angle: 0,
            tactic: t1,
            phaseOffset: 0,
          },
          defender: {
            ...defender,
            currentX: defender.x,
            currentY: defender.y,
            angle: Math.PI,
            tactic: t2,
            phaseOffset: Math.PI,
          },
        });
        lastSkirmishSpawnTime.current = timeRef.current;
      }
    }

    // 2. EXECUTE MOVEMENT
    activeSkirmishesRef.current.forEach((skirmish) => {
      const { attacker, defender, center, axisRotation } = skirmish;
      if (!attacker || !defender) {
        skirmish.finished = true;
        return;
      }

      skirmish.timer++;

      const toArena = (x, y) => {
        const cos = Math.cos(axisRotation);
        const sin = Math.sin(axisRotation);
        return {
          x: center.x + (x * cos - y * sin),
          y: center.y + (x * sin + y * cos),
        };
      };

      // --- PHASE 1: HEAD ON ---
      if (skirmish.phase === "HEADON") {
        const progress = skirmish.timer / 120;
        const spread = 70 * (1 - progress);
        const swerve = progress > 0.7 ? (progress - 0.7) * 80 : 0;

        const pA = toArena(-spread, swerve);
        const pD = toArena(spread, -swerve);

        const ease = 0.1;
        attacker.currentX += (pA.x - attacker.currentX) * ease;
        attacker.currentY += (pA.y - attacker.currentY) * ease;
        defender.currentX += (pD.x - defender.currentX) * ease;
        defender.currentY += (pD.y - defender.currentY) * ease;

        attacker.angle = Math.atan2(
          pA.y - attacker.currentY,
          pA.x - attacker.currentX
        );
        defender.angle = Math.atan2(
          pD.y - defender.currentY,
          pD.x - defender.currentX
        );

        if (progress > 0.3 && progress < 0.7 && Math.random() < 0.2) {
          spawnProjectile(attacker, defender, "LASER");
          spawnProjectile(defender, attacker, "LASER");
        }

        if (progress >= 1) {
          skirmish.phase = "FIGHT";
          skirmish.timer = 0;
        }
      }

      // --- PHASE 2: APPROACH ---
      else if (skirmish.phase === "APPROACH") {
        const pA = toArena(-40, 0);
        const pD = toArena(40, 0);

        const ease = 0.05;
        attacker.currentX += (pA.x - attacker.currentX) * ease;
        attacker.currentY += (pA.y - attacker.currentY) * ease;
        defender.currentX += (pD.x - defender.currentX) * ease;
        defender.currentY += (pD.y - defender.currentY) * ease;

        attacker.angle = Math.atan2(
          defender.currentY - attacker.currentY,
          defender.currentX - attacker.currentX
        );
        defender.angle = Math.atan2(
          attacker.currentY - defender.currentY,
          attacker.currentX - defender.currentX
        );

        const dist = Math.sqrt(
          Math.pow(attacker.currentX - pA.x, 2) +
            Math.pow(attacker.currentY - pA.y, 2)
        );
        if (dist < 10) skirmish.phase = "FIGHT";
      }

      // --- PHASE 3: FIGHT ---
      else if (skirmish.phase === "FIGHT") {
        [attacker, defender].forEach((ship) => {
          const t = skirmish.timer * 0.03 + ship.phaseOffset;
          let tx = 0,
            ty = 0;

          if (ship.tactic === "FIGURE8") {
            tx = Math.cos(t) * 45;
            ty = Math.sin(2 * t) * 20;
          } else if (ship.tactic === "ORBIT") {
            tx = Math.cos(t) * 35;
            ty = Math.sin(t) * 35;
          } else if (ship.tactic === "DIVING_OVAL") {
            tx = Math.cos(t) * 40;
            ty = Math.sin(t) * (Math.sin(t) > 0 ? 30 : 10);
          } else if (ship.tactic === "SINE_WAVE") {
            tx = Math.cos(t * 0.5) * 50;
            ty = Math.sin(t * 3) * 10;
          }

          const dest = toArena(tx, ty);
          ship.currentX += (dest.x - ship.currentX) * 0.08;
          ship.currentY += (dest.y - ship.currentY) * 0.08;

          const moveAngle = Math.atan2(
            dest.y - ship.currentY,
            dest.x - ship.currentX
          );
          const blendAngle = (a, b, k) => {
            let d = b - a;
            while (d > Math.PI) d -= Math.PI * 2;
            while (d < -Math.PI) d += Math.PI * 2;
            return a + d * k;
          };
          ship.angle = blendAngle(ship.angle, moveAngle, 0.15);
        });

        // SHOOTING (Wide Arc: ~170 degrees per side)
        const angleToDef = Math.atan2(
          defender.currentY - attacker.currentY,
          defender.currentX - attacker.currentX
        );
        let diffA = attacker.angle - angleToDef;
        while (diffA > Math.PI) diffA -= Math.PI * 2;
        while (diffA < -Math.PI) diffA += Math.PI * 2;

        if (Math.abs(diffA) < 3.0 && Math.random() < 0.08) {
          if (Math.random() < 0.2) spawnSalvo(attacker, defender);
          else spawnProjectile(attacker, defender, "LASER");
        }

        const angleToAtk = Math.atan2(
          attacker.currentY - defender.currentY,
          attacker.currentX - defender.currentX
        );
        let diffD = defender.angle - angleToAtk;
        while (diffD > Math.PI) diffD -= Math.PI * 2;
        while (diffD < -Math.PI) diffD += Math.PI * 2;

        if (Math.abs(diffD) < 3.0 && Math.random() < 0.08) {
          if (Math.random() < 0.2) spawnSalvo(defender, attacker);
          else spawnProjectile(defender, attacker, "LASER");
        }

        if (skirmish.timer > skirmish.duration) skirmish.phase = "RETURN";
      }

      // --- PHASE 4: RETURN ---
      else if (skirmish.phase === "RETURN") {
        const ease = 0.04;
        attacker.currentX += (attacker.x - attacker.currentX) * ease;
        attacker.currentY += (attacker.y - attacker.currentY) * ease;
        defender.currentX += (defender.x - defender.currentX) * ease;
        defender.currentY += (defender.y - defender.currentY) * ease;

        const blendAngle = (a, b, k) => {
          let d = b - a;
          while (d > Math.PI) d -= Math.PI * 2;
          while (d < -Math.PI) d += Math.PI * 2;
          return a + d * k;
        };
        attacker.angle = blendAngle(attacker.angle, 0, 0.05);
        defender.angle = blendAngle(defender.angle, Math.PI, 0.05);

        const dist = Math.sqrt(
          Math.pow(attacker.currentX - attacker.x, 2) +
            Math.pow(attacker.currentY - attacker.y, 2)
        );
        if (dist < 3) skirmish.finished = true;
      }
    });

    activeSkirmishesRef.current = activeSkirmishesRef.current.filter(
      (s) => !s.finished
    );

    // 3. PROJECTILES
    projectilesRef.current.forEach((p) => {
      p.life--;
      if (p.type === "TORPEDO") {
        p.speed *= 1.05;
        if (!p.targetObj || !p.missDest) {
          p.life = 0;
          return;
        }

        let destX = p.isMiss ? p.missDest.x : p.targetObj.currentX;
        let destY = p.isMiss ? p.missDest.y : p.targetObj.currentY;

        const desiredAngle = Math.atan2(destY - p.y, destX - p.x);
        let diff = desiredAngle - p.angle;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        p.angle += diff * 0.1;

        p.x += Math.cos(p.angle) * p.speed;
        p.y += Math.sin(p.angle) * p.speed;

        const dist = Math.sqrt(
          Math.pow(p.x - destX, 2) + Math.pow(p.y - destY, 2)
        );
        if (dist < 10) {
          p.life = 0;
          if (!p.isMiss) spawnExplosion(destX, destY, 3.5);
        }
      }
    });
    projectilesRef.current = projectilesRef.current.filter((p) => p.life > 0);

    // 4. PARTICLES
    particlesRef.current.forEach((p) => {
      if (!Number.isFinite(p.x)) return;
      p.life--;
      if (p.type === "EXPLOSION") p.size *= 0.9;
      if (p.type === "DEBRIS") {
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.92;
        p.vy *= 0.92;
      }
    });
    particlesRef.current = particlesRef.current.filter((p) => p.life > 0);
  };

  // --- FIXED DRAWING: SHIPS BOTTOM, EXPLOSIONS TOP ---
  const drawBattleEffects = (ctx) => {
    ctx.save();

    // -------------------------------------------------------
    // LAYER 1: SHIPS (Draw these FIRST so they are "Under")
    // -------------------------------------------------------
    ctx.globalCompositeOperation = "source-over"; // Normal solid drawing
    ctx.globalAlpha = 1;

    activeSkirmishesRef.current.forEach((s) => {
      [s.attacker, s.defender].forEach((ship) => {
        if (!Number.isFinite(ship.currentX)) return;

        const color = getFactionColor
          ? getFactionColor(ship.fleet.factionName)
          : "#00f5ff";

        ctx.save();
        ctx.translate(ship.currentX, ship.currentY);
        ctx.rotate(ship.angle + Math.PI / 2);

        const scale = Math.max(0.4, 0.6 / cameraRef.current.zoom);
        ctx.scale(scale, scale);

        if (ship.fleet.Type === "Space") drawSpaceIcon(ctx, color);
        else drawGroundIcon(ctx, color);

        ctx.restore();
      });
    });

    // -------------------------------------------------------
    // LAYER 2: EFFECTS (Draw these LAST so they cover ships)
    // -------------------------------------------------------
    ctx.globalCompositeOperation = "lighter"; // Additive Glow

    // A. PROJECTILES
    projectilesRef.current.forEach((p) => {
      if (p.type === "LASER") {
        if (!p.sourceObj || !p.targetObj) return;

        const sx = p.sourceObj.currentX;
        const sy = p.sourceObj.currentY;
        const tx = p.isMiss ? p.missDest.x : p.targetObj.currentX;
        const ty = p.isMiss ? p.missDest.y : p.targetObj.currentY;

        ctx.shadowBlur = 4;
        ctx.shadowColor = p.color;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 0.6;
        ctx.globalAlpha = Math.max(0, p.life / 8);

        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(tx, ty);
        ctx.stroke();
        ctx.lineWidth = 0.2;
        ctx.strokeStyle = "#fff";
        ctx.stroke();
        ctx.shadowBlur = 0;
      } else if (p.type === "TORPEDO") {
        if (!Number.isFinite(p.x)) return;

        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(p.x, p.y, 0.3, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 2;
        ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 0.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    });

    // B. PARTICLES (Explosions)
    particlesRef.current.forEach((p) => {
      if (!Number.isFinite(p.x)) return;
      if (p.type === "EXPLOSION") {
        let alpha = Math.max(0, p.life / 15);
        const safeRadius = Math.max(0.1, p.size);
        try {
          const gradient = ctx.createRadialGradient(
            p.x,
            p.y,
            0,
            p.x,
            p.y,
            safeRadius
          );
          gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
          gradient.addColorStop(0.4, `rgba(255, 160, 50, ${alpha * 0.8})`);
          gradient.addColorStop(1, `rgba(0,0,0,0)`);
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(p.x, p.y, safeRadius, 0, Math.PI * 2);
          ctx.fill();
        } catch (e) {}
      } else if (p.type === "DEBRIS") {
        ctx.fillStyle = `rgba(255, 200, 150, ${p.life / 30})`;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }
    });

    ctx.restore();
  };

  // Initialize stars
  useEffect(() => {
    const newStars = [];
    // Increased count to 4000 and range to 15000 to cover extreme pans
    for (let i = 0; i < 5000; i++) {
      newStars.push({
        x: (Math.random() - 0.5) * 30000,
        y: (Math.random() - 0.5) * 30000,
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

    // Load images for both Sol and Corelli systems
    loadAllImages(solarSystemsRef.current.Sol);
    loadAllImages(solarSystemsRef.current.Corelli);
    setPlanetImages(images);
  }, [solarSystem]);

  // Teleport to system when systemName changes
  useEffect(() => {
    const pos = systemPositions.current[systemName];
    if (pos) {
      targetCameraRef.current = {
        x: pos.x,
        y: pos.y,
        zoom: 0.8,
      };
      setCurrentSystemView(systemName);
      setFocusedBody(null);
      fleetPositionsRef.current = [];
    }
  }, [systemName]);

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

    const wheelHandler = (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      const minZoom = focusedBody ? 2 : 0.3;
      const maxZoom = focusedBody ? 20 : 10;
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
      timeRef.current += timescale;
      cameraRef.current = lerpCamera(
        cameraRef.current,
        targetCameraRef.current,
        0.1
      );

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

      // --- WARNING CHECKS ---
      const distX = Math.abs(cameraRef.current.x);
      const distY = Math.abs(cameraRef.current.y);
      const distance = Math.sqrt(distX * distX + distY * distY);
      const isExtremePan = distance > 20000;

      if (isExtremePan) {
        if (!warningActiveRef.current && !focusedBody) {
          warningActiveRef.current = true;
          const randomMsg =
            warningMessages[Math.floor(Math.random() * warningMessages.length)];
          setWarningMessage(randomMsg);
          setWarningOpacity(1);
          if (warningTimeoutRef.current)
            clearTimeout(warningTimeoutRef.current);
          warningTimeoutRef.current = setTimeout(() => {
            setWarningOpacity(0);
            setTimeout(() => setWarningMessage(null), 500);
          }, 5000);
        }
      } else {
        if (warningActiveRef.current) {
          warningActiveRef.current = false;
          if (warningTimeoutRef.current)
            clearTimeout(warningTimeoutRef.current);
          setWarningOpacity(0);
          setWarningMessage(null);
        }
      }

      // --- RUN BATTLE LOGIC ---
      // We pass the current list of on-screen fleets (calculated last frame) to the logic
      updateBattleLogic(fleetPositionsRef.current);

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

      // Stars
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

      // --- Important: Clear fleet positions before redrawing ---
      // This allows both systems to populate the ref for click detection and battle logic
      fleetPositionsRef.current = [];

      // Draw both systems
      const currentTime = timeRef.current + initialTimeOffset.current;
      const solPos = systemPositions.current.Sol;
      drawBody(
        ctx,
        solarSystemsRef.current.Sol,
        solPos.x,
        solPos.y,
        currentTime
      );

      const corelliPos = systemPositions.current.Corelli;
      drawBody(
        ctx,
        solarSystemsRef.current.Corelli,
        corelliPos.x,
        corelliPos.y,
        currentTime
      );

      // Connection Line
      ctx.save();
      ctx.setLineDash([8, 12]);
      ctx.strokeStyle = "rgba(0, 245, 255, 0.15)";
      ctx.lineWidth = 2 / cameraRef.current.zoom;
      ctx.beginPath();
      ctx.moveTo(solPos.x, solPos.y);
      ctx.lineTo(corelliPos.x, corelliPos.y);
      ctx.stroke();
      ctx.restore();

      // Asteroid Belts
      if (
        !focusedBody ||
        focusedBody.name === "Sun" ||
        focusedBody.name === "Corelli Star"
      ) {
        // [Reuse existing belt drawing logic...]
        // For brevity, using the previous logic wrapper or inline:
        const drawAsteroidBelt = (centerX, centerY, beltRadius) => {
          // ... [Copy of your existing asteroid belt code] ...
          const beltWidth = 50;
          const totalAsteroids = 800;
          const beltRotationSpeed = 0.00005;
          const beltOffset = currentTime * beltRotationSpeed;
          ctx.save();
          ctx.translate(centerX, centerY);
          ctx.beginPath();
          ctx.arc(0, 0, beltRadius, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(120, 110, 100, 0.06)";
          ctx.lineWidth = beltWidth;
          ctx.stroke();
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
        drawAsteroidBelt(solPos.x, solPos.y, 200);
        drawAsteroidBelt(corelliPos.x, corelliPos.y, 170);
      }

      // --- 4. BATTLE EFFECTS LAYER (High Detail) ---
      if (focusedBody) {
        drawBattleEffects(ctx);
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
      // [Same logic as before]
      let angle = body.angle !== undefined ? body.angle : t * body.speed;
      let x = cx + Math.cos(angle) * body.dist;
      let y = cy + Math.sin(angle) * body.dist;
      body.currentX = x;
      body.currentY = y;

      const isFocusedBody = focusedBody === body;
      const isChildOfFocused = focusedBody && body.parent === focusedBody;
      const isParentOfFocused = focusedBody && focusedBody.parent === body;
      let shouldRender = !skipRendering;
      if (focusedBody)
        shouldRender =
          !skipRendering &&
          (isFocusedBody || isChildOfFocused || isParentOfFocused);

      if (shouldRender && body.dist > 0) {
        ctx.beginPath();
        ctx.strokeStyle = isMoon
          ? "rgba(255,255,255,0.15)"
          : "rgba(255,255,255,0.1)";
        ctx.lineWidth = isMoon ? 0.5 : 1;
        ctx.arc(cx, cy, body.dist, 0, Math.PI * 2);
        ctx.stroke();
      }

      let drawChildren =
        (!isMoon && !focusedBody) ||
        focusedBody === body ||
        (focusedBody && focusedBody.parent === body);

      if (shouldRender) {
        if (body.name === "Sun" || body.name === "Corelli Star") {
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
          ctx.beginPath();
          ctx.fillStyle = body.color;
          ctx.arc(x, y, body.size, 0, Math.PI * 2);
          ctx.fill();
        } else {
          const img = planetImages[body.name];
          if (img && img.complete && img.naturalHeight !== 0)
            ctx.drawImage(
              img,
              x - body.size,
              y - body.size,
              body.size * 2,
              body.size * 2
            );
          else {
            ctx.beginPath();
            ctx.fillStyle = body.color;
            ctx.arc(x, y, body.size, 0, Math.PI * 2);
            ctx.fill();
          }
        }
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
        if (focusedBody === body)
          drawFleetIndicators(ctx, body.name, x, y, body.size);
      }

      if (drawChildren && body.children)
        body.children.forEach((child) => {
          child.parent = body;
          drawBody(ctx, child, x, y, t * 0.3, true, false);
        });
      if (!drawChildren && !isMoon && body.children)
        body.children.forEach((child) => {
          child.parent = body;
          const skip =
            focusedBody && child !== focusedBody && focusedBody.parent !== body;
          drawBody(ctx, child, x, y, t * 0.3, true, skip);
        });
    };

    const drawFleetIndicators = (ctx, worldName, x, y, size) => {
      // 1. Get fleets normally
      const rawFleets = getFleetsAtWorldWrapper(worldName) || [];

      // Visibility Logic (same as before)
      const currentFactionActiveCombatUnits = rawFleets.filter(
        (f) =>
          f.factionName.toLowerCase() === currentFaction.toLowerCase() &&
          ["Defense", "Patrol", "Battle", "Activating"].includes(
            f.State?.Action
          )
      );
      let fleets = [];
      if (refereeMode?.isReferee || currentFactionActiveCombatUnits.length > 0)
        fleets = rawFleets;
      else if (
        rawFleets.some(
          (f) => f.factionName.toLowerCase() === currentFaction.toLowerCase()
        )
      )
        fleets = rawFleets;
      else
        fleets = rawFleets.filter(
          (f) => f.factionName.toLowerCase() === currentFaction.toLowerCase()
        );

      if (fleets.length === 0) return;

      // 2. FILTER OUT fleets that are currently "Hijacked" by Battle Logic
      // We identify them by ID so they don't appear in the orbital ring while fighting
      const busyFleetIds = new Set();
      activeSkirmishesRef.current.forEach((s) => {
        busyFleetIds.add(s.attacker.fleet.ID);
        busyFleetIds.add(s.defender.fleet.ID);
      });
      const visibleOrbitFleets = fleets.filter((f) => !busyFleetIds.has(f.ID));

      const spaceOrbitRadius = size + 8;
      const groundOrbitRadius = size + 1;
      const localFleetPositions = [];

      const fleetsByFaction = visibleOrbitFleets.reduce((acc, fleet) => {
        if (!acc[fleet.factionName]) acc[fleet.factionName] = [];
        acc[fleet.factionName].push(fleet);
        return acc;
      }, {});

      const displayFleets = [];
      Object.entries(fleetsByFaction).forEach(
        ([factionName, factionFleets]) => {
          const key = `${factionName}-${worldName}`;
          if (collapsedFactions.has(key)) {
            const s = factionFleets.filter((f) => f.Type === "Space");
            if (s.length)
              displayFleets.push({
                ...s[0],
                Type: "Space",
                isCollapsed: true,
                collapsedCount: s.length,
              });
            const g = factionFleets.filter((f) => f.Type === "Ground");
            if (g.length)
              displayFleets.push({
                ...g[0],
                Type: "Ground",
                isCollapsed: true,
                collapsedCount: g.length,
              });
          } else displayFleets.push(...factionFleets);
        }
      );

      const sFleets = displayFleets.filter((f) => f.Type === "Space");
      const gFleets = displayFleets.filter((f) => f.Type === "Ground");

      ctx.save();
      ctx.shadowBlur = 4;
      ctx.lineJoin = "round";

      // Space
      sFleets.forEach((fleet, i) => {
        const angle =
          (i / Math.max(sFleets.length, 1)) * Math.PI * 2 +
          timeRef.current * 0.0002;
        const fx = x + Math.cos(angle) * spaceOrbitRadius;
        const fy = y + Math.sin(angle) * spaceOrbitRadius;
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
          ctx.translate(1.5, 1.5);
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
        localFleetPositions.push({
          fleet,
          x: fx,
          y: fy,
          radius: 5 * arrowScale,
          isCollapsed: fleet.isCollapsed || false,
        });
      });

      // Ground
      gFleets.forEach((fleet, i) => {
        const angle =
          (i / Math.max(gFleets.length, 1)) * Math.PI * 2 +
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
        localFleetPositions.push({
          fleet,
          x: fx,
          y: fy,
          radius: 5 * arrowScale,
          isCollapsed: fleet.isCollapsed || false,
        });
      });

      ctx.restore();

      // APPEND to the global ref (since we might draw multiple systems/worlds in one frame)
      fleetPositionsRef.current.push(...localFleetPositions);
    };

    update();
    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("wheel", wheelHandler);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (warningTimeoutRef.current) clearInterval(warningTimeoutRef.current);
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
    animationSettings,
  ]);

  // Handle clicks (Same logic as before)
  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { x: worldX, y: worldY } = screenToWorld(
      e.clientX,
      e.clientY,
      canvas,
      cameraRef.current
    );

    // Only allow fleet clicks if we have visibility on the world
    if (focusedBody && fleetPositionsRef.current.length > 0) {
      // Check if player has intelligence to see fleets at this world
      // IMPORTANT: Use getFleetsAtWorldWrapper which filters by current system
      const fleetsAtWorld = getFleetsAtWorldWrapper(focusedBody.name) || [];
      const currentFactionActiveCombatUnits = fleetsAtWorld.filter(
        (f) =>
          f.factionName.toLowerCase() === currentFaction.toLowerCase() &&
          ["Defense", "Patrol", "Battle", "Activating"].includes(
            f.State?.Action
          )
      );

      // Only process fleet clicks if player has visibility
      const hasVisibility =
        refereeMode?.isReferee ||
        currentFactionActiveCombatUnits.length > 0 ||
        fleetsAtWorld.some(
          (f) => f.factionName.toLowerCase() === currentFaction.toLowerCase()
        );

      if (hasVisibility) {
        for (let fleetPos of fleetPositionsRef.current) {
          const dx = worldX - fleetPos.x;
          const dy = worldY - fleetPos.y;
          if (Math.sqrt(dx * dx + dy * dy) < fleetPos.radius) {
            if (fleetPos.isCollapsed)
              toggleFactionCollapse(
                fleetPos.fleet.factionName,
                focusedBody.name
              );
            else {
              setSelectedFleet({
                ...fleetPos.fleet,
                factionName: fleetPos.fleet.factionName,
              });
              setShowFleetModal(true);
            }
            return;
          }
        }
      }
    }

    // Body checks
    let clickedBody = null;
    const checkList = (list) => {
      for (let body of list) {
        let dx = worldX - body.currentX;
        let dy = worldY - body.currentY;
        if (Math.sqrt(dx * dx + dy * dy) < body.size + 10) return body;
        if (body.children) {
          let c = checkList(body.children);
          if (c) return c;
        }
      }
      return null;
    };
    clickedBody = checkList(solarSystemsRef.current.Sol.children);
    if (!clickedBody)
      clickedBody = checkList(solarSystemsRef.current.Corelli.children);
    if (!clickedBody) {
      let dx = worldX - solarSystemsRef.current.Sol.currentX;
      let dy = worldY - solarSystemsRef.current.Sol.currentY;
      if (Math.sqrt(dx * dx + dy * dy) < solarSystemsRef.current.Sol.size + 10)
        clickedBody = solarSystemsRef.current.Sol;
    }
    if (!clickedBody) {
      let dx = worldX - solarSystemsRef.current.Corelli.currentX;
      let dy = worldY - solarSystemsRef.current.Corelli.currentY;
      if (
        Math.sqrt(dx * dx + dy * dy) <
        solarSystemsRef.current.Corelli.size + 10
      )
        clickedBody = solarSystemsRef.current.Corelli;
    }

    if (clickedBody) handleBodyClick(clickedBody);
    else if (focusedBody) {
      if (
        focusedBody.parent &&
        focusedBody.parent.name !== "Sun" &&
        focusedBody.parent.name !== "Corelli Star"
      )
        focusOnBody(focusedBody.parent);
      else returnToOverview();
    }
  };

  // ... [Keep helper functions like getFleetsAtWorldWrapper, canZoomInForWorld, handleBodyClick, toggleFactionCollapse, focusOnBody, returnToOverview, handleBack, etc.] ...

  // System world lists for filtering
  const systemWorlds = {
    Sol: [
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
    ],
    Corelli: [
      "Barcas",
      "Deo Gloria",
      "Novai",
      "Asteroid Belt Area 1",
      "Asteroid Belt Area 2",
      "Asteroid Belt Area 3",
      "Asteroid Belt Area 4",
      "Scipios",
    ],
  };

  const getFleetsAtWorldWrapper = (worldName) => {
    // No system filtering - show fleets from all systems
    // This allows seeing fleets on Sol worlds even when viewing Corelli and vice versa
    return getFleetsAtWorld(systemData, worldName);
  };
  const canZoomInForWorld = (worldName) => {
    if (refereeMode?.isReferee) return true;
    const fleets = getFleetsAtWorldWrapper(worldName);
    const active = fleets.filter(
      (f) =>
        f.factionName.toLowerCase() === currentFaction.toLowerCase() &&
        ["Defense", "Patrol", "Battle", "Activating"].includes(f.State?.Action)
    );
    return active.length > 0;
  };

  const handleBodyClick = (body) => {
    if (
      focusedBody === body &&
      body.name !== "Sun" &&
      body.name !== "Corelli Star"
    ) {
      setZoomedWorld(body.name);
      // Ensure fleet modal is closed initially; user clicks fleet icon to open
      setShowFleetModal(false);
    } else {
      if (
        body.name !== "Sun" &&
        body.name !== "Corelli Star" &&
        !canZoomInForWorld(body.name)
      ) {
        setWarningMessage("Insufficient intelligence.");
        setWarningOpacity(1);
        setTimeout(() => {
          setWarningOpacity(0);
          setWarningMessage(null);
        }, 1800);
        focusOnBody(body); // Still focus to see fleet icons
        return;
      }
      focusOnBody(body);
    }
  };

  const toggleFactionCollapse = (f, w) => {
    const k = `${f}-${w}`;
    const s = new Set(collapsedFactions);
    if (s.has(k)) s.delete(k);
    else s.add(k);
    setCollapsedFactions(s);
  };

  const focusOnBody = (body) => {
    if (body.name === "Sun" || body.name === "Corelli Star") returnToOverview();
    else {
      setFocusedBody(body);
      targetCameraRef.current = {
        x: body.currentX,
        y: body.currentY,
        zoom: body.children && body.children.length > 0 ? 8 : 12,
      };
    }
  };

  const returnToOverview = () => {
    // Determine target system based on focus
    let target = "Sol";
    if (focusedBody) {
      const isInCorelli = (b, root) => {
        if (b === root) return true;
        if (root.children)
          for (let c of root.children) {
            if (c === b || (c.children && isInCorelli(b, c))) return true;
          }
        return false;
      };
      if (isInCorelli(focusedBody, solarSystemsRef.current.Corelli))
        target = "Corelli";
    }
    setFocusedBody(null);
    fleetPositionsRef.current = [];
    const pos = systemPositions.current[target];
    targetCameraRef.current = { x: pos.x, y: pos.y, zoom: 0.8 };
    setCurrentSystemView(target);
  };

  // ... [Keep Controls logic: handleMouseDown, handleMouseMove, Mobile handlers, etc.] ...
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || "ontouchstart" in window);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  const handleMouseDown = (e) => {
    if (focusedBody) return;
    if (e.button === 2 || e.shiftKey) {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      e.preventDefault();
    }
  };
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const localX = e.clientX - rect.left;
      const localY = e.clientY - rect.top;
      let found = null,
        bestDist = Infinity;

      // Use screen-space distances for robust hover across zoom and systems
      const check = (b) => {
        if (!b || !Number.isFinite(b.currentX) || !Number.isFinite(b.currentY))
          return;
        const sp = worldToScreen(
          b.currentX,
          b.currentY,
          canvas,
          cameraRef.current
        );
        const dx = localX - sp.x;
        const dy = localY - sp.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        const rad = Math.max(12, 14); // pixel radius tolerance
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
    if (focusedBody || !isDragging) return;
    const dx = (e.clientX - dragStart.x) / cameraRef.current.zoom;
    const dy = (e.clientY - dragStart.y) / cameraRef.current.zoom;
    targetCameraRef.current = {
      ...targetCameraRef.current,
      x: targetCameraRef.current.x - dx,
      y: targetCameraRef.current.y - dy,
    };
    setDragStart({ x: e.clientX, y: e.clientY });
  };
  const handleMouseUp = () => setIsDragging(false);

  // Mobile Handlers
  const handleZoomIn = () => {
    targetCameraRef.current = {
      ...targetCameraRef.current,
      zoom: Math.min(10, targetCameraRef.current.zoom * 1.12),
    };
  };
  const handleZoomOut = () => {
    targetCameraRef.current = {
      ...targetCameraRef.current,
      zoom: Math.max(0.3, targetCameraRef.current.zoom * 0.92),
    };
  };
  const handlePanUp = () => {
    targetCameraRef.current.y -= 60 / cameraRef.current.zoom;
  };
  const handlePanDown = () => {
    targetCameraRef.current.y += 60 / cameraRef.current.zoom;
  };
  const handlePanLeft = () => {
    targetCameraRef.current.x -= 60 / cameraRef.current.zoom;
  };
  const handlePanRight = () => {
    targetCameraRef.current.x += 60 / cameraRef.current.zoom;
  };
  const handleBack = () => returnToOverview();

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
      <ActionButtons onClose={onClose} />
      <WorldDetailModal
        zoomedWorld={zoomedWorld}
        setZoomedWorld={setZoomedWorld}
        allFactions={allFactions}
        getFactionColor={getFactionColor}
      />
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
      {isMobile && (
        <MobileControls
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onPanUp={handlePanUp}
          onPanDown={handlePanDown}
          onPanLeft={handlePanLeft}
          onPanRight={handlePanRight}
        />
      )}
    </div>
  );
};

export default AnimatedSolarSystem;
