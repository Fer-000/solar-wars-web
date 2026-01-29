import { getFleetsAtWorld } from "./fleetUtils";
import { 
  drawOrbit, drawPlanet, drawLabel, drawSpaceIcon, 
  drawGroundIcon, drawCountBadge 
} from "./drawUtils";

// --- PHYSICS ---
export const updateBodyPositions = (body, time, cx, cy) => {
  // Calculate position based on orbit
  const angle = body.angle !== undefined ? body.angle : time * body.speed;
  const x = cx + Math.cos(angle) * body.dist;
  const y = cy + Math.sin(angle) * body.dist;

  // Update the mutable body object (side effect intended for simulation state)
  body.currentX = x;
  body.currentY = y;

  // Recursively update children
  if (body.children) {
    body.children.forEach(child => {
      // Pass the *current* body's X/Y as the center for the child
      updateBodyPositions(child, time, x, y);
    });
  }
};

// --- RENDERING ---
export const renderSystemTree = (ctx, body, options, isMoon = false) => {
  const {
    focusedBody, hoveredBody, planetImages, zoom,
    systemData, currentFaction, refereeMode, activeSkirmishes,
    collapsedFactions, getFactionColor, fleetPositions
  } = options;

  const x = body.currentX;
  const y = body.currentY;
  const cx = body.parent ? body.parent.currentX : 0;
  const cy = body.parent ? body.parent.currentY : 0;

  // 1. Determine if this body should render
  const isFocusedBody = focusedBody === body;
  const isChildOfFocused = focusedBody && body.parent === focusedBody;
  const isDescendantOfFocused = () => {
    let current = body.parent;
    while (current) {
      if (current === focusedBody) return true;
      current = current.parent;
    }
    return false;
  };
  
  let shouldRender = true;
  if (focusedBody) {
    // Only render the focused body itself and its descendants (children, grandchildren, etc.)
    // Do NOT render parents or siblings
    shouldRender = (isFocusedBody || isDescendantOfFocused());
  } else if (isMoon) {
    // When unfocused, never render moons
    shouldRender = false;
  }

  // 2. Determine if we should process children (always true to maintain positions)
  const shouldProcessChildren = !isMoon || !focusedBody || 
    focusedBody === body || 
    (focusedBody && focusedBody.parent === body) ||
    (focusedBody && focusedBody.parent && focusedBody.parent.parent === body);

  // 3. Determine if children should be drawn
  let shouldDrawChildren = false;
  if (!focusedBody) {
    // No focus: draw planets but not moons
    shouldDrawChildren = !isMoon;
  } else if (focusedBody === body) {
    // This body is focused: draw its children
    shouldDrawChildren = true;
  } else if (focusedBody && focusedBody.parent === body) {
    // A child of this body is focused: draw siblings
    shouldDrawChildren = true;
  }

  // 4. Draw Orbit Line (but not for the focused body itself)
  if (shouldRender && body.dist > 0 && focusedBody !== body) {
    drawOrbit(ctx, cx, cy, body.dist, isMoon, options.faintOrbitLines);
  }

  // 5. Draw Body
  if (shouldRender) {
    // Draw Planet/Star
    const img = (body.name !== "Sun" && body.name !== "Corelli Star") ? planetImages[body.name] : null;
    drawPlanet(ctx, x, y, body.size, body.color, img);

    // Draw Label
    if (hoveredBody === body) {
      drawLabel(ctx, body.name, x, y, body.size, isMoon, zoom);
    }

    // Draw Fleets (Only if focused on this body)
    if (focusedBody === body) {
      renderFleetIndicators(ctx, body, x, y, options);
    }
  }

  // 6. Process Children (always to maintain positions, but skip drawing if not needed)
  if (shouldProcessChildren && body.children) {
    body.children.forEach(child => {
      child.parent = body;
      // Pass modified options with skipRendering flag if we shouldn't draw
      const childOptions = shouldDrawChildren ? options : { ...options, skipDrawing: true };
      // Children of stars are planets (isMoon = false), children of planets are moons (isMoon = true)
      const isStar = body.name === "Sun" || body.name === "Corelli Star";
      const childIsMoon = !isStar;
      renderSystemTree(ctx, child, childOptions, childIsMoon);
    });
  }
};

// Internal Helper for Fleets
const renderFleetIndicators = (ctx, body, x, y, options) => {
  const { systemData, currentFaction, refereeMode, activeSkirmishes, collapsedFactions, getFactionColor, zoom, fleetPositions } = options;
  const worldName = body.name;

  // Get Fleets
  const rawFleets = getFleetsAtWorld(systemData, worldName) || [];
  
  // Identify Hijacked Fleets (Battle Logic) - we'll filter these from DRAWING but still push to positions
  const busyFleetIds = new Set();
  if (activeSkirmishes && Array.isArray(activeSkirmishes)) {
    activeSkirmishes.forEach(s => {
        busyFleetIds.add(String(s.attacker?.fleet?.ID));
        busyFleetIds.add(String(s.defender?.fleet?.ID));
    });
  }

  // Visibility Filter (apply to ALL fleets first)
  const userFleets = rawFleets.filter(f => f.factionName.toLowerCase() === currentFaction.toLowerCase());
  const activeUserFleets = userFleets.filter(f => ["Defense", "Patrol", "Battle", "Activating"].includes(f.State?.Action));
  
  let fleetsForDetection = [];
  if (refereeMode?.isReferee || activeUserFleets.length > 0) {
      fleetsForDetection = rawFleets;
  } else if (userFleets.length > 0) {
      fleetsForDetection = rawFleets; // Simplified visibility logic for brevity
  } else {
      fleetsForDetection = [];
  }

  // For DRAWING, filter out busy fleets
  const fleetsToDraw = fleetsForDetection.filter(f => !busyFleetIds.has(String(f.ID)));

  if (fleetsToDraw.length === 0) return;

  // Grouping
  const spaceOrbitRadius = body.size + 8;
  const groundOrbitRadius = body.size + 1;
  const fleetsByFaction = fleetsToDraw.reduce((acc, f) => {
      if (!acc[f.factionName]) acc[f.factionName] = [];
      acc[f.factionName].push(f);
      return acc;
  }, {});

  const displayFleets = [];
  Object.entries(fleetsByFaction).forEach(([factionName, factionFleets]) => {
      const key = `${factionName}-${worldName}`;
      if (collapsedFactions.has(key)) {
          const s = factionFleets.filter(f => f.Type === "Space");
          if (s.length) displayFleets.push({ ...s[0], isCollapsed: true, collapsedCount: s.length });
          const g = factionFleets.filter(f => f.Type === "Ground");
          if (g.length) displayFleets.push({ ...g[0], isCollapsed: true, collapsedCount: g.length });
      } else {
          displayFleets.push(...factionFleets);
      }
  });

  // Drawing
  const sFleets = displayFleets.filter(f => f.Type === "Space");
  const gFleets = displayFleets.filter(f => f.Type === "Ground");

  const drawRing = (list, radius, isGround) => {
      list.forEach((fleet, i) => {
          const offset = isGround ? Math.PI : 0;
          const angle = (i / Math.max(list.length, 1)) * Math.PI * 2 + offset;
          const fx = x + Math.cos(angle) * radius;
          const fy = y + Math.sin(angle) * radius;
          const color = getFactionColor ? getFactionColor(fleet.factionName) : "#00f5ff";
          const arrowScale = Math.max(0.3, 0.5 / zoom);

          ctx.save();
          ctx.translate(fx, fy);
          ctx.scale(arrowScale, arrowScale);
          ctx.shadowColor = color;
          ctx.shadowBlur = fleet.isCollapsed ? 0 : 4;
          
          if (fleet.isCollapsed) ctx.globalAlpha = 0.5;
          
          if (isGround) drawGroundIcon(ctx, color);
          else drawSpaceIcon(ctx, color);

          if (fleet.isCollapsed) {
             ctx.globalAlpha = 1;
             drawCountBadge(ctx, fleet.collapsedCount);
          }
          ctx.restore();
      });
  };

  drawRing(sFleets, spaceOrbitRadius, false);
  drawRing(gFleets, groundOrbitRadius, true);

  // Push ALL fleets to positions (including battle fleets) for battle system and click detection
  // Battle fleets need to be in the position array even though they're not drawn
  const allFleetsByFaction = fleetsForDetection.reduce((acc, f) => {
      if (!acc[f.factionName]) acc[f.factionName] = [];
      acc[f.factionName].push(f);
      return acc;
  }, {});

  const allDisplayFleets = [];
  Object.entries(allFleetsByFaction).forEach(([factionName, factionFleets]) => {
      const key = `${factionName}-${worldName}`;
      if (collapsedFactions.has(key)) {
          const s = factionFleets.filter(f => f.Type === "Space");
          if (s.length) allDisplayFleets.push({ ...s[0], isCollapsed: true, collapsedCount: s.length });
          const g = factionFleets.filter(f => f.Type === "Ground");
          if (g.length) allDisplayFleets.push({ ...g[0], isCollapsed: true, collapsedCount: g.length });
      } else {
          allDisplayFleets.push(...factionFleets);
      }
  });

  const allSFleets = allDisplayFleets.filter(f => f.Type === "Space");
  const allGFleets = allDisplayFleets.filter(f => f.Type === "Ground");

  const pushFleetPositions = (list, radius, isGround) => {
      list.forEach((fleet, i) => {
          const offset = isGround ? Math.PI : 0;
          const angle = (i / Math.max(list.length, 1)) * Math.PI * 2 + offset;
          const fx = x + Math.cos(angle) * radius;
          const fy = y + Math.sin(angle) * radius;

          fleetPositions.push({
              fleet, x: fx, y: fy, radius: 15 / zoom, isCollapsed: fleet.isCollapsed || false
          });
      });
  };

  pushFleetPositions(allSFleets, spaceOrbitRadius, false);
  pushFleetPositions(allGFleets, groundOrbitRadius, true);
};