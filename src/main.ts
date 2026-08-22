import { GameApplication } from './app/GameApplication';
import { HomeScreen } from './home/HomeScreen';
import './styles.css';

const bootstrap = async (): Promise<void> => {
  const host = document.querySelector<HTMLElement>('#app');

  if (!host) {
    throw new Error('Missing #app host element.');
  }

  let game: GameApplication | null = null;
  let starting = false;
  let home: HomeScreen | null = null;

  const startGame = async (): Promise<void> => {
    if (starting || game) return;
    starting = true;

    home?.destroy();
    home = null;
    host.classList.add('is-game-running');

    try {
      game = await GameApplication.create(host);
      game.start();
    } catch (error) {
      host.classList.remove('is-game-running');
      starting = false;
      throw error;
    }
  };

  home = HomeScreen.mount(host, () => {
    void startGame();
  });

  if (import.meta.hot) {
    import.meta.hot.dispose(() => {
      home?.destroy();
      game?.destroy();
    });
  }
};

void bootstrap();
