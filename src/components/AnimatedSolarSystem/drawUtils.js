

// --- EXISTING ICONS ---
export function drawSpaceIcon(ctx, color) {
  ctx.beginPath();
  ctx.moveTo(0, -3.5);
  ctx.lineTo(2.5, 2.5);
  ctx.lineTo(0, 1);
  ctx.lineTo(-2.5, 2.5);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.lineWidth = 0.3;
  ctx.strokeStyle = "#ffffff";
  ctx.stroke();
}

export function drawGroundIcon(ctx, color) {
  ctx.beginPath();
  ctx.moveTo(-2.5, -1.5);
  ctx.lineTo(2.5, -1.5);
  ctx.lineTo(2.5, 0.5);
  ctx.lineTo(0, 2.5);
  ctx.lineTo(-2.5, 0.5);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.lineWidth = 0.3;
  ctx.strokeStyle = "#ffffff";
  ctx.stroke();
}

export function drawCountBadge(ctx, count) {
  ctx.beginPath();
  ctx.arc(3, -3, 2.2, 0, Math.PI * 2);
  ctx.fillStyle = "#ff0000";
  ctx.fill();
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 0.2;
  ctx.stroke();

  ctx.fillStyle = "#fff";
  ctx.font = "bold 4px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(count > 9 ? "+" : String(count), 3, -2.8);
}

// --- NEW SCENE PRIMITIVES ---

export function drawStars(ctx, stars, zoom) {
  ctx.save();
  ctx.fillStyle = "white";
  stars.forEach((star) => {
    ctx.globalAlpha = star.alpha;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size / zoom, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

export function drawConnectionLine(ctx, start, end, zoom) {
  ctx.save();
  ctx.setLineDash([8, 12]);
  ctx.strokeStyle = "rgba(0, 245, 255, 0.15)";
  ctx.lineWidth = 2 / zoom;
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x, end.y);
  ctx.stroke();
  ctx.restore();
}

export function drawOrbit(ctx, x, y, radius, isMoon, faint = false) {
  ctx.beginPath();
  if (faint) {
    ctx.strokeStyle = isMoon ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.03)";
    ctx.lineWidth = isMoon ? 0.3 : 0.5;
  } else {
    ctx.strokeStyle = isMoon ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.1)";
    ctx.lineWidth = isMoon ? 0.5 : 1;
  }
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.stroke();
}

export function drawPlanet(ctx, x, y, size, color, image) {
  if (image && image.complete && image.naturalHeight !== 0) {
    ctx.drawImage(image, x - size, y - size, size * 2, size * 2);
  } else {
    // Fallback or Star
    const isStar = !image; // Simple heuristic, stars usually don't have map pngs in this context unless specified
    if (isStar) {
      const gradient = ctx.createRadialGradient(x, y, size * 0.5, x, y, size * 2);
      gradient.addColorStop(0, "rgba(253, 184, 19, 0.8)");
      gradient.addColorStop(1, "rgba(253, 184, 19, 0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, size * 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function drawLabel(ctx, text, x, y, size, isMoon, zoom = 1) {
  ctx.fillStyle = "white";
  // Scale font size inversely with zoom: when zoomed OUT (smaller zoom value)
  // labels become larger. Clamp to reasonable bounds to avoid extremes.
  const baseFontSize = isMoon ? 10 : 14;
  // Inverse zoom factor: larger when zoom is small.
  const inv = 1 / Math.max(0.01, zoom);
  const zoomFactor = Math.max(0.6, Math.min(2, inv));
  const fontSize = Math.round(baseFontSize * zoomFactor);
  ctx.font = `${fontSize}px Arial`;
  ctx.textAlign = "center";
  // Add subtle shadow for readability instead of thick black stroke
  ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
  ctx.shadowBlur = 4;
  ctx.fillText(text, x, y + size + 15);
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
}

export function drawAsteroidBelt(ctx, centerX, centerY, beltRadius, currentTime, zoom) {
  ctx.save();
  const beltWidth = 50;
  // faint ring
  ctx.beginPath();
  ctx.arc(centerX, centerY, beltRadius, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(120, 110, 100, 0.06)";
  ctx.lineWidth = Math.max(1, beltWidth / (zoom * 10));
  ctx.stroke();

  // scatter some moving asteroids for visual effect
  const total = 300; // keep moderate for perf
  const speed = 0.00005;
  const offset = currentTime * speed;
  for (let i = 0; i < total; i++) {
    const r1 = Math.sin(i * 12.9898 + i * 0.1);
    const r2 = Math.cos(i * 78.233 + i * 0.07);
    const angle = (i / total) * Math.PI * 2 + r1 * 0.1 + offset;
    const distOffset = ((r2 + r1) / 2) * (beltWidth / 2);
    const radius = beltRadius + distOffset;
    const x = Math.cos(angle) * radius + centerX;
    const y = Math.sin(angle) * radius + centerY;
    const size = Math.abs(r1) > 0.8 ? 1.2 : 0.5;
    ctx.beginPath();
    ctx.fillStyle = "rgba(180,170,160,0.6)";
    ctx.arc(x, y, size / Math.max(0.4, zoom), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}