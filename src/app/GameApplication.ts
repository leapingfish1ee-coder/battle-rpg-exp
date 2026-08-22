import { BrowserInput } from '../input/BrowserInput';
import { PresentationSystem } from '../presentation/PresentationSystem';
import { PixiRenderer } from '../rendering/pixi-app/PixiRenderer';
import { SimulationClock } from '../simulation/clock/SimulationClock';
import { SnapshotBuffer } from '../simulation/snapshot/SnapshotBuffer';
import { SimulationWorld } from '../simulation/world/SimulationWorld';

const MAX_FRAME_SECONDS = 0.25;
const MAX_CATCH_UP_STEPS = 8;

type ApplicationPhase = 'idle' | 'home' | 'combat';

export class GameApplication {
  private readonly input = new BrowserInput();
  private readonly simulation = new SimulationWorld();
  private readonly clock = new SimulationClock(60);
  private readonly presentation = new PresentationSystem();
  private readonly snapshots = new SnapshotBuffer(this.simulation.snapshot());
  private accumulatorSeconds = 0;
  private previousFrameMilliseconds = 0;
  private phase: ApplicationPhase = 'idle';

  private constructor(private readonly renderer: PixiRenderer) {}

  public static async create(host: HTMLElement): Promise<GameApplication> {
    const renderer = new PixiRenderer();
    await renderer.init(host);
    return new GameApplication(renderer);
  }

  public start(): void {
    if (this.phase !== 'idle') return;
    this.phase = 'home';
    this.renderer.startHome(this.beginCombat);
  }

  public stop(): void {
    if (this.phase === 'idle') return;
    const wasInCombat = this.phase === 'combat';
    this.phase = 'idle';
    this.renderer.stop();
    if (wasInCombat) this.input.detach();
  }

  public destroy(): void {
    this.stop();
    this.renderer.destroy();
  }

  private readonly beginCombat = (): void => {
    if (this.phase !== 'home') return;
    this.phase = 'combat';
    this.accumulatorSeconds = 0;
    this.previousFrameMilliseconds = performance.now();
    this.input.attach();
    this.renderer.start(this.frame);
  };

  private readonly frame = (nowMilliseconds: number): void => {
    if (this.phase !== 'combat') return;

    const frameSeconds = Math.min(
      Math.max((nowMilliseconds - this.previousFrameMilliseconds) / 1000, 0),
      MAX_FRAME_SECONDS,
    );
    this.previousFrameMilliseconds = nowMilliseconds;
    this.accumulatorSeconds += frameSeconds;

    const command = this.input.command();
    const viewport = this.renderer.viewport();
    let catchUpSteps = 0;

    while (
      this.accumulatorSeconds >= this.clock.fixedDeltaSeconds &&
      catchUpSteps < MAX_CATCH_UP_STEPS
    ) {
      this.simulation.step(this.clock.fixedDeltaSeconds, command, viewport);
      this.snapshots.commit(this.simulation.snapshot());
      this.accumulatorSeconds -= this.clock.fixedDeltaSeconds;
      catchUpSteps += 1;
    }

    if (catchUpSteps === MAX_CATCH_UP_STEPS) {
      this.accumulatorSeconds = Math.min(
        this.accumulatorSeconds,
        this.clock.fixedDeltaSeconds,
      );
    }

    const alpha = this.accumulatorSeconds / this.clock.fixedDeltaSeconds;
    const presentationState = this.presentation.project(
      this.snapshots.previous,
      this.snapshots.current,
      alpha,
    );
    this.renderer.present(presentationState);
  };
}
