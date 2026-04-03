// entities/Enemy.ts
import { TileMap } from '../engine/tiled-map';
import { Player } from './player';
import { ENEMY_SPEED, MAX_ALERT_TIME } from '../../constants/constants';
import { AlertManager } from '../../alert-manager';
import { GameOverManager } from '../../game-over-manager';
import { Game } from '../engine/game';

export interface EnemyConfig {
    x: number;
    y: number;
    name: string;
    avatarUrl: string;
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

export class Enemy {
    public x: number;
    public y: number;
    public w: number = 20;
    public h: number = 20;

    // AI 属性
    private speed: number = ENEMY_SPEED;
    private sightRange: number = 250;
    private alertTimer: number = 0;
    private maxAlertTime: number = MAX_ALERT_TIME;

    // 个人档案
    private enemyName: string;
    private avatarUrl: string;

    // 精灵动画
    private spriteSheet: HTMLImageElement | null = null;
    private animation: SpriteAnimation;

    constructor(config: EnemyConfig) {
        this.x = config.x;
        this.y = config.y;
        this.enemyName = config.name;
        this.avatarUrl = config.avatarUrl;

        this.animation = {
            frameWidth: 20,
            frameHeight: 20,
            totalFrames: 3,
            frameSpeed: 0.15,
            startRow: 1,
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
                resolve();
            };
            this.spriteSheet.onerror = () => reject(new Error(`Failed to load enemy texture: ${url}`));
            this.spriteSheet.src = url;
        });
    }

    private setAnimationSequence(startRow: number, startCol: number, totalFrames: number, frameSpeed: number = 0.15) {
        if (this.animation.startRow !== startRow || this.animation.startCol !== startCol) {
            this.animation.startRow = startRow;
            this.animation.startCol = startCol;
            this.animation.totalFrames = totalFrames;
            this.animation.frameSpeed = frameSpeed;
            this.animation.frameIndex = 0;
            this.animation.timer = 0;
        }
    }

    /**
     * 视线检测：从敌人向玩家发射射线，检测是否被墙壁阻挡
     */
    private checkLineOfSight(targetX: number, targetY: number, map: TileMap): boolean {
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance === 0) return true;

        const dirX = dx / distance;
        const dirY = dy / distance;
        const step = 8;

        for (let i = 0; i < distance; i += step) {
            const checkX = this.x + dirX * i;
            const checkY = this.y + dirY * i;
            if (map.checkCollision(checkX, checkY, 20, 20)) {
                return false;
            }
        }
        return true;
    }

    /**
     * AABB 碰撞检测：判断是否与玩家碰撞
     */
    public checkPlayerCollision(player: Player): boolean {
        return (
            this.x < player.x + player.w - 4 &&
            this.x + this.w > player.x &&
            this.y < player.y + player.h - 4 &&
            this.y + this.h > player.y
        );
    }

    update(dt: number, player: Player, map: TileMap, game: Game) {
        // 计算与玩家的距离
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distToPlayer = Math.sqrt(dx * dx + dy * dy);

        // 视线检测
        let canSeePlayer = false;
        if (distToPlayer <= this.sightRange) {
            canSeePlayer = this.checkLineOfSight(player.x, player.y, map);
        }

        let moveX = 0;
        let moveY = 0;

        if (canSeePlayer) {
            // 看到玩家：满速追击，重置警报计时器
            this.alertTimer = this.maxAlertTime;
            const len = distToPlayer || 1;
            moveX = (dx / len) * this.speed * dt;
            moveY = (dy / len) * this.speed * dt;
        } else if (this.alertTimer > 0) {
            // 丢失视线但仍在警戒中：减速追踪（80%速度）
            this.alertTimer -= dt * 1000;
            const len = distToPlayer || 1;
            moveX = (dx / len) * this.speed * 0.8 * dt;
            moveY = (dy / len) * this.speed * 0.8 * dt;
        }

        // 分轴碰撞检测（与 Player 一致的物理模式）
        if (moveX !== 0 && !map.checkCollision(this.x + moveX, this.y, this.w, this.h)) {
            this.x += moveX;
        }
        if (moveY !== 0 && !map.checkCollision(this.x, this.y + moveY, this.w, this.h)) {
            this.y += moveY;
        }

        // 动画方向切换
        if (moveX !== 0 || moveY !== 0) {
            // 原版所有方向都用 row 1, col 0-2 的帧，保持一致
            this.setAnimationSequence(1, 0, 3);

            this.animation.timer += dt;
            if (this.animation.timer >= this.animation.frameSpeed) {
                this.animation.timer = 0;
                this.animation.frameIndex = (this.animation.frameIndex + 1) % this.animation.totalFrames;
            }
        } else {
            // 停下时回到站立帧（第 1 帧，与原版 goToFrame(1) 一致）
            this.animation.frameIndex = 1;
        }

        // 向 AlertManager 汇报警报状态
        if (this.alertTimer > 0) {
            AlertManager.reportAlert(this.alertTimer, this.enemyName, this.avatarUrl);
        }

        // 碰撞检测：抓到玩家 → 游戏结束
        if (this.checkPlayerCollision(player)) {
            game.isPaused = true;
            GameOverManager.show();
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

    // UI 信息访问器
    public getName(): string { return this.enemyName; }
    public getAvatarUrl(): string { return this.avatarUrl; }
    public isAlert(): boolean { return this.alertTimer > 0; }
}
