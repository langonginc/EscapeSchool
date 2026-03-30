import * as ex from 'excalibur'
import { DialogManager } from '../dialog/dialog-manager';
import { HERO_SPEED } from '../constants/constants';

const checkCollision = (x: number, y: number, halfW: number, halfH: number, layer: ex.TileMap): boolean => {
    const corners = [
        ex.vec(x - halfW, y - halfH), // 左上
        ex.vec(x + halfW, y - halfH), // 右上
        ex.vec(x - halfW, y + halfH), // 左下
        ex.vec(x + halfW, y + halfH)  // 右下
    ];

    for (const corner of corners) {
        const tile = layer.getTileByPoint(corner);
        if (tile && tile.solid) {
            return true; // 只要有一个角碰到 solid，就返回 true (撞墙)
        }
    }
    return false; // 四个角都是空的，安全！
};

export const loadActor = async (x: number, y: number, game: ex.Engine, wallLayer: ex.TileMap) => {
    const player = new ex.Actor({
        x,
        y,
        width: 24,
        height: 24,
        collisionType: ex.CollisionType.Passive
    })
    // 假设这段代码在你的 game.start(loader).then(...) 内部执行

    // 1. 加载精灵图资源
    const heroImage = new ex.ImageSource('/tiled/images/pig_def.png');
    await heroImage.load();

    // 2. 切割精灵图
    const heroSpriteSheet = ex.SpriteSheet.fromImageSource({
        image: heroImage,
        grid: {
            rows: 2,      // 总共有 2 行 (上下两个方向)
            columns: 6,   // 总共有 6 列 (每个方向 6 帧动作)
            spriteWidth: 20,
            spriteHeight: 20
        }
    });

    // 3. 抽取特定行创建动画 (参数：精灵图集，帧索引数组，每帧持续时间毫秒)
    // 向下走：第 0 行的索引是 0, 1, 2
    const walkDownAnim = ex.Animation.fromSpriteSheet(heroSpriteSheet, [6,7,8], 150);
    // 向上走：第 1 行的索引是 3, 4, 5
    const walkUpAnim = ex.Animation.fromSpriteSheet(heroSpriteSheet, [6,7,8], 150);
    // 向左走：第 2 行的索引是 6, 7, 8
    const walkLeftAnim = ex.Animation.fromSpriteSheet(heroSpriteSheet, [6,7,8], 150);
    // 向右走：第 3 行的索引是 9, 10, 11
    const walkRightAnim = ex.Animation.fromSpriteSheet(heroSpriteSheet, [6,7,8], 150);

    // 4. 将之前的 color: ex.Color.Red 删掉，把动画注册到玩家身上
    player.graphics.add('walkDown', walkDownAnim);
    player.graphics.add('walkUp', walkUpAnim);
    player.graphics.add('walkLeft', walkLeftAnim);
    player.graphics.add('walkRight', walkRightAnim);

    // 默认站立状态显示向下走的第一帧
    player.graphics.use('walkDown');
    walkDownAnim.pause(); // 站立时暂停动画

    // 5. 在移动逻辑中播放对应的动画
    player.on('preupdate', (evt) => {
        if (DialogManager.isActive) {
            player.vel.setTo(0, 0); // 消除惯性
            
            // 把动画重置为站立状态
            const currentAnim = player.graphics.current as ex.Animation;
            if (currentAnim && currentAnim.pause) {
                currentAnim.pause();
                currentAnim.goToFrame(1); 
            }
            
            return; // 直接 return！退出函数！不执行后面的任何移动探测代码！
        }

        const speed = HERO_SPEED; 
        let vx = 0; let vy = 0;

        if (game.input.keyboard.isHeld(ex.Keys.W)) vy -= 1;
        if (game.input.keyboard.isHeld(ex.Keys.S)) vy += 1;
        if (game.input.keyboard.isHeld(ex.Keys.A)) vx -= 1;
        if (game.input.keyboard.isHeld(ex.Keys.D)) vx += 1;

        const isMoving = vx !== 0 || vy !== 0;

        // 假设你已经获取到了 wallLayer
        // const tileMapLayers = mapResource.getTileMapLayers();
        // const wallLayer = tileMapLayers.find(map => map.name === 'Wall');

        if (isMoving && wallLayer) {
            // 1. 计算移动方向和这一帧要走的距离
            const moveDir = ex.vec(vx, vy).normalize();
            const moveDistance = speed * (evt.elapsed / 1000); 

            // 玩家碰撞盒的一半大小 (比如小猪是 20x20，我们用 8x8 让判定稍微宽松一点)
            const halfW = 8;
            const halfH = 8;

            // 【核心大招：分离轴检测】
            
            // 2. 先单独预测 X 轴的未来位置
            const nextX = player.pos.x + moveDir.x * moveDistance;
            // 探测 X 轴方向：注意 Y 轴传入的是当前的 player.pos.y
            if (!checkCollision(nextX, player.pos.y, halfW, halfH, wallLayer)) {
                player.pos.x = nextX; // X 轴安全，更新 X 坐标！
            }

            // 3. 再单独预测 Y 轴的未来位置
            const nextY = player.pos.y + moveDir.y * moveDistance;
            // 探测 Y 轴方向：注意 X 轴传入的是刚刚可能更新过的 player.pos.x
            if (!checkCollision(player.pos.x, nextY, halfW, halfH, wallLayer)) {
                player.pos.y = nextY; // Y 轴安全，更新 Y 坐标！
            }

            // --- 播放动画逻辑 ---
            if (vx < 0) {
                player.graphics.use('walkLeft'); walkLeftAnim.play();
            } else if (vx > 0) {
                player.graphics.use('walkRight'); walkRightAnim.play();
            } else if (vy < 0) {
                player.graphics.use('walkUp'); walkUpAnim.play();
            } else if (vy > 0) {
                player.graphics.use('walkDown'); walkDownAnim.play();
            }

        } else {
            // 停止动画
            const currentAnim = player.graphics.current as ex.Animation;
            if (currentAnim && currentAnim.pause) {
                currentAnim.pause();
                currentAnim.goToFrame(1); 
            }
        }
    });

    return player;
}