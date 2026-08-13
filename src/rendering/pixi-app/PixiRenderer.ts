import { Application, UPDATE_PRIORITY } from 'pixi.js';
import type { PresentationState } from '../../presentation/PresentationState';
import { createLayers, type RenderLayers } from '../layers/createLayers';
import { TitleScreen } from '../views/TitleScreen';

export class PixiRenderer {
  private readonly app = new Application();
  private layers: RenderLayers | undefined;
  private titleScreen: TitleScreen | undefined;
  private frameCallback: ((nowMilliseconds: number) => void) | undefined;

  private readonly onTick = (): void => {
    this.frameCallback?.(performance.now());
  };

  public async init(host: HTMLElement): Promise<void> {
    await this.app.init({
      antialias: true,
      autoDensity: true,
      autoStart: false,
      background: '#211711',
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

    this.titleScreen = new TitleScreen(this.layers.hud);
    this.app.canvas.setAttribute('role', 'img');
    this.app.canvas.setAttribute('aria-label', '战斗 RPG 实验');
    host.appendChild(this.app.canvas);

    // ResizePlugin batches automatic resize work through requestAnimationFrame.
    // The entry screen must not depend on a later browser frame to become visible,
    // so synchronize dimensions and render the initial scene immediately.
    this.app.resize();
    this.titleScreen.layout(this.app.screen.width, this.app.screen.height);
    this.app.render();
    this.app.canvas.dataset.renderState = 'ready';
  }

  public start(frameCallback: (nowMilliseconds: number) => void): void {
    this.frameCallback = frameCallback;
    this.app.ticker.add(this.onTick, undefined, UPDATE_PRIORITY.HIGH);
    this.app.start();
  }

  public present(state: PresentationState): void {
    void state;
    this.titleScreen?.layout(this.app.screen.width, this.app.screen.height);
  }

  public stop(): void {
    this.app.ticker.remove(this.onTick);
    this.app.stop();
    this.frameCallback = undefined;
  }

  public destroy(): void {
    this.stop();
    this.titleScreen?.destroy();
    this.titleScreen = undefined;
    this.app.destroy(true);
  }
}
