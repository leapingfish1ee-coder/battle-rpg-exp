export interface MainEntryActions {
  start(gameHost: HTMLElement): Promise<void>;
  exit(): void;
}

export class MainEntry {
  private readonly root = document.createElement('main');
  private readonly landing = document.createElement('section');
  private readonly gameShell = document.createElement('section');
  private readonly gameHost = document.createElement('div');
  private readonly startButton = document.createElement('button');
  private readonly exitButton = document.createElement('button');
  private readonly errorMessage = document.createElement('p');
  private starting = false;

  public constructor(
    private readonly host: HTMLElement,
    private readonly actions: MainEntryActions,
  ) {
    this.root.className = 'entry-shell';
    this.root.dataset.testid = 'entry';

    this.landing.className = 'entry-landing';
    this.landing.innerHTML = `
      <div class="entry-noise" aria-hidden="true"></div>
      <header class="entry-header">
        <div class="entry-brand" aria-label="Battle RPG EXP">
          <span class="entry-brand-mark" aria-hidden="true">B</span>
          <span>BATTLE RPG <strong>EXP</strong></span>
        </div>
        <div class="entry-status"><span></span> SYSTEM READY</div>
      </header>
      <div class="entry-content">
        <div class="entry-kicker">PIXEL COMBAT PROTOCOL / 00</div>
        <h1>ENTER THE<br><em>COMBAT GRID</em></h1>
        <p class="entry-description">基于 PixiJS 的 2D RPG 战斗实验场，采用固定步长模拟与独立表现层。</p>
        <div class="entry-actions"></div>
        <div class="entry-metrics" aria-label="Runtime status">
          <div><span>RENDERER</span><strong>PIXIJS v8</strong></div>
          <div><span>SIMULATION</span><strong>60 HZ</strong></div>
          <div><span>INPUT</span><strong>WASD / ARROWS</strong></div>
        </div>
      </div>
      <footer class="entry-footer">
        <span>BUILD / EXPERIMENTAL</span>
        <span>DOMAIN → SIMULATION → PRESENTATION → RENDERING</span>
      </footer>
    `;

    this.startButton.type = 'button';
    this.startButton.className = 'entry-start';
    this.startButton.dataset.testid = 'start-game';
    this.startButton.innerHTML = '<span>进入战斗</span><span aria-hidden="true">→</span>';
    this.startButton.addEventListener('click', this.handleStart);

    this.errorMessage.className = 'entry-error';
    this.errorMessage.setAttribute('role', 'alert');

    const actionsHost = this.landing.querySelector<HTMLElement>('.entry-actions');
    if (!actionsHost) throw new Error('Missing entry actions host.');
    actionsHost.append(this.startButton, this.errorMessage);

    this.gameShell.className = 'game-shell';
    this.gameShell.dataset.testid = 'game-shell';
    this.gameShell.setAttribute('aria-hidden', 'true');

    this.gameHost.className = 'game-host';
    this.gameHost.dataset.testid = 'game-host';

    const gameHud = document.createElement('div');
    gameHud.className = 'game-shell-hud';
    gameHud.innerHTML = '<span>BATTLE RPG EXP</span><span class="game-shell-hint">WASD / 方向键移动</span>';

    this.exitButton.type = 'button';
    this.exitButton.className = 'game-shell-exit';
    this.exitButton.dataset.testid = 'exit-game';
    this.exitButton.textContent = '返回入口';
    this.exitButton.addEventListener('click', this.handleExit);
    gameHud.appendChild(this.exitButton);

    this.gameShell.append(this.gameHost, gameHud);
    this.root.append(this.gameShell, this.landing);
  }

  public mount(): void {
    this.host.replaceChildren(this.root);
  }

  public destroy(): void {
    this.startButton.removeEventListener('click', this.handleStart);
    this.exitButton.removeEventListener('click', this.handleExit);
    this.root.remove();
  }

  private readonly handleStart = async (): Promise<void> => {
    if (this.starting) return;
    this.starting = true;
    this.startButton.disabled = true;
    this.startButton.firstElementChild!.textContent = '启动中';
    this.errorMessage.textContent = '';

    try {
      await this.actions.start(this.gameHost);
      this.showGame();
    } catch (error) {
      console.error(error);
      this.errorMessage.textContent = '启动失败，请刷新页面后重试。';
    } finally {
      this.starting = false;
      this.startButton.disabled = false;
      this.startButton.firstElementChild!.textContent = '进入战斗';
    }
  };

  private readonly handleExit = (): void => {
    this.actions.exit();
    this.showLanding();
  };

  private showGame(): void {
    this.landing.classList.add('is-hidden');
    this.gameShell.classList.add('is-active');
    this.gameShell.setAttribute('aria-hidden', 'false');
    this.exitButton.focus();
  }

  private showLanding(): void {
    this.gameShell.classList.remove('is-active');
    this.gameShell.setAttribute('aria-hidden', 'true');
    this.landing.classList.remove('is-hidden');
    this.startButton.focus();
  }
}
