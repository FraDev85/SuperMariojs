export function drawBackground(background, ctx, sprites) {
  background.ranges.forEach(([x1, x2, y1, y2]) => {
    for (let x = x1; x < x2; ++x) {
      for (let y = y1; y < y2; ++y) {
        sprites.drawTile(background.tile, ctx, x, y);
      }
    }
  });
}

export function createBackgroundLayers(backgrounds, sprites) {
  const buffer = document.createElement("canvas");
  buffer.width = 260;
  buffer.height = 240;
  const bufferCtx = buffer.getContext("2d");

  backgrounds.forEach((background) => {
    drawBackground(background, bufferCtx, sprites);
  });

  return function drawBackgroundLayer(ctx) {
    ctx.drawImage(buffer, 0, 0);
  };
}
