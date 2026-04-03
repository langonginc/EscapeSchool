import { Game } from './components/engine/game';
import { MenuManager } from './menu-manager';

export const VictoryManager = {
    uiContainer: null as HTMLElement | null,
    game: null as Game | null,

    init(game: Game) {
        if (this.uiContainer) return;
        this.game = game;

        this.uiContainer = document.createElement('div');
        this.uiContainer.className = 'victory-container';

        const title = document.createElement('div');
        title.className = 'victory-title';
        title.innerText = '逃学顺利';
        this.uiContainer.appendChild(title);

        const subtitle = document.createElement('div');
        subtitle.className = 'victory-subtitle';
        subtitle.innerText = '恭喜你离开了学校！';
        this.uiContainer.appendChild(subtitle);

        this.createButton('返回选关', () => this.quitToLevelSelect());

        document.body.appendChild(this.uiContainer);
    },

    createButton(text: string, onClick: () => void) {
        const btn = document.createElement('button');
        btn.className = 'victory-btn';
        btn.innerText = text;
        btn.onclick = onClick;
        this.uiContainer!.appendChild(btn);
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

    quitToLevelSelect() {
        this.hide();
        this.game!.isPaused = false;
        MenuManager.showMainMenu();
        MenuManager.showLevelSelect();
    }
};