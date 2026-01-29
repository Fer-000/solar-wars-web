import React, { useRef, useEffect, useState } from "react";
import {
  drawStars,
  drawSpaceIcon,
  drawGroundIcon,
} from "./AnimatedSolarSystem/drawUtils";
import { lerpCamera, screenToWorld } from "./AnimatedSolarSystem/camera";
import { useSpaceBattle } from "../hooks/UseSpaceBattle";

const WallpaperFight = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  // Camera State
  const cameraRef = useRef({ x: 0, y: 0, zoom: 1.5 });
  const targetCameraRef = useRef({ x: 0, y: 0, zoom: 1.5 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // Time - start high to trigger battle immediately
  const timeRef = useRef(10000);

  // Player control - store reference to specific ship being controlled
  const [controlledShip, setControlledShip] = useState(null); // stores { ship, zone }
  const keysPressed = useRef({});
  const playerShipRef = useRef({ x: 0, y: 0, angle: 0 });
  const playerProjectiles = useRef([]);

  // UI State
  const [stars, setStars] = useState([]);

  // Fleet colors
  const factionColors = {
    Red: "#ff3333",
    Blue: "#3366ff",
  };

  const getFactionColor = (factionName) => {
    return factionColors[factionName] || "#fff";
  };

  // Battle hook with hideVSButton enabled
  const { updateBattle, drawBattle, getActiveSkirmishes } = useSpaceBattle(
    getFactionColor,
    {
      hideVSButton: true,
      level: "total",
    },
  );

  // Mock fleets for eternal combat - positioned closer together
  const fleetsRef = useRef([
    {
      fleet: {
        ID: "fleet-red-1",
        factionName: "Red",
        Type: "Space",
        State: { Action: "Battle", Location: "arena" },
      },
      x: -25,
      y: 0,
    },
    {
      fleet: {
        ID: "fleet-blue-1",
        factionName: "Blue",
        Type: "Space",
        State: { Action: "Battle", Location: "arena" },
      },
      x: 25,
      y: 0,
    },
  ]);

  // Initialize Stars
  useEffect(() => {
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
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      keysPressed.current[key] = true;

      if (key === " " && controlledShip) {
        e.preventDefault();
      }
    };

    const handleKeyUp = (e) => {
      keysPressed.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [controlledShip]);

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
      const minZoom = 0.5;
      const maxZoom = 5;
      targetCameraRef.current.zoom = Math.max(
        minZoom,
        Math.min(maxZoom, targetCameraRef.current.zoom * zoomFactor),
      );
    };
    canvas.addEventListener("wheel", wheelHandler, { passive: false });

    const update = () => {
      timeRef.current += 1;

      // Camera Lerp
      cameraRef.current = lerpCamera(
        cameraRef.current,
        targetCameraRef.current,
        0.1,
      );

      // Player control logic
      if (controlledShip) {
        const speed = 2.0;
        const rotSpeed = 0.12;

        // W moves forward in the direction the ship is pointing (up)
        if (keysPressed.current["w"]) {
          playerShipRef.current.x +=
            Math.cos(playerShipRef.current.angle) * speed;
          playerShipRef.current.y +=
            Math.sin(playerShipRef.current.angle) * speed;
        }
        if (keysPressed.current["s"]) {
          playerShipRef.current.x -=
            Math.cos(playerShipRef.current.angle) * speed;
          playerShipRef.current.y -=
            Math.sin(playerShipRef.current.angle) * speed;
        }
        if (keysPressed.current["a"]) {
          playerShipRef.current.angle -= rotSpeed;
        }
        if (keysPressed.current["d"]) {
          playerShipRef.current.angle += rotSpeed;
        }

        // Fire weapons with spacebar
        if (keysPressed.current[" "]) {
          // Fire salvo every 20 frames
          if (timeRef.current % 20 === 0) {
            // Find enemy ship (any ship not the controlled one)
            const skirmishes = getActiveSkirmishes();
            let enemyShip = null;
            for (const zone of skirmishes) {
              if (zone.attacker !== controlledShip.ship) {
                enemyShip = zone.attacker;
                break;
              }
              if (zone.defender !== controlledShip.ship) {
                enemyShip = zone.defender;
                break;
              }
            }

            if (enemyShip) {
              // Fire 3 torpedoes
              for (let i = 0; i < 3; i++) {
                const spread = (Math.random() - 0.5) * 5;
                const angle =
                  Math.atan2(
                    enemyShip.currentY - playerShipRef.current.y,
                    enemyShip.currentX - playerShipRef.current.x,
                  ) +
                  spread * 0.1;

                playerProjectiles.current.push({
                  type: "TORPEDO",
                  x: playerShipRef.current.x,
                  y: playerShipRef.current.y,
                  angle: angle,
                  speed: 2,
                  life: 150,
                  color: getFactionColor(controlledShip.ship.factionName),
                  targetX: enemyShip.currentX,
                  targetY: enemyShip.currentY,
                });
              }
            }
          }
        }

        // Update ONLY the controlled ship's position in battle zone
        controlledShip.ship.currentX = playerShipRef.current.x;
        controlledShip.ship.currentY = playerShipRef.current.y;
        controlledShip.ship.angle = playerShipRef.current.angle;
      }

      // Update player projectiles
      playerProjectiles.current.forEach((p) => {
        p.speed *= 1.05;
        const desiredAngle = Math.atan2(p.targetY - p.y, p.targetX - p.x);
        let diff = desiredAngle - p.angle;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        p.angle += diff * 0.1;
        p.x += Math.cos(p.angle) * p.speed;
        p.y += Math.sin(p.angle) * p.speed;
        p.life--;
      });
      playerProjectiles.current = playerProjectiles.current.filter(
        (p) => p.life > 0,
      );

      // Update battle
      updateBattle(fleetsRef.current, timeRef.current, true, 15, 0, 0);

      draw();
      animationRef.current = requestAnimationFrame(update);
    };

    const draw = () => {
      ctx.fillStyle = "#050505";
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.scale(cameraRef.current.zoom, cameraRef.current.zoom);
      ctx.translate(-cameraRef.current.x, -cameraRef.current.y);

      drawStars(ctx, stars, cameraRef.current.zoom);
      drawBattle(ctx, cameraRef.current.zoom);

      // Draw player projectiles
      ctx.globalCompositeOperation = "lighter";
      playerProjectiles.current.forEach((p) => {
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
        ctx.globalAlpha = 1;
      });
      ctx.globalCompositeOperation = "source-over";

      ctx.restore();
    };

    update();
    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("wheel", wheelHandler);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [stars, updateBattle, drawBattle, controlledShip, getActiveSkirmishes]);

  // Interaction Handlers
  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { x, y } = screenToWorld(
      e.clientX,
      e.clientY,
      canvas,
      cameraRef.current,
    );

    // Check if clicked on a ship in battle
    const skirmishes = getActiveSkirmishes();
    for (const zone of skirmishes) {
      const ships = [zone.attacker, zone.defender];

      for (const ship of ships) {
        const dx = x - ship.currentX;
        const dy = y - ship.currentY;
        const dist = Math.hypot(dx, dy);

        if (dist < 15) {
          if (controlledShip && controlledShip.ship === ship) {
            // Release control
            setControlledShip(null);
          } else {
            // Take control of this specific ship
            setControlledShip({ ship, zone });
            playerShipRef.current = {
              x: ship.currentX,
              y: ship.currentY,
              angle: ship.angle,
            };
          }
          return;
        }
      }
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging.current && !controlledShip) {
      const dx = (e.clientX - dragStart.current.x) / cameraRef.current.zoom;
      const dy = (e.clientY - dragStart.current.y) / cameraRef.current.zoom;
      targetCameraRef.current.x -= dx;
      targetCameraRef.current.y -= dy;
      dragStart.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseDown = (e) => {
    if (controlledShip) return;
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
          cursor: controlledShip
            ? "crosshair"
            : isDragging.current
              ? "grabbing"
              : "grab",
        }}
      />
    </div>
  );
};

export default WallpaperFight;
