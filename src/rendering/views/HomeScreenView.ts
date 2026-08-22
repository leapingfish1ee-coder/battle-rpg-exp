import { Container, Graphics, Text } from 'pixi.js';

const BACKGROUND = 0x090805;
const PANEL = 0x15110c;
const GOLD = 0xb18b4b;
const GOLD_BRIGHT = 0xd0a35f;
const TEXT = 0xf0e6cf;
const MUTED = 0x9d9586;
const DIM = 0x6e685d;

export class HomeScreenView {
  private readonly root = new Container();
  private readonly backdrop = new Graphics();
  private readonly scenery = new Graphics();
  private readonly ornaments = new Graphics();
  private readonly button = new Container();
  private readonly buttonFrame = new Graphics();
  private readonly eyebrow = new Text({
    text: 'THE ASHEN FRONTIER',
    style: {
      fill: GOLD,
      fontFamily: 'monospace',
      fontSize: 12,
      letterSpacing: 5,
    },
  });
  private readonly title = new Text({
    text: 'BATTLE RPG',
    style: {
      fill: TEXT,
      fontFamily: 'Georgia, serif',
      fontSize: 104,
      letterSpacing: -5,
    },
  });
  private readonly subtitle = new Text({
    text: 'Steel, sorcery and shattered oaths await\nbeyond the last kingdom.',
    style: {
      align: 'center',
      fill: 0xc9b994,
      fontFamily: 'Georgia, serif',
      fontSize: 20,
      fontStyle: 'italic',
      lineHeight: 30,
    },
  });
  private readonly copy = new Text({
    text: 'Enter a hostile frontier where every skirmish is immediate, every weapon has weight,\nand survival belongs to those who keep moving.',
    style: {
      align: 'center',
      fill: MUTED,
      fontFamily: 'Arial, sans-serif',
      fontSize: 13,
      lineHeight: 22,
    },
  });
  private readonly buttonLabel = new Text({
    text: 'ENTER THE FRONTIER',
    style: {
      fill: 0xf0e2bf,
      fontFamily: 'monospace',
      fontSize: 12,
      letterSpacing: 3,
    },
  });
  private readonly hint = new Text({
    text: 'WASD TO MOVE  ·  COMBAT BEGINS AUTOMATICALLY',
    style: {
      fill: DIM,
      fontFamily: 'monospace',
      fontSize: 10,
      letterSpacing: 1.4,
    },
  });
  private readonly footer = new Text({
    text: 'A COMBAT PROTOTYPE FORGED IN PIXIJS',
    style: {
      fill: DIM,
      fontFamily: 'monospace',
      fontSize: 9,
      letterSpacing: 1.2,
    },
  });
  private lastWidth = Number.NaN;
  private lastHeight = Number.NaN;
  private buttonWidth = 320;
  private buttonHeight = 54;
  private hovered = false;

  public constructor(parent: Container, onStart: () => void) {
    this.eyebrow.anchor.set(0.5);
    this.title.anchor.set(0.5);
    this.subtitle.anchor.set(0.5);
    this.copy.anchor.set(0.5);
    this.buttonLabel.anchor.set(0.5);
    this.hint.anchor.set(0.5);
    this.footer.anchor.set(1, 1);

    this.button.eventMode = 'static';
    this.button.cursor = 'pointer';
    this.button.on('pointerover', () => {
      this.hovered = true;
      this.drawButton();
    });
    this.button.on('pointerout', () => {
      this.hovered = false;
      this.drawButton();
    });
    this.button.on('pointertap', onStart);
    this.button.addChild(this.buttonFrame, this.buttonLabel);

    this.root.addChild(
      this.backdrop,
      this.scenery,
      this.ornaments,
      this.eyebrow,
      this.title,
      this.subtitle,
      this.copy,
      this.button,
      this.hint,
      this.footer,
    );
    parent.addChild(this.root);
  }

  public present(width: number, height: number): void {
    if (width === this.lastWidth && height === this.lastHeight) return;
    this.lastWidth = width;
    this.lastHeight = height;

    const compact = width < 720 || height < 620;
    const scale = Math.max(0.68, Math.min(1, Math.min(width / 1280, height / 720)));
    const centerX = width / 2;
    const centerY = height * (compact ? 0.39 : 0.37);

    this.drawBackdrop(width, height);
    this.drawScenery(width, height);
    this.drawOrnaments(width, height, compact);

    this.eyebrow.style.fontSize = Math.max(9, Math.round(12 * scale));
    this.eyebrow.position.set(centerX, centerY - 118 * scale);

    this.title.style.fontSize = Math.max(52, Math.round(104 * scale));
    this.title.style.letterSpacing = Math.round(-5 * scale);
    this.title.position.set(centerX, centerY - 38 * scale);

    this.subtitle.style.fontSize = Math.max(13, Math.round(20 * scale));
    this.subtitle.style.lineHeight = Math.max(20, Math.round(30 * scale));
    this.subtitle.position.set(centerX, centerY + 58 * scale);

    this.copy.visible = !compact;
    this.copy.style.fontSize = Math.max(10, Math.round(13 * scale));
    this.copy.style.lineHeight = Math.max(16, Math.round(22 * scale));
    this.copy.position.set(centerX, centerY + 134 * scale);

    this.buttonWidth = Math.min(340, Math.max(250, width * 0.3));
    this.buttonHeight = compact ? 48 : 54;
    this.button.position.set(centerX, height * (compact ? 0.72 : 0.7));
    this.buttonLabel.style.fontSize = compact ? 10 : 12;
    this.drawButton();

    this.hint.style.fontSize = compact ? 8 : 10;
    this.hint.position.set(centerX, this.button.y + this.buttonHeight * 0.95);

    this.footer.visible = width >= 620;
    this.footer.position.set(width - 20, height - 18);
  }

  private drawBackdrop(width: number, height: number): void {
    this.backdrop.clear();
    this.backdrop.rect(0, 0, width, height).fill({ color: BACKGROUND });

    const glowRadius = Math.max(width, height) * 0.42;
    for (let index = 6; index >= 1; index -= 1) {
      this.backdrop.circle(width / 2, height * 0.31, (glowRadius * index) / 6).fill({
        color: 0x93662b,
        alpha: 0.012 + (7 - index) * 0.008,
      });
    }

    this.backdrop.rect(0, height * 0.68, width, height * 0.32).fill({ color: 0x020201, alpha: 0.5 });
  }

  private drawScenery(width: number, height: number): void {
    this.scenery.clear();
    const groundY = height * 0.83;
    const castleColor = 0x030403;
    const centerX = width / 2;
    const towerWidth = Math.max(34, width * 0.045);

    this.scenery.rect(0, groundY, width, height - groundY).fill({ color: castleColor });
    this.scenery.rect(centerX - width * 0.16, groundY - height * 0.15, width * 0.32, height * 0.15).fill({ color: castleColor });
    this.scenery.rect(centerX - towerWidth / 2, groundY - height * 0.29, towerWidth, height * 0.29).fill({ color: castleColor });
    this.scenery
      .moveTo(centerX - towerWidth * 0.72, groundY - height * 0.29)
      .lineTo(centerX, groundY - height * 0.39)
      .lineTo(centerX + towerWidth * 0.72, groundY - height * 0.29)
      .closePath()
      .fill({ color: castleColor });

    for (const direction of [-1, 1]) {
      const x = centerX + direction * width * 0.19;
      this.scenery.rect(x - towerWidth / 2, groundY - height * 0.2, towerWidth, height * 0.2).fill({ color: castleColor });
      this.scenery
        .moveTo(x - towerWidth * 0.72, groundY - height * 0.2)
        .lineTo(x, groundY - height * 0.28)
        .lineTo(x + towerWidth * 0.72, groundY - height * 0.2)
        .closePath()
        .fill({ color: castleColor });
    }

    const emberSeed = [0.11, 0.2, 0.31, 0.43, 0.58, 0.68, 0.79, 0.89];
    emberSeed.forEach((fraction, index) => {
      this.scenery.circle(width * fraction, height * (0.2 + ((index * 17) % 31) / 100), 1 + (index % 2)).fill({
        color: GOLD_BRIGHT,
        alpha: 0.22 + (index % 3) * 0.08,
      });
    });
  }

  private drawOrnaments(width: number, height: number, compact: boolean): void {
    this.ornaments.clear();
    const centerX = width / 2;
    const dividerY = height * (compact ? 0.58 : 0.575);
    const half = Math.min(220, width * 0.22);

    this.ornaments.moveTo(centerX - half, dividerY).lineTo(centerX - 14, dividerY).stroke({ color: 0x77623e, alpha: 0.65, width: 1 });
    this.ornaments.moveTo(centerX + 14, dividerY).lineTo(centerX + half, dividerY).stroke({ color: 0x77623e, alpha: 0.65, width: 1 });
    this.ornaments
      .moveTo(centerX, dividerY - 6)
      .lineTo(centerX + 6, dividerY)
      .lineTo(centerX, dividerY + 6)
      .lineTo(centerX - 6, dividerY)
      .closePath()
      .fill({ color: 0x171108 })
      .stroke({ color: GOLD, alpha: 0.8, width: 1 });

    if (compact) return;
    for (const direction of [-1, 1]) {
      const x = direction < 0 ? 70 : width - 70;
      const y = height * 0.46;
      const size = Math.min(82, width * 0.07);
      this.ornaments
        .moveTo(x, y - size)
        .lineTo(x + size, y)
        .lineTo(x, y + size)
        .lineTo(x - size, y)
        .closePath()
        .stroke({ color: 0x887147, alpha: 0.18, width: 1 });
      this.ornaments
        .moveTo(x, y - size * 0.55)
        .lineTo(x + size * 0.55, y)
        .lineTo(x, y + size * 0.55)
        .lineTo(x - size * 0.55, y)
        .closePath()
        .stroke({ color: 0x887147, alpha: 0.13, width: 1 });
    }
  }

  private drawButton(): void {
    this.buttonFrame.clear();
    this.buttonFrame
      .rect(-this.buttonWidth / 2, -this.buttonHeight / 2, this.buttonWidth, this.buttonHeight)
      .fill({ color: PANEL, alpha: 0.96 })
      .stroke({ color: this.hovered ? 0xc49a50 : 0x8d6c36, width: 1 });
    this.buttonFrame
      .rect(
        -this.buttonWidth / 2 + 4,
        -this.buttonHeight / 2 + 4,
        this.buttonWidth - 8,
        this.buttonHeight - 8,
      )
      .stroke({ color: GOLD_BRIGHT, alpha: this.hovered ? 0.2 : 0.08, width: 1 });
    this.buttonLabel.style.fill = this.hovered ? 0xfff3d5 : 0xf0e2bf;
  }

  public destroy(): void {
    this.root.destroy({ children: true });
  }
}
