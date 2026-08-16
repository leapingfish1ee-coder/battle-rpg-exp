import { Container, Graphics } from 'pixi.js';
import type { PresentationState } from '../../presentation/PresentationState';

export class EnemyFieldView {
  private readonly root = new Container();
  private readonly graphics = new Graphics();

  public constructor(parent: Container) {
    this.root.addChild(this.graphics);
    parent.addChild(this.root);
  }

  public present(enemies: PresentationState['enemies']): void {
    this.graphics.clear();

    for (const enemy of enemies) {
      const radius = enemy.radius;

      if (enemy.behavior === 'chaser') {
        this.graphics
          .circle(enemy.x, enemy.y, radius)
          .fill({ color: '#593536' })
          .circle(enemy.x, enemy.y, Math.max(radius - 3, 2))
          .fill({ color: '#8d5757' });

        const speed = Math.hypot(enemy.velocityX, enemy.velocityY);
        if (speed > 1) {
          const directionX = enemy.velocityX / speed;
          const directionY = enemy.velocityY / speed;
          const tipX = enemy.x + directionX * (radius + 3);
          const tipY = enemy.y + directionY * (radius + 3);
          this.graphics
            .moveTo(tipX, tipY)
            .lineTo(enemy.x + directionY * 4, enemy.y - directionX * 4)
            .lineTo(enemy.x - directionY * 4, enemy.y + directionX * 4)
            .lineTo(tipX, tipY)
            .fill({ color: '#3c2425' });
        }
      } else {
        this.graphics
          .rect(enemy.x - radius, enemy.y - radius, radius * 2, radius * 2)
          .fill({ color: '#343b40' })
          .rect(enemy.x - radius + 3, enemy.y - radius + 3, radius * 2 - 6, radius * 2 - 6)
          .fill({ color: '#b9a46f' });
      }

      if (enemy.healthRatio < 0.999) {
        const width = radius * 2;
        const top = enemy.y - radius - 6;
        this.graphics
          .rect(enemy.x - radius, top, width, 2)
          .fill({ color: '#303030', alpha: 0.75 })
          .rect(enemy.x - radius, top, width * enemy.healthRatio, 2)
          .fill({ color: '#e6ddd3', alpha: 0.9 });
      }
    }
  }

  public destroy(): void {
    this.root.destroy({ children: true });
  }
}
