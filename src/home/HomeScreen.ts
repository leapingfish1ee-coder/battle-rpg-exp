export class HomeScreen {
  private readonly root: HTMLElement;

  private constructor(root: HTMLElement) {
    this.root = root;
  }

  public static mount(host: HTMLElement, onStart: () => void): HomeScreen {
    const root = document.createElement('section');
    root.className = 'home-screen';
    root.setAttribute('aria-label', 'Battle RPG home');
    root.innerHTML = `
      <div class="home-screen__veil" aria-hidden="true"></div>
      <div class="home-screen__ornament home-screen__ornament--left" aria-hidden="true"></div>
      <div class="home-screen__ornament home-screen__ornament--right" aria-hidden="true"></div>
      <div class="home-screen__content">
        <p class="home-screen__eyebrow">THE ASHEN FRONTIER</p>
        <h1 class="home-screen__title">Battle RPG</h1>
        <p class="home-screen__subtitle">Steel, sorcery and shattered oaths await beyond the last kingdom.</p>
        <div class="home-screen__divider" aria-hidden="true"><span></span></div>
        <p class="home-screen__copy">Enter a hostile frontier where every skirmish is immediate, every weapon has weight, and survival belongs to those who keep moving.</p>
        <button class="home-screen__start" type="button" data-action="start-game">
          <span>Enter the Frontier</span>
        </button>
        <p class="home-screen__hint">WASD to move · combat begins automatically</p>
      </div>
      <footer class="home-screen__footer">A combat prototype forged in PixiJS</footer>
    `;

    const startButton = root.querySelector<HTMLButtonElement>('[data-action="start-game"]');
    if (!startButton) {
      throw new Error('Missing home screen start button.');
    }

    startButton.addEventListener('click', onStart, { once: true });
    host.appendChild(root);
    return new HomeScreen(root);
  }

  public destroy(): void {
    this.root.remove();
  }
}
