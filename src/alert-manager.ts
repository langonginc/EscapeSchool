import { MAX_ALERT_TIME } from "./constants/constants";

export const AlertManager = {
    uiContainer: null as HTMLElement | null,
    progressBar: null as HTMLElement | null,
    statusText: null as HTMLElement | null,
    nameLabel: null as HTMLElement | null,
    avatarImg: null as HTMLImageElement | null,

    highestAlertTimerThisFrame: 0,
    maxAlertTime: MAX_ALERT_TIME,
    currentThreatName: '',
    currentThreatAvatar: '',

    init() {
        if (this.uiContainer) return;

        // 容器
        this.uiContainer = document.createElement('div');
        this.uiContainer.className = 'alert-container';

        // 头像
        this.avatarImg = document.createElement('img');
        this.avatarImg.className = 'alert-avatar';
        this.uiContainer.appendChild(this.avatarImg);

        // 信息区
        const infoArea = document.createElement('div');
        infoArea.className = 'alert-info';
        this.uiContainer.appendChild(infoArea);

        // 名字行
        const nameRow = document.createElement('div');
        nameRow.className = 'alert-name-row';
        this.nameLabel = document.createElement('span');
        this.statusText = document.createElement('span');
        this.statusText.className = 'alert-status';
        nameRow.appendChild(this.nameLabel);
        nameRow.appendChild(this.statusText);
        infoArea.appendChild(nameRow);

        // 进度条
        const barBg = document.createElement('div');
        barBg.className = 'alert-bar-bg';
        infoArea.appendChild(barBg);

        this.progressBar = document.createElement('div');
        this.progressBar.className = 'alert-bar';
        barBg.appendChild(this.progressBar);

        document.body.appendChild(this.uiContainer);
    },

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
            this.uiContainer.classList.remove('locked');
            return;
        }

        this.uiContainer.style.display = 'flex';

        // 更新名字和头像
        this.nameLabel.innerText = this.currentThreatName;
        if (this.avatarImg.src !== this.currentThreatAvatar) {
            this.avatarImg.src = this.currentThreatAvatar;
        }

        // 进度条宽度（唯一需要内联的动态值）
        const percent = Math.max(0, Math.min(100, (this.highestAlertTimerThisFrame / this.maxAlertTime) * 100));
        this.progressBar.style.width = `${percent}%`;

        // 根据警报等级切换 CSS class
        const isLocked = this.highestAlertTimerThisFrame > 4900;
        this.uiContainer.classList.toggle('locked', isLocked);

        if (isLocked) {
            this.statusText.innerText = '锁定目标!';
            this.statusText.className = 'alert-status locked';
            this.progressBar.style.backgroundColor = '#ff0000';
        } else {
            this.statusText.innerText = `搜寻中... ${(this.highestAlertTimerThisFrame / 1000).toFixed(1)}s`;
            this.statusText.className = 'alert-status searching';
            this.progressBar.style.backgroundColor = '#ffaa00';
        }

        this.highestAlertTimerThisFrame = 0;
    }
};