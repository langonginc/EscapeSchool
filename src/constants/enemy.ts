export enum EnemyType {
    Liu,
    Feng
}

export interface EnemyProfile {
    name: string;        // 显示在 UI 上的名字
    avatarUrl: string;   // 显示在 UI 上的头像路径 (比如 '/images/guard_face.png')
    spriteSheetUrl: string; // 敌人的切片动画图集
}
