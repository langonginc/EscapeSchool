import { EnemyType, EnemyProfile } from "../constants/enemy";
import { Enemy } from "./enemy";

export const enemyProfiles: Record<EnemyType, EnemyProfile> = {
    [EnemyType.Liu]: {
        name: '刘主任',
        avatarUrl: '/EscapeSchool/images/guard_avatar.png',
        spriteSheetUrl: '/EscapeSchool/tiled/images/enemy.png'
    },
    [EnemyType.Feng]: {
        name: '冯老师',
        avatarUrl: '/EscapeSchool/images/feng_avatar.png',
        spriteSheetUrl: '/EscapeSchool/tiled/images/enemy.png'
    }
};

export const loadEnemy = async (type: EnemyType, x: number, y: number, player: ex.Actor, wallLayer: ex.TileMap) => {
    const enemyProfile = enemyProfiles[type];
    // 1. 定义和加载资源 (假设你有这些图片在 public 或 assets 目录下)
    const enemyImage = new ex.ImageSource(enemyProfile.spriteSheetUrl);
    await enemyImage.load();

    // 2. 游戏加载完成后，切割精灵图
    const enemySpriteSheet = ex.SpriteSheet.fromImageSource({
        image: enemyImage,
        grid: { rows: 2, columns: 6, spriteWidth: 20, spriteHeight: 20 }
    });

        // 3. 生成敌人实例，注入档案数据
    const guard1 = new Enemy({
        x,
        y,
        name: enemyProfile.name,
        avatarUrl: enemyProfile.avatarUrl,
        spriteSheet: enemySpriteSheet
    }, player, wallLayer);

    return guard1;
};