import { Container, Text } from 'pixi.js';
import type { PresentationState } from '../../presentation/PresentationState';
import { resolveDamagePopupMotion } from '../animation/DamagePopupMotion';
import type { PageLayout } from '../layout/PageLayout';
import { PAGE_EFFECT_STYLE, PAGE_TYPOGRAPHY } from '../style/PageTypography';

const POPUP_DURATION_SECONDS = 0.72;
const MOTION_VECTOR_SAMPLE_PROGRESS = 0.045;
const MIN_TRAIL_ALPHA = 0.004;

const createPopupText = (withShadow: boolean): Text =>
  new Text({
    text: '',
    style: {
      align: 'center',
      fill: '#ff6b45',
      fontFamily:
        '"PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", "Source Han Sans SC", sans-serif',
      fontSize: PAGE_TYPOGRAPHY.floatingFeedback.fontSize,
      fontWeight: PAGE_TYPOGRAPHY.floatingFeedback.fontWeight,
      stroke: { color: '#5a160e', width: PAGE_EFFECT_STYLE.floatingFeedback.strokeWidth },
      ...(withShadow
        ? {
            dropShadow: {
              color: '#000000',
              alpha: PAGE_EFFECT_STYLE.floatingFeedback.shadowAlpha,
              blur: PAGE_EFFECT_STYLE.floatingFeedback.shadowBlur,
              distance: PAGE_EFFECT_STYLE.floatingFeedback.shadowDistance,
              angle: Math.PI / 4,
            },
          }
        : {}),
    },
    anchor: 0.5,
  });

export class DamagePopupView {
  private readonly root = new Container();
  private readonly text = createPopupText(true);
  private readonly trails = PAGE_EFFECT_STYLE.floatingFeedback.motionBlurSamples.map(() =>
    createPopupText(false),
  );

  private lastSequence = 0;
  private ageSeconds = POPUP_DURATION_SECONDS;
  private lateralDirection = 1;

  public constructor(parent: Container) {
    this.text.visible = false;

    for (const trail of this.trails) {
      trail.visible = false;
      this.root.addChild(trail);
    }

    this.root.addChild(this.text);
    parent.addChild(this.root);
  }

  public present(state: PresentationState, layout: PageLayout, deltaSeconds: number): void {
    if (state.damagePopup.sequence !== this.lastSequence) {
      this.lastSequence = state.damagePopup.sequence;

      if (state.damagePopup.sequence > 0) {
        this.ageSeconds = 0;
        this.lateralDirection = state.damagePopup.sequence % 2 === 0 ? -1 : 1;
        const value = `-${state.damagePopup.amount}`;

        this.text.text = value;
        this.text.visible = true;
        this.text.alpha = 1;

        for (const trail of this.trails) {
          trail.text = value;
          trail.visible = false;
        }
      }
    }

    if (!this.text.visible) {
      return;
    }

    this.ageSeconds = Math.min(this.ageSeconds + deltaSeconds, POPUP_DURATION_SECONDS);
    const progress = Math.min(this.ageSeconds / POPUP_DURATION_SECONDS, 1);
    const motion = resolveDamagePopupMotion(progress);
    const currentPosition = this.resolvePosition(progress, layout);
    const previousPosition = this.resolvePosition(
      Math.max(0, progress - MOTION_VECTOR_SAMPLE_PROGRESS),
      layout,
    );
    const velocityX = currentPosition.x - previousPosition.x;
    const velocityY = currentPosition.y - previousPosition.y;
    const velocityLength = Math.hypot(velocityX, velocityY);

    this.text.position.set(currentPosition.x, currentPosition.y);
    this.text.scale.set(motion.scale);
    this.text.alpha = motion.opacity;

    for (let index = 0; index < this.trails.length; index += 1) {
      const trail = this.trails[index];
      const sample = PAGE_EFFECT_STYLE.floatingFeedback.motionBlurSamples[index];
      const alpha = motion.opacity * motion.blurStrength * sample.alpha;

      if (velocityLength <= 0.001 || alpha <= MIN_TRAIL_ALPHA) {
        trail.visible = false;
        continue;
      }

      const distance = sample.distance * motion.blurStrength;
      trail.position.set(
        currentPosition.x - (velocityX / velocityLength) * distance,
        currentPosition.y - (velocityY / velocityLength) * distance,
      );
      trail.scale.set(motion.scale);
      trail.alpha = alpha;
      trail.visible = true;
    }

    if (progress >= 1) {
      this.text.visible = false;
      for (const trail of this.trails) {
        trail.visible = false;
      }
    }
  }

  private resolvePosition(progress: number, layout: PageLayout): { x: number; y: number } {
    const motion = resolveDamagePopupMotion(progress);

    return {
      x:
        layout.feedback.originX +
        this.lateralDirection * motion.lateralProgress * layout.feedback.swayDistance,
      y: layout.feedback.originY - motion.riseProgress * layout.feedback.riseDistance,
    };
  }

  public destroy(): void {
    this.root.destroy({ children: true });
  }
}
