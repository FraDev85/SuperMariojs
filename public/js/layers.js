export function createBackgroundLayers(level, sprites) {
  const tileSize = 16;
  return function drawBackgroundLayer(ctx, camera) {
    level.tiles.forEach((tile, x, y) => {
      if (!tile) return;
      sprites.drawTile(
        tile.name,
        ctx,
        x * tileSize - camera.position.x,
        y * tileSize - camera.position.y,
      );
    });
  };
}

export function createSpriteLayer(entities) {
  return function drawSpriteLayer(ctx, camera) {
    entities.forEach((entity) => {
      if (!entity.position || !entity.size) return;
      ctx.save();
      ctx.translate(-camera.position.x, -camera.position.y);
      entity.draw(ctx);
      ctx.restore();
    });
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
