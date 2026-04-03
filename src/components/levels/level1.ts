import { DialogIds, dialogs } from "../../dialog/dialog-loader";
import { DialogManager } from "../../dialog/dialog-manager";
import { BaseLevel } from "./base";

export class Level1Scene extends BaseLevel {
    // 🌟 1. 必须实现父类的抽象方法
    get mapUrl(): string {
        return '/EscapeSchool/tiled/map1.tmx';
    }

    protected async onLevelInit() {
        console.log("Level 1 专属逻辑加载完毕，准备好逃学了！");
        // 这里你可以加载属于第一关的特定 NPC 数据
        DialogManager.start(
            dialogs[DialogIds.L1] || [],
            () => this.player.pauseForDialogue(),
            () => this.player.resumeFromDialogue()
        );
    }

    protected onLevelUpdate(dt: number) {
        // 例子：判定通关
        // const exit = this.map.getObjectByName('LevelExit');
        // if (exit && this.player.x > exit.x) {
        //     console.log("通关啦！");
        //     MenuManager.unlockNextLevel(1);
        // }
    }
}