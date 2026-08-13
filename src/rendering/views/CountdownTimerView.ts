import { Container, Graphics, Text } from 'pixi.js';
import type { PresentationState } from '../../presentation/PresentationState';

const TIMER_SIZE = 64;
const RADIUS = TIMER_SIZE / 2;
const START_ANGLE = -Math.PI / 2;
const FULL_CIRCLE = Math.PI * 2;

export class CountdownTimerView {
  private readonly root = new Container();
  private readonly track = new Graphics()
    .circle(0, 0, RADIUS)
    .fill({ color: '#30231d' });
  private readonly fill = new Graphics();
  private readonly label = new Text({
    text: '',
    style: {
      align: 'center',
      fill: '#fff3df',
      fontFamily:
        '"PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", "Source Han Sans SC", sans-serif',
      fontSize: 16,
      fontWeight: '700',
    },
    anchor: 0.5,
  });

  public constructor(parent: Container) {
    this.root.addChild(this.track, this.fill, this.label);
    parent.addChild(this.root);
  }

  public present(state: PresentationState, width: number, height: number): void {
    this.root.position.set(width / 2, height / 2);

    const progress = Math.min(Math.max(state.countdown.progress, 0), 1);
    this.fill.clear();

    if (progress > 0) {
      this.fill
        .moveTo(0, 0)
        .lineTo(0, -RADIUS)
        .arc(0, 0, RADIUS, START_ANGLE, START_ANGLE + FULL_CIRCLE * progress)
        .lineTo(0, 0)
        .fill({ color: '#d96d3f' });
    }

    this.label.text = state.countdown.remainingSeconds.toFixed(1);
  }

  public destroy(): void {
    this.root.destroy({ children: true });
  }
}
