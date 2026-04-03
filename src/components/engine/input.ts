export class Input {
    // 记录当前一直被按住的键
    private keysDown: Set<string> = new Set();
    
    // 记录在当前这一帧“刚刚被按下”的键 (用于单次触发)
    private keysPressedThisFrame: Set<string> = new Set();

    constructor() {
        this.initListeners();
    }

    private initListeners() {
        // 监听键盘按下
        window.addEventListener('keydown', (e: KeyboardEvent) => {
            const key = e.key.toLowerCase();
            
            // 如果这个键之前没被按住，说明是刚刚按下的
            if (!this.keysDown.has(key)) {
                this.keysPressedThisFrame.add(key);
            }
            
            this.keysDown.add(key);
        });

        // 监听键盘抬起
        window.addEventListener('keyup', (e: KeyboardEvent) => {
            const key = e.key.toLowerCase();
            this.keysDown.delete(key);
        });

        // 失去焦点时清空按键，防止玩家切出窗口导致角色一直“自动行走”
        window.addEventListener('blur', () => {
            this.keysDown.clear();
            this.keysPressedThisFrame.clear();
        });
    }

    /**
     * 判断某个键是否正在被按住 (适合用于移动)
     * @param key 例如 'w', 'a', 's', 'd', 'arrowup'
     */
    public isKeyDown(key: string): boolean {
        return this.keysDown.has(key.toLowerCase());
    }

    /**
     * 判断某个键是否在当前帧刚刚被按下 (适合用于对话、交互、跳跃)
     * @param key 例如 'f', ' ', 'enter'
     */
    public wasKeyPressed(key: string): boolean {
        return this.keysPressedThisFrame.has(key.toLowerCase());
    }

    /**
     * 🌟 极其重要：必须在每一帧结束时调用，清理掉“单次按下”的状态
     * 这个方法会由 Game 类的 loop 自动调用，你不需要在 Player 里管它
     */
    public update() {
        this.keysPressedThisFrame.clear();
    }
}