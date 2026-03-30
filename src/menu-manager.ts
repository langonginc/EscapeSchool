import * as ex from 'excalibur';
import { LEVEL_COUNTS } from './components/level';

export const MenuManager = {
    uiContainer: null as HTMLElement | null,
    mainMenuView: null as HTMLElement | null,
    levelSelectView: null as HTMLElement | null,
    gameEngine: null as ex.Engine | null, // 保存引擎引用，方便切换场景

    init(engine: ex.Engine) {
        if (this.uiContainer) return;
        this.gameEngine = engine;

        // 1. 全屏主容器 (黑色半透明遮罩)
        this.uiContainer = document.createElement('div');
        this.uiContainer.style.position = 'absolute';
        this.uiContainer.style.top = '0';
        this.uiContainer.style.left = '0';
        this.uiContainer.style.width = '100%';
        this.uiContainer.style.height = '100%';
        this.uiContainer.style.backgroundColor = 'rgba(20, 20, 30, 0.95)'; // 深色背景
        this.uiContainer.style.zIndex = '10000'; // 最顶层
        this.uiContainer.style.display = 'flex';
        this.uiContainer.style.flexDirection = 'column';
        this.uiContainer.style.justifyContent = 'center';
        this.uiContainer.style.alignItems = 'center';
        this.uiContainer.style.fontFamily = 'sans-serif';
        this.uiContainer.style.color = '#fff';

        // ================= 视图 1：主菜单 =================
        this.mainMenuView = document.createElement('div');
        this.mainMenuView.style.textAlign = 'center';

        const title = document.createElement('h1');
        title.innerText = '逃学';
        title.style.fontSize = '64px';
        title.style.marginBottom = '50px';
        title.style.letterSpacing = '5px';
        title.style.textShadow = '0 0 20px rgba(255,255,255,0.5)';
        this.mainMenuView.appendChild(title);

        const startBtn = document.createElement('button');
        startBtn.className = 'menu-btn';
        startBtn.innerText = '开始游戏';
        startBtn.onclick = () => this.showLevelSelect(); // 点击切换到选关
        this.mainMenuView.appendChild(startBtn);

        this.uiContainer.appendChild(this.mainMenuView);

        // ================= 视图 2：选关界面 =================
        this.levelSelectView = document.createElement('div');
        this.levelSelectView.style.textAlign = 'center';
        this.levelSelectView.style.display = 'none'; // 默认隐藏

        const levelTitle = document.createElement('h2');
        levelTitle.innerText = '选择关卡';
        levelTitle.style.fontSize = '36px';
        this.levelSelectView.appendChild(levelTitle);

        const grid = document.createElement('div');
        grid.className = 'level-grid';
        
        // 动态生成 6 个关卡按钮
        for (let i = 1; i <= LEVEL_COUNTS; i++) {
            const lvlBtn = document.createElement('button');
            lvlBtn.className = 'level-btn';
            lvlBtn.innerText = i.toString();
            lvlBtn.onclick = () => this.enterGame(`level${i}`); // 点击进入对应关卡
            grid.appendChild(lvlBtn);
        }
        this.levelSelectView.appendChild(grid);

        const backBtn = document.createElement('button');
        backBtn.className = 'menu-btn';
        backBtn.innerText = '返回主菜单';
        backBtn.style.marginTop = '20px';
        backBtn.onclick = () => this.showMainMenu();
        this.levelSelectView.appendChild(backBtn);

        this.uiContainer.appendChild(this.levelSelectView);
        document.body.appendChild(this.uiContainer);
    },

    showMainMenu() {
        this.uiContainer!.style.display = 'flex';
        this.levelSelectView!.style.display = 'none';
        this.mainMenuView!.style.display = 'block';

        if (this.gameEngine) {
            this.gameEngine.goToScene('menuScene'); 
        }
    },

    showLevelSelect() {
        this.uiContainer!.style.display = 'flex';
        this.mainMenuView!.style.display = 'none';
        this.levelSelectView!.style.display = 'block';

        if (this.gameEngine) {
            this.gameEngine.goToScene('menuScene'); 
        }
    },

    // 核心逻辑：隐藏 UI，并通知 Excalibur 引擎加载场景
    enterGame(levelName: string) {
        this.uiContainer!.style.display = 'none'; // 隐藏所有菜单
        
        if (this.gameEngine) {
            // 跳转到 Excalibur 中注册的对应 Scene
            this.gameEngine.goToScene(levelName);
        }
    }
};