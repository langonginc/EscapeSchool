import * as ex from 'excalibur';
import { AlertManager } from '../alert-manager';
import { ENEMY_SPEED, MAX_ALERT_TIME } from '../constants/constants';
import { GameOverManager } from '../game-over-manager';

// 定义敌人配置接口
export interface EnemyConfig {
    x: number;
    y: number;
    name: string;        // 显示在 UI 上的名字
    avatarUrl: string;   // 显示在 UI 上的头像路径 (比如 '/images/guard_face.png')
    spriteSheet: ex.SpriteSheet; // 敌人的切片动画图集
}

export class Enemy extends ex.Actor {
    // 基础属性
    private alertTimer: number = 0;
    private maxAlertTime: number = MAX_ALERT_TIME;
    private enemySpeed: number = ENEMY_SPEED;
    private sightRange: number = 250;

    // 个人档案
    private enemyName: string;
    private avatarUrl: string;

    // 动画存储
    private walkDownAnim: ex.Animation;
    private walkUpAnim: ex.Animation;
    private walkLeftAnim: ex.Animation;
    private walkRightAnim: ex.Animation;

    // 外部依赖
    private targetPlayer: ex.Actor;
    private wallLayer: ex.TileMap;

    constructor(config: EnemyConfig, player: ex.Actor, wallLayer: ex.TileMap) {
        super({
            x: config.x, 
            y: config.y, 
            width: 20, 
            height: 20,
            collisionType: ex.CollisionType.Active
        });

        this.enemyName = config.name;
        this.avatarUrl = config.avatarUrl;
        this.targetPlayer = player;
        this.wallLayer = wallLayer;

        // --- 抽取并注册动画 (假设和玩家的切片结构一致：2行6列) ---
        // 向下：0, 1, 2
        this.walkDownAnim = ex.Animation.fromSpriteSheet(config.spriteSheet, [6, 7, 8], 150);
        // 向上：3, 4, 5
        this.walkUpAnim = ex.Animation.fromSpriteSheet(config.spriteSheet, [6, 7, 8], 150);
        // 向左：6, 7, 8
        this.walkLeftAnim = ex.Animation.fromSpriteSheet(config.spriteSheet, [6, 7, 8], 150);
        // 向右：9, 10, 11
        this.walkRightAnim = ex.Animation.fromSpriteSheet(config.spriteSheet, [6, 7, 8], 150);

        this.graphics.add('walkDown', this.walkDownAnim);
        this.graphics.add('walkUp', this.walkUpAnim);
        this.graphics.add('walkLeft', this.walkLeftAnim);
        this.graphics.add('walkRight', this.walkRightAnim);
        
        // 默认站立
        this.graphics.use('walkDown');
        this.walkDownAnim.pause();
    }

    onInitialize(engine: ex.Engine) {
        // 设置防卡墙的圆形碰撞体
        this.collider.set(ex.Shape.Circle(10));
        // 在 Enemy.ts 的 constructor 或 onInitialize 中增加：
        this.on('collisionstart', (evt) => {
            // 检查撞到的是不是玩家 (targetPlayer 是我们之前传入的引用)
            if (evt.other.owner === this.targetPlayer) {
                // 1. 停止游戏引擎逻辑
                engine.stop(); 
                
                // 2. 弹出游戏结束 UI
                GameOverManager.show();
                
                // 3. (可选) 播放一个惨叫音效或者震屏
                // engine.currentScene.camera.shake(10, 10, 500);
            }
        });
    }

    private checkLineOfSight(start: ex.Vector, end: ex.Vector): boolean {
        const distance = start.distance(end);
        const direction = end.sub(start).normalize();
        const step = 8; 

        for (let i = 0; i < distance; i += step) {
            const checkPoint = start.add(direction.scale(i));
            const tile = this.wallLayer.getTileByPoint(checkPoint);
            if (tile && tile.solid) return false; 
        }
        return true; 
    }

    onPreUpdate(engine: ex.Engine, elapsedMs: number) {
        const distToPlayer = this.pos.distance(this.targetPlayer.pos);
        let canSeePlayer = false;

        if (distToPlayer <= this.sightRange) {
            canSeePlayer = this.checkLineOfSight(this.pos, this.targetPlayer.pos);
        }

        if (canSeePlayer) {
            this.alertTimer = this.maxAlertTime; 
            const dir = this.targetPlayer.pos.sub(this.pos).normalize();
            this.vel = dir.scale(this.enemySpeed);
        } else {
            if (this.alertTimer > 0) {
                this.alertTimer -= elapsedMs; 
                const dir = this.targetPlayer.pos.sub(this.pos).normalize();
                this.vel = dir.scale(this.enemySpeed * 0.8); 
            } else {
                this.vel.setTo(0, 0);
            }
        }

        // --- 播放动画逻辑 ---
        const vx = this.vel.x;
        const vy = this.vel.y;
        
        if (vx !== 0 || vy !== 0) {
            // 根据速度向量的主导方向来播放对应动画
            if (Math.abs(vx) > Math.abs(vy)) {
                if (vx < 0) { this.graphics.use('walkLeft'); this.walkLeftAnim.play(); }
                else { this.graphics.use('walkRight'); this.walkRightAnim.play(); }
            } else {
                if (vy < 0) { this.graphics.use('walkUp'); this.walkUpAnim.play(); }
                else { this.graphics.use('walkDown'); this.walkDownAnim.play(); }
            }
        } else {
            // 停下时暂停动画，回到站立帧
            const currentAnim = this.graphics.current as ex.Animation;
            if (currentAnim && currentAnim.pause) {
                currentAnim.pause();
                currentAnim.goToFrame(1); 
            }
        }

        // 向 AlertManager 汇报：不仅传时间，还把自己的名字和头像传过去
        if (this.alertTimer > 0) {
            AlertManager.reportAlert(this.alertTimer, this.enemyName, this.avatarUrl);
        }
    }
}