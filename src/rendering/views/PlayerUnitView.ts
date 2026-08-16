import { Container, Graphics } from 'pixi.js';
import type { PresentationState } from '../../presentation/PresentationState';

const HEADING_SPEED_THRESHOLD = 2;

export class PlayerUnitView {
  private readonly root = new Container();
  private readonly body = new Graphics()
    .circle(0, 0, 12)
    .fill({ color: '#24282b' })
    .circle(0, 0, 9)
    .fill({ color: '#eeeeea' })
    .circle(0, 0, 3)
    .fill({ color: '#24282b' })
    .moveTo(0, -12)
    .lineTo(4.5, -5)
    .lineTo(-4.5, -5)
    .lineTo(0, -12)
    .fill({ color: '#24282b' });

  public constructor(parent: Container) {
    this.root.addChild(this.body);
    parent.addChild(this.root);
  }

  public present(player: PresentationState['player']): void {
    this.root.position.set(player.x, player.y);

    const speed = Math.hypot(player.velocityX, player.velocityY);
    if (speed > HEADING_SPEED_THRESHOLD) {
      this.body.rotation = Math.atan2(player.velocityY, player.velocityX) + Math.PI / 2;
    }
  }

  public destroy(): void {
    this.root.destroy({ children: true });
  }
}
