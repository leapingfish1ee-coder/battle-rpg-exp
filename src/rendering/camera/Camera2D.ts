export interface CameraPosition {
  readonly x: number;
  readonly y: number;
}

const FOLLOW_SHARPNESS = 12;

export class Camera2D {
  private x = 0;
  private y = 0;
  private initialized = false;

  public update(targetX: number, targetY: number, deltaSeconds: number): void {
    if (!this.initialized) {
      this.x = targetX;
      this.y = targetY;
      this.initialized = true;
      return;
    }

    const delta = Math.max(deltaSeconds, 0);
    const blend = 1 - Math.exp(-FOLLOW_SHARPNESS * delta);
    this.x += (targetX - this.x) * blend;
    this.y += (targetY - this.y) * blend;
  }

  public position(): CameraPosition {
    return { x: this.x, y: this.y };
  }

  public worldToScreen(
    worldX: number,
    worldY: number,
    viewportWidth: number,
    viewportHeight: number,
  ): CameraPosition {
    return {
      x: worldX - this.x + viewportWidth / 2,
      y: worldY - this.y + viewportHeight / 2,
    };
  }
}
