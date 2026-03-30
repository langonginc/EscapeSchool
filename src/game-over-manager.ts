export const GameOverManager = {
    uiContainer: null as HTMLElement | null,

    init() {
        if (this.uiContainer) return;

        this.uiContainer = document.createElement('div');
        this.uiContainer.style.position = 'absolute';
        this.uiContainer.style.top = '0';
        this.uiContainer.style.left = '0';
        this.uiContainer.style.width = '100%';
        this.uiContainer.style.height = '100%';
        this.uiContainer.style.backgroundColor = 'rgba(100, 0, 0, 0.7)'; // 鲜红色的死亡滤镜
        this.uiContainer.style.zIndex = '100000'; // 最高的层级
        this.uiContainer.style.display = 'none'; // 默认隐藏
        this.uiContainer.style.flexDirection = 'column';
        this.uiContainer.style.justifyContent = 'center';
        this.uiContainer.style.alignItems = 'center';
        this.uiContainer.style.color = '#fff';

        const title = document.createElement('h1');
        title.innerText = '你被抓住了！';
        title.style.fontSize = '72px';
        title.style.marginBottom = '40px';
        title.style.textShadow = '0 0 20px #000';
        this.uiContainer.appendChild(title);

        const retryBtn = document.createElement('button');
        retryBtn.innerText = '重新开始本关';
        retryBtn.style.padding = '15px 40px';
        retryBtn.style.fontSize = '24px';
        retryBtn.style.cursor = 'pointer';
        retryBtn.style.backgroundColor = '#fff';
        retryBtn.style.border = 'none';
        retryBtn.style.borderRadius = '5px';
        retryBtn.onclick = () => window.location.reload(); // 暴力重开
        this.uiContainer.appendChild(retryBtn);

        document.body.appendChild(this.uiContainer);
    },

    show() {
        if (this.uiContainer) {
            this.uiContainer.style.display = 'flex';
        }
    }
};