export interface PresentationState {
  readonly player: {
    readonly x: number;
    readonly y: number;
  };
  readonly countdown: {
    readonly progress: number;
    readonly remainingSeconds: number;
    readonly timedOut: boolean;
  };
  readonly damagePopup: {
    readonly sequence: number;
    readonly amount: number;
  };
}
