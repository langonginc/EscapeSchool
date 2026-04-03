import { Game } from './components/engine/game';

export const GameOverManager = {
    uiContainer: null as HTMLElement | null,
    game: null as Game | null,

    init(game: Game) {
        if (this.uiContainer) return;
        this.game = game;

        this.uiContainer = document.createElement('div');
        this.uiContainer.className = 'gameover-container';

        const title = document.createElement('h1');
        title.className = 'gameover-title';
        title.innerText = '你被抓住了！';
        this.uiContainer.appendChild(title);

        const retryBtn = document.createElement('button');
        retryBtn.className = 'gameover-btn';
        retryBtn.innerText = '重新开始本关';
        retryBtn.onclick = () => this.retry();
        this.uiContainer.appendChild(retryBtn);

        document.body.appendChild(this.uiContainer);
    },

    show() {
        if (this.uiContainer) {
            this.uiContainer.style.display = 'flex';
        }
    },

    hide() {
        if (this.uiContainer) {
            this.uiContainer.style.display = 'none';
        }
    },

    retry() {
        this.hide();
        this.game!.isPaused = false;
        this.game!.goToScene(this.game!.currentSceneName);
    }
};