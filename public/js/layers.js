export function createSpriteLayer(entities) {
  return function drawSpriteLayer(ctx) {
    entities.forEach((entity) => {
      entity.draw(ctx);
    });
  };
}

export function createBackgroundLayers(level, sprites) {
  const buffer = document.createElement("canvas");
  buffer.width = 260;
  buffer.height = 240;
  const ctx = buffer.getContext("2d");
  level.tiles.forEach((tile, x, y) => {
    sprites.drawTile(tile.name, ctx, x, y);
  });

  return function drawBackgroundLayer(ctx) {
    ctx.drawImage(buffer, 0, 0);
  };
}

export function createCameraLayer(entities) {
  return function drawCameraLayer(ctx) {
    entities.forEach((entity) => {
      if (!entity.position || !entity.size) return;
      ctx.strokeStyle = "red";
      ctx.lineWidth = 2;
      ctx.strokeRect(
        entity.position.x,
        entity.position.y,
        entity.size.x,
        entity.size.y,
      );
    });
  };
}
