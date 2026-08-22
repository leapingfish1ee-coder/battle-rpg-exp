export interface MenuInputHandlers {
  readonly onMoveSelection: (step: -1 | 1) => void;
  readonly onConfirm: () => void;
}

const PREVENT_DEFAULT_KEYS = new Set([
  'ArrowUp',
  'ArrowDown',
  'KeyW',
  'KeyS',
  'Enter',
  'Space',
]);

export class BrowserInput {
  private handlers: MenuInputHandlers | undefined;
  private attached = false;

  private readonly onKeyDown = (event: KeyboardEvent): void => {
    if (PREVENT_DEFAULT_KEYS.has(event.code)) event.preventDefault();
    if (event.repeat) return;

    if (event.code === 'ArrowUp' || event.code === 'KeyW') {
      this.handlers?.onMoveSelection(-1);
      return;
    }

    if (event.code === 'ArrowDown' || event.code === 'KeyS') {
      this.handlers?.onMoveSelection(1);
      return;
    }

    if (event.code === 'Enter' || event.code === 'Space') {
      this.handlers?.onConfirm();
    }
  };

  public attach(handlers: MenuInputHandlers): void {
    this.handlers = handlers;
    if (this.attached) return;
    window.addEventListener('keydown', this.onKeyDown);
    this.attached = true;
  }

  public detach(): void {
    if (!this.attached) return;
    window.removeEventListener('keydown', this.onKeyDown);
    this.handlers = undefined;
    this.attached = false;
  }
}
