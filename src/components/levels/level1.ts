import { DialogIds, dialogs } from "../../dialog/dialog-loader";
import { DialogManager } from "../../dialog/dialog-manager";
import { EnemyType } from "../../constants/enemy";
import { loadEnemy } from "../entities/load-enemy";
import { BaseLevel } from "./base";

export class Level1Scene extends BaseLevel {
    get mapUrl(): string {
        return '/EscapeSchool/tiled/map1.tmx';
    }

    protected async onLevelInit() {
        console.log("Level 1 专属逻辑加载完毕，准备好逃学了！");

        // 从 Tiled 地图的 E1 标点加载刘主任
        const e1 = this.map.getObjectByName('E1');
        if (e1) {
            const guard = await loadEnemy(EnemyType.Liu, e1.x, e1.y);
            this.enemies.push(guard);
        } else {
            console.warn("[Level1] 地图缺少 'E1' 对象标点！");
        }

        DialogManager.start(
            dialogs[DialogIds.L1] || [],
            () => this.player.pauseForDialogue(),
            () => this.player.resumeFromDialogue()
        );
    }
}