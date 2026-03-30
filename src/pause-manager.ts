import * as ex from 'excalibur';
import { MenuManager } from './menu-manager';

export const PauseManager = {
    uiContainer: null as HTMLElement | null,
    gameEngine: null as ex.Engine | null,
    isPaused: false,

    init(engine: ex.Engine) {
        if (this.uiContainer) return;
        this.gameEngine = engine;

        // 1. 创建全屏毛玻璃遮罩
        this.uiContainer = document.createElement('div');
        this.uiContainer.style.position = 'absolute';
        this.uiContainer.style.top = '0';
        this.uiContainer.style.left = '0';
        this.uiContainer.style.width = '100%';
        this.uiContainer.style.height = '100%';
        this.uiContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.4)'; // 半透明黑底
        this.uiContainer.style.backdropFilter = 'blur(8px)'; // 【核心特效】毛玻璃模糊
        this.uiContainer.style.zIndex = '99999'; // 必须比 AlertManager 还要高
        this.uiContainer.style.display = 'none'; // 默认隐藏
        this.uiContainer.style.flexDirection = 'column';
        this.uiContainer.style.justifyContent = 'center';
        this.uiContainer.style.alignItems = 'center';
        this.uiContainer.style.fontFamily = 'sans-serif';

        // 3. 标题
        const title = document.createElement('div');
        title.className = 'pause-title';
        title.innerText = '已暂停';
        this.uiContainer.appendChild(title);

        // 4. 按钮组
        this.createButton('继续游戏', () => this.resume());
        this.createButton('重新开始', () => this.restartLevel());
        this.createButton('返回主菜单', () => this.quitToMenu());

        document.body.appendChild(this.uiContainer);
        
        // 5. 【极其关键】绑定浏览器原生键盘事件，突破引擎冻结限制
        window.addEventListener('keydown', (e) => {
            // 如果按下了 Esc 键，并且当前不在主菜单界面 (防止在主菜单按 Esc 报错)
            if (e.key === 'Escape' && MenuManager.uiContainer?.style.display === 'none') {
                this.toggle();
            }
        });
    },

    // 辅助创建按钮的函数
    createButton(text: string, onClick: () => void) {
        const btn = document.createElement('button');
        btn.className = 'pause-btn';
        btn.innerText = text;
        btn.onclick = onClick;
        this.uiContainer!.appendChild(btn);
    },

    toggle() {
        if (this.isPaused) {
            this.resume();
        } else {
            this.pause();
        }
    },

    pause() {
        this.isPaused = true;
        this.uiContainer!.style.display = 'flex';
        // 冻结 Excalibur 引擎！物理、渲染、动画全部时间停止！
        this.gameEngine!.stop(); 
    },

    resume() {
        this.isPaused = false;
        this.uiContainer!.style.display = 'none';
        // 唤醒引擎，游戏继续
        this.gameEngine!.start(); 
    },

    restartLevel() {
        this.resume(); // 先解除暂停
        // 最暴力的重开方式：直接刷新网页。
        // 如果你后期做了完善的场景清理逻辑，可以替换为重新加载当前 Scene
        window.location.reload(); 
    },

    quitToMenu() {
        this.resume(); // 【避坑】：必须先唤醒引擎，否则切回菜单后引擎依然是死机状态
        MenuManager.showMainMenu();
    }
};