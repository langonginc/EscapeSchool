import { MAX_ALERT_TIME } from "./constants/constants";

export const AlertManager = {
    uiContainer: null as HTMLElement | null,
    progressBar: null as HTMLElement | null,
    statusText: null as HTMLElement | null,
    
    // 【新增】用来保存动态更新的 DOM 节点
    nameLabel: null as HTMLElement | null,
    avatarImg: null as HTMLImageElement | null, 

    highestAlertTimerThisFrame: 0,
    maxAlertTime: MAX_ALERT_TIME,
    
    // 【新增】暂存当前最高威胁敌人的信息
    currentThreatName: '',
    currentThreatAvatar: '',

    init() {
        if (this.uiContainer) return;

        this.uiContainer = document.createElement('div');
        this.uiContainer.style.position = 'absolute';
        this.uiContainer.style.top = '20px';
        this.uiContainer.style.right = '20px';
        this.uiContainer.style.zIndex = '9999';
        this.uiContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        this.uiContainer.style.border = '2px solid #555';
        this.uiContainer.style.borderRadius = '8px';
        this.uiContainer.style.padding = '10px';
        this.uiContainer.style.display = 'none'; 
        this.uiContainer.style.boxShadow = '0 4px 10px rgba(0,0,0,0.5)';
        this.uiContainer.style.display = 'flex'; 
        this.uiContainer.style.alignItems = 'center';
        this.uiContainer.style.gap = '15px';
        this.uiContainer.style.width = '280px';

        // 【修改】将头像改成 img 标签，方便动态替换 src
        this.avatarImg = document.createElement('img');
        this.avatarImg.style.width = '50px';
        this.avatarImg.style.height = '50px';
        this.avatarImg.style.backgroundColor = '#333';
        this.avatarImg.style.borderRadius = '5px';
        this.avatarImg.style.border = '2px solid #777';
        // 像素风游戏通常需要加上这个属性，防止图片被浏览器模糊抗锯齿处理
        this.avatarImg.style.imageRendering = 'pixelated'; 
        this.uiContainer.appendChild(this.avatarImg);

        const infoArea = document.createElement('div');
        infoArea.style.display = 'flex';
        infoArea.style.flexDirection = 'column';
        infoArea.style.flexGrow = '1';
        infoArea.style.gap = '5px';
        this.uiContainer.appendChild(infoArea);

        const nameRow = document.createElement('div');
        nameRow.style.display = 'flex';
        nameRow.style.justifyContent = 'space-between';
        nameRow.style.color = '#fff';
        nameRow.style.fontFamily = 'sans-serif';
        nameRow.style.fontSize = '14px';
        nameRow.style.fontWeight = 'bold';
        
        // 【修改】保存名字标签的引用
        this.nameLabel = document.createElement('span');
        this.statusText = document.createElement('span'); 
        
        nameRow.appendChild(this.nameLabel);
        nameRow.appendChild(this.statusText);
        infoArea.appendChild(nameRow);

        const barBg = document.createElement('div');
        barBg.style.width = '100%';
        barBg.style.height = '12px';
        barBg.style.backgroundColor = '#222';
        barBg.style.borderRadius = '6px';
        barBg.style.overflow = 'hidden';
        barBg.style.border = '1px solid #000';
        infoArea.appendChild(barBg);

        this.progressBar = document.createElement('div');
        this.progressBar.style.width = '100%';
        this.progressBar.style.height = '100%';
        this.progressBar.style.borderRadius = '6px';
        this.progressBar.style.transition = 'width 0.1s linear, background-color 0.3s ease'; 
        barBg.appendChild(this.progressBar);

        document.body.appendChild(this.uiContainer);
        this.uiContainer.style.display = 'none';
    },

    // 【核心修改】：汇报警报时，把敌人的名字和头像也传过来
    reportAlert(timeRemainingMs: number, name: string, avatarUrl: string) {
        if (timeRemainingMs > this.highestAlertTimerThisFrame) {
            this.highestAlertTimerThisFrame = timeRemainingMs;
            this.currentThreatName = name;
            this.currentThreatAvatar = avatarUrl;
        }
    },

    render() {
        if (!this.uiContainer || !this.progressBar || !this.statusText || !this.nameLabel || !this.avatarImg) return;

        if (this.highestAlertTimerThisFrame <= 0) {
            this.uiContainer.style.display = 'none';
        } else {
            this.uiContainer.style.display = 'flex'; 

            // 【新增】更新 UI 上的名字和头像
            this.nameLabel.innerText = this.currentThreatName;
            // 为了防止每帧重复加载相同的图片导致闪烁，加个判断
            if (this.avatarImg.src !== this.currentThreatAvatar) {
                this.avatarImg.src = this.currentThreatAvatar;
            }

            const percent = Math.max(0, Math.min(100, (this.highestAlertTimerThisFrame / this.maxAlertTime) * 100));
            this.progressBar.style.width = `${percent}%`;

            if (this.highestAlertTimerThisFrame > 4900) {
                this.statusText.innerText = '锁定目标!';
                this.statusText.style.color = '#ff4444';
                this.progressBar.style.backgroundColor = '#ff0000'; 
                this.uiContainer.style.borderColor = '#ff0000'; 
            } else {
                this.statusText.innerText = `搜寻中... ${(this.highestAlertTimerThisFrame/1000).toFixed(1)}s`;
                this.statusText.style.color = '#ffaa00';
                this.progressBar.style.backgroundColor = '#ffaa00'; 
                this.uiContainer.style.borderColor = '#555'; 
            }
        }
        
        this.highestAlertTimerThisFrame = 0; 
    }
};