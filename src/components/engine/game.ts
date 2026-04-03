import { Input } from "./input";
import { Scene } from "./scene";

export class Game {
    public canvas: HTMLCanvasElement;
    public ctx: CanvasRenderingContext2D;
    public input: Input;

    public readonly logicalWidth: number;
    public readonly logicalHeight: number;
    
    private scenes: Map<string, Scene> = new Map();
    private currentScene: Scene | null = null;
    private lastTime: number = 0;

    public isPaused: boolean = false;
    public currentSceneName: string = '';

    constructor(canvasId: string, width: number, height: number) {
        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        
        this.logicalWidth = width;
        this.logicalHeight = height;
        this.canvas.width = width;
        this.canvas.height = height;

        this.ctx = this.canvas.getContext('2d')!;
        this.input = new Input();
        
        // 🌟 2. 监听窗口大小变化
        window.addEventListener('resize', this.handleResize);
        
        // 🌟 3. 初始化时立刻执行一次缩放
        this.handleResize();
    }

    private handleResize = () => {
        // 获取当前浏览器窗口的真实宽高
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        // 计算 X 和 Y 方向的缩放比例
        const scaleX = windowWidth / this.logicalWidth;
        const scaleY = windowHeight / this.logicalHeight;

        // 取两者中较小的一个，确保画面一定能完整显示在屏幕内，不会被裁切
        const scale = Math.min(scaleX, scaleY);

        // 使用 CSS3 硬件加速进行缩放，性能极高
        this.canvas.style.transform = `scale(${scale})`;
        this.canvas.style.transformOrigin = 'center center'; // 始终保持居中缩放
    }

    // 注册场景（传一个工厂函数，实现懒加载，杜绝循环依赖）
    addScene(name: string, sceneFactory: (game: Game) => Scene) {
        // 这里为了简单，我们直接实例化，你也可以在 goToScene 时再实例化
        this.scenes.set(name, sceneFactory(this)); 
    }

    async goToScene(name: string) {
        const nextScene = this.scenes.get(name);
        if (!nextScene) throw new Error(`Scene ${name} not found!`);
        
        this.currentSceneName = name;

        if (this.currentScene) {
            this.currentScene.destroy();
        }
        this.currentScene = nextScene;
        await this.currentScene.init();
    }

    start() {
        this.lastTime = performance.now();
        requestAnimationFrame(this.loop);
    }

    private loop = (time: number) => {
        const dt = (time - this.lastTime) / 1000; // 转换为秒
        this.lastTime = time;

        // 1. 清空画布
        this.ctx.fillStyle = '#020222';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 2. 更新与渲染当前场景
        if (this.currentScene) {
            if (!this.isPaused) {
                this.currentScene.update(dt);
            }
            this.currentScene.render(this.ctx);
        }

        this.input.update();

        requestAnimationFrame(this.loop);
    }
}