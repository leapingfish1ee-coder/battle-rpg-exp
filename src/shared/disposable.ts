export interface Disposable {
  dispose(): void;
}

export class DisposableScope implements Disposable {
  private readonly items: Disposable[] = [];

  public add<T extends Disposable>(item: T): T {
    this.items.push(item);
    return item;
  }

  public dispose(): void {
    for (let index = this.items.length - 1; index >= 0; index -= 1) {
      this.items[index]?.dispose();
    }
    this.items.length = 0;
  }
}
