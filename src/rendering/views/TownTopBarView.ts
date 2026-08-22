import { Container, Graphics, Text } from 'pixi.js';
import type { AdventureState } from '../../domain/adventure-state';

const COLORS = {
  backdrop: 0x080f18,
  backdropRaised: 0x111d2a,
  gold: 0xc9a84c,
  goldBright: 0xe5cb7b,
  ivory: 0xeee8da,
  muted: 0x7f8993,
  dim: 0x56616d,
  statusGreen: 0x45ca50,
  hp: 0x75bd81,
  mp: 0x7897c8,
  shadow: 0x02060a,
};

interface StatusMetricView {
  readonly root: Container;
  readonly label: Text;
  readonly value: Text;
  readonly suffix: Text;
  readonly accent: number;
  width: number;
}

const createKicker = (): Text =>
  new Text({
    text: '',
    style: {
      fill: COLORS.muted,
      fontFamily: 'system-ui, sans-serif',
      fontSize: 8,
      fontWeight: '600',
      letterSpacing: 1.7,
    },
  });

const createPrimaryValue = (): Text =>
  new Text({
    text: '',
    style: {
      fill: COLORS.gold,
      fontFamily: 'Georgia, "Times New Roman", serif',
      fontSize: 32,
      fontWeight: '600',
      letterSpacing: 0.1,
    },
  });

export class TownTopBarView {
  private readonly root = new Container();
  private readonly backdrop = new Graphics();
  private readonly dividers = new Graphics();

  private readonly playerKicker = createKicker();
  private readonly playerValue = createPrimaryValue();
  private readonly weatherKicker = createKicker();
  private readonly weatherValue = createPrimaryValue();
  private readonly locationKicker = createKicker();
  private readonly locationValue = createPrimaryValue();

  private readonly metrics: StatusMetricView[];
  private lastWidth = Number.NaN;

  public constructor(parent: Container, state: AdventureState) {
    this.metrics = [
      this.createMetric('HP', COLORS.hp),
      this.createMetric('MP', COLORS.mp),
      this.createMetric('LV', COLORS.statusGreen),
      this.createMetric('G', COLORS.goldBright),
      this.createMetric('DAY', COLORS.ivory),
      this.createMetric('PTY', COLORS.ivory),
    ];

    for (const text of [
      this.playerKicker,
      this.playerValue,
      this.weatherKicker,
      this.weatherValue,
      this.locationKicker,
      this.locationValue,
    ]) {
      text.anchor.set(0, 0.5);
    }

    this.root.addChild(
      this.backdrop,
      this.dividers,
      this.playerKicker,
      this.playerValue,
      this.weatherKicker,
      this.weatherValue,
      this.locationKicker,
      this.locationValue,
      ...this.metrics.map((metric) => metric.root),
    );
    parent.addChild(this.root);
    this.updateState(state);
  }

  public updateState(state: AdventureState): void {
    const hero = state.party[0];

    this.playerKicker.text = hero ? `TRAVELER · LV ${String(hero.level).padStart(2, '0')} · ${hero.role}` : 'TRAVELER';
    this.playerValue.text = hero?.name ?? '—';
    this.weatherKicker.text = `WEATHER · DAY ${String(state.day).padStart(2, '0')}`;
    this.weatherValue.text = state.weather === 'clear' ? '晴朗' : state.weather;
    this.locationKicker.text = state.townRegion.toUpperCase();
    this.locationValue.text = state.townName;

    this.setMetric(0, hero ? String(hero.hp) : '—', hero ? `/${hero.maxHp}` : '');
    this.setMetric(1, hero ? String(hero.mp) : '—', hero ? `/${hero.maxMp}` : '');
    this.setMetric(2, hero ? String(hero.level) : '—', '/99');
    this.setMetric(3, state.gold.toLocaleString('en-US'), ' G');
    this.setMetric(4, String(state.day), '/999');
    this.setMetric(5, String(state.party.length), '/4');
  }

  public layout(width: number): void {
    if (width === this.lastWidth) return;
    this.lastWidth = width;

    const compact = width < 900;
    const contentY = compact ? 10 : 20;
    const contentHeight = compact ? 54 : 60;
    const totalHeight = contentY + contentHeight;
    const pad = compact ? 18 : Math.max(28, Math.min(60, width * 0.03125));
    const metricsWidth = compact ? Math.min(286, width * 0.38) : Math.max(330, Math.min(400, width * 0.22));
    const metricsX = width - pad - metricsWidth;
    const primaryWidth = Math.max(metricsX - pad, 1);
    const primaryFontSize = compact ? 22 : Math.max(27, Math.min(34, width * 0.018));
    const kickerFontSize = compact ? 6 : 8;

    this.drawBackdrop(width, totalHeight, pad, metricsX, contentY, contentHeight);

    const profileX = pad;
    const weatherX = pad + primaryWidth * 0.315;
    const locationX = pad + primaryWidth * 0.655;
    const kickerY = contentY + 10;
    const valueY = contentY + contentHeight * 0.59;

    for (const kicker of [this.playerKicker, this.weatherKicker, this.locationKicker]) {
      kicker.style.fontSize = kickerFontSize;
    }
    for (const value of [this.playerValue, this.weatherValue, this.locationValue]) {
      value.style.fontSize = primaryFontSize;
    }

    this.playerKicker.position.set(profileX, kickerY);
    this.playerValue.position.set(profileX, valueY);
    this.weatherKicker.position.set(weatherX, kickerY);
    this.weatherValue.position.set(weatherX, valueY);
    this.locationKicker.position.set(locationX, kickerY);
    this.locationValue.position.set(locationX, valueY);

    this.layoutMetrics(metricsX, contentY, metricsWidth, contentHeight, compact);
  }

  private createMetric(label: string, accent: number): StatusMetricView {
    const root = new Container();
    const labelText = new Text({
      text: label,
      style: {
        fill: COLORS.dim,
        fontFamily: 'monospace',
        fontSize: 7,
        fontWeight: '700',
        letterSpacing: 0.3,
      },
    });
    const value = new Text({
      text: '',
      style: {
        fill: accent,
        fontFamily: 'monospace',
        fontSize: 18,
        fontWeight: '700',
      },
    });
    const suffix = new Text({
      text: '',
      style: {
        fill: COLORS.dim,
        fontFamily: 'monospace',
        fontSize: 9,
        fontWeight: '500',
      },
    });

    labelText.anchor.set(0, 0.5);
    value.anchor.set(0, 0.5);
    suffix.anchor.set(0, 0.5);
    root.addChild(labelText, value, suffix);
    return { root, label: labelText, value, suffix, accent, width: 100 };
  }

  private setMetric(index: number, value: string, suffix: string): void {
    const metric = this.metrics[index];
    if (!metric) return;
    metric.value.text = value;
    metric.suffix.text = suffix;
    metric.value.style.fill = metric.accent;
    this.positionMetricText(metric);
  }

  private layoutMetrics(
    x: number,
    y: number,
    width: number,
    height: number,
    compact: boolean,
  ): void {
    const columnGap = compact ? 8 : 20;
    const rowGap = compact ? 0 : 2;
    const cellWidth = (width - columnGap * 2) / 3;
    const cellHeight = (height - rowGap) / 2;

    this.metrics.forEach((metric, index) => {
      const column = index % 3;
      const row = Math.floor(index / 3);
      metric.width = cellWidth;
      metric.root.position.set(x + column * (cellWidth + columnGap), y + row * (cellHeight + rowGap));
      metric.label.style.fontSize = compact ? 6 : 7;
      metric.value.style.fontSize = compact ? 14 : 18;
      metric.suffix.style.fontSize = compact ? 7 : 9;
      metric.label.position.set(0, cellHeight * 0.54);
      metric.value.position.set(compact ? 18 : 21, cellHeight * 0.45);
      this.positionMetricText(metric);
    });
  }

  private positionMetricText(metric: StatusMetricView): void {
    const desiredX = metric.value.x + metric.value.width + 2;
    metric.suffix.position.set(Math.min(desiredX, metric.width - metric.suffix.width), metric.value.y + 3);
  }

  private drawBackdrop(
    width: number,
    height: number,
    pad: number,
    metricsX: number,
    contentY: number,
    contentHeight: number,
  ): void {
    this.backdrop.clear();
    this.backdrop.rect(0, 0, width, height).fill({ color: COLORS.backdrop, alpha: 0.9 });
    this.backdrop.rect(0, contentY, width, contentHeight).fill({ color: COLORS.backdropRaised, alpha: 0.24 });
    this.backdrop.rect(0, height - 5, width, 5).fill({ color: COLORS.shadow, alpha: 0.42 });
    this.backdrop.moveTo(pad, height - 1).lineTo(width - pad, height - 1).stroke({ color: COLORS.gold, alpha: 0.58, width: 1 });

    this.dividers.clear();
    this.dividers
      .moveTo(metricsX - 20, contentY + 8)
      .lineTo(metricsX - 20, contentY + contentHeight - 8)
      .stroke({ color: COLORS.gold, alpha: 0.18, width: 1 });
  }
}
