// scenes/BaseLevel.ts
import { Scene } from '../engine/scene';
import { TileMap } from '../engine/tiled-map';
import { Player } from '../entities/player';
import { DialogManager } from '../../dialog/dialog-manager';

export abstract class BaseLevel extends Scene {
    public map!: TileMap;
    public player!: Player;
    protected isReady: boolean = false;

    // 🌟 1. 强制子类必须提供自己的地图路径
    abstract get mapUrl(): string;

    // 🌟 2. 父类接管统一的初始化流程
    async init() {
        this.map = new TileMap();
        await this.map.loadTmx(this.mapUrl);

        this.player = new Player();
        // 假设主角在所有关卡里都是同一个贴图
        await this.player.loadTexture('/EscapeSchool/tiled/images/pig_def.png', 20, 20);

        // 统一处理出生点
        const startPoint = this.map.getObjectByName('PlayerStart');
        if (startPoint) {
            this.player.x = startPoint.x;
            this.player.y = startPoint.y;
        } else {
            console.warn(`[BaseLevel] 地图 ${this.mapUrl} 缺少 'PlayerStart' 对象！`);
        }

        // 调用子类专属的初始化钩子 (比如加载特有NPC)
        await this.onLevelInit();

        this.isReady = true;
    }

    // 🌟 3. 提供给子类的可选“钩子(Hooks)”方法
    protected async onLevelInit(): Promise<void> {}
    protected onLevelUpdate(dt: number): void {}
    protected onLevelRender(ctx: CanvasRenderingContext2D): void {}

    // 🌟 4. 父类接管统一的 Update 逻辑
    update(dt: number) {
        if (!this.isReady) return;

        // 全局对话时停
        if (DialogManager.isActive) {
            DialogManager.update(this.game.input);
            return; 
        }

        // 玩家与地图的底层交互
        this.player.update(dt, this.game.input, this.map);

        // 执行子类当前关卡的特有逻辑 (比如检测是否走到终点)
        this.onLevelUpdate(dt);
    }

    // 🌟 5. 父类接管统一的 Render 逻辑 (包含完美的摄像机居中+边界限制)
    render(ctx: CanvasRenderingContext2D) {
        if (!this.isReady) {
            this.renderLoading(ctx);
            return;
        }

        const canvasW = this.game.canvas.width;
        const canvasH = this.game.canvas.height;
        
        // 计算地图的物理总宽高
        const mapTotalW = this.map.width * this.map.tilewidth;
        const mapTotalH = this.map.height * this.map.tileheight;

        // 1. 理想状态下的偏移量：把玩家绝对居中
        let offsetX = canvasW / 2 - (this.player.x + this.player.w / 2);
        let offsetY = canvasH / 2 - (this.player.y + this.player.h / 2);

        // 🌟 2. X 轴自适应居中与边界限制
        if (mapTotalW <= canvasW) {
            // 【小场景模式】：地图比屏幕窄，直接把整个地图居中，取消 X 轴跟随
            offsetX = (canvasW - mapTotalW) / 2;
        } else {
            // 【大场景模式】：限制摄像机不能超出左边界(0) 和 右边界(canvasW - mapTotalW)
            offsetX = Math.max(canvasW - mapTotalW, Math.min(0, offsetX));
        }

        // 🌟 3. Y 轴自适应居中与边界限制
        if (mapTotalH <= canvasH) {
            // 【小场景模式】：地图比屏幕矮，直接把整个地图居中，取消 Y 轴跟随
            offsetY = (canvasH - mapTotalH) / 2;
        } else {
            // 【大场景模式】：限制摄像机不能超出上边界(0) 和 下边界(canvasH - mapTotalH)
            offsetY = Math.max(canvasH - mapTotalH, Math.min(0, offsetY));
        }

        ctx.save();
        
        // 4. 推动世界坐标系（这就是 2D 游戏里“摄像机”的本质）
        ctx.translate(offsetX, offsetY);

        // 5. 渲染底层世界
        this.map.render(ctx);
        this.player.render(ctx);

        // 渲染子类特有的东西
        this.onLevelRender(ctx);

        ctx.restore();
    }

    // 统一的加载画面
    private renderLoading(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, this.game.canvas.width, this.game.canvas.height);
        ctx.fillStyle = '#fff';
        ctx.font = '24px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Loading Level...', this.game.canvas.width / 2, this.game.canvas.height / 2);
    }

    /**
     * 🌟 场景卸载时的生命周期钩子
     */
    destroy() {
        // 1. 如果关卡被销毁时还有对话框挂在屏幕上，强行击杀！
        if (DialogManager.isActive) {
            DialogManager.close();
        }

        // 2. 如果你以后在关卡里加了 setTimeout, setInterval 
        // 或者播放了当前关卡专属的 BGM，记得全部在这里 stop() 和 clear() 掉！
        
        console.log(`[BaseLevel] 关卡 ${this.mapUrl} 已彻底清理卸载。`);
    }
}