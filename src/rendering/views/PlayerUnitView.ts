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
  private readonly sidearm = new Graphics()
    .rect(7, -2.5, 14, 5)
    .fill({ color: '#25292c' })
    .rect(8, -1.4, 10, 2.8)
    .fill({ color: '#a8adb0' })
    .rect(7, 2, 5, 7)
    .fill({ color: '#303438' })
    .circle(21, 0, 1.5)
    .fill({ color: '#d9c57b' });
  private readonly saber = new Graphics()
    .moveTo(7, 0)
    .lineTo(24, 0)
    .stroke({ color: '#e7eef1', width: 3 })
    .moveTo(6, -4)
    .lineTo(6, 4)
    .stroke({ color: '#2d3134', width: 2 })
    .moveTo(0, 0)
    .lineTo(6, 0)
    .stroke({ color: '#4b3428', width: 4 });

  public constructor(parent: Container) {
    this.root.addChild(this.saber, this.body, this.sidearm);
    parent.addChild(this.root);
  }

  public present(
    player: PresentationState['player'],
    weapons: PresentationState['weapons'],
  ): void {
    this.root.position.set(player.x, player.y);

    const speed = Math.hypot(player.velocityX, player.velocityY);
    if (speed > HEADING_SPEED_THRESHOLD) {
      this.body.rotation = Math.atan2(player.velocityY, player.velocityX) + Math.PI / 2;
    }

    this.sidearm.rotation = weapons.sidearm.aimAngle;
    this.saber.rotation = weapons.saber.aimAngle;
  }

  public destroy(): void {
    this.root.destroy({ children: true });
  }
}
