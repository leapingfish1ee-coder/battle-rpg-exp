import { describe, expect, it } from 'vitest';
import {
  PAGE_EFFECT_STYLE,
  PAGE_TYPOGRAPHY,
} from '../../src/rendering/style/PageTypography';

describe('PageTypography', () => {
  it('keeps typography below the 32 px component reference', () => {
    expect(PAGE_TYPOGRAPHY.timerLabel.fontSize).toBe(12);
    expect(PAGE_TYPOGRAPHY.floatingFeedback.fontSize).toBe(24);
  });

  it('keeps transient feedback effects compact', () => {
    expect(PAGE_EFFECT_STYLE.floatingFeedback.strokeWidth).toBe(2);
    expect(PAGE_EFFECT_STYLE.floatingFeedback.shadowDistance).toBe(2);
    expect(PAGE_EFFECT_STYLE.floatingFeedback.shadowBlur).toBe(1);
    expect(PAGE_EFFECT_STYLE.floatingFeedback.shadowAlpha).toBe(0.35);
  });
});
