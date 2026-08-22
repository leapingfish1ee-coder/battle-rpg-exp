import { Application, UPDATE_PRIORITY } from 'pixi.js';
import type { PresentationState } from '../../presentation/PresentationState';
import { Camera2D } from '../camera/Camera2D';
import { createLayers, type RenderLayers } from '../layers/createLayers';
import { CementFloorView } from '../views/CementFloorView';
import { EnemyFieldView } from '../views/EnemyFieldView';
import { HomeScreenView } from '../views/HomeScreenView';
import { PlayerUnitView } from '../views/PlayerUnitView';
import { WeaponEffectsView } from '../views/WeaponEffectsView';

const MAX_PRESENT_DELTA_SECONDS = 0.1;

export interface RendererViewport {
  readonly width: number;
  readonly height: number;
}

export class PixiRenderer {
  private readonly app = new Application();
  private readonly camera = new Camera2D();
  private layers: RenderLayers | undefined;
  private cementFloorView: CementFloorView | undefined;
  private enemyFieldView: EnemyFieldView | undefined;
  private homeScreenView: HomeScreenView | undefined;
  private playerUnitView: PlayerUnitView | undefined;
  private weaponEffectsView: WeaponEffectsView | undefined;
  private frameCallback: ((nowMilliseconds: number) => void) | undefined;
  private previousPresentMilliseconds = 0;
  private tickerAttached = false;

  private readonly onTick = (): void => {
    this.homeScreenView?.present(this.app.screen.width, this.app.screen.height);
    this.frameCallback?.(performance.now());
  };

  public async init(host: HTMLElement): Promise<void> {
    await this.app.init({
      antialias: true,
      autoDensity: true,
      autoStart: false,
      background: '#090805',
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
    this.enemyFieldView = new EnemyFieldView(this.layers.world);
    this.playerUnitView = new PlayerUnitView(this.layers.world);
    this.weaponEffectsView = new WeaponEffectsView(this.layers.effects);
    this.setWorldVisible(false);

    this.app.canvas.setAttribute('role', 'img');
    this.app.canvas.setAttribute('aria-label', 'Battle RPG Pixi application');
    this.app.canvas.dataset.renderer = 'pixi';
    this.app.canvas.dataset.page = 'boot';
    host.appendChild(this.app.canvas);
    this.app.resize();
  }

  public viewport(): RendererViewport {
    return {
      width: Math.max(this.app.screen.width, 1),
      height: Math.max(this.app.screen.height, 1),
    };
  }

  public startHome(onStart: () => void): void {
    this.frameCallback = undefined;
    this.setWorldVisible(false);
    this.homeScreenView?.destroy();
    this.homeScreenView = new HomeScreenView(this.app.stage, onStart);
    this.homeScreenView.present(this.app.screen.width, this.app.screen.height);
    this.app.canvas.dataset.page = 'home';
    this.app.canvas.dataset.renderState = 'home-ready';
    this.ensureTicker();
    this.app.start();
  }

  public start(frameCallback: (nowMilliseconds: number) => void): void {
    this.homeScreenView?.destroy();
    this.homeScreenView = undefined;
    this.setWorldVisible(true);
    this.frameCallback = frameCallback;
    this.previousPresentMilliseconds = performance.now();
    this.app.canvas.setAttribute('aria-label', '2D automatic combat world');
    this.app.canvas.dataset.page = 'combat';
    this.app.canvas.dataset.worldSurface = 'cement';
    this.app.canvas.dataset.playerWeaponVisuals = 'none';
    this.app.canvas.dataset.ballisticsModel = 'kinetic-drag';
    delete this.app.canvas.dataset.renderState;
    this.ensureTicker();
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
    this.enemyFieldView?.present(state.enemies);
    this.playerUnitView?.present(state.player);
    this.weaponEffectsView?.present(state);

    const chaserCount = state.enemies.filter((enemy) => enemy.behavior === 'chaser').length;
    const stationaryCount = state.enemies.length - chaserCount;
    const highestImpactId = state.projectileImpacts.reduce(
      (highest, impact) => Math.max(highest, impact.id),
      0,
    );

    this.app.canvas.dataset.playerX = state.player.x.toFixed(3);
    this.app.canvas.dataset.playerY = state.player.y.toFixed(3);
    this.app.canvas.dataset.playerSpeed = Math.hypot(
      state.player.velocityX,
      state.player.velocityY,
    ).toFixed(3);
    this.app.canvas.dataset.cameraX = camera.x.toFixed(3);
    this.app.canvas.dataset.cameraY = camera.y.toFixed(3);
    this.app.canvas.dataset.enemyCount = String(state.enemies.length);
    this.app.canvas.dataset.chaserCount = String(chaserCount);
    this.app.canvas.dataset.stationaryCount = String(stationaryCount);
    this.app.canvas.dataset.projectileCount = String(state.projectiles.length);
    this.app.canvas.dataset.projectileImpactId = String(highestImpactId);
    this.app.canvas.dataset.soloSpawnSequence = String(state.spawn.soloSequence);
    this.app.canvas.dataset.groupSpawnSequence = String(state.spawn.groupSequence);
    this.app.canvas.dataset.sidearmCycleSequence = String(state.weapons.sidearm.cycleSequence);
    this.app.canvas.dataset.sidearmAttackSequence = String(state.weapons.sidearm.attackSequence);
    this.app.canvas.dataset.saberCycleSequence = String(state.weapons.saber.cycleSequence);
    this.app.canvas.dataset.saberAttackSequence = String(state.weapons.saber.attackSequence);

    if (this.app.canvas.dataset.renderState !== 'ready') {
      this.app.render();
      this.app.canvas.dataset.renderState = 'ready';
    }
  }

  public stop(): void {
    this.app.stop();
    this.frameCallback = undefined;
  }

  public destroy(): void {
    this.stop();
    if (this.tickerAttached) {
      this.app.ticker.remove(this.onTick);
      this.tickerAttached = false;
    }
    this.homeScreenView?.destroy();
    this.cementFloorView?.destroy();
    this.enemyFieldView?.destroy();
    this.playerUnitView?.destroy();
    this.weaponEffectsView?.destroy();
    this.homeScreenView = undefined;
    this.cementFloorView = undefined;
    this.enemyFieldView = undefined;
    this.playerUnitView = undefined;
    this.weaponEffectsView = undefined;
    this.app.destroy(true);
  }

  private ensureTicker(): void {
    if (this.tickerAttached) return;
    this.app.ticker.add(this.onTick, undefined, UPDATE_PRIORITY.HIGH);
    this.tickerAttached = true;
  }

  private setWorldVisible(visible: boolean): void {
    if (!this.layers) return;
    this.layers.background.visible = visible;
    this.layers.worldRoot.visible = visible;
    this.layers.hud.visible = visible;
    this.layers.debug.visible = visible;
  }
}
