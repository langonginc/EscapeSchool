import { Game } from './game';

export abstract class Scene {
    protected game: Game;
    constructor(game: Game) { this.game = game; }
    
    abstract init(): Promise<void> | void;
    abstract update(dt: number): void;
    abstract render(ctx: CanvasRenderingContext2D): void;
    destroy(): void {} // 切换场景时清理资源
}