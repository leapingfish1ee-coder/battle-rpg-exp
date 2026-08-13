export class SnapshotBuffer<T> {
  public previous: T;
  public current: T;

  public constructor(initial: T) {
    this.previous = initial;
    this.current = initial;
  }

  public commit(next: T): void {
    this.previous = this.current;
    this.current = next;
  }
}
