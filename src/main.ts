import './styles.css';

const host = document.querySelector<HTMLElement>('#app');

if (!host) {
  throw new Error('Missing #app host element.');
}

const title = document.createElement('h1');
title.className = 'project-title';
title.textContent = '战斗 RPG 实验';

host.replaceChildren(title);
