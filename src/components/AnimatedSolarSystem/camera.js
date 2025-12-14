export function lerpCamera(camera, target, alpha = 0.1) {
  return {
    x: camera.x + (target.x - camera.x) * alpha,
    y: camera.y + (target.y - camera.y) * alpha,
    zoom: camera.zoom + (target.zoom - camera.zoom) * alpha,
  };
}

export function screenToWorld(mouseX, mouseY, canvas, camera) {
  const rect = canvas.getBoundingClientRect();
  // mouseX/mouseY may be client coords; if caller already computed local coords,
  // pass them directly and ignore rect translation.
  const localX = mouseX - rect.left;
  const localY = mouseY - rect.top;

  const width = canvas.width;
  const height = canvas.height;
  const worldX = (localX - width / 2) / camera.zoom + camera.x;
  const worldY = (localY - height / 2) / camera.zoom + camera.y;
  return { x: worldX, y: worldY };
}

export function worldToScreen(wx, wy, canvas, camera) {
  const width = canvas.width;
  const height = canvas.height;
  const sx = (wx - camera.x) * camera.zoom + width / 2;
  const sy = (wy - camera.y) * camera.zoom + height / 2;
  return { x: sx, y: sy };
}
