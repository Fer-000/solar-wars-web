import React, { useEffect, useRef, useState, useMemo } from "react";
import SciFiOverlay from "./SciFiOverlay";
import HexModal from "./HexModal";

// --- CONSTANTS ---
const HEX_SIZE = 25;
const HEX_APOTHEM = 21.650635094610966; // Math.sqrt(3) * HEX_SIZE / 2
const COL_WIDTH = HEX_SIZE * 1.5; // 37.5
const ROW_HEIGHT = HEX_APOTHEM * 2; // 43.3
const SCIFI_CYAN = "#00f3ff";

const HexMapEditor = ({
  width = 73,
  height = 36,
  backgroundImage,
  initialData,
  onClose,
  onSave,
  userFactionId = null,
  isRef = false,
  worldName = "Unknown World",
  allFactions = {},
  onShowWorldDetail,
  readOnly = false,
}) => {
  // --- UI STATE ---
  const [tool, setTool] = useState("brush");
  const [animEnabled, setAnimEnabled] = useState(true);
  const [mode, setMode] = useState("view");
  const [selectedHex, setSelectedHex] = useState(null);
  const [currentPaintColor, setCurrentPaintColor] = useState(SCIFI_CYAN);

  const [factionsByColor, setFactionsByColor] = useState({});
  const [factionsList, setFactionsList] = useState([]);

  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // --- ENGINE STATE ---
  const stateRef = useRef({
    camera: { x: 0, y: 0, zoom: 1.0 },
    // Interaction State
    isDragging: false,
    isPainting: false,
    isRightClick: false, // Track button type
    dragStart: { x: 0, y: 0 }, // Track start pos for click-distance check
    lastMouse: { x: 0, y: 0 },
    // Data
    hexData: new Map(),
    animating: new Map(),
    bgImage: null,
    bgConfig: { scaleX: 1, scaleY: 1 },
    gridWidth: width,
    gridHeight: height,
    hexOpacity: 0.6,
    strokeColor: "rgba(255,255,255,0.3)",
  });

  // --- PERMISSION & COLOR LOGIC ---
  const fixColor = (c) => (c && !c.startsWith("#") ? `#${c}` : c);

  const userColor = useMemo(() => {
    if (isRef || !userFactionId || !factionsList.length) return null;
    const userFac = factionsList.find((f) => f.id === userFactionId);
    return userFac ? fixColor(userFac.fill) : null;
  }, [userFactionId, isRef, factionsList]);

  useEffect(() => {
    if (!isRef && userColor) {
      setCurrentPaintColor(userColor);
    }
  }, [userColor, isRef]);

  // --- DATA PARSING ---
  const convertDataToMap = (data) => {
    const map = new Map();
    const colorMap = {};
    const list = [];

    if (!data || !data.hexes) return { map, colorMap, list };

    const factionColors = {};
    if (data.factions) {
      data.factions.forEach((f) => {
        const c = fixColor(f.fill);
        factionColors[f.id] = c;
        colorMap[c] = f;
        list.push({ ...f, fill: c });
      });
    }

    data.hexes.forEach((colData, q) => {
      if (Array.isArray(colData)) {
        colData.forEach((factionId, r) => {
          if (factionId !== null && factionId !== undefined) {
            const color = factionColors[factionId];
            if (color) {
              map.set(`${q},${r}`, color);
            }
          }
        });
      }
    });
    return { map, colorMap, list };
  };

  const convertMapToData = () => {
    const factions = [];
    const hexes = Array(stateRef.current.gridWidth)
      .fill(null)
      .map(() => Array(stateRef.current.gridHeight).fill(null));
    return {
      factions,
      hexes,
      width: stateRef.current.gridWidth,
      height: stateRef.current.gridHeight,
    };
  };

  // --- INITIALIZATION ---
  useEffect(() => {
    const s = stateRef.current;

    if (initialData) {
      const { map, colorMap, list } = convertDataToMap(initialData);
      s.hexData = map;
      setFactionsByColor(colorMap);
      setFactionsList(list);

      s.gridWidth = initialData.width || width;
      s.gridHeight = initialData.height || height;
      s.hexOpacity = initialData.hexOpacity || 0.6;

      if (initialData.stroke) {
        const { r, g, b, a } = initialData.stroke;
        s.strokeColor = `rgba(${r},${g},${b},${a})`;
      }

      if (initialData.factions && initialData.factions.length > 0 && isRef) {
        setCurrentPaintColor(fixColor(initialData.factions[0].fill));
      }

      if (initialData.image) {
        s.bgConfig = {
          scaleX: initialData.image.scaleX || 1,
          scaleY: initialData.image.scaleY || 1,
        };
      }
    }

    const imgUrl = initialData?.imageData || backgroundImage;
    if (imgUrl) {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.onload = () => {
        s.bgImage = img;
      };
      img.src = imgUrl;
    }
  }, [initialData, backgroundImage, width, height, isRef]);

  // --- GEOMETRY ---
  const getHexCenter = (q, r) => {
    const cx = q * COL_WIDTH;
    let cy = r * ROW_HEIGHT;
    if (q % 2 !== 0) cy += HEX_APOTHEM;
    return { x: cx, y: cy };
  };

  const screenToHex = (sx, sy) => {
    const s = stateRef.current;
    // World coordinates (Account for Zoom and Camera Pan)
    const worldX = sx / s.camera.zoom - s.camera.x;
    const worldY = sy / s.camera.zoom - s.camera.y;

    const approxQ = Math.round(worldX / COL_WIDTH);
    const approxR = Math.round(worldY / ROW_HEIGHT);

    let bestDist = Infinity;
    let bestHex = { q: -1, r: -1 };

    // Nearest neighbor scan for accuracy
    for (let i = approxQ - 1; i <= approxQ + 1; i++) {
      for (let j = approxR - 1; j <= approxR + 1; j++) {
        const center = getHexCenter(i, j);
        const d2 = (worldX - center.x) ** 2 + (worldY - center.y) ** 2;
        if (d2 < bestDist) {
          bestDist = d2;
          bestHex = { q: i, r: j };
        }
      }
    }

    if (bestDist < HEX_APOTHEM * HEX_APOTHEM) return bestHex;
    return bestHex;
  };

  const applyColor = (q, r, colorToApply) => {
    const key = `${q},${r}`;
    const s = stateRef.current;
    if (q < 0 || q >= s.gridWidth || r < 0 || r >= s.gridHeight) return;

    const existingColor = s.hexData.get(key);

    if (!isRef) {
      if (colorToApply === null) {
        if (existingColor !== userColor) return;
      } else {
        if (colorToApply !== userColor) return;
      }
    }

    if (existingColor === colorToApply) return;
    if (colorToApply === null) s.hexData.delete(key);
    else s.hexData.set(key, colorToApply);
  };

  // --- RENDER LOOP ---
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { alpha: false });
    let animId;

    const render = (time) => {
      const s = stateRef.current;
      const rect = containerRef.current.getBoundingClientRect();
      if (canvas.width !== rect.width || canvas.height !== rect.height) {
        canvas.width = rect.width;
        canvas.height = rect.height;
      }

      ctx.fillStyle = "#050505";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      // Apply Camera Transform
      ctx.scale(s.camera.zoom, s.camera.zoom);
      ctx.translate(s.camera.x, s.camera.y);

      if (s.bgImage) {
        ctx.drawImage(
          s.bgImage,
          0,
          0,
          s.bgImage.width * s.bgConfig.scaleX,
          s.bgImage.height * s.bgConfig.scaleY,
        );
      }

      const drawHexPath = (cx, cy) => {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i;
          const x = cx + HEX_SIZE * Math.cos(angle);
          const y = cy + HEX_SIZE * Math.sin(angle);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
      };

      for (let q = 0; q < s.gridWidth; q++) {
        for (let r = 0; r < s.gridHeight; r++) {
          const key = `${q},${r}`;
          const color = s.hexData.get(key);

          if (color) {
            const center = getHexCenter(q, r);
            drawHexPath(center.x, center.y);
            ctx.fillStyle = color;
            ctx.globalAlpha = s.hexOpacity;
            ctx.fill();
            ctx.globalAlpha = 1.0;
            ctx.strokeStyle = s.strokeColor;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      if (selectedHex && selectedHex.q !== -1) {
        const center = getHexCenter(selectedHex.q, selectedHex.r);
        drawHexPath(center.x, center.y);
        ctx.lineWidth = 3 / s.camera.zoom;
        ctx.strokeStyle = SCIFI_CYAN;
        ctx.stroke();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [width, height, mode, selectedHex]);

  // --- INTERACTION HANDLERS ---
  const handleStart = (e) => {
    // Prevent default only on touch to stop scrolling/refresh
    if (e.type === "touchstart") e.preventDefault();

    const s = stateRef.current;
    s.isDragging = true;

    // 1. Capture Inputs
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    // 2. Track Interaction Start (For click distance check)
    s.dragStart = { x: clientX, y: clientY };
    s.lastMouse = { x: clientX, y: clientY };

    // 3. Detect Right Click (Button 2)
    // Touch doesn't have 'button' property on start usually, assume left
    s.isRightClick = e.button === 2;

    // 4. Paint Action (Only on Edit + Left Click)
    if (mode === "edit" && !s.isRightClick) {
      const rect = canvasRef.current.getBoundingClientRect();
      const hex = screenToHex(clientX - rect.left, clientY - rect.top);

      let colorToUse =
        tool === "eraser" ? null : isRef ? currentPaintColor : userColor;
      applyColor(hex.q, hex.r, colorToUse);
      s.isPainting = true;
    }
  };

  const handleMove = (e) => {
    const s = stateRef.current;
    if (!s.isDragging) return;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const dx = clientX - s.lastMouse.x;
    const dy = clientY - s.lastMouse.y;
    s.lastMouse = { x: clientX, y: clientY };

    // Pan: Right Click OR View Mode
    if (mode === "view" || s.isRightClick) {
      // Adjust Pan speed by Zoom level for natural feeling
      s.camera.x += dx / s.camera.zoom;
      s.camera.y += dy / s.camera.zoom;
    }
    // Paint: Edit Mode + Left Click
    else if (s.isPainting) {
      const rect = canvasRef.current.getBoundingClientRect();
      const hex = screenToHex(clientX - rect.left, clientY - rect.top);
      let colorToUse =
        tool === "eraser" ? null : isRef ? currentPaintColor : userColor;
      applyColor(hex.q, hex.r, colorToUse);
    }
  };

  const handleEnd = (e) => {
    const s = stateRef.current;

    // Calculate Drag Distance
    // Touch events store last pos in lastMouse
    const dist = Math.hypot(
      s.lastMouse.x - s.dragStart.x,
      s.lastMouse.y - s.dragStart.y,
    );

    // --- MODAL TRIGGER LOGIC ---
    // 1. Must be View Mode
    // 2. Must NOT be Painting
    // 3. Must be LEFT CLICK (Not Right Click)
    // 4. Must be a CLICK (Distance < 5px), not a Drag
    if (mode === "view" && !s.isPainting && !s.isRightClick && dist < 5) {
      const rect = canvasRef.current.getBoundingClientRect();
      const hex = screenToHex(
        s.lastMouse.x - rect.left,
        s.lastMouse.y - rect.top,
      );

      if (hex.q !== -1) {
        const key = `${hex.q},${hex.r}`;
        const color = s.hexData.get(key);
        setSelectedHex({ q: hex.q, r: hex.r, color });
      } else {
        setSelectedHex(null);
      }
    }

    s.isDragging = false;
    s.isPainting = false;
  };

  // --- IMPROVED ZOOM LOGIC (Zoom Toward Mouse) ---
  const handleWheel = (e) => {
    const s = stateRef.current;
    e.preventDefault();

    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // 1. Calculate World Point under mouse BEFORE zoom
    const worldX = mouseX / s.camera.zoom - s.camera.x;
    const worldY = mouseY / s.camera.zoom - s.camera.y;

    // 2. Adjust Zoom
    const zoomSens = 0.001;
    let newZoom = s.camera.zoom - e.deltaY * zoomSens;
    newZoom = Math.min(Math.max(0.1, newZoom), 5); // Limits: 0.1x to 5x

    // 3. Calculate New Camera Position to keep World Point stationary
    // mouseX / newZoom - newCamX = worldX  =>  newCamX = mouseX / newZoom - worldX
    s.camera.x = mouseX / newZoom - worldX;
    s.camera.y = mouseY / newZoom - worldY;
    s.camera.zoom = newZoom;
  };

  useEffect(() => {
    const c = canvasRef.current;
    c.addEventListener("mousedown", handleStart);
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleEnd);
    c.addEventListener("wheel", handleWheel, { passive: false }); // Non-passive for preventDefault
    return () => {
      c.removeEventListener("mousedown", handleStart);
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleEnd);
      c.removeEventListener("wheel", handleWheel);
    };
  }, [mode, tool, currentPaintColor, isRef, userColor]);

  // --- KEYBOARD (Ref Cycling) ---
  useEffect(() => {
    const handleKey = (e) => {
      if (!isRef || mode !== "edit") return;
      if (e.key === "[" || e.key === "]") {
        const idx = factionsList.findIndex((f) => f.fill === currentPaintColor);
        if (idx !== -1) {
          let nextIdx = e.key === "]" ? idx + 1 : idx - 1;
          if (nextIdx >= factionsList.length) nextIdx = 0;
          if (nextIdx < 0) nextIdx = factionsList.length - 1;
          setCurrentPaintColor(factionsList[nextIdx].fill);
        }
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isRef, mode, factionsList, currentPaintColor]);

  const toggleTool = () => {
    const t = ["brush", "bucket", "eraser"];
    setTool(t[(t.indexOf(tool) + 1) % 3]);
  };

  const selectedFaction = useMemo(() => {
    if (!selectedHex || !selectedHex.color) return null;

    const hexFaction = factionsByColor[selectedHex.color];
    if (!hexFaction || !hexFaction.name) return null;

    // Try to find the full faction data from allFactions
    const fullFactionData = Object.values(allFactions).find(
      (f) => f.Name?.toLowerCase() === hexFaction.name.toLowerCase(),
    );

    return fullFactionData || hexFaction;
  }, [selectedHex, factionsByColor, allFactions]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        inset: 0,
        background: "#050505",
        zIndex: 140,
      }}
    >
      <canvas ref={canvasRef} style={{ display: "block" }} />
      <SciFiOverlay
        mode={mode}
        onClose={onClose}
        onSave={onSave ? () => onSave(convertMapToData()) : undefined}
        onShowWorldDetail={onShowWorldDetail}
        onToggleMode={() => {
          if (readOnly) return; // disable mode switching when readOnly
          setMode((m) => (m === "edit" ? "view" : "edit"));
          setSelectedHex(null);
        }}
        currentTool={tool}
        onToggleTool={toggleTool}
        readOnly={readOnly}
      />
      <HexModal
        data={selectedHex}
        onClose={() => setSelectedHex(null)}
        factionName={
          selectedFaction ? selectedFaction.name || selectedFaction.Name : null
        }
        factionData={selectedFaction}
        worldName={worldName}
        getFactionColor={() => selectedHex?.color || SCIFI_CYAN}
        allFactions={allFactions}
      />
    </div>
  );
};

export default HexMapEditor;
