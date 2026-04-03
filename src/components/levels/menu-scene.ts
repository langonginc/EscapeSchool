import { Scene } from '../engine/scene';
import { Game } from '../engine/game';

// 定义一个简单的星星结构
interface Star {
    x: number;
    y: number;
    size: number;
    speed: number;
    alpha: number;
}

export class MenuScene extends Scene {
    private stars: Star[] = [];
    private bgAlpha: number = 0; // 用于淡入效果

    constructor(game: Game) {
        super(game);
    }

    init() {
        // 初始化时生成 100 个随机星星
        this.stars = [];
        for (let i = 0; i < 100; i++) {
            this.stars.push({
                x: Math.random() * this.game.canvas.width,
                y: Math.random() * this.game.canvas.height,
                size: Math.random() * 2 + 0.5, // 星星大小 0.5 ~ 2.5
                speed: Math.random() * 20 + 10, // 移动速度 10 ~ 30 像素/秒
                alpha: Math.random() // 初始透明度
            });
        }
        this.bgAlpha = 0; // 重置淡入透明度
        console.log("MenuScene initialized");
    }

    update(dt: number) {
        // 1. 背景淡入效果 (可选)
        if (this.bgAlpha < 1) {
            this.bgAlpha += dt * 0.5; // 2秒淡入
            if (this.bgAlpha > 1) this.bgAlpha = 1;
        }

        // 2. 更新星星位置
        for (const star of this.stars) {
            star.y -= star.speed * dt; // 星星向上飘
            
            // 星星闪烁效果
            star.alpha += (Math.random() - 0.5) * dt * 2;
            if (star.alpha < 0.2) star.alpha = 0.2;
            if (star.alpha > 1) star.alpha = 1;

            // 如果星星飘出屏幕顶部，让它从底部重新出现
            if (star.y < -10) {
                star.y = this.game.canvas.height + 10;
                star.x = Math.random() * this.game.canvas.width;
            }
        }
    }

    render(ctx: CanvasRenderingContext2D) {
        const { width, height } = this.game.canvas;

        // 1. 绘制深色渐变背景
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, `rgba(10, 10, 25, ${this.bgAlpha})`);   // 深蓝
        gradient.addColorStop(1, `rgba(30, 20, 40, ${this.bgAlpha})`);   // 深紫
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // 2. 绘制星星
        for (const star of this.stars) {
            ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha * this.bgAlpha})`;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // 🚨 注意：这里不要画任何文字或按钮！
        // 因为 HTML DOM (MenuManager) 会覆盖在 Canvas 上面，
        // 这里的 Canvas 只负责提供底部的动态画面。
    }

    destroy() {
        // 如果有需要清理的定时器或音频，在这里处理
        this.stars = [];
        console.log("MenuScene destroyed");
    }
}