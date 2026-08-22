import {
  confirmTownFacility,
  createInitialAdventureState,
  moveTownSelection,
  selectTownFacility,
  type AdventureState,
  type TownFacility,
} from '../domain/adventure-state';
import { BrowserInput } from '../input/BrowserInput';
import { PixiRenderer } from '../rendering/pixi-app/PixiRenderer';

export class GameApplication {
  private readonly input = new BrowserInput();
  private state: AdventureState = createInitialAdventureState();
  private running = false;

  private constructor(private readonly renderer: PixiRenderer) {}

  public static async create(host: HTMLElement): Promise<GameApplication> {
    const renderer = new PixiRenderer();
    await renderer.init(host);
    return new GameApplication(renderer);
  }

  public start(): void {
    if (this.running) return;
    this.running = true;
    this.renderer.startTown(this.state, {
      onSelectFacility: this.selectFacility,
    });
    this.input.attach({
      onMoveSelection: this.moveSelection,
      onConfirm: this.confirmSelection,
    });
  }

  public stop(): void {
    if (!this.running) return;
    this.running = false;
    this.input.detach();
    this.renderer.stop();
  }

  public destroy(): void {
    this.stop();
    this.renderer.destroy();
  }

  private readonly selectFacility = (facility: TownFacility): void => {
    this.state = selectTownFacility(this.state, facility);
    this.renderer.presentTown(this.state);
  };

  private readonly moveSelection = (step: -1 | 1): void => {
    this.state = moveTownSelection(this.state, step);
    this.renderer.presentTown(this.state);
  };

  private readonly confirmSelection = (): void => {
    this.state = confirmTownFacility(this.state);
    this.renderer.presentTown(this.state);
  };
}
