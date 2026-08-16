import { Container, Graphics } from 'pixi.js';

const FLOOR_COLOR = '#808080';
const CELL_SIZE = 48;
const OVERSCAN_CELLS = 2;

const hash01 = (x: number, y: number, salt: number): number => {
  let value = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(salt, 1274126177);
  value = Math.imul(value ^ (value >>> 13), 1274126177);
  return ((value ^ (value >>> 16)) >>> 0) / 0xffffffff;
};

export class CementFloorView {
  private readonly root = new Container();
  private readonly graphics = new Graphics();
  private lastCellX = Number.NaN;
  private lastCellY = Number.NaN;
  private lastWidth = Number.NaN;
  private lastHeight = Number.NaN;

  public constructor(parent: Container) {
    this.root.addChild(this.graphics);
    parent.addChild(this.root);
  }

  public present(cameraX: number, cameraY: number, width: number, height: number): void {
    const worldLeft = cameraX - width / 2;
    const worldTop = cameraY - height / 2;
    const anchorCellX = Math.floor(worldLeft / CELL_SIZE);
    const anchorCellY = Math.floor(worldTop / CELL_SIZE);
    const anchorWorldX = anchorCellX * CELL_SIZE;
    const anchorWorldY = anchorCellY * CELL_SIZE;

    this.root.position.set(anchorWorldX - worldLeft, anchorWorldY - worldTop);

    if (
      anchorCellX === this.lastCellX &&
      anchorCellY === this.lastCellY &&
      width === this.lastWidth &&
      height === this.lastHeight
    ) {
      return;
    }

    this.lastCellX = anchorCellX;
    this.lastCellY = anchorCellY;
    this.lastWidth = width;
    this.lastHeight = height;
    this.redraw(anchorCellX, anchorCellY, width, height);
  }

  private redraw(anchorCellX: number, anchorCellY: number, width: number, height: number): void {
    const margin = OVERSCAN_CELLS * CELL_SIZE;
    const columns = Math.ceil(width / CELL_SIZE) + OVERSCAN_CELLS * 2 + 1;
    const rows = Math.ceil(height / CELL_SIZE) + OVERSCAN_CELLS * 2 + 1;

    this.graphics.clear();
    this.graphics
      .rect(-margin, -margin, width + margin * 2, height + margin * 2)
      .fill({ color: FLOOR_COLOR });

    for (let row = 0; row < rows; row += 1) {
      const cellY = anchorCellY - OVERSCAN_CELLS + row;
      const localCellY = (cellY - anchorCellY) * CELL_SIZE;

      for (let column = 0; column < columns; column += 1) {
        const cellX = anchorCellX - OVERSCAN_CELLS + column;
        const localCellX = (cellX - anchorCellX) * CELL_SIZE;
        const primaryX = localCellX + hash01(cellX, cellY, 1) * CELL_SIZE;
        const primaryY = localCellY + hash01(cellX, cellY, 2) * CELL_SIZE;
        const primaryRadius = 0.6 + hash01(cellX, cellY, 3) * 1.4;
        const primaryLight = hash01(cellX, cellY, 4) > 0.5;

        this.graphics.circle(primaryX, primaryY, primaryRadius).fill({
          color: primaryLight ? '#969696' : '#676767',
          alpha: 0.18 + hash01(cellX, cellY, 5) * 0.12,
        });

        const secondaryX = localCellX + hash01(cellX, cellY, 6) * CELL_SIZE;
        const secondaryY = localCellY + hash01(cellX, cellY, 7) * CELL_SIZE;
        this.graphics.circle(secondaryX, secondaryY, 0.45 + hash01(cellX, cellY, 8) * 0.8).fill({
          color: hash01(cellX, cellY, 9) > 0.5 ? '#a0a0a0' : '#707070',
          alpha: 0.12,
        });

        if (hash01(cellX, cellY, 10) > 0.9) {
          const startX = localCellX + hash01(cellX, cellY, 11) * CELL_SIZE;
          const startY = localCellY + hash01(cellX, cellY, 12) * CELL_SIZE;
          const angle = hash01(cellX, cellY, 13) * Math.PI * 2;
          const length = 8 + hash01(cellX, cellY, 14) * 14;
          const midX = startX + Math.cos(angle) * length * 0.55;
          const midY = startY + Math.sin(angle) * length * 0.55;
          const endX = startX + Math.cos(angle + 0.18) * length;
          const endY = startY + Math.sin(angle + 0.18) * length;

          this.graphics
            .moveTo(startX, startY)
            .lineTo(midX, midY)
            .lineTo(endX, endY)
            .stroke({ color: '#5f5f5f', alpha: 0.16, width: 0.8 });
        }
      }
    }
  }

  public destroy(): void {
    this.root.destroy({ children: true });
  }
}
