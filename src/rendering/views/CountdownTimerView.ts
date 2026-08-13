import { Container, Graphics, Text } from 'pixi.js';
import type { PresentationState } from '../../presentation/PresentationState';

const MIN_RADIUS = 72;
const MAX_RADIUS = 118;
const VIEWPORT_RADIUS_SCALE = 0.16;
const START_ANGLE = -Math.PI / 2;
const FULL_CIRCLE = Math.PI * 2;

export class CountdownTimerView {
  private readonly root = new Container();
  private readonly track = new Graphics();
  private readonly fill = new Graphics();
  private readonly label = new Text({
    text: '',
    style: {
      align: 'center',
      fill: '#fff3df',
      fontFamily:
        '"PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", "Source Han Sans SC", sans-serif',
      fontSize: 48,
      fontWeight: '700',
    },
    anchor: 0.5,
  });

  private lastRadius = 0;

  public constructor(parent: Container) {
    this.root.addChild(this.track, this.fill, this.label);
    parent.addChild(this.root);
  }

  public present(state: PresentationState, width: number, height: number): void {
    this.root.visible = !state.countdown.timedOut;

    if (!this.root.visible) {
      return;
    }

    const radius = Math.round(
      Math.min(Math.max(Math.min(width, height) * VIEWPORT_RADIUS_SCALE, MIN_RADIUS), MAX_RADIUS),
    );

    this.root.position.set(width / 2, height / 2);

    if (radius !== this.lastRadius) {
      this.track
        .clear()
        .circle(0, 0, radius)
        .fill({ color: '#30231d', alpha: 0.96 })
        .stroke({ color: '#75513d', width: Math.max(4, radius * 0.05), alpha: 0.9 });
      this.label.style.fontSize = Math.round(radius * 0.48);
      this.lastRadius = radius;
    }

    const progress = Math.min(Math.max(state.countdown.progress, 0), 1);
    this.fill.clear();

    if (progress > 0) {
      this.fill
        .moveTo(0, 0)
        .lineTo(0, -radius)
        .arc(0, 0, radius, START_ANGLE, START_ANGLE + FULL_CIRCLE * progress)
        .lineTo(0, 0)
        .fill({ color: '#d96d3f', alpha: 0.96 });
    }

    this.label.text = state.countdown.remainingSeconds.toFixed(1);
  }

  public destroy(): void {
    this.root.destroy({ children: true });
  }
}
