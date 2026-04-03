// entities/load-enemy.ts
import { EnemyType, EnemyProfile } from '../../constants/enemy';
import { Enemy } from './enemy';

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

export async function loadEnemy(type: EnemyType, x: number, y: number): Promise<Enemy> {
    const profile = enemyProfiles[type];

    const enemy = new Enemy({
        x,
        y,
        name: profile.name,
        avatarUrl: profile.avatarUrl,
    });

    // 加载精灵图（2行6列，每格 20x20）
    await enemy.loadTexture(profile.spriteSheetUrl, 20, 20);

    return enemy;
}
