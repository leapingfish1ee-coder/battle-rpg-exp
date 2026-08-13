import { Container, Text } from 'pixi.js';
import type { PresentationState } from '../../presentation/PresentationState';
import { PAGE_SPACING, type PageLayout } from '../layout/PageLayout';

const POPUP_DURATION_SECONDS = 1.05;

const easeOutCubic = (value: number): number => 1 - (1 - value) ** 3;

export class DamagePopupView {
  private readonly root = new Container();
  private readonly text = new Text({
    text: '',
    style: {
      align: 'center',
      fill: '#ff6b45',
      fontFamily:
        '"PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", "Source Han Sans SC", sans-serif',
      fontSize: PAGE_SPACING.two,
      fontWeight: '900',
      stroke: { color: '#5a160e', width: PAGE_SPACING.quarter },
      dropShadow: {
        color: '#000000',
        alpha: 0.55,
        blur: 2,
        distance: PAGE_SPACING.quarter / 2,
        angle: Math.PI / 4,
      },
    },
    anchor: 0.5,
  });

  private lastSequence = 0;
  private ageSeconds = POPUP_DURATION_SECONDS;

  public constructor(parent: Container) {
    this.text.visible = false;
    this.root.addChild(this.text);
    parent.addChild(this.root);
  }

  public present(state: PresentationState, layout: PageLayout, deltaSeconds: number): void {
    if (state.damagePopup.sequence !== this.lastSequence) {
      this.lastSequence = state.damagePopup.sequence;

      if (state.damagePopup.sequence > 0) {
        this.ageSeconds = 0;
        this.text.text = `-${state.damagePopup.amount}`;
        this.text.visible = true;
        this.text.alpha = 1;
      }
    }

    if (!this.text.visible) {
      return;
    }

    this.ageSeconds = Math.min(this.ageSeconds + deltaSeconds, POPUP_DURATION_SECONDS);
    const progress = Math.min(this.ageSeconds / POPUP_DURATION_SECONDS, 1);
    const rise = easeOutCubic(progress);
    const fadeStart = 0.62;
    const fadeProgress = Math.max(0, (progress - fadeStart) / (1 - fadeStart));
    const introProgress = Math.min(progress / 0.18, 1);
    const scale = introProgress < 1 ? 0.68 + introProgress * 0.52 : 1.2 - (progress - 0.18) * 0.24;

    this.text.position.set(
      layout.feedback.originX + Math.sin(progress * Math.PI) * layout.feedback.swayDistance,
      layout.feedback.originY - rise * layout.feedback.riseDistance,
    );
    this.text.scale.set(Math.max(scale, 1));
    this.text.alpha = 1 - Math.min(fadeProgress, 1);

    if (progress >= 1) {
      this.text.visible = false;
    }
  }

  public destroy(): void {
    this.root.destroy({ children: true });
  }
}
