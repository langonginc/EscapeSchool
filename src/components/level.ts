import * as ex from 'excalibur'
import { Level1Scene } from './levels/level1';

// 只有 level1 被实现，所以关卡总数为 1
// 如果以后添加更多关卡，需要：
// 1. 创建 level2.ts, level3.ts 等
// 2. 在这里 import 它们
// 3. 在 addScene 里注册
// 4. 更新 LEVEL_COUNTS 的值
export const LEVEL_COUNTS = 1;

export const setupGameScenes = (game: ex.Engine) => {
    console.log('[setupGameScenes] 开始注册场景...');
    game.director.add('menuScene', new ex.Scene());
    console.log('[setupGameScenes] ✓ menuScene 已注册');

    game.director.add('level1', new Level1Scene());
    console.log('[setupGameScenes] ✓ level1 已注册');
    console.log('[setupGameScenes] 所有场景注册完成！');

    console.log("👉 [立即检查] 刚注册完，字典里有 level1 吗？", !!game.scenes['level1']);
    console.log("👉 [立即检查] 引擎里的所有场景：", Object.keys(game.scenes));
}