import { Container } from 'pixi.js';

export interface RenderLayers {
  readonly background: Container;
  readonly worldRoot: Container;
  readonly world: Container;
  readonly effects: Container;
  readonly foreground: Container;
  readonly hud: Container;
  readonly debug: Container;
}

export const createLayers = (): RenderLayers => {
  const background = new Container();
  const worldRoot = new Container();
  const world = new Container();
  const effects = new Container();
  const foreground = new Container();
  const hud = new Container();
  const debug = new Container();

  worldRoot.addChild(world, effects, foreground);

  return {
    background,
    worldRoot,
    world,
    effects,
    foreground,
    hud,
    debug,
  };
};
