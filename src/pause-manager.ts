import { Game } from './components/engine/game';
import { DialogManager } from './dialog/dialog-manager';
import { MenuManager } from './menu-manager';

export const PauseManager = {
    uiContainer: null as HTMLElement | null,
    game: null as Game | null,

    init(game: Game) {
        if (this.uiContainer) return;
        this.game = game;

        // ================= 根容器 =================
        this.uiContainer = document.createElement('div');
        this.uiContainer.className = 'pause-container';

        // ================= 标题 =================
        const title = document.createElement('div');
        title.className = 'pause-title';
        title.innerText = '游戏暂停';
        this.uiContainer.appendChild(title);

        // ================= 按钮组 =================
        const btnGroup = document.createElement('div');
        btnGroup.className = 'pause-btn-group';

        // 1. 继续游戏
        const resumeBtn = document.createElement('button');
        resumeBtn.className = 'pause-btn';
        resumeBtn.innerText = '继续游戏';
        resumeBtn.onclick = () => this.resume();
        btnGroup.appendChild(resumeBtn);

        // 2. 重新开始
        const restartBtn = document.createElement('button');
        restartBtn.className = 'pause-btn warning';
        restartBtn.innerText = '重新开始';
        restartBtn.onclick = () => this.restart();
        btnGroup.appendChild(restartBtn);

        // 3. 回到关卡选择
        const levelBtn = document.createElement('button');
        levelBtn.className = 'pause-btn';
        levelBtn.innerText = '关卡选择';
        levelBtn.onclick = () => this.goToLevelSelect();
        btnGroup.appendChild(levelBtn);

        // 4. 回到主界面
        const mainBtn = document.createElement('button');
        mainBtn.className = 'pause-btn';
        mainBtn.innerText = '回到主界面';
        mainBtn.onclick = () => this.goToMainMenu();
        btnGroup.appendChild(mainBtn);

        this.uiContainer.appendChild(btnGroup);
        document.body.appendChild(this.uiContainer);

        // ================= 监听 ESC 键 =================
        window.addEventListener('keydown', (e) => {
            // 如果按下的是 ESC，并且当前正在玩关卡（不在主菜单）
            if (e.key === 'Escape' || e.key === 'Esc') {
                this.togglePause();
            }
        });
    },

    togglePause() {
        if (!this.game) return;
        // 如果当前是菜单场景，不允许暂停
        if (this.game.currentSceneName === 'menuScene') return;

        if (this.game.isPaused) {
            this.resume();
        } else {
            this.pause();
        }
    },

    pause() {
        if (!this.game) return;
        this.game.isPaused = true;
        this.uiContainer!.style.display = 'flex'; // 显示暂停菜单
    },

    resume() {
        if (!this.game) return;
        this.game.isPaused = false;
        this.uiContainer!.style.display = 'none'; // 隐藏暂停菜单
    },

    restart() {
        this.resume(); // 先解除暂停状态
        DialogManager.close();
        if (this.game && this.game.currentSceneName) {
            // 重新加载当前的场景名即可实现重开！
            this.game.goToScene(this.game.currentSceneName);
        }
    },

    goToLevelSelect() {
        this.resume();
        DialogManager.close();
        MenuManager.showMainMenu();
        MenuManager.showLevelSelect();
    },

    goToMainMenu() {
        this.resume();
        DialogManager.close();
        MenuManager.showMainMenu();
    }
};