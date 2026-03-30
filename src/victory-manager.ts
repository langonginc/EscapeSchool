import * as ex from 'excalibur';
import { MenuManager } from './menu-manager';

export const VictoryManager = {
    uiContainer: null as HTMLElement | null,
    gameEngine: null as ex.Engine | null,

    init(engine: ex.Engine) {
        if (this.uiContainer) return;
        this.gameEngine = engine;

        // 1. 创建全屏遮罩 (使用深色带一点金黄色的渐变或半透明底)
        this.uiContainer = document.createElement('div');
        this.uiContainer.style.position = 'absolute';
        this.uiContainer.style.top = '0';
        this.uiContainer.style.left = '0';
        this.uiContainer.style.width = '100%';
        this.uiContainer.style.height = '100%';
        this.uiContainer.style.backgroundColor = 'rgba(20, 30, 10, 0.85)'; // 偏暗的墨绿色底
        this.uiContainer.style.backdropFilter = 'blur(5px)';
        this.uiContainer.style.zIndex = '100000'; // 最高层级
        this.uiContainer.style.display = 'none'; // 默认隐藏
        this.uiContainer.style.flexDirection = 'column';
        this.uiContainer.style.justifyContent = 'center';
        this.uiContainer.style.alignItems = 'center';
        this.uiContainer.style.fontFamily = 'sans-serif';

        // 3. 胜利标题
        const title = document.createElement('div');
        title.className = 'victory-title';
        title.innerText = '逃学顺利';
        this.uiContainer.appendChild(title);

        // (可选) 可以在这里加一个评分或者用时展示
        const subtitle = document.createElement('div');
        subtitle.innerText = '恭喜你离开了学校！';
        subtitle.style.color = '#fff';
        subtitle.style.fontSize = '20px';
        subtitle.style.marginBottom = '40px';
        this.uiContainer.appendChild(subtitle);

        // 4. 按钮组
        this.createButton('返回选关', () => this.quitToLevelSelect());
        // 如果你以后做好了连贯的关卡，可以在这里加一个 "下一关" 的按钮

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
        // 【关键排坑】：因为玩家碰到终点时我们调用了 engine.stop()，
        // 所以在切回菜单前，必须先唤醒引擎，否则菜单里的动画和下一次进游戏都会卡死！
        this.gameEngine!.start(); 
        
        // 调用菜单管理器，显示选关界面
        MenuManager.showLevelSelect();
    }
};