import { Application, UPDATE_PRIORITY } from 'pixi.js';
import type { AdventureState, TownFacility } from '../../domain/adventure-state';
import { TownSceneView } from '../views/TownSceneView';

interface TownCallbacks {
  readonly onSelectFacility: (facility: TownFacility) => void;
}

export class PixiRenderer {
  private readonly app = new Application();
  private townSceneView: TownSceneView | undefined;
  private tickerAttached = false;
  private startedAtMilliseconds = 0;

  private readonly onTick = (): void => {
    const elapsedSeconds = Math.max((performance.now() - this.startedAtMilliseconds) / 1000, 0);
    this.townSceneView?.present(this.app.screen.width, this.app.screen.height, elapsedSeconds);
  };

  public async init(host: HTMLElement): Promise<void> {
    await this.app.init({
      antialias: true,
      autoDensity: true,
      autoStart: false,
      background: '#74b9df',
      preference: 'webgl',
      resolution: Math.min(window.devicePixelRatio || 1, 2),
      resizeTo: host,
    });

    this.app.canvas.setAttribute('role', 'img');
    this.app.canvas.setAttribute('aria-label', 'JRPG adventure town interface');
    this.app.canvas.dataset.renderer = 'pixi';
    this.app.canvas.dataset.page = 'boot';
    host.appendChild(this.app.canvas);
    this.app.resize();
  }

  public startTown(state: AdventureState, callbacks: TownCallbacks): void {
    this.townSceneView?.destroy();
    this.townSceneView = new TownSceneView(this.app.stage, state, callbacks);
    this.startedAtMilliseconds = performance.now();
    this.updateCanvasState(state);
    this.townSceneView.present(this.app.screen.width, this.app.screen.height, 0);
    this.ensureTicker();
    this.app.start();
    this.app.render();
  }

  public presentTown(state: AdventureState): void {
    this.townSceneView?.updateState(state);
    this.updateCanvasState(state);
    this.app.render();
  }

  public stop(): void {
    this.app.stop();
  }

  public destroy(): void {
    this.stop();
    if (this.tickerAttached) {
      this.app.ticker.remove(this.onTick);
      this.tickerAttached = false;
    }
    this.townSceneView?.destroy();
    this.townSceneView = undefined;
    this.app.destroy(true);
  }

  private ensureTicker(): void {
    if (this.tickerAttached) return;
    this.app.ticker.add(this.onTick, undefined, UPDATE_PRIORITY.NORMAL);
    this.tickerAttached = true;
  }

  private updateCanvasState(state: AdventureState): void {
    this.app.canvas.dataset.page = 'town';
    this.app.canvas.dataset.gameMode = 'jrpg-adventure';
    this.app.canvas.dataset.menu = 'town';
    this.app.canvas.dataset.location = state.townId;
    this.app.canvas.dataset.selectedFacility = state.selectedFacility;
    this.app.canvas.dataset.partySize = String(state.party.length);
    this.app.canvas.dataset.gold = String(state.gold);
    this.app.canvas.dataset.renderState = 'ready';
  }
}
