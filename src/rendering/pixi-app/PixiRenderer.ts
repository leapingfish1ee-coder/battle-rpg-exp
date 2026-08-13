import { Application, UPDATE_PRIORITY } from 'pixi.js';
import type { PresentationState } from '../../presentation/PresentationState';
import { createLayers, type RenderLayers } from '../layers/createLayers';
import { CountdownTimerView } from '../views/CountdownTimerView';
import { DamagePopupView } from '../views/DamagePopupView';

export class PixiRenderer {
  private readonly app = new Application();
  private layers: RenderLayers | undefined;
  private countdownTimerView: CountdownTimerView | undefined;
  private damagePopupView: DamagePopupView | undefined;
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

    this.countdownTimerView = new CountdownTimerView(this.layers.hud);
    this.damagePopupView = new DamagePopupView(this.layers.hud);
    this.app.canvas.setAttribute('role', 'img');
    this.app.canvas.setAttribute('aria-label', '倒计时与伤害跳字演示');
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
      0.1,
    );
    this.previousPresentMilliseconds = nowMilliseconds;

    this.countdownTimerView?.present(state, this.app.screen.width, this.app.screen.height);
    this.damagePopupView?.present(
      state,
      this.app.screen.width,
      this.app.screen.height,
      deltaSeconds,
    );

    this.app.canvas.dataset.countdownState = state.countdown.timedOut ? 'timed-out' : 'running';
    this.app.canvas.dataset.damagePopupSequence = String(state.damagePopup.sequence);

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
    this.countdownTimerView?.destroy();
    this.damagePopupView?.destroy();
    this.countdownTimerView = undefined;
    this.damagePopupView = undefined;
    this.app.destroy(true);
  }
}
