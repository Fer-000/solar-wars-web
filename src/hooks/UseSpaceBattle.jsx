import { useRef } from "react";
import {
  drawSpaceIcon,
  drawGroundIcon,
} from "../components/AnimatedSolarSystem/drawUtils";

export const useSpaceBattle = (getFactionColor, animationSettings) => {
  const battleZonesRef = useRef({});
  const lastSpawnTimeRef = useRef(0);

  // --- INTERNAL: SPAWN UTILS ---
  const spawnExplosion = (zone, x, y, scale = 1) => {
    zone.particles.push({
      type: "EXPLOSION",
      x,
      y,
      life: 15,
      size: 2 * scale,
      color: "#FFA500",
    });
    for (let i = 0; i < 3; i++) {
      zone.particles.push({
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

  const spawnSalvo = (zone, source, target) => {
    const count = 3 + Math.floor(Math.random() * 3);
    const groupMiss = Math.random() > 0.5;
    for (let i = 0; i < count; i++) {
      spawnProjectile(zone, source, target, "TORPEDO", groupMiss);
    }
  };

  const spawnProjectile = (
    zone,
    source,
    target,
    type = "TORPEDO",
    forceMiss = null
  ) => {
    const isMiss = forceMiss !== null ? forceMiss : Math.random() > 0.6;
    const color = getFactionColor
      ? getFactionColor(source.factionName)
      : "#fff";

    let staticDestX = target.currentX;
    let staticDestY = target.currentY;

    if (isMiss) {
      staticDestX += (Math.random() - 0.5) * 80;
      staticDestY += (Math.random() - 0.5) * 80;
    }

    if (type === "TORPEDO") {
      const spreadX = (Math.random() - 0.5) * 2;
      const spreadY = (Math.random() - 0.5) * 2;
      const startX = source.currentX + spreadX;
      const startY = source.currentY + spreadY;
      const angle = Math.atan2(staticDestY - startY, staticDestX - startX);

      zone.projectiles.push({
        type: "TORPEDO",
        x: startX,
        y: startY,
        missDest: { x: staticDestX, y: staticDestY },
        angle: angle,
        speed: 1.5,
        life: 150,
        color: color,
        isMiss: isMiss,
      });
    } else {
      zone.projectiles.push({
        type: "LASER",
        sourceX: source.currentX,
        sourceY: source.currentY,
        targetX: staticDestX,
        targetY: staticDestY,
        life: 8,
        color: color,
        isMiss: isMiss,
      });
      if (!isMiss) spawnExplosion(zone, staticDestX, staticDestY, 0.8);
    }
  };

  // --- MAIN UPDATE LOOP ---
  const updateBattle = (
    fleetsOnScreen,
    time,
    isFocused,
    focusedBodyRadius = 20,
    focusedBodyX = 0,
    focusedBodyY = 0
  ) => {
    // Don't update battles when not focused on a body
    if (!isFocused) {
      return;
    }

    // Check animation level - only run battles on "total" animation level
    if (animationSettings?.level !== "total") {
      return;
    }

    const battleFleets = fleetsOnScreen.filter(
      (f) => f.fleet.State?.Action === "Battle"
    );
    const battleFleetIds = new Set(battleFleets.map((b) => b.fleet.ID));

    // Group by faction
    const factionGroups = {};
    battleFleets.forEach((f) => {
      const name = f.fleet.factionName;
      if (!factionGroups[name]) factionGroups[name] = [];
      factionGroups[name].push({
        fleet: f.fleet,
        originalPos: { x: f.x, y: f.y },
      });
    });

    const factions = Object.keys(factionGroups);
    // Don't create battles if less than 2 factions
    if (factions.length < 2) {
      return;
    }

    // Spawn new skirmishes if needed
    const timeSinceLast = time - lastSpawnTimeRef.current;
    const isQuiet = Object.keys(battleZonesRef.current).length === 0;
    const cooldown = isQuiet
      ? 1500 + Math.random() * 1500
      : 100 + Math.random() * 200;

    if (
      Object.keys(battleZonesRef.current).length < 3 &&
      timeSinceLast > cooldown
    ) {
      // pick two distinct factions at random and spawn one skirmish
      const keys = Object.keys(factionGroups);
      if (keys.length >= 2) {
        const f1 = keys[Math.floor(Math.random() * keys.length)];
        let f2 = f1;
        while (f2 === f1) f2 = keys[Math.floor(Math.random() * keys.length)];

        const key = `${f1}_${f2}_${Date.now()}`;
        if (!battleZonesRef.current[key]) {
          const attacker =
            factionGroups[f1][
              Math.floor(Math.random() * factionGroups[f1].length)
            ];
          const defender =
            factionGroups[f2][
              Math.floor(Math.random() * factionGroups[f2].length)
            ];

          // Position battle closer to planet
          const angle = Math.random() * Math.PI * 2;
          const distance = focusedBodyRadius + 25;
          const midX = Math.cos(angle) * distance + (Math.random() - 0.5) * 30;
          const midY = Math.sin(angle) * distance + (Math.random() - 0.5) * 30;
          const axisRotation = Math.random() * Math.PI * 2;

          const tactics = ["FIGURE8", "ORBIT", "DIVING_OVAL", "SINE_WAVE"];
          const t1 = tactics[Math.floor(Math.random() * tactics.length)];
          let t2 = t1;
          while (t2 === t1)
            t2 = tactics[Math.floor(Math.random() * tactics.length)];

          const startPhase = Math.random() < 0.3 ? "HEADON" : "APPROACH";

          // Convert world coords to local coords (relative to focused body)
          const attackerLocalX = attacker.originalPos.x - focusedBodyX;
          const attackerLocalY = attacker.originalPos.y - focusedBodyY;
          const defenderLocalX = defender.originalPos.x - focusedBodyX;
          const defenderLocalY = defender.originalPos.y - focusedBodyY;

          battleZonesRef.current[key] = {
            key,
            phase: startPhase,
            timer: 0,
            duration: 400 + Math.random() * 200,
            center: { x: midX, y: midY },
            axisRotation,
            attacker: {
              ...attacker,
              factionName: f1,
              // Store original positions in local coords for RETURN phase
              originalLocalX: attackerLocalX,
              originalLocalY: attackerLocalY,
              currentX: attackerLocalX,
              currentY: attackerLocalY,
              angle: 0,
              tactic: t1,
              phaseOffset: 0,
            },
            defender: {
              ...defender,
              factionName: f2,
              originalLocalX: defenderLocalX,
              originalLocalY: defenderLocalY,
              currentX: defenderLocalX,
              currentY: defenderLocalY,
              angle: Math.PI,
              tactic: t2,
              phaseOffset: Math.PI,
            },
            projectiles: [],
            particles: [],
          };
          lastSpawnTimeRef.current = time;
        }
      }
    }

    // Execute movement for each zone
    Object.values(battleZonesRef.current).forEach((zone) => {
      zone.timer++;

      const toArena = (x, y) => {
        const cos = Math.cos(zone.axisRotation);
        const sin = Math.sin(zone.axisRotation);
        return {
          x: zone.center.x + (x * cos - y * sin),
          y: zone.center.y + (x * sin + y * cos),
        };
      };

      // PHASE 1: HEAD ON
      if (zone.phase === "HEADON") {
        const progress = zone.timer / 120;
        const spread = 50 * (1 - progress); // Reduced from 70
        const swerve = progress > 0.7 ? (progress - 0.7) * 60 : 0; // Reduced from 80

        const pA = toArena(-spread, swerve);
        const pD = toArena(spread, -swerve);

        const ease = 0.1;
        zone.attacker.currentX += (pA.x - zone.attacker.currentX) * ease;
        zone.attacker.currentY += (pA.y - zone.attacker.currentY) * ease;
        zone.defender.currentX += (pD.x - zone.defender.currentX) * ease;
        zone.defender.currentY += (pD.y - zone.defender.currentY) * ease;

        zone.attacker.angle = Math.atan2(
          pA.y - zone.attacker.currentY,
          pA.x - zone.attacker.currentX
        );
        zone.defender.angle = Math.atan2(
          pD.y - zone.defender.currentY,
          pD.x - zone.defender.currentX
        );

        if (progress > 0.3 && progress < 0.7 && Math.random() < 0.2) {
          spawnProjectile(zone, zone.attacker, zone.defender, "LASER");
          spawnProjectile(zone, zone.defender, zone.attacker, "LASER");
        }

        if (progress >= 1) {
          zone.phase = "FIGHT";
          zone.timer = 0;
        }
      }
      // PHASE 2: APPROACH
      else if (zone.phase === "APPROACH") {
        const pA = toArena(-30, 0); // Reduced from -40
        const pD = toArena(30, 0); // Reduced from 40

        const ease = 0.05;
        zone.attacker.currentX += (pA.x - zone.attacker.currentX) * ease;
        zone.attacker.currentY += (pA.y - zone.attacker.currentY) * ease;
        zone.defender.currentX += (pD.x - zone.defender.currentX) * ease;
        zone.defender.currentY += (pD.y - zone.defender.currentY) * ease;

        zone.attacker.angle = Math.atan2(
          zone.defender.currentY - zone.attacker.currentY,
          zone.defender.currentX - zone.attacker.currentX
        );
        zone.defender.angle = Math.atan2(
          zone.attacker.currentY - zone.defender.currentY,
          zone.attacker.currentX - zone.defender.currentX
        );

        const dist = Math.sqrt(
          Math.pow(zone.attacker.currentX - pA.x, 2) +
            Math.pow(zone.attacker.currentY - pA.y, 2)
        );
        if (dist < 10) zone.phase = "FIGHT";
      }
      // PHASE 3: FIGHT
      else if (zone.phase === "FIGHT") {
        [zone.attacker, zone.defender].forEach((ship) => {
          const t = zone.timer * 0.03 + ship.phaseOffset;
          let tx = 0,
            ty = 0;

          // Reduced all radii for tighter combat
          if (ship.tactic === "FIGURE8") {
            tx = Math.cos(t) * 30; // was 45
            ty = Math.sin(2 * t) * 15; // was 20
          } else if (ship.tactic === "ORBIT") {
            tx = Math.cos(t) * 25; // was 35
            ty = Math.sin(t) * 25;
          } else if (ship.tactic === "DIVING_OVAL") {
            tx = Math.cos(t) * 30; // was 40
            ty = Math.sin(t) * (Math.sin(t) > 0 ? 20 : 8); // was 30:10
          } else if (ship.tactic === "SINE_WAVE") {
            tx = Math.cos(t * 0.5) * 35; // was 50
            ty = Math.sin(t * 3) * 8; // was 10
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

        // SHOOTING
        const angleToDef = Math.atan2(
          zone.defender.currentY - zone.attacker.currentY,
          zone.defender.currentX - zone.attacker.currentX
        );
        let diffA = zone.attacker.angle - angleToDef;
        while (diffA > Math.PI) diffA -= Math.PI * 2;
        while (diffA < -Math.PI) diffA += Math.PI * 2;

        if (Math.abs(diffA) < 3.0 && Math.random() < 0.08) {
          if (Math.random() < 0.2)
            spawnSalvo(zone, zone.attacker, zone.defender);
          else spawnProjectile(zone, zone.attacker, zone.defender, "LASER");
        }

        const angleToAtk = Math.atan2(
          zone.attacker.currentY - zone.defender.currentY,
          zone.attacker.currentX - zone.defender.currentX
        );
        let diffD = zone.defender.angle - angleToAtk;
        while (diffD > Math.PI) diffD -= Math.PI * 2;
        while (diffD < -Math.PI) diffD += Math.PI * 2;

        if (Math.abs(diffD) < 3.0 && Math.random() < 0.08) {
          if (Math.random() < 0.2)
            spawnSalvo(zone, zone.defender, zone.attacker);
          else spawnProjectile(zone, zone.defender, zone.attacker, "LASER");
        }

        // Battles never end - removed RETURN phase logic
        // if (zone.timer > zone.duration && !battleFleetIds.has(attackerId) && !battleFleetIds.has(defenderId)) {
        //   zone.phase = "RETURN";
        // }
      }
      // RETURN phase removed - battles never end

      // UPDATE PROJECTILES
      zone.projectiles.forEach((p) => {
        p.life--;
        if (p.type === "TORPEDO") {
          p.speed *= 1.05;
          let destX = p.isMiss ? p.missDest.x : zone.defender.currentX;
          let destY = p.isMiss ? p.missDest.y : zone.defender.currentY;

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
            if (!p.isMiss) spawnExplosion(zone, destX, destY, 3.5);
          }
        }
      });
      zone.projectiles = zone.projectiles.filter((p) => p.life > 0);

      // UPDATE PARTICLES
      zone.particles.forEach((p) => {
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
      zone.particles = zone.particles.filter((p) => p.life > 0);
    });

    // Battles never end - removed cleanup logic for finished battles
    // Clean up only happens when fleets are no longer in Battle state
    Object.keys(battleZonesRef.current).forEach((key) => {
      const z = battleZonesRef.current[key];
      const aId = z.attacker?.fleet?.ID;
      const dId = z.defender?.fleet?.ID;
      // Only remove battle zone if BOTH fleets no longer exist in battleFleetIds
      if (!battleFleetIds.has(aId) && !battleFleetIds.has(dId)) {
        delete battleZonesRef.current[key];
      }
    });
  };

  // --- INTERACTION ---
  const checkBattleZoneClick = (worldX, worldY, planetX, planetY) => {
    const localX = worldX - planetX;
    const localY = worldY - planetY;

    for (let zone of Object.values(battleZonesRef.current)) {
      const dist = Math.hypot(localX - zone.center.x, localY - zone.center.y);
      if (dist < 12) {
        // Reduced clickable radius
        return {
          factionA: {
            name: zone.attacker.factionName,
            fleets: zone.attacker.fleet ? [zone.attacker.fleet] : [],
          },
          factionB: {
            name: zone.defender.factionName,
            fleets: zone.defender.fleet ? [zone.defender.fleet] : [],
          },
        };
      }
    }
    return null;
  };

  // --- DRAW FUNCTION ---
  const drawBattle = (ctx, cameraZoom) => {
    Object.values(battleZonesRef.current).forEach((zone) => {
      ctx.save();

      ctx.save();
      ctx.translate(zone.center.x, zone.center.y);

      // 1. The Backing Plate (Crucial fix: Hides the triangles behind the button)
      // A dark, semi-transparent circle that creates contrast
      ctx.fillStyle = "rgba(0, 10, 20, 0.85)";
      ctx.beginPath();
      ctx.arc(0, 0, 9, 0, Math.PI * 2);
      ctx.fill();

      // 2. Setup Hologram Styles
      const time = Date.now();
      const holoColor = "#00f3ff"; // Cyan
      ctx.shadowColor = holoColor;
      // We lower the blur to keep it looking "sharp" rather than "foggy"
      ctx.shadowBlur = 6;

      // 3. Inner Ring (Static, thin, precise)
      ctx.strokeStyle = "rgba(0, 243, 255, 0.5)";
      ctx.lineWidth = 0.5; // Very thin line for high-tech look
      ctx.setLineDash([]); // Solid
      ctx.beginPath();
      ctx.arc(0, 0, 6.5, 0, Math.PI * 2);
      ctx.stroke();

      // 4. Rotating Outer Brackets (The dynamic part)
      ctx.save();
      ctx.rotate(time / 1500); // Slow rotation
      ctx.strokeStyle = "#fff"; // White core makes it look like intense light
      ctx.lineWidth = 1; // Thinner than before
      ctx.lineCap = "round"; // Rounded ends look more polished
      ctx.setLineDash([4, 10]); // Dashed look suggests "data stream"
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // 5. Tech Decorations (Little ticks)
      // This adds that "Iron Man HUD" complexity without bulk
      ctx.fillStyle = holoColor;
      for (let i = 0; i < 4; i++) {
        ctx.save();
        ctx.rotate((Math.PI / 2) * i);
        ctx.translate(0, -9.5); // Push to edge
        ctx.fillRect(-0.5, 0, 1, 2); // Tiny ticks
        ctx.restore();
      }

      // 6. The Text (Sharp and Clean)
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      // Use a sans-serif font for cleaner readability than monospace
      ctx.font = "bold italic 7px Arial, sans-serif";

      // Glow pass (soft cyan halo)
      ctx.shadowBlur = 8;
      ctx.fillStyle = holoColor;
      ctx.fillText("VS", 0, 0.5);

      // Sharp pass (pure white, no blur) - makes it readable
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#ffffff";
      ctx.fillText("VS", 0, 0.5);

      ctx.restore();

      // 2. Draw Ships
      ctx.globalCompositeOperation = "source-over";
      [zone.attacker, zone.defender].forEach((ship) => {
        if (!Number.isFinite(ship.currentX)) return;
        const color = getFactionColor(ship.factionName);

        ctx.save();
        ctx.translate(ship.currentX, ship.currentY);
        ctx.rotate(ship.angle + Math.PI / 2);
        const scale = 0.5;
        ctx.scale(scale, scale);
        if (ship.fleet.Type === "Space") drawSpaceIcon(ctx, color);
        else drawGroundIcon(ctx, color);
        ctx.restore();
      });

      // 3. Draw Effects (Lighter composite for glow)
      ctx.globalCompositeOperation = "lighter";

      // PROJECTILES
      zone.projectiles.forEach((p) => {
        if (p.type === "LASER") {
          ctx.shadowBlur = 4;
          ctx.shadowColor = p.color;
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 0.6;
          ctx.globalAlpha = Math.max(0, p.life / 8);
          ctx.beginPath();
          ctx.moveTo(p.sourceX, p.sourceY);
          ctx.lineTo(p.targetX, p.targetY);
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

      // PARTICLES
      zone.particles.forEach((p) => {
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
    });
  };

  const getActiveSkirmishes = () => Object.values(battleZonesRef.current);

  const clearBattles = (location = null) => {
    if (location) {
      // Clear battles for a specific location only
      Object.keys(battleZonesRef.current).forEach((key) => {
        const zone = battleZonesRef.current[key];
        // Check if either fleet in the battle is at this location
        const attackerLoc = zone.attacker?.fleet?.State?.Location;
        const defenderLoc = zone.defender?.fleet?.State?.Location;
        if (attackerLoc === location || defenderLoc === location) {
          delete battleZonesRef.current[key];
        }
      });
    } else {
      // Clear all battles
      battleZonesRef.current = {};
    }
  };

  return {
    updateBattle,
    drawBattle,
    checkBattleZoneClick,
    getActiveSkirmishes,
    clearBattles,
  };
};
