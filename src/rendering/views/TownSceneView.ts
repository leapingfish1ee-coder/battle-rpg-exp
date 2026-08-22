import { BlurFilter, ColorMatrixFilter, Container, Graphics, Text } from 'pixi.js';
import type { AdventureState, TownFacility } from '../../domain/adventure-state';

export type RenderQuality = 'high' | 'medium' | 'low';

const COLORS = {
  skyZenith: 0x607f9e,
  skyHigh: 0x86a8bf,
  skyHaze: 0xc7c6b4,
  skyHorizon: 0xe5cda3,
  mountainFar: 0x758391,
  mountainNear: 0x596b79,
  stoneLight: 0xd8cfba,
  stone: 0xbdb39d,
  stoneShade: 0x8f897d,
  stoneDeep: 0x625f5b,
  roof: 0x344151,
  roofLight: 0x52606e,
  timber: 0x59473d,
  plaza: 0xaaa08e,
  plazaShade: 0x7a746a,
  water: 0x7195a1,
  waterLight: 0xbad9d6,
  banner: 0x6d2933,
  bannerLight: 0x8a3b44,
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
  lamp: 0xffd990,
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

const mixColor = (from: number, to: number, amount: number): number => {
  const t = Math.min(Math.max(amount, 0), 1);
  const ar = (from >> 16) & 0xff;
  const ag = (from >> 8) & 0xff;
  const ab = from & 0xff;
  const br = (to >> 16) & 0xff;
  const bg = (to >> 8) & 0xff;
  const bb = to & 0xff;
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const b = Math.round(ab + (bb - ab) * t);
  return (r << 16) | (g << 8) | b;
};

export class TownSceneView {
  private readonly root = new Container();
  private readonly world = new Container();
  private readonly sky = new Graphics();
  private readonly distant = new Graphics();
  private readonly architecture = new Graphics();
  private readonly plaza = new Graphics();
  private readonly lightBloom = new Graphics();
  private readonly atmosphere = new Graphics();
  private readonly screenFx = new Graphics();
  private readonly ui = new Container();
  private readonly chrome = new Graphics();
  private readonly crest = new Graphics();
  private readonly header = new Container();
  private readonly colorGrade = new ColorMatrixFilter();
  private readonly bloomBlur: BlurFilter;
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
  private elapsedSeconds = 0;

  public constructor(parent: Container, state: AdventureState, callbacks: TownSceneCallbacks, quality: RenderQuality = 'high') {
    this.state = state;
    this.quality = quality;
    this.bloomBlur = new BlurFilter(quality === 'high' ? 10 : quality === 'medium' ? 6 : 3);
    this.configurePostProcessing();

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
    this.qualityLabel.text = `${quality.toUpperCase()} · PRECISION`;

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
    this.world.addChild(this.sky, this.distant, this.architecture, this.plaza);
    this.root.addChild(this.world, this.lightBloom, this.atmosphere, this.screenFx, this.ui);
    parent.addChild(this.root);
    this.updateState(state);
  }

  private configurePostProcessing(): void {
    this.colorGrade.contrast(0.56, false);
    this.colorGrade.saturate(-0.08, true);
    this.colorGrade.brightness(1.02, true);
    this.colorGrade.alpha = this.quality === 'low' ? 0.48 : 0.72;
    this.world.filters = [this.colorGrade];
    this.lightBloom.filters = [this.bloomBlur];
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
    this.elapsedSeconds = elapsedSeconds;
    const resized = width !== this.lastWidth || height !== this.lastHeight;
    if (resized) {
      this.lastWidth = width;
      this.lastHeight = height;
      this.layout(width, height);
    }
    this.drawAtmosphere(width, height);
  }

  private layout(width: number, height: number): void {
    const compact = width < 900 || height < 620;
    const pad = compact ? 18 : 28;
    const menuWidth = compact ? Math.min(300, width * 0.38) : Math.min(356, width * 0.3);
    const bottomHeight = compact ? 170 : 188;
    const menuX = width - menuWidth - pad;
    const menuY = compact ? 92 : 108;
    const sceneBottom = height - bottomHeight;

    this.drawSky(width, sceneBottom);
    this.drawDistantCity(width, sceneBottom);
    this.drawArchitecture(width, sceneBottom);
    this.drawPlaza(width, sceneBottom);
    this.drawLighting(width, sceneBottom);
    this.drawScreenFx(width, height, sceneBottom);
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

  private drawSky(width: number, sceneBottom: number): void {
    this.sky.clear();
    const steps = this.quality === 'low' ? 16 : 32;
    const height = sceneBottom * 0.74;
    for (let index = 0; index < steps; index += 1) {
      const t = index / Math.max(steps - 1, 1);
      const color = t < 0.62
        ? mixColor(COLORS.skyZenith, COLORS.skyHaze, t / 0.62)
        : mixColor(COLORS.skyHaze, COLORS.skyHorizon, (t - 0.62) / 0.38);
      const y = (height / steps) * index;
      this.sky.rect(0, y, width, height / steps + 1.5).fill({ color });
    }
    const sunX = width * 0.19;
    const sunY = sceneBottom * 0.22;
    this.sky.circle(sunX, sunY, Math.max(25, sceneBottom * 0.052)).fill({ color: 0xf2dfb3, alpha: 0.68 });
    this.sky.circle(sunX, sunY, Math.max(38, sceneBottom * 0.082)).fill({ color: 0xf5e7c6, alpha: 0.09 });
  }

  private drawDistantCity(width: number, sceneBottom: number): void {
    this.distant.clear();
    const horizon = sceneBottom * 0.48;
    const far = [
      [0, 30], [0.08, -24], [0.16, 10], [0.25, -42], [0.34, -8], [0.43, -60],
      [0.54, -12], [0.63, -48], [0.73, 2], [0.84, -38], [0.92, -6], [1, -34],
    ] as const;
    this.distant.moveTo(0, sceneBottom * 0.72);
    for (const [x, y] of far) this.distant.lineTo(width * x, horizon + y);
    this.distant.lineTo(width, sceneBottom * 0.72).closePath().fill({ color: COLORS.mountainFar, alpha: 0.62 });

    this.distant.moveTo(0, sceneBottom * 0.69);
    this.distant.lineTo(width * 0.08, horizon + 22);
    this.distant.lineTo(width * 0.18, horizon - 16);
    this.distant.lineTo(width * 0.29, horizon + 18);
    this.distant.lineTo(width * 0.41, horizon - 28);
    this.distant.lineTo(width * 0.57, horizon + 9);
    this.distant.lineTo(width * 0.7, horizon - 23);
    this.distant.lineTo(width * 0.84, horizon + 17);
    this.distant.lineTo(width, horizon - 9);
    this.distant.lineTo(width, sceneBottom * 0.7).closePath().fill({ color: COLORS.mountainNear, alpha: 0.54 });

    const skylineY = sceneBottom * 0.57;
    for (let index = 0; index < 16; index += 1) {
      const buildingWidth = width / 15;
      const x = index * buildingWidth - buildingWidth * 0.2;
      const h = 26 + ((index * 19) % 44);
      this.distant.rect(x, skylineY - h, buildingWidth * 0.82, h).fill({ color: 0x68747d, alpha: 0.38 });
      if (index % 4 === 1) {
        this.distant.moveTo(x - 4, skylineY - h).lineTo(x + buildingWidth * 0.41, skylineY - h - 30).lineTo(x + buildingWidth * 0.86, skylineY - h).closePath().fill({ color: 0x586673, alpha: 0.42 });
      }
    }
  }

  private drawArchitecture(width: number, sceneBottom: number): void {
    this.architecture.clear();
    const plazaTop = sceneBottom * 0.66;
    const center = width * 0.5;

    this.drawTownhouse(width * 0.08, plazaTop + 18, width * 0.15, sceneBottom * 0.31, -1, true);
    this.drawTownhouse(width * 0.23, plazaTop + 8, width * 0.17, sceneBottom * 0.35, 1, false);
    this.drawTownhouse(width * 0.78, plazaTop + 8, width * 0.17, sceneBottom * 0.35, -1, false);
    this.drawTownhouse(width * 0.93, plazaTop + 19, width * 0.15, sceneBottom * 0.3, 1, true);
    this.drawCathedral(center, plazaTop + 8, Math.min(width * 0.28, 360), Math.min(sceneBottom * 0.56, 360));

    const leftLamp = width * 0.35;
    const rightLamp = width * 0.65;
    for (const x of [leftLamp, rightLamp]) {
      this.architecture.rect(x - 2, plazaTop - 24, 4, 82).fill({ color: 0x3d3d3d });
      this.architecture.rect(x - 10, plazaTop - 26, 20, 4).fill({ color: 0x3d3d3d });
      this.architecture.roundRect(x - 7, plazaTop - 46, 14, 21, 3).fill({ color: 0x2d3439 }).stroke({ color: COLORS.oldGold, alpha: 0.8, width: 1 });
      this.architecture.rect(x - 4, plazaTop - 42, 8, 13).fill({ color: COLORS.lamp, alpha: 0.82 });
    }
  }

  private drawCathedral(centerX: number, baseY: number, width: number, height: number): void {
    const bodyWidth = width * 0.6;
    const bodyX = centerX - bodyWidth / 2;
    const bodyY = baseY - height * 0.64;
    const towerWidth = width * 0.16;
    const towerHeight = height * 0.79;

    this.architecture.rect(bodyX, bodyY, bodyWidth, baseY - bodyY).fill({ color: COLORS.stoneLight });
    this.architecture.rect(bodyX, bodyY + (baseY - bodyY) * 0.58, bodyWidth, (baseY - bodyY) * 0.42).fill({ color: COLORS.stone, alpha: 0.72 });
    this.architecture.moveTo(bodyX - 10, bodyY).lineTo(centerX, bodyY - height * 0.18).lineTo(bodyX + bodyWidth + 10, bodyY).closePath().fill({ color: COLORS.roof });
    this.architecture.moveTo(bodyX + 8, bodyY + 4).lineTo(centerX, bodyY - height * 0.145).lineTo(bodyX + bodyWidth - 8, bodyY + 4).closePath().stroke({ color: COLORS.roofLight, alpha: 0.72, width: 2 });

    for (const side of [-1, 1] as const) {
      const towerX = centerX + side * width * 0.33 - towerWidth / 2;
      const towerY = baseY - towerHeight;
      this.architecture.rect(towerX, towerY, towerWidth, towerHeight).fill({ color: COLORS.stone });
      this.architecture.rect(towerX + 4, towerY + 5, towerWidth - 8, towerHeight - 5).stroke({ color: COLORS.stoneDeep, alpha: 0.32, width: 1 });
      this.architecture.moveTo(towerX - 7, towerY).lineTo(towerX + towerWidth / 2, towerY - height * 0.19).lineTo(towerX + towerWidth + 7, towerY).closePath().fill({ color: COLORS.roof });
      this.architecture.rect(towerX + towerWidth * 0.44, towerY - height * 0.245, towerWidth * 0.12, height * 0.08).fill({ color: COLORS.stoneDeep });
      this.architecture.circle(towerX + towerWidth / 2, towerY + towerHeight * 0.31, towerWidth * 0.19).fill({ color: 0x506e7c }).stroke({ color: COLORS.oldGold, width: 2 });
      for (let slit = 0; slit < 3; slit += 1) {
        this.architecture.roundRect(towerX + towerWidth * (0.24 + slit * 0.19), towerY + towerHeight * 0.55, towerWidth * 0.09, towerHeight * 0.18, 4).fill({ color: 0x435765 });
      }
    }

    const roseY = bodyY + height * 0.19;
    this.architecture.circle(centerX, roseY, height * 0.06).fill({ color: 0x587986 }).stroke({ color: COLORS.oldGold, alpha: 0.9, width: 3 });
    this.architecture.circle(centerX, roseY, height * 0.038).stroke({ color: COLORS.goldBright, alpha: 0.5, width: 1 });
    for (let spoke = 0; spoke < 8; spoke += 1) {
      const angle = (Math.PI * 2 * spoke) / 8;
      this.architecture.moveTo(centerX, roseY).lineTo(centerX + Math.cos(angle) * height * 0.055, roseY + Math.sin(angle) * height * 0.055).stroke({ color: COLORS.oldGold, alpha: 0.5, width: 1 });
    }

    const doorWidth = bodyWidth * 0.2;
    const doorHeight = height * 0.19;
    this.architecture.roundRect(centerX - doorWidth / 2, baseY - doorHeight, doorWidth, doorHeight, doorWidth * 0.48).fill({ color: 0x3b3130 }).stroke({ color: COLORS.oldGold, alpha: 0.72, width: 2 });
    this.architecture.moveTo(centerX, baseY - doorHeight).lineTo(centerX, baseY).stroke({ color: COLORS.oldGold, alpha: 0.35, width: 1 });

    for (const side of [-1, 1] as const) {
      const bannerX = centerX + side * bodyWidth * 0.34;
      const bannerY = bodyY + height * 0.14;
      this.architecture.rect(bannerX - 8, bannerY, 16, height * 0.17).fill({ color: COLORS.banner });
      this.architecture.moveTo(bannerX - 8, bannerY + height * 0.17).lineTo(bannerX, bannerY + height * 0.145).lineTo(bannerX + 8, bannerY + height * 0.17).closePath().fill({ color: COLORS.banner });
      this.architecture.rect(bannerX - 1, bannerY + 9, 2, height * 0.1).fill({ color: COLORS.gold, alpha: 0.72 });
    }
  }

  private drawTownhouse(centerX: number, baseY: number, width: number, height: number, roofDirection: -1 | 1, arcade: boolean): void {
    const x = centerX - width / 2;
    const y = baseY - height;
    this.architecture.rect(x, y, width, height).fill({ color: COLORS.stone });
    this.architecture.rect(x, y + height * 0.6, width, height * 0.4).fill({ color: COLORS.stoneShade, alpha: 0.38 });
    this.architecture.moveTo(x - width * 0.08, y).lineTo(centerX + roofDirection * width * 0.08, y - height * 0.23).lineTo(x + width * 1.08, y).closePath().fill({ color: COLORS.roof });
    this.architecture.moveTo(x, y + 5).lineTo(x + width, y + 5).stroke({ color: COLORS.oldGold, alpha: 0.24, width: 1 });

    const floors = 2;
    for (let floor = 0; floor < floors; floor += 1) {
      for (const offset of [-0.28, 0.28]) {
        const wx = centerX + width * offset;
        const wy = y + height * (0.28 + floor * 0.28);
        this.architecture.roundRect(wx - 8, wy, 16, 24, 7).fill({ color: 0x527381 }).stroke({ color: COLORS.timber, alpha: 0.66, width: 2 });
        this.architecture.moveTo(wx, wy + 2).lineTo(wx, wy + 22).stroke({ color: COLORS.stoneLight, alpha: 0.25, width: 1 });
      }
    }

    if (arcade) {
      for (let arch = 0; arch < 3; arch += 1) {
        const ax = x + width * (0.2 + arch * 0.3);
        this.architecture.roundRect(ax - width * 0.09, baseY - height * 0.22, width * 0.18, height * 0.22, width * 0.09).fill({ color: COLORS.stoneDeep, alpha: 0.82 });
      }
    } else {
      this.architecture.roundRect(centerX - 11, baseY - 45, 22, 45, 7).fill({ color: COLORS.timber });
    }
  }

  private drawPlaza(width: number, sceneBottom: number): void {
    this.plaza.clear();
    const plazaTop = sceneBottom * 0.66;
    this.plaza.rect(0, plazaTop, width, sceneBottom - plazaTop).fill({ color: COLORS.plaza });
    this.plaza.rect(0, plazaTop, width, 7).fill({ color: COLORS.stoneDeep, alpha: 0.22 });

    const vanishingX = width * 0.5;
    const depth = sceneBottom - plazaTop;
    for (let index = -8; index <= 8; index += 1) {
      const bottomX = vanishingX + index * width * 0.08;
      const topX = vanishingX + index * width * 0.012;
      this.plaza.moveTo(topX, plazaTop).lineTo(bottomX, sceneBottom).stroke({ color: COLORS.plazaShade, alpha: 0.23, width: 1 });
    }
    for (let row = 1; row <= 10; row += 1) {
      const t = row / 10;
      const y = plazaTop + depth * t * t;
      this.plaza.moveTo(0, y).lineTo(width, y).stroke({ color: COLORS.plazaShade, alpha: 0.18 + t * 0.08, width: 1 });
    }

    const fountainX = width * 0.39;
    const fountainY = plazaTop + depth * 0.55;
    this.plaza.ellipse(fountainX, fountainY + 25, 70, 19).fill({ color: COLORS.shadow, alpha: 0.2 });
    this.plaza.ellipse(fountainX, fountainY, 58, 20).fill({ color: COLORS.stoneDeep }).stroke({ color: COLORS.stoneLight, width: 4 });
    this.plaza.ellipse(fountainX, fountainY - 1, 49, 14).fill({ color: COLORS.water, alpha: 0.9 });
    this.plaza.rect(fountainX - 6, fountainY - 49, 12, 49).fill({ color: COLORS.stone });
    this.plaza.circle(fountainX, fountainY - 52, 9).fill({ color: COLORS.stoneLight });
    this.plaza.moveTo(fountainX - 2, fountainY - 45).bezierCurveTo(fountainX - 30, fountainY - 38, fountainX - 34, fountainY - 12, fountainX - 37, fountainY - 7).stroke({ color: COLORS.waterLight, alpha: 0.72, width: 2 });
    this.plaza.moveTo(fountainX + 2, fountainY - 45).bezierCurveTo(fountainX + 30, fountainY - 38, fountainX + 34, fountainY - 12, fountainX + 37, fountainY - 7).stroke({ color: COLORS.waterLight, alpha: 0.72, width: 2 });
  }

  private drawLighting(width: number, sceneBottom: number): void {
    this.lightBloom.clear();
    if (this.quality === 'low') return;
    const plazaTop = sceneBottom * 0.66;
    const lampY = plazaTop - 35;
    for (const x of [width * 0.35, width * 0.65]) {
      this.lightBloom.circle(x, lampY, this.quality === 'high' ? 24 : 17).fill({ color: COLORS.lamp, alpha: this.quality === 'high' ? 0.24 : 0.16 });
    }
    this.lightBloom.circle(width * 0.5, sceneBottom * 0.44, this.quality === 'high' ? 34 : 22).fill({ color: COLORS.goldBright, alpha: 0.08 });
  }

  private drawScreenFx(width: number, height: number, sceneBottom: number): void {
    this.screenFx.clear();
    const vignette = this.quality === 'high' ? 0.12 : this.quality === 'medium' ? 0.08 : 0.04;
    const edge = Math.max(28, Math.min(width, height) * 0.055);
    this.screenFx.rect(0, 0, width, edge).fill({ color: COLORS.shadow, alpha: vignette });
    this.screenFx.rect(0, sceneBottom - edge * 0.55, width, edge * 0.55).fill({ color: COLORS.shadow, alpha: vignette * 0.55 });
    this.screenFx.rect(0, 0, edge, sceneBottom).fill({ color: COLORS.shadow, alpha: vignette * 0.62 });
    this.screenFx.rect(width - edge, 0, edge, sceneBottom).fill({ color: COLORS.shadow, alpha: vignette * 0.62 });
    this.screenFx.rect(0, sceneBottom * 0.56, width, sceneBottom * 0.12).fill({ color: COLORS.skyHorizon, alpha: this.quality === 'high' ? 0.035 : 0.02 });
  }

  private drawChrome(width: number, height: number, pad: number, menuX: number, menuY: number, menuWidth: number, bottomHeight: number, compact: boolean): void {
    this.chrome.clear();
    this.chrome.rect(0, 0, width, 76).fill({ color: COLORS.navyDeep, alpha: 0.78 });
    this.chrome.rect(0, 0, width, 3).fill({ color: COLORS.oldGold, alpha: 0.88 });
    this.chrome.moveTo(pad, 67).lineTo(width - pad, 67).stroke({ color: COLORS.gold, alpha: 0.3, width: 1 });
    this.chrome.moveTo(pad, 71).lineTo(width - pad, 71).stroke({ color: COLORS.ivory, alpha: 0.07, width: 1 });

    const menuHeight = compact ? 310 : 354;
    this.chrome.roundRect(menuX, menuY, menuWidth, menuHeight, 7).fill({ color: COLORS.navyDeep, alpha: 1 }).stroke({ color: COLORS.oldGold, alpha: 0.86, width: 1 });
    this.chrome.roundRect(menuX + 5, menuY + 5, menuWidth - 10, menuHeight - 10, 5).stroke({ color: COLORS.goldBright, alpha: 0.12, width: 1 });
    this.chrome.rect(menuX + 14, menuY + 47, menuWidth - 28, 1).fill({ color: COLORS.oldGold, alpha: 0.34 });
    this.drawCornerOrnaments(this.chrome, menuX, menuY, menuWidth, menuHeight);

    const bottomY = height - bottomHeight;
    this.chrome.rect(0, bottomY, width, bottomHeight).fill({ color: COLORS.navyDeep, alpha: 0.985 });
    this.chrome.rect(0, bottomY, width, 2).fill({ color: COLORS.oldGold, alpha: 0.92 });
    this.chrome.moveTo(0, bottomY + 6).lineTo(width, bottomY + 6).stroke({ color: COLORS.ivory, alpha: 0.07, width: 1 });

    const partyCardWidth = compact ? 142 : 178;
    this.chrome.roundRect(pad, bottomY + 20, partyCardWidth, bottomHeight - 48, 5).fill({ color: COLORS.navy, alpha: 0.9 }).stroke({ color: COLORS.oldGold, alpha: 0.38, width: 1 });
    this.chrome.rect(pad + 15, bottomY + 78, partyCardWidth - 30, 4).fill({ color: 0x263342 });
    this.chrome.rect(pad + 15, bottomY + 78, partyCardWidth - 30, 4).fill({ color: COLORS.hp });
    this.chrome.rect(pad + 15, bottomY + 90, partyCardWidth - 30, 3).fill({ color: 0x263342 });
    this.chrome.rect(pad + 15, bottomY + 90, partyCardWidth - 30, 3).fill({ color: COLORS.mp });
    this.chrome.moveTo(pad + partyCardWidth + 13, bottomY + 20).lineTo(pad + partyCardWidth + 13, height - 28).stroke({ color: COLORS.oldGold, alpha: 0.24, width: 1 });
  }

  private drawCornerOrnaments(graphics: Graphics, x: number, y: number, width: number, height: number): void {
    const inset = 11;
    const length = 14;
    for (const [sx, sy, dx, dy] of [
      [x + inset, y + inset, 1, 1],
      [x + width - inset, y + inset, -1, 1],
      [x + inset, y + height - inset, 1, -1],
      [x + width - inset, y + height - inset, -1, -1],
    ] as const) {
      graphics.moveTo(sx, sy + dy * length).lineTo(sx, sy).lineTo(sx + dx * length, sy).stroke({ color: COLORS.goldBright, alpha: 0.46, width: 1 });
      graphics.circle(sx, sy, 1.5).fill({ color: COLORS.goldBright, alpha: 0.6 });
    }
  }

  private drawCrest(x: number, y: number, radius: number): void {
    this.crest.clear();
    this.crest.circle(x + radius, y, radius).fill({ color: COLORS.navy }).stroke({ color: COLORS.oldGold, alpha: 0.9, width: 1 });
    this.crest.circle(x + radius, y, radius - 4).stroke({ color: COLORS.goldBright, alpha: 0.25, width: 1 });
    this.crest.moveTo(x + radius, y - radius * 0.52).lineTo(x + radius * 1.32, y).lineTo(x + radius, y + radius * 0.52).lineTo(x + radius * 0.68, y).closePath().fill({ color: COLORS.oldGold, alpha: 0.82 });
  }

  private drawMenuRow(row: MenuRow, selected: boolean): void {
    const { width, height } = row;
    row.frame.clear();
    row.frame.roundRect(0, 0, width, height, 4).fill({ color: selected ? COLORS.navySelected : COLORS.navy, alpha: 1 });
    row.frame.rect(0, 0, selected ? 3 : 1, height).fill({ color: selected ? COLORS.goldBright : COLORS.oldGold, alpha: selected ? 0.94 : 0.2 });
    row.frame.moveTo(12, height - 1).lineTo(width - 12, height - 1).stroke({ color: COLORS.ivory, alpha: selected ? 0.08 : 0.035, width: 1 });
    if (selected) row.frame.roundRect(0.5, 0.5, width - 1, height - 1, 4).stroke({ color: COLORS.gold, alpha: 0.72, width: 1 });
    row.marker.clear();
    if (selected) {
      row.marker.moveTo(10, height / 2).lineTo(15, height / 2 - 4).lineTo(15, height / 2 + 4).closePath().fill({ color: COLORS.goldBright });
    }
    row.label.style.fill = selected ? COLORS.ivory : COLORS.text;
    row.subtitle.style.fill = selected ? COLORS.gold : COLORS.dim;
  }

  private drawAtmosphere(width: number, height: number): void {
    this.atmosphere.clear();
    const cloudY = Math.min(height * 0.18, 122);
    const cloudCount = this.quality === 'low' ? 2 : 4;
    for (let index = 0; index < cloudCount; index += 1) {
      const x = ((this.elapsedSeconds * (3.4 + index * 0.8) + index * width * 0.31) % (width + 220)) - 110;
      const y = cloudY + index * 25;
      const alpha = 0.055 + index * 0.012;
      this.atmosphere.ellipse(x, y, 72, 10).fill({ color: 0xf4f1e7, alpha });
      this.atmosphere.ellipse(x + 41, y - 5, 48, 8).fill({ color: 0xf4f1e7, alpha });
    }

    if (this.quality === 'high') {
      for (let index = 0; index < 9; index += 1) {
        const x = ((index * 137 + this.elapsedSeconds * (2 + (index % 3))) % (width + 40)) - 20;
        const y = height * 0.56 + ((index * 41) % Math.max(40, height * 0.28));
        const pulse = 0.035 + (Math.sin(this.elapsedSeconds * 0.8 + index) + 1) * 0.012;
        this.atmosphere.circle(x, y, 1.1 + (index % 2) * 0.5).fill({ color: COLORS.goldBright, alpha: pulse });
      }
    }
  }

  public destroy(): void {
    this.root.destroy({ children: true });
    this.colorGrade.destroy();
    this.bloomBlur.destroy();
  }
}
