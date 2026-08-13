import { Container, Graphics, Text } from 'pixi.js';
import type { PresentationState } from '../../presentation/PresentationState';
import { PAGE_LAYOUT_UNIT, type PageLayout } from '../layout/PageLayout';
import { PAGE_TYPOGRAPHY } from '../style/PageTypography';

const RADIUS = PAGE_LAYOUT_UNIT / 2;
const START_ANGLE = -Math.PI / 2;
const FULL_CIRCLE = Math.PI * 2;

export class CountdownTimerView {
  private readonly root = new Container();
  private readonly track = new Graphics().circle(0, 0, RADIUS).fill({ color: '#30231d' });
  private readonly fill = new Graphics();
  private readonly label = new Text({
    text: '',
    style: {
      align: 'center',
      fill: '#fff3df',
      fontFamily:
        '"PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", "Source Han Sans SC", sans-serif',
      fontSize: PAGE_TYPOGRAPHY.timerLabel.fontSize,
      fontWeight: PAGE_TYPOGRAPHY.timerLabel.fontWeight,
    },
    anchor: 0.5,
  });

  public constructor(parent: Container) {
    this.root.addChild(this.track, this.fill, this.label);
    parent.addChild(this.root);
  }

  public present(state: PresentationState, layout: PageLayout): void {
    this.root.position.set(layout.timer.x, layout.timer.y);
    const progress = Math.min(Math.max(state.countdown.progress, 0), 1);
    this.fill.clear();

    if (progress > 0) {
      this.fill
        .moveTo(0, 0)
        .lineTo(0, -layout.timer.radius)
        .arc(0, 0, layout.timer.radius, START_ANGLE, START_ANGLE + FULL_CIRCLE * progress)
        .lineTo(0, 0)
        .fill({ color: '#d96d3f' });
    }

    this.label.text = state.countdown.remainingSeconds.toFixed(1);
  }

  public destroy(): void {
    this.root.destroy({ children: true });
  }
}
