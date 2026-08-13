export class SimulationClock {
  public readonly fixedDeltaSeconds: number;

  public constructor(public readonly ticksPerSecond = 60) {
    if (!Number.isFinite(ticksPerSecond) || ticksPerSecond <= 0) {
      throw new RangeError('ticksPerSecond must be a positive finite number.');
    }

    this.fixedDeltaSeconds = 1 / ticksPerSecond;
  }
}
