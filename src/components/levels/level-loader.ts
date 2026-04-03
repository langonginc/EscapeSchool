import { Game } from '../engine/game';
import { Level1Scene } from './level1';
import { MenuScene } from './menu-scene';

// 只有 level1 被实现，所以关卡总数为 1
// 如果以后添加更多关卡，需要：
// 1. 创建 level2.ts, level3.ts 等
// 2. 在这里 import 它们
// 3. 在 addScene 里注册
// 4. 更新 LEVEL_COUNTS 的值
export const LEVEL_COUNTS = 1;

export const setupGameScenes = (game: Game) => {
    game.addScene('menuScene', (g) => new MenuScene(g));

    game.addScene('level1', (g) => new Level1Scene(g));
}