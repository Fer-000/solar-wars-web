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
