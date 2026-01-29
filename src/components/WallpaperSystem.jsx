import React, { useRef, useEffect, useState } from "react";
import { createSolarSystemHierarchy } from "../data/SolarSystemConfig";
import { getSolarDate } from "../utils/dateUtils";
import {
  updateBodyPositions,
  renderSystemTree,
} from "./AnimatedSolarSystem/SolarSystemRenderer";
import { drawStars } from "./AnimatedSolarSystem/drawUtils";
import { lerpCamera, screenToWorld } from "./AnimatedSolarSystem/camera";

const drawAsteroidBelt = (ctx, centerX, centerY, beltRadius, currentTime) => {
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

    const angle = (i / totalAsteroids) * Math.PI * 2 + r1 * 0.1 + beltOffset;
    const distOffset = ((r2 + r3) / 2) * (beltWidth / 2);
    const radius = beltRadius + distOffset;

    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    const isChunk = Math.abs(r4) > 0.85;
    const size = isChunk ? 1.5 + Math.abs(r1) * 1.5 : 0.5 + Math.abs(r2) * 0.5;
    const baseGrey = 100 + Math.floor(Math.abs(r1) * 60);
    const redTint = Math.floor(Math.abs(r2) * 20);
    const alpha = isChunk ? 0.9 : 0.3 + Math.abs(r3) * 0.3;

    ctx.fillStyle = `rgba(${baseGrey + redTint}, ${baseGrey}, ${
      baseGrey - 5
    }, ${alpha})`;

    if (isChunk) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(r1 * Math.PI * 2);
      ctx.fillRect(-size / 2, -size / 2, size, size);
      ctx.restore();
    } else {
      ctx.fillRect(x - size / 2, y - size / 2, size, size);
    }
  }

  ctx.restore();
};

const WallpaperSystem = () => {
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
  const systemPositions = useRef({
    Sol: { x: 0, y: 0 },
    Corelli: {
      x: 4200 * Math.cos(Math.PI / 6),
      y: 4200 * Math.sin(Math.PI / 6),
    },
  });

  // UI State
  const [focusedBody, setFocusedBody] = useState(null);
  const [stars, setStars] = useState([]);
  const [planetImages, setPlanetImages] = useState({});

  // Initialize Systems
  if (!solarSystemsRef.current) {
    solarSystemsRef.current = {
      Sol: createSolarSystemHierarchy("Sol"),
      Corelli: createSolarSystemHierarchy("Corelli"),
    };
  }

  // Initialize Date/Time Offset & Stars
  useEffect(() => {
    const alignment1982GameYear = 0;
    const [currentGameYear, currentGameMonth, currentGameDay] = getSolarDate();
    const gameYearsElapsed = currentGameYear - alignment1982GameYear;
    const isLeapYear =
      currentGameYear % 4 === 0 &&
      (currentGameYear % 100 !== 0 || currentGameYear % 400 === 0);
    const daysInYear = isLeapYear ? 366 : 365;
    const monthDays = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
    const dayOfYear = monthDays[currentGameMonth - 1] + currentGameDay;
    const yearProgress = dayOfYear / daysInYear;
    const totalGameYears = gameYearsElapsed + yearProgress;
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
  }, []);

  // Animation Loop
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
      timeRef.current += 0.0008; // timeScale
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

      // Update Physics
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

      draw(currentTime);
      animationRef.current = requestAnimationFrame(update);
    };

    const draw = () => {
      // Clear
      ctx.fillStyle = "#050505";
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.scale(cameraRef.current.zoom, cameraRef.current.zoom);
      ctx.translate(-cameraRef.current.x, -cameraRef.current.y);

      // Draw Background
      drawStars(ctx, stars, cameraRef.current.zoom);

      // Render Options Bundle (minimal - no fleets, UI, etc.)
      const renderOptions = {
        focusedBody,
        hoveredBody: null,
        planetImages,
        zoom: cameraRef.current.zoom,
        systemData: {},
        currentFaction: "",
        refereeMode: {},
        collapsedFactions: new Set(),
        getFactionColor: () => "#fff",
        fleetPositions: [],
        activeSkirmishes: [],
        faintOrbitLines: true, // More faint orbit lines for wallpaper mode
      };

      // Draw Asteroid Belts (only when not focused or focused on star)
      if (
        !focusedBody ||
        focusedBody.name === "Sun" ||
        focusedBody.name === "Corelli Star"
      ) {
        drawAsteroidBelt(
          ctx,
          systemPositions.current.Sol.x,
          systemPositions.current.Sol.y,
          200,
          timeRef.current + initialTimeOffset.current,
        );
        drawAsteroidBelt(
          ctx,
          systemPositions.current.Corelli.x,
          systemPositions.current.Corelli.y,
          170,
          timeRef.current + initialTimeOffset.current,
        );
      }

      // RENDER TREES
      renderSystemTree(ctx, solarSystemsRef.current.Sol, renderOptions);
      renderSystemTree(ctx, solarSystemsRef.current.Corelli, renderOptions);

      ctx.restore();
    };

    update();
    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("wheel", wheelHandler);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [stars, focusedBody, planetImages]);

  // Interaction Handlers
  const handleCanvasClick = (e) => {
    const { x, y } = screenToWorld(
      e.clientX,
      e.clientY,
      canvasRef.current,
      cameraRef.current,
    );

    const checkList = (list) => {
      for (let body of list) {
        if (
          focusedBody &&
          body !== focusedBody &&
          !isDescendantOf(body, focusedBody)
        ) {
          if (body.children) {
            const c = checkList(body.children);
            if (c) return c;
          }
          continue;
        }

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

    const isDescendantOf = (body, ancestor) => {
      if (!ancestor) return true;
      let current = body;
      while (current) {
        if (current === ancestor) return true;
        current = current.parent;
      }
      return false;
    };

    let clickedBody = null;

    // Check Suns first
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

    if (!clickedBody) {
      clickedBody = checkList(solarSystemsRef.current.Sol.children);
      if (!clickedBody)
        clickedBody = checkList(solarSystemsRef.current.Corelli.children);
    }

    // Handle Body Selection (focus only, no modal/hex editor)
    if (clickedBody) {
      if (clickedBody.name === "Sun" || clickedBody.name === "Corelli Star") {
        // Click on star = unfocus
        setFocusedBody(null);
        const sys = clickedBody.name === "Sun" ? "Sol" : "Corelli";
        const pos = systemPositions.current[sys];
        targetCameraRef.current = { x: pos.x, y: pos.y, zoom: 0.8 };
      } else {
        // Focus on body
        setFocusedBody(clickedBody);
        targetCameraRef.current = {
          x: clickedBody.currentX,
          y: clickedBody.currentY,
          zoom:
            clickedBody.children && clickedBody.children.length > 0 ? 8 : 12,
        };
      }
    } else if (focusedBody) {
      // Clicked void - go up one level or reset
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
        const findRootSystem = (body) => {
          if (!body) return "Sol";
          if (body.name === "Sun") return "Sol";
          if (body.name === "Corelli Star") return "Corelli";
          if (body.parent) return findRootSystem(body.parent);
          return "Sol";
        };
        const targetSystem = findRootSystem(focusedBody);
        const pos = systemPositions.current[targetSystem];
        targetCameraRef.current = { x: pos.x, y: pos.y, zoom: 0.8 };
      }
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging.current && !focusedBody) {
      const dx = (e.clientX - dragStart.current.x) / cameraRef.current.zoom;
      const dy = (e.clientY - dragStart.current.y) / cameraRef.current.zoom;
      targetCameraRef.current.x -= dx;
      targetCameraRef.current.y -= dy;
      dragStart.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseDown = (e) => {
    if (focusedBody) return;
    if (e.button === 2 || e.shiftKey || e.button === 0) {
      isDragging.current = true;
      dragStart.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        background: "#050505",
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
    </div>
  );
};

export default WallpaperSystem;
