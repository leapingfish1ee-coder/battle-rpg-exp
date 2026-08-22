import { Container, Graphics, Text } from 'pixi.js';
import type { AdventureState, TownFacility } from '../../domain/adventure-state';

export type RenderQuality = 'high' | 'medium' | 'low';

const COLORS = {
  navyDeep: 0x091522,
  navy: 0x102238,
  navyRaised: 0x172d47,
  navySelected: 0x223d5c,
  oldGold: 0xb99a57,
  gold: 0xd1b56f,
  goldBright: 0xead49a,
  ivory: 0xeee8da,
  text: 0xd8d7d3,
  muted: 0x9da9b4,
  dim: 0x6d7a88,
  hp: 0x6f9f78,
  mp: 0x6d88b3,
  shadow: 0x050b12,
};

interface TownSceneCallbacks {
  readonly onSelectFacility: (facility: TownFacility) => void;
}

interface MenuRow {
  readonly root: Container;
  readonly frame: Graphics;
  readonly marker: Graphics;
  readonly label: Text;
  readonly subtitle: Text;
  readonly facility: TownFacility;
  width: number;
  height: number;
}

export class TownSceneView {
  private readonly root = new Container();
  private readonly ui = new Container();
  private readonly chrome = new Graphics();
  private readonly crest = new Graphics();
  private readonly header = new Container();
  private readonly quality: RenderQuality;

  private readonly locationLabel = new Text({
    text: '',
    style: {
      fill: COLORS.ivory,
      fontFamily: 'Georgia, "Times New Roman", serif',
      fontSize: 31,
      fontWeight: '600',
      letterSpacing: 0.3,
    },
  });
  private readonly regionLabel = new Text({
    text: '',
    style: { fill: COLORS.gold, fontFamily: 'system-ui, sans-serif', fontSize: 10, letterSpacing: 2.4 },
  });
  private readonly dayLabel = new Text({
    text: '',
    style: { fill: COLORS.text, fontFamily: 'monospace', fontSize: 10, letterSpacing: 1.4 },
  });
  private readonly currencyLabel = new Text({
    text: '',
    style: { fill: COLORS.goldBright, fontFamily: 'Georgia, serif', fontSize: 14, fontWeight: '600' },
  });
  private readonly menuKicker = new Text({
    text: 'ROYAL CAPITAL',
    style: { fill: COLORS.dim, fontFamily: 'monospace', fontSize: 8, letterSpacing: 2.8 },
  });
  private readonly menuTitle = new Text({
    text: '城 镇 指 引',
    style: { fill: COLORS.goldBright, fontFamily: 'Georgia, serif', fontSize: 18, fontWeight: '600', letterSpacing: 2.5 },
  });
  private readonly objectiveKicker = new Text({
    text: 'CURRENT OBJECTIVE',
    style: { fill: COLORS.oldGold, fontFamily: 'monospace', fontSize: 8, letterSpacing: 1.9 },
  });
  private readonly objectiveText = new Text({
    text: '',
    style: { fill: COLORS.text, fontFamily: 'system-ui, sans-serif', fontSize: 13 },
  });
  private readonly facilityKicker = new Text({
    text: 'SELECTED DESTINATION',
    style: { fill: COLORS.dim, fontFamily: 'monospace', fontSize: 8, letterSpacing: 1.7 },
  });
  private readonly facilityTitle = new Text({
    text: '',
    style: { fill: COLORS.ivory, fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 22, fontWeight: '600' },
  });
  private readonly facilityDescription = new Text({
    text: '',
    style: {
      fill: COLORS.muted,
      fontFamily: 'system-ui, sans-serif',
      fontSize: 12,
      lineHeight: 19,
      wordWrap: true,
      wordWrapWidth: 460,
    },
  });
  private readonly partyKicker = new Text({
    text: 'TRAVELER',
    style: { fill: COLORS.oldGold, fontFamily: 'monospace', fontSize: 8, letterSpacing: 1.8 },
  });
  private readonly partyName = new Text({
    text: '',
    style: { fill: COLORS.ivory, fontFamily: 'Georgia, serif', fontSize: 17, fontWeight: '600' },
  });
  private readonly partyRole = new Text({
    text: '',
    style: { fill: COLORS.muted, fontFamily: 'system-ui, sans-serif', fontSize: 10, letterSpacing: 0.8 },
  });
  private readonly partyStats = new Text({
    text: '',
    style: { fill: COLORS.text, fontFamily: 'monospace', fontSize: 10, letterSpacing: 0.2 },
  });
  private readonly prompt = new Text({
    text: '↑↓ / W S  选择    ENTER  确认    鼠标  直接选择',
    style: { fill: COLORS.dim, fontFamily: 'monospace', fontSize: 8, letterSpacing: 0.7 },
  });
  private readonly qualityLabel = new Text({
    text: '',
    style: { fill: COLORS.dim, fontFamily: 'monospace', fontSize: 7, letterSpacing: 1.2 },
  });

  private readonly menuRows: MenuRow[] = [];
  private state: AdventureState;
  private lastWidth = Number.NaN;
  private lastHeight = Number.NaN;

  public constructor(
    parent: Container,
    state: AdventureState,
    callbacks: TownSceneCallbacks,
    quality: RenderQuality = 'high',
  ) {
    this.state = state;
    this.quality = quality;

    this.locationLabel.anchor.set(0, 0.5);
    this.regionLabel.anchor.set(0, 0.5);
    this.dayLabel.anchor.set(1, 0.5);
    this.currencyLabel.anchor.set(1, 0.5);
    this.menuKicker.anchor.set(0, 0.5);
    this.menuTitle.anchor.set(0, 0.5);
    this.objectiveKicker.anchor.set(0, 0.5);
    this.objectiveText.anchor.set(0, 0.5);
    this.facilityKicker.anchor.set(0, 0.5);
    this.facilityTitle.anchor.set(0, 0.5);
    this.facilityDescription.anchor.set(0, 0);
    this.partyKicker.anchor.set(0, 0.5);
    this.partyName.anchor.set(0, 0.5);
    this.partyRole.anchor.set(0, 0.5);
    this.partyStats.anchor.set(0, 0.5);
    this.prompt.anchor.set(0.5, 1);
    this.qualityLabel.anchor.set(1, 1);
    this.qualityLabel.text = `${this.quality.toUpperCase()} · PRECISION`;

    for (const facility of state.facilities) {
      const root = new Container();
      const frame = new Graphics();
      const marker = new Graphics();
      const label = new Text({
        text: facility.label,
        style: { fill: COLORS.text, fontFamily: 'system-ui, sans-serif', fontSize: 14, fontWeight: '600', letterSpacing: 0.4 },
      });
      const subtitle = new Text({
        text: facility.subtitle,
        style: { fill: COLORS.dim, fontFamily: 'monospace', fontSize: 8, letterSpacing: 1.3 },
      });
      label.anchor.set(0, 0.5);
      subtitle.anchor.set(1, 0.5);
      root.eventMode = 'static';
      root.cursor = 'pointer';
      root.on('pointertap', () => callbacks.onSelectFacility(facility.id));
      root.addChild(frame, marker, label, subtitle);
      this.menuRows.push({ root, frame, marker, label, subtitle, facility: facility.id, width: 300, height: 52 });
    }

    this.header.addChild(this.crest, this.locationLabel, this.regionLabel, this.dayLabel, this.currencyLabel);
    this.ui.addChild(
      this.chrome,
      this.header,
      this.menuKicker,
      this.menuTitle,
      this.objectiveKicker,
      this.objectiveText,
      this.facilityKicker,
      this.facilityTitle,
      this.facilityDescription,
      this.partyKicker,
      this.partyName,
      this.partyRole,
      this.partyStats,
      this.prompt,
      this.qualityLabel,
      ...this.menuRows.map((row) => row.root),
    );
    this.root.addChild(this.ui);
    parent.addChild(this.root);
    this.updateState(state);
  }

  public updateState(state: AdventureState): void {
    this.state = state;
    const selected = state.facilities.find((facility) => facility.id === state.selectedFacility) ?? state.facilities[0];
    const hero = state.party[0];

    this.locationLabel.text = state.townName;
    this.regionLabel.text = state.townRegion.toUpperCase();
    this.dayLabel.text = `DAY ${String(state.day).padStart(2, '0')}  ·  CLEAR`;
    this.currencyLabel.text = `${state.gold.toLocaleString('en-US')} G`;
    this.objectiveText.text = state.objective;
    this.facilityTitle.text = selected?.label ?? '';
    this.facilityDescription.text = selected?.description ?? '';

    if (hero) {
      this.partyName.text = `${hero.name}  Lv.${hero.level}`;
      this.partyRole.text = hero.role;
      this.partyStats.text = `HP ${hero.hp}/${hero.maxHp}     MP ${hero.mp}/${hero.maxMp}`;
    }

    for (const row of this.menuRows) this.drawMenuRow(row, row.facility === state.selectedFacility);
  }

  public present(width: number, height: number, elapsedSeconds: number): void {
    void elapsedSeconds;
    if (width === this.lastWidth && height === this.lastHeight) return;
    this.lastWidth = width;
    this.lastHeight = height;
    this.layout(width, height);
  }

  private layout(width: number, height: number): void {
    const compact = width < 900 || height < 620;
    const pad = compact ? 18 : 28;
    const menuWidth = compact ? Math.min(300, width * 0.38) : Math.min(356, width * 0.3);
    const bottomHeight = compact ? 170 : 188;
    const menuX = width - menuWidth - pad;
    const menuY = compact ? 92 : 108;

    this.drawChrome(width, height, pad, menuX, menuY, menuWidth, bottomHeight, compact);
    this.drawCrest(pad, 38, compact ? 18 : 22);

    this.locationLabel.style.fontSize = compact ? 23 : 31;
    this.locationLabel.position.set(pad + (compact ? 32 : 40), 38);
    this.regionLabel.position.set(pad + (compact ? 185 : 248), 40);
    this.dayLabel.position.set(width - pad, 30);
    this.currencyLabel.position.set(width - pad, 51);

    this.menuKicker.position.set(menuX + 19, menuY + 17);
    this.menuTitle.style.fontSize = compact ? 15 : 18;
    this.menuTitle.position.set(menuX + 19, menuY + 36);
    const rowHeight = compact ? 46 : 52;
    const rowGap = compact ? 5 : 7;
    this.menuRows.forEach((row, index) => {
      row.root.position.set(menuX + 10, menuY + 52 + index * (rowHeight + rowGap));
      row.width = menuWidth - 20;
      row.height = rowHeight;
      row.label.style.fontSize = compact ? 12 : 14;
      row.label.position.set(22, rowHeight / 2 - 1);
      row.subtitle.position.set(menuWidth - 38, rowHeight / 2);
      this.drawMenuRow(row, row.facility === this.state.selectedFacility);
    });

    const detailX = pad + (compact ? 150 : 198);
    const detailY = height - bottomHeight + 52;
    this.objectiveKicker.position.set(detailX, detailY - 31);
    this.objectiveText.style.fontSize = compact ? 10 : 12;
    this.objectiveText.position.set(detailX, detailY - 11);
    this.facilityKicker.position.set(detailX, detailY + 20);
    this.facilityTitle.style.fontSize = compact ? 17 : 22;
    this.facilityTitle.position.set(detailX, detailY + 42);
    this.facilityDescription.style.fontSize = compact ? 9 : 11;
    this.facilityDescription.style.lineHeight = compact ? 16 : 19;
    this.facilityDescription.style.wordWrapWidth = Math.max(180, width - menuWidth - detailX - pad * 2);
    this.facilityDescription.position.set(detailX, detailY + 59);

    this.partyKicker.position.set(pad + 18, detailY - 31);
    this.partyName.position.set(pad + 18, detailY - 7);
    this.partyRole.position.set(pad + 18, detailY + 18);
    this.partyStats.style.fontSize = compact ? 8 : 10;
    this.partyStats.position.set(pad + 18, detailY + 46);
    this.prompt.position.set(width / 2, height - 9);
    this.prompt.visible = height >= 500;
    this.qualityLabel.position.set(width - pad, height - 8);
    this.qualityLabel.visible = !compact;
  }

  private drawChrome(
    width: number,
    height: number,
    pad: number,
    menuX: number,
    menuY: number,
    menuWidth: number,
    bottomHeight: number,
    compact: boolean,
  ): void {
    this.chrome.clear();
    this.chrome.rect(0, 0, width, 76).fill({ color: COLORS.shadow, alpha: 0.82 });
    this.chrome.moveTo(pad, 67).lineTo(width - pad, 67).stroke({ color: COLORS.oldGold, alpha: 0.55, width: 1 });

    const menuHeight = compact ? 310 : 354;
    this.chrome
      .roundRect(menuX, menuY, menuWidth, menuHeight, 8)
      .fill({ color: COLORS.navyDeep, alpha: 0.96 })
      .stroke({ color: COLORS.oldGold, alpha: 0.82, width: 1 });
    this.chrome
      .roundRect(menuX + 5, menuY + 5, menuWidth - 10, menuHeight - 10, 6)
      .stroke({ color: COLORS.ivory, alpha: 0.1, width: 1 });

    const bottomY = height - bottomHeight;
    this.chrome.rect(0, bottomY, width, bottomHeight).fill({ color: COLORS.navyDeep, alpha: 0.98 });
    this.chrome.moveTo(0, bottomY).lineTo(width, bottomY).stroke({ color: COLORS.oldGold, alpha: 0.8, width: 2 });

    const partyCardWidth = compact ? 140 : 178;
    this.chrome
      .roundRect(pad, bottomY + 20, partyCardWidth, bottomHeight - 48, 7)
      .fill({ color: COLORS.navy, alpha: 0.9 })
      .stroke({ color: COLORS.oldGold, alpha: 0.35, width: 1 });
    this.chrome.rect(pad + 18, bottomY + 84, partyCardWidth - 36, 5).fill({ color: 0x26364c });
    this.chrome.rect(pad + 18, bottomY + 84, partyCardWidth - 36, 5).fill({ color: COLORS.hp });
    this.chrome.rect(pad + 18, bottomY + 96, partyCardWidth - 36, 4).fill({ color: 0x26364c });
    this.chrome.rect(pad + 18, bottomY + 96, partyCardWidth - 36, 4).fill({ color: COLORS.mp });
  }

  private drawCrest(x: number, y: number, size: number): void {
    this.crest.clear();
    this.crest.circle(x + size / 2, y, size / 2).stroke({ color: COLORS.oldGold, alpha: 0.8, width: 1.5 });
    this.crest.moveTo(x + size / 2, y - size * 0.32).lineTo(x + size / 2, y + size * 0.32).stroke({ color: COLORS.gold, alpha: 0.72, width: 1 });
    this.crest.moveTo(x + size * 0.2, y).lineTo(x + size * 0.8, y).stroke({ color: COLORS.gold, alpha: 0.72, width: 1 });
  }

  private drawMenuRow(row: MenuRow, selected: boolean): void {
    const { width, height } = row;
    row.frame
      .clear()
      .roundRect(0, 0, width, height, 5)
      .fill({ color: selected ? COLORS.navySelected : COLORS.navyRaised, alpha: selected ? 1 : 0.94 });
    if (selected) row.frame.stroke({ color: COLORS.goldBright, alpha: 0.95, width: 1 });
    row.marker.clear();
    if (selected) {
      row.marker
        .moveTo(8, height / 2)
        .lineTo(14, height / 2 - 5)
        .lineTo(14, height / 2 + 5)
        .closePath()
        .fill({ color: COLORS.goldBright });
    }
    row.label.style.fill = selected ? COLORS.ivory : COLORS.text;
    row.subtitle.style.fill = selected ? COLORS.gold : COLORS.dim;
  }

  public destroy(): void {
    this.root.destroy({ children: true });
  }
}
