// @ts-ignore: Allow importing CSS without type declarations
import './styles/index.css'

import { Game } from './components/engine/game';
import { setupGameScenes } from './components/levels/level-loader';
import { setupDialogs } from './dialog/dialog-loader';
import { DialogManager } from './dialog/dialog-manager';
import { MenuManager } from './menu-manager';
import { PauseManager } from './pause-manager';
import { AlertManager } from './alert-manager';
import { GameOverManager } from './game-over-manager';
import { VictoryManager } from './victory-manager';

const game = new Game('gameCanvas', 800, 600); // 替换为你的 Canvas ID 和尺寸

// 2. 初始化各大系统
MenuManager.init(game);
DialogManager.init();
PauseManager.init(game);
AlertManager.init();
GameOverManager.init(game);
VictoryManager.init(game);
setupDialogs();

// 3. 注册所有的场景工厂（懒加载机制，随用随 new）
setupGameScenes(game);

// 4. 启动游戏并展示主菜单
game.start();
MenuManager.showMainMenu();
