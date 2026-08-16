import { DeterministicRng } from '../rng/DeterministicRng';
import type { EnemyRuntime, MutableVector2, SimulationViewport } from '../combat/RuntimeTypes';

const SOLO_INTERVAL_SECONDS = 1.45;
const GROUP_INTERVAL_SECONDS = 5.25;
const INITIAL_SOLO_DELAY_SECONDS = 0.35;
const INITIAL_GROUP_DELAY_SECONDS = 0.9;
const OFFSCREEN_MARGIN_MIN = 120;
const OFFSCREEN_MARGIN_MAX = 220;
const GROUP_MEMBER_MIN = 4;
const GROUP_MEMBER_VARIANCE = 3;
const GROUP_RADIUS_MIN = 26;
const GROUP_RADIUS_MAX = 54;
const MAX_ENEMY_COUNT = 72;
const CHASER_RADIUS = 10;
const GROUP_MEMBER_RADIUS = 11;
const CHASER_HEALTH = 2;
const GROUP_MEMBER_HEALTH = 3;

export interface EnemySpawnSnapshot {
  readonly soloSequence: number;
  readonly groupSequence: number;
}

export class EnemySpawnSystem {
  private readonly rng = new DeterministicRng(0x5a17c9e3);
  private soloRemainingSeconds = INITIAL_SOLO_DELAY_SECONDS;
  private groupRemainingSeconds = INITIAL_GROUP_DELAY_SECONDS;
  private soloSequence = 0;
  private groupSequence = 0;
  private nextGroupId = 1;

  public step(
    deltaSeconds: number,
    player: MutableVector2,
    viewport: SimulationViewport,
    enemies: EnemyRuntime[],
    allocateEnemyId: () => number,
  ): void {
    const delta = Math.max(deltaSeconds, 0);
    this.soloRemainingSeconds -= delta;
    this.groupRemainingSeconds -= delta;

    while (this.soloRemainingSeconds <= 0) {
      this.soloRemainingSeconds += SOLO_INTERVAL_SECONDS;
      if (enemies.length < MAX_ENEMY_COUNT) {
        this.spawnSolo(player, viewport, enemies, allocateEnemyId);
        this.soloSequence += 1;
      }
    }

    while (this.groupRemainingSeconds <= 0) {
      this.groupRemainingSeconds += GROUP_INTERVAL_SECONDS;
      if (enemies.length + GROUP_MEMBER_MIN <= MAX_ENEMY_COUNT) {
        this.spawnGroup(player, viewport, enemies, allocateEnemyId);
        this.groupSequence += 1;
      }
    }
  }

  public snapshot(): EnemySpawnSnapshot {
    return {
      soloSequence: this.soloSequence,
      groupSequence: this.groupSequence,
    };
  }

  private spawnSolo(
    player: MutableVector2,
    viewport: SimulationViewport,
    enemies: EnemyRuntime[],
    allocateEnemyId: () => number,
  ): void {
    const position = this.outsideViewport(player, viewport);
    enemies.push({
      id: allocateEnemyId(),
      groupId: null,
      behavior: 'chaser',
      position,
      velocity: { x: 0, y: 0 },
      radius: CHASER_RADIUS,
      health: CHASER_HEALTH,
      maxHealth: CHASER_HEALTH,
    });
  }

  private spawnGroup(
    player: MutableVector2,
    viewport: SimulationViewport,
    enemies: EnemyRuntime[],
    allocateEnemyId: () => number,
  ): void {
    const anchor = this.outsideViewport(player, viewport);
    const groupId = this.nextGroupId;
    this.nextGroupId += 1;
    const memberCount = Math.min(
      GROUP_MEMBER_MIN + Math.floor(this.rng.nextFloat() * GROUP_MEMBER_VARIANCE),
      MAX_ENEMY_COUNT - enemies.length,
    );
    const rotation = this.rng.nextFloat() * Math.PI * 2;

    for (let index = 0; index < memberCount; index += 1) {
      const angle = rotation + (index / memberCount) * Math.PI * 2;
      const radius =
        GROUP_RADIUS_MIN + this.rng.nextFloat() * (GROUP_RADIUS_MAX - GROUP_RADIUS_MIN);

      enemies.push({
        id: allocateEnemyId(),
        groupId,
        behavior: 'stationary-group',
        position: {
          x: anchor.x + Math.cos(angle) * radius,
          y: anchor.y + Math.sin(angle) * radius,
        },
        velocity: { x: 0, y: 0 },
        radius: GROUP_MEMBER_RADIUS,
        health: GROUP_MEMBER_HEALTH,
        maxHealth: GROUP_MEMBER_HEALTH,
      });
    }
  }

  private outsideViewport(player: MutableVector2, viewport: SimulationViewport): MutableVector2 {
    const halfWidth = Math.max(viewport.width, 320) / 2;
    const halfHeight = Math.max(viewport.height, 180) / 2;
    const margin =
      OFFSCREEN_MARGIN_MIN + this.rng.nextFloat() * (OFFSCREEN_MARGIN_MAX - OFFSCREEN_MARGIN_MIN);
    const edge = Math.floor(this.rng.nextFloat() * 4);

    if (edge === 0 || edge === 1) {
      return {
        x: player.x + (edge === 0 ? -1 : 1) * (halfWidth + margin),
        y: player.y + (this.rng.nextFloat() * 2 - 1) * (halfHeight + margin * 0.25),
      };
    }

    return {
      x: player.x + (this.rng.nextFloat() * 2 - 1) * (halfWidth + margin * 0.25),
      y: player.y + (edge === 2 ? -1 : 1) * (halfHeight + margin),
    };
  }
}
