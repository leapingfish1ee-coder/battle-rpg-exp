import { Application, Graphics, UPDATE_PRIORITY } from 'pixi.js';
import type { PresentationState } from '../../presentation/PresentationState';
import { createLayers, type RenderLayers } from '../layers/createLayers';

export class PixiRenderer {
  private readonly app = new Application();
  private readonly playerView = new Graphics();
  private layers: RenderLayers | undefined;
  private frameCallback: ((nowMilliseconds: number) => void) | undefined;

  private readonly onTick = (): void => {
    this.frameCallback?.(performance.now());
  };

  public async init(host: HTMLElement): Promise<void> {
    await this.app.init({
      antialias: false,
      autoDensity: true,
      background: '#0b1020',
      preference: 'webgl',
      resolution: Math.min(window.devicePixelRatio || 1, 2),
      resizeTo: host,
    });

    this.layers = createLayers();
    this.app.stage.addChild(
      this.layers.background,
      this.layers.world,
      this.layers.effects,
      this.layers.foreground,
      this.layers.hud,
      this.layers.debug,
    );

    this.playerView.circle(0, 0, 16).fill(0xffffff);
    this.layers.world.addChild(this.playerView);
    host.appendChild(this.app.canvas);
  }

  public start(frameCallback: (nowMilliseconds: number) => void): void {
    this.frameCallback = frameCallback;
    this.app.ticker.add(this.onTick, undefined, UPDATE_PRIORITY.HIGH);
  }

  public present(state: PresentationState): void {
    this.playerView.position.set(state.player.x, state.player.y);
  }

  public stop(): void {
    this.app.ticker.remove(this.onTick);
    this.frameCallback = undefined;
  }

  public destroy(): void {
    this.stop();
    this.app.destroy(true);
  }
}
