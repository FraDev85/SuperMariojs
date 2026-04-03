// layers.js
export function createBackgroundLayers(level, sprites) {
  const tileSize = 16;

  return function drawBackgroundLayer(ctx, camera) {
    const canvasWidth = ctx.canvas.width;
    const canvasHeight = ctx.canvas.height;

    // ✅ calcola solo le tile visibili nella viewport
    const startCol = Math.floor(camera.position.x / tileSize);
    const endCol = Math.ceil((camera.position.x + canvasWidth) / tileSize);
    const startRow = Math.floor(camera.position.y / tileSize);
    const endRow = Math.ceil((camera.position.y + canvasHeight) / tileSize);

    for (let x = startCol; x <= endCol; x++) {
      for (let y = startRow; y <= endRow; y++) {
        const tile = level.tiles.get(x, y);
        if (!tile) continue;
        if (tile.name === "sky") continue;
        if (tile.name === "questionBlock") continue;

        sprites.drawTile(
          tile.name,
          ctx,
          x * tileSize - camera.position.x,
          y * tileSize - camera.position.y,
        );
      }
    }
  };
}
export function createSpriteLayer(entities, sprites) {
  return function drawSpriteLayer(ctx, camera) {
    for (const entity of entities) {
      if (!entity.draw) continue;
      ctx.save();
      ctx.translate(-camera.position.x, -camera.position.y);

      // Se l'entità è una moneta, passa gli sprite corretti
      if (entity.isAlive && entity.draw.name === "draw") {
        entity.draw(ctx, sprites); // sprite coins
      } else {
        entity.draw(ctx);
      }

      ctx.restore();
    }
  };
}

export function createCameraLayer(entities) {
  return function drawCameraLayer(ctx, camera) {
    entities.forEach((entity) => {
      if (!entity.position || !entity.size) return;
      ctx.strokeStyle = "red";
      ctx.lineWidth = 2;
      ctx.strokeRect(
        entity.position.x - camera.position.x,
        entity.position.y - camera.position.y,
        entity.size.x,
        entity.size.y,
      );
    });
  };
}
