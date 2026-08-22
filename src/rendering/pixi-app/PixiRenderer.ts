import { Application, UPDATE_PRIORITY } from 'pixi.js';
import type { AdventureState, TownFacility } from '../../domain/adventure-state';
import { TownSceneView, type RenderQuality } from '../views/TownSceneView';

interface TownCallbacks {
  readonly onSelectFacility: (facility: TownFacility) => void;
}

interface RenderProfile {
  readonly quality: RenderQuality;
  readonly resolution: number;
}

const resolveRenderProfile = (): RenderProfile => {
  const viewportPixels = Math.max(window.innerWidth * window.innerHeight, 1);
  const cores = navigator.hardwareConcurrency || 4;
  const deviceDpr = window.devicePixelRatio || 1;
  const coarsePointer = window.matchMedia?.('(pointer: coarse)').matches ?? false;

  let quality: RenderQuality = 'medium';
  if (cores >= 8 && viewportPixels <= 2_600_000 && !coarsePointer) quality = 'high';
  if (cores <= 2 || viewportPixels > 4_200_000) quality = 'low';

  const targetResolution = quality === 'high' ? 1.75 : quality === 'medium' ? 1.35 : 1;
  const resolution = Math.min(Math.max(deviceDpr, targetResolution), 2);
  return { quality, resolution };
};

export class PixiRenderer {
  private readonly app = new Application();
  private townSceneView: TownSceneView | undefined;
  private tickerAttached = false;
  private startedAtMilliseconds = 0;
  private renderProfile: RenderProfile = { quality: 'medium', resolution: 1.35 };

  private readonly onTick = (): void => {
    const elapsedSeconds = Math.max((performance.now() - this.startedAtMilliseconds) / 1000, 0);
    this.townSceneView?.present(this.app.screen.width, this.app.screen.height, elapsedSeconds);
  };

  public async init(host: HTMLElement): Promise<void> {
    this.renderProfile = resolveRenderProfile();
    await this.app.init({
      antialias: true,
      autoDensity: true,
      autoStart: false,
      background: '#0b1522',
      preference: 'webgl',
      resolution: this.renderProfile.resolution,
      resizeTo: host,
    });

    this.app.canvas.setAttribute('role', 'img');
    this.app.canvas.setAttribute('aria-label', 'JRPG adventure town interface');
    this.app.canvas.dataset.renderer = 'pixi';
    this.app.canvas.dataset.page = 'boot';
    this.app.canvas.dataset.renderQuality = this.renderProfile.quality;
    this.app.canvas.dataset.renderResolution = this.renderProfile.resolution.toFixed(2);
    this.app.canvas.dataset.backgroundArt = 'none';
    this.app.canvas.dataset.topbar = 'kingdom';
    this.app.canvas.dataset.topbarSource = 'figma-2-2';
    this.app.canvas.dataset.topbarMetrics = 'hp,mp,level,gold,day,party';
    host.appendChild(this.app.canvas);
    this.app.resize();
  }

  public startTown(state: AdventureState, callbacks: TownCallbacks): void {
    this.townSceneView?.destroy();
    this.townSceneView = new TownSceneView(this.app.stage, state, callbacks, this.renderProfile.quality);
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
    this.app.canvas.dataset.weather = state.weather;
    this.app.canvas.dataset.selectedFacility = state.selectedFacility;
    this.app.canvas.dataset.partySize = String(state.party.length);
    this.app.canvas.dataset.gold = String(state.gold);
    this.app.canvas.dataset.renderState = 'ready';
  }
}
