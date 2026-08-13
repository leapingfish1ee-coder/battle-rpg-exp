export interface Vector2 {
  readonly x: number;
  readonly y: number;
}

export interface PlayerState {
  readonly position: Vector2;
}

export interface CountdownState {
  readonly durationSeconds: number;
  readonly remainingSeconds: number;
  readonly timedOut: boolean;
  readonly timeoutSequence: number;
  readonly damageAmount: number;
}

export interface GameState {
  readonly tick: number;
  readonly player: PlayerState;
  readonly countdown: CountdownState;
}

export interface PlayerCommand {
  readonly moveX: number;
  readonly moveY: number;
}
