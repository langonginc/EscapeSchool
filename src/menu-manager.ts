import * as ex from 'excalibur';
import { LEVEL_COUNTS } from './components/level';

export const MenuManager = {
    uiContainer: null as HTMLElement | null,
    mainMenuView: null as HTMLElement | null,
    levelSelectView: null as HTMLElement | null,
    levelGrid: null as HTMLElement | null, // 【新增】专门存放关卡按钮的容器
    gameEngine: null as ex.Engine | null, 

    // 【新增】进度管理属性
    totalLevels: 0,      // 游戏总关卡数（在 init 时再从 LEVEL_COUNTS 赋值，避免循环依赖导致的 TDZ）
    unlockedLevel: 1,    // 当前解锁到了第几关 (默认第 1 关)
    saveKey: 'ES_save_data', // 存在浏览器里的专属暗号

    init(engine: ex.Engine) {
        if (this.uiContainer) return;
        this.gameEngine = engine;

        // 延迟读取，避免 "Cannot access 'LEVEL_COUNTS' before initialization"（通常是循环 import 引起）
        this.totalLevels = LEVEL_COUNTS;

        // 1. 初始化时先读取本地存档！
        this.loadProgress();

        // 2. 全屏主容器
        this.uiContainer = document.createElement('div');
        this.uiContainer.style.position = 'absolute';
        this.uiContainer.style.top = '0';
        this.uiContainer.style.left = '0';
        this.uiContainer.style.width = '100%';
        this.uiContainer.style.height = '100%';
        this.uiContainer.style.backgroundColor = 'rgba(20, 20, 30, 0.95)'; 
        this.uiContainer.style.zIndex = '10000'; 
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
        startBtn.onclick = () => this.showLevelSelect();
        this.mainMenuView.appendChild(startBtn);

        this.uiContainer.appendChild(this.mainMenuView);

        // ================= 视图 2：选关界面 =================
        this.levelSelectView = document.createElement('div');
        this.levelSelectView.style.textAlign = 'center';
        this.levelSelectView.style.display = 'none'; 

        const levelTitle = document.createElement('h2');
        levelTitle.innerText = '选择关卡';
        levelTitle.style.fontSize = '36px';
        this.levelSelectView.appendChild(levelTitle);

        // 创建网格容器 (里面的按钮我们在 renderLevelButtons 里动态生成)
        this.levelGrid = document.createElement('div');
        this.levelGrid.className = 'level-grid';
        this.levelSelectView.appendChild(this.levelGrid);

        const backBtn = document.createElement('button');
        backBtn.className = 'menu-btn';
        backBtn.innerText = '返回主菜单';
        backBtn.style.marginTop = '20px';
        backBtn.onclick = () => this.showMainMenu();
        this.levelSelectView.appendChild(backBtn);

        // (可选) 调试用的清除存档按钮
        const clearBtn = document.createElement('button');
        clearBtn.innerText = '重置存档(测试用)';
        clearBtn.style.cssText = 'display:block; margin: 20px auto 0; background:none; color:#777; border:none; text-decoration:underline; cursor:pointer;';
        clearBtn.onclick = () => {
            localStorage.removeItem(this.saveKey);
            this.unlockedLevel = 1;
            this.renderLevelButtons(); // 重新渲染成全锁状态
            alert('存档已清空！');
        };
        this.levelSelectView.appendChild(clearBtn);

        this.uiContainer.appendChild(this.levelSelectView);
        document.body.appendChild(this.uiContainer);
    },

    // ================= 存档核心逻辑 =================
    
    // 读取进度
    loadProgress() {
        const savedData = localStorage.getItem(this.saveKey);
        if (savedData) {
            this.unlockedLevel = parseInt(savedData, 10);
        } else {
            this.unlockedLevel = 1; // 没玩过的新玩家，默认解锁第一关
        }
    },

    // 解锁下一关 (由 VictoryManager 调用)
    unlockNextLevel(currentLevelBeaten: number) {
        const nextLevel = currentLevelBeaten + 1;
        // 如果玩家通关的关卡，刚好是当前最高进度，才需要更新存档 (防止重复玩第一关覆盖了后面的进度)
        if (nextLevel > this.unlockedLevel && nextLevel <= this.totalLevels) {
            this.unlockedLevel = nextLevel;
            localStorage.setItem(this.saveKey, this.unlockedLevel.toString());
            console.log(`存档已保存！已解锁至第 ${this.unlockedLevel} 关`);
        }
    },

    // 动态生成关卡按钮 (每次打开选关界面时重新渲染)
    renderLevelButtons() {
        if (!this.levelGrid) return;
        this.levelGrid.innerHTML = ''; // 清空旧按钮

        for (let i = 1; i <= this.totalLevels; i++) {
            const lvlBtn = document.createElement('button');
            lvlBtn.className = 'level-btn';
            
            if (i <= this.unlockedLevel) {
                // 已解锁：正常显示数字，绑定点击事件
                lvlBtn.innerText = i.toString();
                lvlBtn.onclick = () => this.enterGame(`level${i}`);
            } else {
                // 未解锁：加上 locked 类，显示一把小锁，点击无效
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
        if (this.gameEngine) this.gameEngine.goToScene('menuScene'); 
    },

    showLevelSelect() {
        this.mainMenuView!.style.display = 'none';
        this.levelSelectView!.style.display = 'block';
        
        // 每次打开选关界面，都重新读取存档并渲染一次按钮，确保状态最新
        this.loadProgress();
        this.renderLevelButtons(); 
        
        if (this.gameEngine) this.gameEngine.goToScene('menuScene'); 
    },

    enterGame(levelName: string) {
        console.log(`[MenuManager.enterGame] 尝试进入: ${levelName}`);
        this.uiContainer!.style.display = 'none'; 
        console.log("👉 [跳转前检查] MenuManager 手里的引擎还是刚才那个吗？");
        console.log("👉 [跳转前检查] 现在的场景有：", this.gameEngine!.scenes);
        
        if (this.gameEngine) {
            console.log(`[MenuManager.enterGame] 正在调用 goToScene('${levelName}')`);
            
            // 【调试】详细检查场景对象
            const targetScene = this.gameEngine.scenes[levelName];
            console.log(`[MenuManager.enterGame] 目标场景对象:`, targetScene);
            console.log(`[MenuManager.enterGame] 场景是否存在:`, !!targetScene);
            
            // 确保场景存在后再转场
            if (targetScene) {
                this.gameEngine.director.goToScene(levelName);
            } else {
                console.error(`[MenuManager.enterGame] ❌ 场景 '${levelName}' 不存在！`);
            }
        }
    }
};