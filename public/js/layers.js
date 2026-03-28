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
