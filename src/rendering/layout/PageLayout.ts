export const PAGE_LAYOUT_UNIT = 32;

export const PAGE_SPACING = {
  quarter: PAGE_LAYOUT_UNIT * 0.25,
  half: PAGE_LAYOUT_UNIT * 0.5,
  one: PAGE_LAYOUT_UNIT,
  two: PAGE_LAYOUT_UNIT * 2,
  three: PAGE_LAYOUT_UNIT * 3,
  four: PAGE_LAYOUT_UNIT * 4,
} as const;

export interface PageLayout {
  readonly center: {
    readonly x: number;
    readonly y: number;
  };
  readonly pageInset: number;
  readonly timer: {
    readonly x: number;
    readonly y: number;
    readonly diameter: number;
    readonly radius: number;
    readonly labelFontSize: number;
  };
  readonly feedback: {
    readonly originX: number;
    readonly originY: number;
    readonly riseDistance: number;
    readonly swayDistance: number;
    readonly fontSize: number;
    readonly strokeWidth: number;
    readonly shadowDistance: number;
  };
}

export const resolvePageLayout = (width: number, height: number): PageLayout => {
  const centerX = width / 2;
  const centerY = height / 2;

  return {
    center: {
      x: centerX,
      y: centerY,
    },
    pageInset: PAGE_SPACING.one,
    timer: {
      x: centerX,
      y: centerY,
      diameter: PAGE_LAYOUT_UNIT,
      radius: PAGE_SPACING.half,
      labelFontSize: PAGE_SPACING.half,
    },
    feedback: {
      originX: centerX,
      originY: centerY,
      riseDistance: PAGE_SPACING.four,
      swayDistance: PAGE_SPACING.quarter,
      fontSize: PAGE_SPACING.two,
      strokeWidth: PAGE_SPACING.quarter,
      shadowDistance: PAGE_LAYOUT_UNIT * 0.125,
    },
  };
};
