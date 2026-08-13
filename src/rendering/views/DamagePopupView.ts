import { Container, Text } from 'pixi.js';
import type { PresentationState } from '../../presentation/PresentationState';
import { resolveDamagePopupMotion } from '../animation/DamagePopupMotion';
import type { PageLayout } from '../layout/PageLayout';
import { PAGE_EFFECT_STYLE, PAGE_TYPOGRAPHY } from '../style/PageTypography';

const POPUP_DURATION_SECONDS = 1.05;

export class DamagePopupView {
  private readonly root = new Container();
  private readonly text = new Text({
    text: '',
    style: {
      align: 'center',
      fill: '#ff6b45',
      fontFamily:
        '"PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", "Source Han Sans SC", sans-serif',
      fontSize: PAGE_TYPOGRAPHY.floatingFeedback.fontSize,
      fontWeight: PAGE_TYPOGRAPHY.floatingFeedback.fontWeight,
      stroke: { color: '#5a160e', width: PAGE_EFFECT_STYLE.floatingFeedback.strokeWidth },
      dropShadow: {
        color: '#000000',
        alpha: PAGE_EFFECT_STYLE.floatingFeedback.shadowAlpha,
        blur: PAGE_EFFECT_STYLE.floatingFeedback.shadowBlur,
        distance: PAGE_EFFECT_STYLE.floatingFeedback.shadowDistance,
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
    const motion = resolveDamagePopupMotion(progress);

    this.text.position.set(
      layout.feedback.originX + Math.sin(progress * Math.PI) * layout.feedback.swayDistance,
      layout.feedback.originY - motion.riseProgress * layout.feedback.riseDistance,
    );
    this.text.scale.set(motion.scale);
    this.text.alpha = motion.opacity;

    if (progress >= 1) {
      this.text.visible = false;
    }
  }

  public destroy(): void {
    this.root.destroy({ children: true });
  }
}
