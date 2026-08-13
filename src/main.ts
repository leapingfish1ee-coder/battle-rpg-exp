import { GameApplication } from './app/GameApplication';
import { MainEntry } from './ui/MainEntry';
import './styles.css';

const host = document.querySelector<HTMLElement>('#app');

if (!host) {
  throw new Error('Missing #app host element.');
}

let game: GameApplication | undefined;

const entry = new MainEntry(host, {
  async start(gameHost) {
    game ??= await GameApplication.create(gameHost);
    game.start();
  },
  exit() {
    game?.stop();
  },
});

entry.mount();

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    game?.destroy();
    entry.destroy();
  });
}
