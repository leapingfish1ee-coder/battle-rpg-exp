import { Container, Graphics } from 'pixi.js';
import type { PresentationState } from '../../presentation/PresentationState';

const PROJECTILE_TRAIL_LENGTH = 13;

export class WeaponEffectsView {
  private readonly root = new Container();
  private readonly graphics = new Graphics();

  public constructor(parent: Container) {
    this.root.addChild(this.graphics);
    parent.addChild(this.root);
  }

  public present(state: PresentationState): void {
    this.graphics.clear();

    for (const projectile of state.projectiles) {
      const speed = Math.hypot(projectile.velocityX, projectile.velocityY);
      const directionX = speed > 0 ? projectile.velocityX / speed : 1;
      const directionY = speed > 0 ? projectile.velocityY / speed : 0;
      const trailX = projectile.x - directionX * PROJECTILE_TRAIL_LENGTH;
      const trailY = projectile.y - directionY * PROJECTILE_TRAIL_LENGTH;

      this.graphics
        .moveTo(trailX, trailY)
        .lineTo(projectile.x, projectile.y)
        .stroke({ color: '#f2df9a', alpha: 0.72, width: 2 })
        .circle(projectile.x, projectile.y, Math.max(projectile.radius, 1.5))
        .fill({ color: '#fff6cf', alpha: 0.95 });
    }

    for (const swing of state.meleeSwings) {
      const sweepProgress = Math.min(swing.progress * 1.45, 1);
      const startAngle = swing.angle - swing.arcRadians / 2;
      const endAngle = startAngle + swing.arcRadians * sweepProgress;
      const alpha = 0.08 + (1 - swing.progress) * 0.18;

      this.graphics
        .moveTo(swing.x, swing.y)
        .lineTo(
          swing.x + Math.cos(startAngle) * swing.range,
          swing.y + Math.sin(startAngle) * swing.range,
        )
        .arc(swing.x, swing.y, swing.range, startAngle, endAngle)
        .lineTo(swing.x, swing.y)
        .fill({ color: '#e8eef0', alpha });

      this.graphics
        .moveTo(
          swing.x + Math.cos(startAngle) * swing.range,
          swing.y + Math.sin(startAngle) * swing.range,
        )
        .arc(swing.x, swing.y, swing.range, startAngle, endAngle)
        .stroke({ color: '#ffffff', alpha: Math.min(alpha + 0.22, 0.5), width: 2 });
    }
  }

  public destroy(): void {
    this.root.destroy({ children: true });
  }
}
