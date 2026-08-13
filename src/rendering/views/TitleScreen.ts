import { Container, Text } from 'pixi.js';

const MIN_FONT_SIZE = 40;
const MAX_FONT_SIZE = 96;
const FONT_SCALE = 0.075;

export class TitleScreen {
  private readonly title = new Text({
    text: '战斗 RPG 实验',
    style: {
      align: 'center',
      fill: '#f2e4cf',
      fontFamily:
        '"PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", "Source Han Sans SC", sans-serif',
      fontSize: 64,
      fontWeight: '600',
      letterSpacing: 6,
    },
    anchor: 0.5,
  });

  private lastFontSize = 0;

  public constructor(parent: Container) {
    parent.addChild(this.title);
  }

  public layout(width: number, height: number): void {
    const fontSize = Math.round(
      Math.min(Math.max(width * FONT_SCALE, MIN_FONT_SIZE), MAX_FONT_SIZE),
    );

    if (fontSize !== this.lastFontSize) {
      this.title.style.fontSize = fontSize;
      this.lastFontSize = fontSize;
    }

    this.title.position.set(width / 2, height / 2);
  }

  public destroy(): void {
    this.title.destroy();
  }
}
