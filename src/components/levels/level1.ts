import { TiledResource } from "@excaliburjs/plugin-tiled";
import * as ex from "excalibur";
import { EnemyType } from "../../constants/enemy";
import { loadDialog } from "../../dialog/dialog-loader";
import { DialogManager } from "../../dialog/dialog-manager";
import { loadActor } from "../load-actor";
import { loadEnemy } from "../load-enemy";
import { VictoryManager } from "../../victory-manager";

export class Level1Scene extends ex.Scene {
    async onInitialize(game: ex.Engine) {
        const mapResource = new TiledResource('/tiled/map1.tmx'); 
        await mapResource.load();
        mapResource.addToScene(game.currentScene);

        const tileMaps = game.currentScene.tileMaps;
        tileMaps.filter(map => map.name === 'Wall').forEach(map => {
            map.tiles.forEach(tile => {
                if (tile.getGraphics().length > 0) { 
                    tile.solid = true;
                }
            });
        });
        const wallLayer = tileMaps.find(map => map.name === 'Wall');

        // Check start pos.
        let startX = 100;
        let startY = 100;
        const objects = mapResource.getObjectsByName('PlayerStart');
        if (objects && objects.length > 0) {
            startX = objects[0].x;
            startY = objects[0].y;
        }

        // Check start pos.
        let e1X = 100;
        let e1Y = 100;
        const objectse1 = mapResource.getObjectsByName('E1');
        if (objectse1 && objectse1.length > 0) {
            e1X = objectse1[0].x;
            e1Y = objectse1[0].y;
        }

        const player = await loadActor(startX, startY, game, wallLayer!);

        game.add(player);
        game.add(await loadEnemy(EnemyType.Liu, e1X, e1Y, player, wallLayer!));
        
        game.currentScene.camera.strategy.lockToActor(player);
        // game.toggleDebug();


        // 1. 获取所有的对象图层 (Object Layers)，这是 0.32.0 官方保留的正确 API
        const objectLayers = mapResource.getObjectLayers();

        // 2. 遍历这些图层
        for (const layer of objectLayers) {
            
            // 3. 找到你画触发器的那个图层 (注意和 Tiled 里的名字保持一致)
            if (layer.name === 'Trigger') {
                
                // 4. 遍历图层里的所有对象
                for (const obj of layer.objects) {
                    
                    // 5. 找到名字叫 WinZone 的区域 (转小写匹配，防止大小写手误)
                    if (obj.name?.toLowerCase() === 'win') {
                        
                        // 【绝杀 1】：用 as any 强行让 TypeScript 闭嘴，绕过官方有 Bug 的类型检查
                        const tObj = obj as any; 
                        
                        // 【绝杀 2】：双保险兼容！新版插件中，原始 Tiled 数据可能被封装在 tiledObject 里，也可能直接就在自身
                        const rawObj = tObj.tiledObject || tObj;

                        // 确保它是一个画好的矩形区域，而不是一个点
                        if (!rawObj.width || !rawObj.height) continue;

                        // 6. 创建 Excalibur 触发器
                        const winTrigger = new ex.Trigger({
                            width: rawObj.width,
                            height: rawObj.height,
                            pos: ex.vec(rawObj.x + rawObj.width / 2, rawObj.y + rawObj.height / 2),
                            target: player, 
                            action: () => {
                                // 1. 冻结游戏一切逻辑（物理、敌人追踪等瞬间停止）
                                game.stop(); 
                                
                                // 2. 弹出金光闪闪的胜利面板！
                                VictoryManager.show(); 
                            }
                        });

                        // 7. 将触发器添加到游戏场景中
                        game.add(winTrigger);
                        // 注意：如果你是在 Scene 类的 onInitialize 里面写这段代码，上面这句可能需要改成 this.add(winTrigger);
                    }
                }
            }
        }

        loadDialog('1-1').then(dialogs => {
            DialogManager.start(dialogs);
        });
    }
    
    onActivate() {
        // 每次进入这个场景时触发（比如从暂停菜单回来，或者重新开始）
        console.log("进入关卡 1");
    }
}