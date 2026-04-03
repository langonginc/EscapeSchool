// dialog/MenuManager.ts (或者你存放的路径)
import { LEVEL_COUNTS } from './components/level';
// 🌟 引入我们自己写的 Game 类
import { Game } from './components/engine/game';

export const MenuManager = {
    uiContainer: null as HTMLElement | null,
    mainMenuView: null as HTMLElement | null,
    levelSelectView: null as HTMLElement | null,
    levelGrid: null as HTMLElement | null,
    
    // 🌟 核心引擎替换为我们的 Game 类
    game: null as Game | null, 

    totalLevels: 0,      
    unlockedLevel: 1,    
    saveKey: 'ES_save_data',

    // 🌟 初始化时传入我们的 Game 实例
    init(game: Game) {
        if (this.uiContainer) return;
        this.game = game;

        this.totalLevels = LEVEL_COUNTS;
        this.loadProgress();

        // ================= 根容器 =================
        this.uiContainer = document.createElement('div');
        this.uiContainer.className = 'ui-container';

        // ================= 视图 1：主菜单 =================
        this.mainMenuView = document.createElement('div');
        this.mainMenuView.className = 'menu-view main-menu-view';

        const title = document.createElement('h1');
        title.className = 'menu-title';
        title.innerText = '逃学';
        this.mainMenuView.appendChild(title);

        const startBtn = document.createElement('button');
        startBtn.className = 'menu-btn';
        startBtn.innerText = '开始游戏';
        startBtn.onclick = () => this.showLevelSelect();
        this.mainMenuView.appendChild(startBtn);

        this.uiContainer.appendChild(this.mainMenuView);

        // ================= 视图 2：选关界面 =================
        this.levelSelectView = document.createElement('div');
        this.levelSelectView.className = 'menu-view level-select-view';
        this.levelSelectView.style.display = 'none'; 

        const levelTitle = document.createElement('h2');
        levelTitle.className = 'level-title';
        levelTitle.innerText = '选择关卡';
        this.levelSelectView.appendChild(levelTitle);

        this.levelGrid = document.createElement('div');
        this.levelGrid.className = 'level-grid';
        this.levelSelectView.appendChild(this.levelGrid);

        const backBtn = document.createElement('button');
        backBtn.className = 'menu-btn back-btn'; 
        backBtn.innerText = '返回主菜单';
        backBtn.onclick = () => this.showMainMenu();
        this.levelSelectView.appendChild(backBtn);

        const clearBtn = document.createElement('button');
        clearBtn.className = 'clear-btn';
        clearBtn.innerText = '重置存档(测试用)';
        clearBtn.onclick = () => {
            localStorage.removeItem(this.saveKey);
            this.unlockedLevel = 1;
            this.renderLevelButtons(); 
            alert('存档已清空！');
        };
        this.levelSelectView.appendChild(clearBtn);

        this.uiContainer.appendChild(this.levelSelectView);
        document.body.appendChild(this.uiContainer);
    },

    // ================= 存档核心逻辑 =================
    loadProgress() {
        const savedData = localStorage.getItem(this.saveKey);
        if (savedData) {
            this.unlockedLevel = parseInt(savedData, 10);
        } else {
            this.unlockedLevel = 1;
        }
    },

    unlockNextLevel(currentLevelBeaten: number) {
        const nextLevel = currentLevelBeaten + 1;
        if (nextLevel > this.unlockedLevel && nextLevel <= this.totalLevels) {
            this.unlockedLevel = nextLevel;
            localStorage.setItem(this.saveKey, this.unlockedLevel.toString());
            console.log(`存档已保存！已解锁至第 ${this.unlockedLevel} 关`);
        }
    },

    renderLevelButtons() {
        if (!this.levelGrid) return;
        this.levelGrid.innerHTML = ''; 

        for (let i = 1; i <= this.totalLevels; i++) {
            const lvlBtn = document.createElement('button');
            lvlBtn.className = 'level-btn';
            
            if (i <= this.unlockedLevel) {
                lvlBtn.innerText = i.toString();
                lvlBtn.onclick = () => this.enterGame(`level${i}`);
            } else {
                lvlBtn.classList.add('locked');
                lvlBtn.innerText = '🔒';
            }
            
            this.levelGrid.appendChild(lvlBtn);
        }
    },

    // ================= 视图切换 =================
    showMainMenu() {
        this.uiContainer!.style.display = 'flex'; 
        this.levelSelectView!.style.display = 'none';
        this.mainMenuView!.style.display = 'block';
        
        // 🌟 使用我们自定义框架的 goToScene
        if (this.game) this.game.goToScene('menuScene'); 
    },

    showLevelSelect() {
        this.mainMenuView!.style.display = 'none';
        this.levelSelectView!.style.display = 'block';
        
        this.loadProgress();
        this.renderLevelButtons(); 
        
        // 🌟 同上
        if (this.game) this.game.goToScene('menuScene'); 
    },

    enterGame(levelName: string) {
        console.log(`[MenuManager.enterGame] 准备进入原生框架场景: ${levelName}`);
        
        // 隐藏 HTML 菜单 UI，露出底层的 Canvas 游戏画面
        this.uiContainer!.style.display = 'none'; 
        
        if (this.game) {
            // 🌟 彻底干掉了 Excalibur 的 director，直接调用我们的异步跳转
            this.game.goToScene(levelName).catch(err => {
                console.error(`进入场景 ${levelName} 失败:`, err);
            });
        }
    }
};