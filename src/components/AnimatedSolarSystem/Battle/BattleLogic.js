// battleLogic.js

// --- STATE CONTAINERS (Mutable for performance) ---
export const createBattleState = () => ({
  activeSkirmishes: [],
  projectiles: [],
  particles: [],
  lastSkirmishSpawnTime: 0,
});

// --- HELPERS ---
const spawnExplosion = (state, x, y, scale = 1) => {
  state.particles.push({
    type: "EXPLOSION",
    x, y,
    life: 15,
    size: 2 * scale,
    color: "#FFA500",
  });
  for (let i = 0; i < 3; i++) {
    state.particles.push({
      type: "DEBRIS",
      x, y,
      life: 30,
      size: 0.5,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      color: "#FFF",
    });
  }
};

const spawnProjectile = (state, source, target, type = "TORPEDO", forceMiss = null) => {
  const isMiss = forceMiss !== null ? forceMiss : Math.random() > 0.6;
  const color = getFactionColor ? getFactionColor(source.fleet.factionName) : "#fff";
  
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
    const startX = source.currentX + (Math.random() - 0.5) * 2;
    const startY = source.currentY + (Math.random() - 0.5) * 2;
    const angle = Math.atan2(staticDestY - startY, staticDestX - startX);

    state.projectiles.push({
      type: "TORPEDO",
      x: startX, y: startY,
      targetObj: target,
      missDest: { x: staticDestX, y: staticDestY },
      angle,
      speed: 1.5,
      life: 150,
      color,
      isMiss
    });
  } else {
    state.projectiles.push({
      type: "LASER",
      sourceObj: source,
      targetObj: target,
      missDest: { x: staticDestX, y: staticDestY },
      life: 8,
      color,
      isMiss
    });
    if (!isMiss) spawnExplosion(state, staticDestX, staticDestY, 0.8);
  }
};

const spawnSalvo = (state, source, target) => {
  const count = 3 + Math.floor(Math.random() * 3);
  for (let i = 0; i < count; i++) {
    spawnProjectile(state, source, target, "TORPEDO", Math.random() > 0.5);
  }
};

// --- MAIN UPDATE FUNCTION ---
export const updateBattleSimulation = (state, fleetsOnScreen, time, options) => {
  const { focusedBody } = options;
  if (!focusedBody) return;

  const { activeSkirmishes, projectiles, particles } = state;
  const timeSinceLast = time - state.lastSkirmishSpawnTime;

  // 1. SPAWN NEW SKIRMISHES
  const isQuiet = activeSkirmishes.length === 0;
  const cooldown = isQuiet ? Math.random() * 1500 + 1500 : Math.random() * 200 + 100;

  if (activeSkirmishes.length < 5 && timeSinceLast > cooldown) {
    // Identify busy fleets
    const busyIds = new Set(activeSkirmishes.flatMap(s => [s.attacker.fleet.ID, s.defender.fleet.ID]));
    
    // Find free fleets in "Battle" state
    const available = fleetsOnScreen.filter(f => !busyIds.has(f.fleet.ID) && f.fleet.State?.Action === "Battle");
    
    // Group by faction
    const factions = {};
    available.forEach(f => {
      if (!factions[f.fleet.factionName]) factions[f.fleet.factionName] = [];
      factions[f.fleet.factionName].push(f);
    });

    const factionNames = Object.keys(factions);

    if (factionNames.length >= 2) {
      // Pick two different factions
      const f1 = factionNames[Math.floor(Math.random() * factionNames.length)];
      const f2 = factionNames.filter(n => n !== f1)[Math.floor(Math.random() * (factionNames.length - 1))];

      const attacker = factions[f1][Math.floor(Math.random() * factions[f1].length)];
      const defender = factions[f2][Math.floor(Math.random() * factions[f2].length)];

      // Pick tactics
      const tactics = ["FIGURE8", "ORBIT", "DIVING_OVAL", "SINE_WAVE"];
      const t1 = tactics[Math.floor(Math.random() * tactics.length)];
      let t2 = t1;
      while (t2 === t1) t2 = tactics[Math.floor(Math.random() * tactics.length)];

      state.activeSkirmishes.push({
        id: Date.now(),
        phase: Math.random() < 0.3 ? "HEADON" : "APPROACH",
        timer: 0,
        duration: 400 + Math.random() * 200,
        center: { x: (attacker.x + defender.x)/2, y: (attacker.y + defender.y)/2 },
        axisRotation: Math.random() * Math.PI * 2,
        attacker: { ...attacker, currentX: attacker.x, currentY: attacker.y, angle: 0, tactic: t1, phaseOffset: 0 },
        defender: { ...defender, currentX: defender.x, currentY: defender.y, angle: Math.PI, tactic: t2, phaseOffset: Math.PI }
      });
      state.lastSkirmishSpawnTime = time;
    }
  }

  // 2. UPDATE SKIRMISHES (Movement Physics)
  state.activeSkirmishes.forEach(skirmish => {
    const { attacker, defender, center, axisRotation } = skirmish;
    skirmish.timer++;
    
    // Helper: Local Arena to World Coordinates
    const toArena = (x, y) => {
        const cos = Math.cos(axisRotation);
        const sin = Math.sin(axisRotation);
        return { x: center.x + (x * cos - y * sin), y: center.y + (x * sin + y * cos) };
    };

    // --- PHASE LOGIC (Simplified from your original for brevity, but retaining flow) ---
    if (skirmish.phase === "HEADON" || skirmish.phase === "APPROACH") {
        // Move ships towards arena center
        const pA = toArena(-40, 0);
        const pD = toArena(40, 0);
        const ease = 0.05;
        
        attacker.currentX += (pA.x - attacker.currentX) * ease;
        attacker.currentY += (pA.y - attacker.currentY) * ease;
        defender.currentX += (pD.x - defender.currentX) * ease;
        defender.currentY += (pD.y - defender.currentY) * ease;
        
        // Orient ships
        attacker.angle = Math.atan2(defender.currentY - attacker.currentY, defender.currentX - attacker.currentX);
        defender.angle = Math.atan2(attacker.currentY - defender.currentY, attacker.currentX - defender.currentX);

        if (skirmish.timer > 100 || (Math.abs(attacker.currentX - pA.x) < 5)) {
            skirmish.phase = "FIGHT";
            skirmish.timer = 0;
        }
    } 
    else if (skirmish.phase === "FIGHT") {
        // Apply Tactics (Figure8, Orbit, etc)
        [attacker, defender].forEach(ship => {
            const t = skirmish.timer * 0.03 + ship.phaseOffset;
            let tx = 0, ty = 0;
            if (ship.tactic === "FIGURE8") { tx = Math.cos(t)*45; ty = Math.sin(2*t)*20; }
            else if (ship.tactic === "ORBIT") { tx = Math.cos(t)*35; ty = Math.sin(t)*35; }
            else if (ship.tactic === "DIVING_OVAL") { tx = Math.cos(t)*40; ty = Math.sin(t)*(Math.sin(t)>0?30:10); }
            else { tx = Math.cos(t*0.5)*50; ty = Math.sin(t*3)*10; } // Sine Wave

            const dest = toArena(tx, ty);
            ship.currentX += (dest.x - ship.currentX) * 0.08;
            ship.currentY += (dest.y - ship.currentY) * 0.08;
            
            // Smooth rotation
            const moveAngle = Math.atan2(dest.y - ship.currentY, dest.x - ship.currentX);
            let d = moveAngle - ship.angle;
            while (d > Math.PI) d -= Math.PI * 2;
            while (d < -Math.PI) d += Math.PI * 2;
            ship.angle += d * 0.15;
        });

        // SHOOTING
        if (Math.random() < 0.08) {
             if (Math.random() < 0.2) spawnSalvo(state, attacker, defender);
             else spawnProjectile(state, attacker, defender, "LASER");
        }
        if (Math.random() < 0.08) {
             if (Math.random() < 0.2) spawnSalvo(state, defender, attacker);
             else spawnProjectile(state, defender, attacker, "LASER");
        }

        if (skirmish.timer > skirmish.duration) skirmish.phase = "RETURN";
    }
    else if (skirmish.phase === "RETURN") {
        const ease = 0.04;
        attacker.currentX += (attacker.x - attacker.currentX) * ease;
        attacker.currentY += (attacker.y - attacker.currentY) * ease;
        defender.currentX += (defender.x - defender.currentX) * ease;
        defender.currentY += (defender.y - defender.currentY) * ease;

        if (Math.abs(attacker.currentX - attacker.x) < 3) skirmish.finished = true;
    }
  });

  // Cleanup Finished Skirmishes
  state.activeSkirmishes = state.activeSkirmishes.filter(s => !s.finished);

  // 3. UPDATE PROJECTILES
  state.projectiles.forEach(p => {
    p.life--;
    if (p.type === "TORPEDO") {
      p.speed *= 1.05;
      let destX = p.isMiss ? p.missDest.x : p.targetObj.currentX;
      let destY = p.isMiss ? p.missDest.y : p.targetObj.currentY;
      
      const desiredAngle = Math.atan2(destY - p.y, destX - p.x);
      let diff = desiredAngle - p.angle;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      p.angle += diff * 0.1;

      p.x += Math.cos(p.angle) * p.speed;
      p.y += Math.sin(p.angle) * p.speed;

      if (Math.sqrt(Math.pow(p.x - destX, 2) + Math.pow(p.y - destY, 2)) < 10) {
        p.life = 0;
        if (!p.isMiss) spawnExplosion(state, destX, destY, 3.5);
      }
    }
  });
  state.projectiles = state.projectiles.filter(p => p.life > 0);

  // 4. UPDATE PARTICLES
  state.particles.forEach(p => {
    p.life--;
    if (p.type === "EXPLOSION") p.size *= 0.9;
    if (p.type === "DEBRIS") { p.x += p.vx; p.y += p.vy; p.vx *= 0.92; p.vy *= 0.92; }
  });
  state.particles = state.particles.filter(p => p.life > 0);
};