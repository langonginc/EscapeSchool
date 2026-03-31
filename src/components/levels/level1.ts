import { TiledResource } from "@excaliburjs/plugin-tiled";
import * as ex from "excalibur";
import { EnemyType } from "../../constants/enemy";
import { loadDialog } from "../../dialog/dialog-loader";
import { DialogManager } from "../../dialog/dialog-manager";
import { VictoryManager } from "../../victory-manager";
import { loadActor } from "../load-actor";
import { loadEnemy } from "../load-enemy";

export class Level1Scene extends ex.Scene {
    // 提升作用域：把地图资源保存为类的属性，这样就不需要每次都去下载网络请求了
    private mapResource!: TiledResource;
    private isMapLoaded: boolean = false;

    // 1. 初始化 (只执行一次)：专心加载资源
    async onInitialize(engine: ex.Engine) {
        this.mapResource = new TiledResource('/tiled/map1.tmx'); 
        await this.mapResource.load();
        this.isMapLoaded = true;
    }
    
    // 2. 激活钩子 (每次进入场景、从菜单回来、重开时都会触发！)
    onActivate(context: ex.SceneActivationContext<unknown>) {
        console.log("进入关卡 1，正在重置/构建场景...");
        // 每次进入场景，都调用我们封装好的刷新接口
        this.resetLevel(context.engine);
    }

    // 3. 【核心】封装好的刷新接口
    public async resetLevel(engine: ex.Engine) {
        if (!this.isMapLoaded) return; // 确保地图已经下载完了

        // 【大扫除】：把上一次玩的时候剩下的小猪、敌人、触发器、甚至地图图层全部清空！
        this.clear(); 

        // ====== 下面的代码基本是你原来的逻辑，但我帮你把 game 改成了 this / engine ======

        // 重新把地图铺到当前场景 (this)
        this.mapResource.addToScene(this);

        const tileMaps = this.tileMaps; // 改用 this.tileMaps
        tileMaps.filter(map => map.name === 'Wall').forEach(map => {
            map.tiles.forEach(tile => {
                if (tile.getGraphics().length > 0) { 
                    tile.solid = true;
                }
            });
        });
        const wallLayer = tileMaps.find(map => map.name === 'Wall');

        // Check start pos
        let startX = 100;
        let startY = 100;
        const objects = this.mapResource.getObjectsByName('PlayerStart');
        if (objects && objects.length > 0) {
            startX = objects[0]!.x;
            startY = objects[0]!.y;
        }

        // Check enemy pos
        let e1X = 100;
        let e1Y = 100;
        const objectse1 = this.mapResource.getObjectsByName('E1');
        if (objectse1 && objectse1.length > 0) {
            e1X = objectse1[0]!.x;
            e1Y = objectse1[0]!.y;
        }

        // 加载角色 (传入 engine 和 wallLayer)
        const player = await loadActor(startX, startY, engine, wallLayer!);
        
        // 把角色和敌人添加到当前场景 (this.add)
        this.add(player);
        this.add(await loadEnemy(EnemyType.Liu, e1X, e1Y, player, wallLayer!));
        
        // 绑定相机
        this.camera.strategy.lockToActor(player);

        // --- 触发器逻辑 ---
        const objectLayers = this.mapResource.getObjectLayers();
        for (const layer of objectLayers) {
            if (layer.name === 'Trigger') {
                for (const obj of layer.objects) {
                    if (obj.name?.toLowerCase() === 'win') {
                        const tObj = obj as any; 
                        const rawObj = tObj.tiledObject || tObj;
                        if (!rawObj.width || !rawObj.height) continue;

                        const winTrigger = new ex.Trigger({
                            width: rawObj.width,
                            height: rawObj.height,
                            pos: ex.vec(rawObj.x + rawObj.width / 2, rawObj.y + rawObj.height / 2),
                            target: player, 
                            action: () => {
                                engine.stop(); // 冻结引擎
                                VictoryManager.show(); 
                            }
                        });

                        // 把胜利触发器加到场景里
                        this.add(winTrigger);
                    }
                }
            }
        }

        // 重新加载并开始开场对话
        loadDialog('1-1').then(dialogs => {
            DialogManager.start(dialogs);
        });
    }
}