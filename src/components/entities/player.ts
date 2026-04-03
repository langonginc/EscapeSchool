// entities/Player.ts
import { TileMap } from '../engine/tiled-map';
import { Input } from '../engine/input';
import { HERO_SPEED } from '../../constants/constants';

function normalize2D(x: number, y: number, scale: number = 1): [number, number] {
    const length = Math.sqrt(x * x + y * y);
    
    if (length === 0) {
        return [0, 0];
    }

    return [x / length * scale, y / length * scale];
}

interface SpriteAnimation {
    frameWidth: number;
    frameHeight: number;
    totalFrames: number;
    frameSpeed: number; 
    startRow: number; 
    startCol: number; 
    frameIndex: number;
    timer: number;
}

export class Player {
    public x: number = 0;
    public y: number = 0;
    public w: number = 32;
    public h: number = 48;
    public speed: number = HERO_SPEED;

    private spriteSheet: HTMLImageElement | null = null;
    private animation: SpriteAnimation;

    // 🌟 对话状态现在完全由 Player 内部管理行为
    private isDialogueActive: boolean = false;

    constructor() {
        this.animation = {
            frameWidth: 32,
            frameHeight: 48,
            totalFrames: 1, 
            frameSpeed: 0.15,
            startRow: 0, 
            startCol: 0,
            frameIndex: 0,
            timer: 0,
        };
    }

    public async loadTexture(url: string, frameWidth: number, frameHeight: number): Promise<void> {
        return new Promise((resolve, reject) => {
            this.spriteSheet = new Image();
            this.spriteSheet.onload = () => {
                this.animation.frameWidth = frameWidth;
                this.animation.frameHeight = frameHeight;
                this.w = frameWidth;
                this.h = frameHeight;
                console.log('Player grid texture loaded');
                resolve();
            };
            this.spriteSheet.onerror = () => reject(new Error(`Failed to load texture`));
            this.spriteSheet.src = url;
        });
    }

    public setAnimationSequence(startRow: number, startCol: number, totalFrames: number, frameSpeed: number = 0.15) {
        if (this.animation.startRow !== startRow || this.animation.startCol !== startCol) {
            this.animation.startRow = startRow;
            this.animation.startCol = startCol;
            this.animation.totalFrames = totalFrames;
            this.animation.frameSpeed = frameSpeed;
            this.animation.frameIndex = 0;
            this.animation.timer = 0;
        }
    }

    // 控制对话状态的 API
    public pauseForDialogue() { 
        this.isDialogueActive = true; 
        this.animation.frameIndex = 0; // 🌟 立刻重置为站立静止状态
    }

    public resumeFromDialogue() { 
        this.isDialogueActive = false; 
    }

    /**
     * 🌟 高内聚的 Update 方法
     * Player 自己决定怎么响应输入和地图
     */
    update(dt: number, input: Input, map: TileMap) {
        // 如果正在对话，冻结物理和输入处理，直接返回
        if (this.isDialogueActive) {
            return; 
        }

        let dx = 0;
        let dy = 0;
        let moving = false;

        // 🌟 Player 内部自己处理输入和动画序列的切换
        if (input.isKeyDown('w') || input.isKeyDown('ArrowUp')) { 
            dy -= 1; 
            moving = true; 
            this.setAnimationSequence(1, 0, 3); // 假设第三行是向上走
        }
        if (input.isKeyDown('s') || input.isKeyDown('ArrowDown')) { 
            dy += 1; 
            moving = true; 
            this.setAnimationSequence(1, 0, 3); // 假设第二行是向下走
        }
        if (input.isKeyDown('a') || input.isKeyDown('ArrowLeft')) { 
            dx -= 1; 
            moving = true; 
            this.setAnimationSequence(1, 0, 3); // 假设第四行是向左走
        }
        if (input.isKeyDown('d') || input.isKeyDown('ArrowRight')) { 
            dx += 1; 
            moving = true; 
            this.setAnimationSequence(1, 0, 3); // 假设第一行是向右走
        }

        [dx, dy] = normalize2D(dx, dy, this.speed * dt);

        // 分轴物理碰撞预测
        if (dx !== 0 && !map.checkCollision(this.x + dx + 2, this.y + 4, this.w - 6, this.h - 6)) {
            this.x += dx;
        }
        if (dy !== 0 && !map.checkCollision(this.x + 2, this.y + dy + 4, this.w - 6, this.h - 6)) {
            this.y += dy;
        }

        // 更新动画逻辑
        if (moving) {
            this.animation.timer += dt;
            if (this.animation.timer >= this.animation.frameSpeed) {
                this.animation.timer = 0;
                this.animation.frameIndex = (this.animation.frameIndex + 1) % this.animation.totalFrames;
            }
        } else {
            this.animation.frameIndex = 0; 
        }
    }

    render(ctx: CanvasRenderingContext2D) {
        if (!this.spriteSheet) return;

        const sx = (this.animation.startCol + this.animation.frameIndex) * this.animation.frameWidth;
        const sy = this.animation.startRow * this.animation.frameHeight;

        ctx.drawImage(
            this.spriteSheet,
            sx, sy, this.animation.frameWidth, this.animation.frameHeight, 
            this.x, this.y, this.w, this.h 
        );
    }
}