import { GameApplication } from './app/GameApplication';
import './styles.css';

const bootstrap = async (): Promise<void> => {
  const host = document.querySelector<HTMLElement>('#app');

  if (!host) {
    throw new Error('Missing #app host element.');
  }

  const game = await GameApplication.create(host);
  game.start();

  if (import.meta.hot) {
    import.meta.hot.dispose(() => {
      game.destroy();
    });
  }
};

void bootstrap();
