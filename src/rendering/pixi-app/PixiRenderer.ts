import { Application, UPDATE_PRIORITY } from 'pixi.js';
import type { PresentationState } from '../../presentation/PresentationState';
import { Camera2D } from '../camera/Camera2D';
import { createLayers, type RenderLayers } from '../layers/createLayers';
import { CementFloorView } from '../views/CementFloorView';
import { PlayerUnitView } from '../views/PlayerUnitView';

const MAX_PRESENT_DELTA_SECONDS = 0.1;

export class PixiRenderer {
  private readonly app = new Application();
  private readonly camera = new Camera2D();
  private layers: RenderLayers | undefined;
  private cementFloorView: CementFloorView | undefined;
  private playerUnitView: PlayerUnitView | undefined;
  private frameCallback: ((nowMilliseconds: number) => void) | undefined;
  private previousPresentMilliseconds = 0;

  private readonly onTick = (): void => {
    this.frameCallback?.(performance.now());
  };

  public async init(host: HTMLElement): Promise<void> {
    await this.app.init({
      antialias: true,
      autoDensity: true,
      autoStart: false,
      background: '#808080',
      preference: 'webgl',
      resolution: Math.min(window.devicePixelRatio || 1, 2),
      resizeTo: host,
    });

    this.layers = createLayers();
    this.app.stage.addChild(
      this.layers.background,
      this.layers.worldRoot,
      this.layers.hud,
      this.layers.debug,
    );

    this.cementFloorView = new CementFloorView(this.layers.background);
    this.playerUnitView = new PlayerUnitView(this.layers.world);
    this.app.canvas.setAttribute('role', 'img');
    this.app.canvas.setAttribute('aria-label', '2D player movement world');
    this.app.canvas.dataset.worldSurface = 'cement';
    host.appendChild(this.app.canvas);
    this.app.resize();
  }

  public start(frameCallback: (nowMilliseconds: number) => void): void {
    this.frameCallback = frameCallback;
    this.previousPresentMilliseconds = performance.now();
    this.app.ticker.add(this.onTick, undefined, UPDATE_PRIORITY.HIGH);
    this.app.start();
  }

  public present(state: PresentationState): void {
    const nowMilliseconds = performance.now();
    const deltaSeconds = Math.min(
      Math.max((nowMilliseconds - this.previousPresentMilliseconds) / 1000, 0),
      MAX_PRESENT_DELTA_SECONDS,
    );
    this.previousPresentMilliseconds = nowMilliseconds;

    this.camera.update(state.player.x, state.player.y, deltaSeconds);
    const camera = this.camera.position();
    const screen = this.app.screen;

    if (this.layers) {
      this.layers.worldRoot.position.set(screen.width / 2 - camera.x, screen.height / 2 - camera.y);
    }

    this.cementFloorView?.present(camera.x, camera.y, screen.width, screen.height);
    this.playerUnitView?.present(state.player);

    this.app.canvas.dataset.playerX = state.player.x.toFixed(3);
    this.app.canvas.dataset.playerY = state.player.y.toFixed(3);
    this.app.canvas.dataset.playerSpeed = Math.hypot(
      state.player.velocityX,
      state.player.velocityY,
    ).toFixed(3);
    this.app.canvas.dataset.cameraX = camera.x.toFixed(3);
    this.app.canvas.dataset.cameraY = camera.y.toFixed(3);

    if (this.app.canvas.dataset.renderState !== 'ready') {
      this.app.render();
      this.app.canvas.dataset.renderState = 'ready';
    }
  }

  public stop(): void {
    this.app.ticker.remove(this.onTick);
    this.app.stop();
    this.frameCallback = undefined;
  }

  public destroy(): void {
    this.stop();
    this.cementFloorView?.destroy();
    this.playerUnitView?.destroy();
    this.cementFloorView = undefined;
    this.playerUnitView = undefined;
    this.app.destroy(true);
  }
}
