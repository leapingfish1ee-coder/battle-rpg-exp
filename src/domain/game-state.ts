export interface Vector2 {
  readonly x: number;
  readonly y: number;
}

export interface PlayerState {
  readonly position: Vector2;
  readonly velocity: Vector2;
}

export interface GameState {
  readonly tick: number;
  readonly player: PlayerState;
}

export interface PlayerCommand {
  readonly moveX: number;
  readonly moveY: number;
}
