import { Container } from 'pixi.js';

export interface RenderLayers {
  readonly background: Container;
  readonly world: Container;
  readonly effects: Container;
  readonly foreground: Container;
  readonly hud: Container;
  readonly debug: Container;
}

export const createLayers = (): RenderLayers => ({
  background: new Container(),
  world: new Container(),
  effects: new Container(),
  foreground: new Container(),
  hud: new Container(),
  debug: new Container(),
});
