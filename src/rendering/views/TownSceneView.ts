import { Container, Graphics, Text } from 'pixi.js';
import type { AdventureState, TownFacility } from '../../domain/adventure-state';

const COLORS = {
  skyTop: 0x74b9df,
  skyMid: 0xa8d7ea,
  skyLow: 0xe8dfbd,
  distant: 0x71879a,
  distantLight: 0x8ea2ad,
  roof: 0x42516a,
  roofLight: 0x5a6980,
  wall: 0xe8dbc0,
  wallShade: 0xcdbb99,
  timber: 0x705949,
  plaza: 0xb9aa8e,
  plazaDark: 0x8e806d,
  fountain: 0x799aaa,
  fountainLight: 0xb5d9df,
  navy: 0x14243d,
  navyLight: 0x203858,
  panel: 0x0e1d34,
  panelRaised: 0x172b48,
  gold: 0xd8b66a,
  goldBright: 0xf0d58f,
  ivory: 0xf5eddc,
  text: 0xe9e4da,
  muted: 0xaeb9c7,
  dim: 0x72829a,
  hp: 0x69b878,
  mp: 0x6698d7,
  shadow: 0x06101d,
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
}

export class TownSceneView {
  private readonly root = new Container();
  private readonly sky = new Graphics();
  private readonly scenery = new Graphics();
  private readonly atmosphere = new Graphics();
  private readonly ui = new Container();
  private readonly chrome = new Graphics();
  private readonly header = new Container();
  private readonly locationLabel = new Text({
    text: '',
    style: { fill: COLORS.ivory, fontFamily: 'Georgia, serif', fontSize: 32, fontWeight: '600' },
  });
  private readonly regionLabel = new Text({
    text: '',
    style: { fill: COLORS.gold, fontFamily: 'system-ui, sans-serif', fontSize: 11, letterSpacing: 1.8 },
  });
  private readonly dayLabel = new Text({
    text: '',
    style: { fill: COLORS.text, fontFamily: 'monospace', fontSize: 11, letterSpacing: 1.1 },
  });
  private readonly currencyLabel = new Text({
    text: '',
    style: { fill: COLORS.goldBright, fontFamily: 'monospace', fontSize: 13, fontWeight: '700' },
  });
  private readonly menuTitle = new Text({
    text: 'TOWN MENU',
    style: { fill: COLORS.gold, fontFamily: 'Georgia, serif', fontSize: 17, fontWeight: '600', letterSpacing: 2.2 },
  });
  private readonly objectiveKicker = new Text({
    text: 'CURRENT OBJECTIVE',
    style: { fill: COLORS.gold, fontFamily: 'monospace', fontSize: 9, letterSpacing: 1.6 },
  });
  private readonly objectiveText = new Text({
    text: '',
    style: { fill: COLORS.text, fontFamily: 'system-ui, sans-serif', fontSize: 13 },
  });
  private readonly facilityTitle = new Text({
    text: '',
    style: { fill: COLORS.ivory, fontFamily: 'Georgia, serif', fontSize: 21, fontWeight: '600' },
  });
  private readonly facilityDescription = new Text({
    text: '',
    style: { fill: COLORS.muted, fontFamily: 'system-ui, sans-serif', fontSize: 12, lineHeight: 20, wordWrap: true, wordWrapWidth: 460 },
  });
  private readonly partyName = new Text({
    text: '',
    style: { fill: COLORS.ivory, fontFamily: 'system-ui, sans-serif', fontSize: 16, fontWeight: '600' },
  });
  private readonly partyRole = new Text({
    text: '',
    style: { fill: COLORS.muted, fontFamily: 'system-ui, sans-serif', fontSize: 11 },
  });
  private readonly partyStats = new Text({
    text: '',
    style: { fill: COLORS.text, fontFamily: 'monospace', fontSize: 11 },
  });
  private readonly prompt = new Text({
    text: '↑↓ / W S  选择    ENTER  确认    鼠标  直接选择',
    style: { fill: COLORS.dim, fontFamily: 'monospace', fontSize: 9, letterSpacing: 0.5 },
  });
  private readonly menuRows: MenuRow[] = [];
  private state: AdventureState;
  private lastWidth = Number.NaN;
  private lastHeight = Number.NaN;
  private elapsedSeconds = 0;

  public constructor(parent: Container, state: AdventureState, callbacks: TownSceneCallbacks) {
    this.state = state;
    this.locationLabel.anchor.set(0, 0.5);
    this.regionLabel.anchor.set(0, 0.5);
    this.dayLabel.anchor.set(1, 0.5);
    this.currencyLabel.anchor.set(1, 0.5);
    this.menuTitle.anchor.set(0, 0.5);
    this.objectiveKicker.anchor.set(0, 0.5);
    this.objectiveText.anchor.set(0, 0.5);
    this.facilityTitle.anchor.set(0, 0.5);
    this.facilityDescription.anchor.set(0, 0);
    this.partyName.anchor.set(0, 0.5);
    this.partyRole.anchor.set(0, 0.5);
    this.partyStats.anchor.set(0, 0.5);
    this.prompt.anchor.set(0.5, 1);

    for (const facility of state.facilities) {
      const root = new Container();
      const frame = new Graphics();
      const marker = new Graphics();
      const label = new Text({
        text: facility.label,
        style: { fill: COLORS.text, fontFamily: 'system-ui, sans-serif', fontSize: 15, fontWeight: '600' },
      });
      const subtitle = new Text({
        text: facility.subtitle,
        style: { fill: COLORS.dim, fontFamily: 'monospace', fontSize: 9, letterSpacing: 1.2 },
      });
      label.anchor.set(0, 0.5);
      subtitle.anchor.set(1, 0.5);
      root.eventMode = 'static';
      root.cursor = 'pointer';
      root.on('pointertap', () => callbacks.onSelectFacility(facility.id));
      root.addChild(frame, marker, label, subtitle);
      this.menuRows.push({ root, frame, marker, label, subtitle, facility: facility.id });
    }

    this.header.addChild(this.locationLabel, this.regionLabel, this.dayLabel, this.currencyLabel);
    this.ui.addChild(
      this.chrome,
      this.header,
      this.menuTitle,
      this.objectiveKicker,
      this.objectiveText,
      this.facilityTitle,
      this.facilityDescription,
      this.partyName,
      this.partyRole,
      this.partyStats,
      this.prompt,
      ...this.menuRows.map((row) => row.root),
    );
    this.root.addChild(this.sky, this.scenery, this.atmosphere, this.ui);
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

    this.drawSky(width, height);
    this.drawTown(width, sceneBottom);
    this.drawChrome(width, height, pad, menuX, menuY, menuWidth, bottomHeight, compact);

    this.locationLabel.style.fontSize = compact ? 24 : 32;
    this.locationLabel.position.set(pad, 42);
    this.regionLabel.position.set(pad + (compact ? 190 : 250), 43);
    this.dayLabel.position.set(width - pad, 32);
    this.currencyLabel.position.set(width - pad, 54);

    this.menuTitle.position.set(menuX + 18, menuY + 25);
    const rowHeight = compact ? 46 : 52;
    const rowGap = compact ? 5 : 7;
    this.menuRows.forEach((row, index) => {
      row.root.position.set(menuX + 10, menuY + 52 + index * (rowHeight + rowGap));
      row.frame.clear().roundRect(0, 0, menuWidth - 20, rowHeight, 5).fill({ color: COLORS.panelRaised, alpha: 0.92 });
      row.label.style.fontSize = compact ? 13 : 15;
      row.label.position.set(18, rowHeight / 2);
      row.subtitle.position.set(menuWidth - 38, rowHeight / 2);
      this.drawMenuRow(row, row.facility === this.state.selectedFacility);
    });

    const detailX = pad + (compact ? 146 : 190);
    const detailY = height - bottomHeight + 52;
    this.objectiveKicker.position.set(detailX, detailY - 27);
    this.objectiveText.style.fontSize = compact ? 11 : 13;
    this.objectiveText.position.set(detailX, detailY - 7);
    this.facilityTitle.style.fontSize = compact ? 17 : 21;
    this.facilityTitle.position.set(detailX, detailY + 35);
    this.facilityDescription.style.fontSize = compact ? 10 : 12;
    this.facilityDescription.style.wordWrapWidth = Math.max(180, width - menuWidth - detailX - pad * 2);
    this.facilityDescription.position.set(detailX, detailY + 55);

    this.partyName.position.set(pad + 18, detailY - 5);
    this.partyRole.position.set(pad + 18, detailY + 20);
    this.partyStats.style.fontSize = compact ? 9 : 11;
    this.partyStats.position.set(pad + 18, detailY + 48);
    this.prompt.position.set(width / 2, height - 10);
    this.prompt.visible = height >= 500;
  }

  private drawSky(width: number, height: number): void {
    this.sky.clear();
    const bandHeight = Math.max(1, height / 10);
    const bands = [
      COLORS.skyTop,
      0x7fc0e1,
      0x8bc7e3,
      0x98cee5,
      COLORS.skyMid,
      0xb8dce7,
      0xc8e0e3,
      0xd7dfd4,
      COLORS.skyLow,
      0xead9ad,
    ];
    bands.forEach((color, index) => {
      this.sky.rect(0, bandHeight * index, width, bandHeight + 1).fill({ color });
    });
    this.sky.circle(width * 0.18, height * 0.19, Math.max(34, height * 0.07)).fill({ color: 0xfff1b5, alpha: 0.9 });
  }

  private drawTown(width: number, sceneBottom: number): void {
    this.scenery.clear();
    const horizon = sceneBottom * 0.42;
    const plazaTop = sceneBottom * 0.68;

    this.scenery
      .moveTo(0, horizon)
      .lineTo(width * 0.1, horizon - 70)
      .lineTo(width * 0.2, horizon - 32)
      .lineTo(width * 0.33, horizon - 104)
      .lineTo(width * 0.46, horizon - 36)
      .lineTo(width * 0.62, horizon - 88)
      .lineTo(width * 0.76, horizon - 20)
      .lineTo(width * 0.88, horizon - 74)
      .lineTo(width, horizon - 22)
      .lineTo(width, plazaTop)
      .lineTo(0, plazaTop)
      .closePath()
      .fill({ color: COLORS.distant, alpha: 0.72 });

    this.scenery.rect(0, plazaTop, width, sceneBottom - plazaTop).fill({ color: COLORS.plaza });
    for (let index = 0; index < 18; index += 1) {
      const y = plazaTop + (index / 18) * (sceneBottom - plazaTop);
      this.scenery.moveTo(0, y).lineTo(width, y + index * 0.7).stroke({ color: COLORS.plazaDark, alpha: 0.16, width: 1 });
    }

    this.drawBuilding(width * 0.1, plazaTop, width * 0.16, sceneBottom * 0.34, -1);
    this.drawBuilding(width * 0.3, plazaTop + 12, width * 0.18, sceneBottom * 0.3, 1);
    this.drawBuilding(width * 0.73, plazaTop + 5, width * 0.17, sceneBottom * 0.33, -1);
    this.drawBuilding(width * 0.9, plazaTop + 18, width * 0.14, sceneBottom * 0.27, 1);

    const towerX = width * 0.54;
    const towerBaseY = plazaTop + 6;
    this.scenery.rect(towerX - 38, towerBaseY - 190, 76, 190).fill({ color: COLORS.wall });
    this.scenery
      .moveTo(towerX - 54, towerBaseY - 190)
      .lineTo(towerX, towerBaseY - 266)
      .lineTo(towerX + 54, towerBaseY - 190)
      .closePath()
      .fill({ color: COLORS.roof });
    this.scenery.rect(towerX - 5, towerBaseY - 170, 10, 46).fill({ color: COLORS.navy, alpha: 0.8 });
    this.scenery.circle(towerX, towerBaseY - 98, 18).fill({ color: 0xf0d58f }).stroke({ color: COLORS.timber, width: 4 });
    this.scenery.moveTo(towerX, towerBaseY - 98).lineTo(towerX + 8, towerBaseY - 105).stroke({ color: COLORS.timber, width: 2 });
    this.scenery.moveTo(towerX, towerBaseY - 98).lineTo(towerX - 2, towerBaseY - 109).stroke({ color: COLORS.timber, width: 2 });

    const fountainX = width * 0.46;
    const fountainY = plazaTop + (sceneBottom - plazaTop) * 0.48;
    this.scenery.ellipse(fountainX, fountainY + 26, 72, 25).fill({ color: 0x7e7569, alpha: 0.35 });
    this.scenery.ellipse(fountainX, fountainY, 62, 22).fill({ color: COLORS.fountain }).stroke({ color: 0xd7d0bd, width: 5 });
    this.scenery.rect(fountainX - 7, fountainY - 57, 14, 58).fill({ color: 0xd5cbb5 });
    this.scenery.circle(fountainX, fountainY - 60, 11).fill({ color: 0xe4d9c0 });
    this.scenery
      .moveTo(fountainX - 3, fountainY - 52)
      .bezierCurveTo(fountainX - 40, fountainY - 45, fountainX - 44, fountainY - 13, fountainX - 47, fountainY - 7)
      .stroke({ color: COLORS.fountainLight, alpha: 0.75, width: 2 });
    this.scenery
      .moveTo(fountainX + 3, fountainY - 52)
      .bezierCurveTo(fountainX + 40, fountainY - 45, fountainX + 44, fountainY - 13, fountainX + 47, fountainY - 7)
      .stroke({ color: COLORS.fountainLight, alpha: 0.75, width: 2 });
  }

  private drawBuilding(centerX: number, baseY: number, width: number, height: number, roofDirection: -1 | 1): void {
    const x = centerX - width / 2;
    const y = baseY - height;
    this.scenery.rect(x, y, width, height).fill({ color: COLORS.wall });
    this.scenery.rect(x, y + height * 0.56, width, height * 0.44).fill({ color: COLORS.wallShade, alpha: 0.28 });
    this.scenery
      .moveTo(x - width * 0.08, y)
      .lineTo(centerX + roofDirection * width * 0.08, y - height * 0.25)
      .lineTo(x + width * 1.08, y)
      .closePath()
      .fill({ color: COLORS.roof });
    this.scenery.rect(centerX - 12, baseY - 48, 24, 48).fill({ color: COLORS.timber });
    for (const offset of [-0.28, 0.28]) {
      this.scenery.rect(centerX + width * offset - 11, y + height * 0.34, 22, 28).fill({ color: 0x7eb4ca, alpha: 0.82 });
      this.scenery.rect(centerX + width * offset - 1, y + height * 0.34, 2, 28).fill({ color: COLORS.timber, alpha: 0.55 });
    }
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
    this.chrome.rect(0, 0, width, 78).fill({ color: COLORS.shadow, alpha: 0.3 });
    this.chrome.moveTo(pad, 69).lineTo(width - pad, 69).stroke({ color: COLORS.ivory, alpha: 0.22, width: 1 });

    const menuHeight = compact ? 310 : 354;
    this.chrome.roundRect(menuX, menuY, menuWidth, menuHeight, 8).fill({ color: COLORS.panel, alpha: 0.94 }).stroke({ color: COLORS.gold, alpha: 0.72, width: 1 });
    this.chrome.roundRect(menuX + 5, menuY + 5, menuWidth - 10, menuHeight - 10, 6).stroke({ color: COLORS.ivory, alpha: 0.12, width: 1 });

    const bottomY = height - bottomHeight;
    this.chrome.rect(0, bottomY, width, bottomHeight).fill({ color: COLORS.panel, alpha: 0.97 });
    this.chrome.moveTo(0, bottomY).lineTo(width, bottomY).stroke({ color: COLORS.gold, alpha: 0.8, width: 2 });
    this.chrome.moveTo(0, bottomY + 6).lineTo(width, bottomY + 6).stroke({ color: COLORS.ivory, alpha: 0.08, width: 1 });

    const partyCardWidth = compact ? 138 : 170;
    this.chrome.roundRect(pad, bottomY + 22, partyCardWidth, bottomHeight - 50, 6).fill({ color: COLORS.navyLight, alpha: 0.72 }).stroke({ color: COLORS.ivory, alpha: 0.14, width: 1 });
    this.chrome.rect(pad + 18, bottomY + 82, partyCardWidth - 36, 5).fill({ color: 0x26364c });
    this.chrome.rect(pad + 18, bottomY + 82, (partyCardWidth - 36) * 1, 5).fill({ color: COLORS.hp });
    this.chrome.rect(pad + 18, bottomY + 94, partyCardWidth - 36, 4).fill({ color: 0x26364c });
    this.chrome.rect(pad + 18, bottomY + 94, (partyCardWidth - 36) * 1, 4).fill({ color: COLORS.mp });
  }

  private drawMenuRow(row: MenuRow, selected: boolean): void {
    const width = row.frame.width || 300;
    const height = row.frame.height || 52;
    row.frame.clear().roundRect(0, 0, width, height, 5).fill({ color: selected ? COLORS.navyLight : COLORS.panelRaised, alpha: selected ? 1 : 0.92 });
    if (selected) row.frame.stroke({ color: COLORS.goldBright, alpha: 0.95, width: 1 });
    row.marker.clear();
    if (selected) {
      row.marker
        .moveTo(7, height / 2)
        .lineTo(13, height / 2 - 5)
        .lineTo(13, height / 2 + 5)
        .closePath()
        .fill({ color: COLORS.goldBright });
    }
    row.label.style.fill = selected ? COLORS.ivory : COLORS.text;
    row.subtitle.style.fill = selected ? COLORS.gold : COLORS.dim;
  }

  private drawAtmosphere(width: number, height: number): void {
    this.atmosphere.clear();
    const cloudY = Math.min(height * 0.19, 130);
    for (let index = 0; index < 4; index += 1) {
      const x = ((this.elapsedSeconds * (5 + index * 1.5) + index * width * 0.28) % (width + 180)) - 90;
      const y = cloudY + index * 22;
      const alpha = 0.12 + index * 0.02;
      this.atmosphere.ellipse(x, y, 58, 13).fill({ color: 0xffffff, alpha });
      this.atmosphere.ellipse(x + 35, y - 7, 42, 11).fill({ color: 0xffffff, alpha });
    }
  }

  public destroy(): void {
    this.root.destroy({ children: true });
  }
}
