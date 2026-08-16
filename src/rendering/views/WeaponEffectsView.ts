import { Container, Graphics } from 'pixi.js';
import type { PresentationState } from '../../presentation/PresentationState';

const clamp01 = (value: number): number => Math.min(Math.max(value, 0), 1);

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
      const energy = clamp01(projectile.energyRatio);
      const trailLength = 10 + energy * 30;
      const trailX = projectile.x - directionX * trailLength;
      const trailY = projectile.y - directionY * trailLength;
      const coreWidth = 1.25 + energy * 1.5;
      const haloWidth = 4 + energy * 3;

      this.graphics
        .moveTo(trailX, trailY)
        .lineTo(projectile.x, projectile.y)
        .stroke({ color: '#d8b96b', alpha: 0.08 + energy * 0.14, width: haloWidth });

      this.graphics
        .moveTo(trailX, trailY)
        .lineTo(projectile.x, projectile.y)
        .stroke({ color: '#fff0b0', alpha: 0.42 + energy * 0.5, width: coreWidth });

      this.graphics
        .circle(projectile.x, projectile.y, Math.max(projectile.radius, 1.4) + energy * 0.9)
        .fill({ color: '#fff7d6', alpha: 0.78 + energy * 0.2 });
    }

    for (const impact of state.projectileImpacts) {
      const energy = clamp01(impact.energyRatio);
      const fade = (1 - impact.progress) * (1 - impact.progress);
      const radius = 3 + impact.progress * (12 + energy * 12);
      const forward = 4 + energy * 9;
      const backward = 5 + energy * 13;
      const tangentX = -impact.directionY;
      const tangentY = impact.directionX;
      const side = 3 + energy * 6;

      this.graphics
        .circle(impact.x, impact.y, radius)
        .stroke({ color: '#fff0ad', alpha: fade * (0.2 + energy * 0.42), width: 1.2 + energy });

      this.graphics
        .moveTo(
          impact.x - impact.directionX * backward,
          impact.y - impact.directionY * backward,
        )
        .lineTo(
          impact.x + impact.directionX * forward,
          impact.y + impact.directionY * forward,
        )
        .stroke({ color: '#fff8d6', alpha: fade * (0.5 + energy * 0.45), width: 1.5 + energy * 1.5 });

      this.graphics
        .moveTo(impact.x - tangentX * side, impact.y - tangentY * side)
        .lineTo(impact.x + tangentX * side, impact.y + tangentY * side)
        .stroke({ color: '#e4c06a', alpha: fade * (0.22 + energy * 0.32), width: 1 });
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
