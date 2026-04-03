import { Input } from '../components/engine/input';
import { Dialog } from '../constants/dialog';

interface DialogState {
    dialogs: Dialog[];
    returnIndex: number;
}

export const DialogManager = {
    isActive: false,
    dialogs: [] as Dialog[],
    currentIndex: 0,
    selectedOptionIndex: 0,
    dialogStack: [] as DialogState[],
    
    uiContainer: null as HTMLElement | null,
    textElement: null as HTMLElement | null,
    optionsContainer: null as HTMLElement | null,
    hintElement: null as HTMLElement | null,

    onCloseCallback: null as (() => void) | null,

    init() {
        if (this.uiContainer) return;

        // 1. 主容器
        this.uiContainer = document.createElement('div');
        this.uiContainer.className = 'dialog-container';
        this.uiContainer.style.display = 'none'; // 初始隐藏
        this.uiContainer.addEventListener('pointerdown', (e) => e.stopPropagation());

        // 2. 文字容器
        this.textElement = document.createElement('div');
        this.textElement.className = 'dialog-text';
        this.uiContainer.appendChild(this.textElement);

        // 3. 选项容器
        this.optionsContainer = document.createElement('div');
        this.optionsContainer.className = 'dialog-options';
        this.uiContainer.appendChild(this.optionsContainer);

        // 4. 按键提示
        this.hintElement = document.createElement('div');
        this.hintElement.className = 'dialog-hint';
        this.hintElement.innerText = '按 [F] 继续 ▼';
        this.uiContainer.appendChild(this.hintElement);

        document.body.appendChild(this.uiContainer);
    },

    start(dialogData: Dialog[], onStart?: () => void, onClose?: () => void) {
        if (!dialogData || dialogData.length === 0) return;
        this.isActive = true;
        this.dialogs = dialogData;
        this.currentIndex = 0;
        this.selectedOptionIndex = 0;
        this.uiContainer!.style.display = 'block';
        this.dialogStack = [];

        // 🌟 1. 对话开始，立刻执行暂停逻辑
        if (onStart) onStart();
        
        // 🌟 2. 把结束回调存起来，等 close 时调用
        this.onCloseCallback = onClose || null;

        this.renderCurrentDialog();
    },

    renderCurrentDialog() {
        const current = this.dialogs[this.currentIndex]!;
        this.textElement!.innerHTML = current.text;
        this.optionsContainer!.innerHTML = '';

        if (current.type === 'text') {
            this.hintElement!.style.display = 'block';
        } 
        else if (current.type === 'option') {
            this.hintElement!.style.display = 'none'; // 选项模式不显示"按F继续"
            if (current.options) {
                current.options.forEach((opt, index) => {
                    const btn = document.createElement('div');
                    btn.className = 'dialog-option-btn';
                    
                    if (index === this.selectedOptionIndex) {
                        btn.classList.add('active');
                        btn.innerText = `▶ ${opt.text}`; // 选中的选项加上箭头
                    } else {
                        btn.innerText = `  ${opt.text}`;
                    }
                    this.optionsContainer!.appendChild(btn);
                });
            }
        }
    },

    /**
     * 🌟 高内聚的 Update 方法，接管所有对话按键逻辑
     */
    update(input: Input) {
        if (!this.isActive) return;

        const current = this.dialogs[this.currentIndex];
        if (!current) return;

        // 1. 如果当前是选项模式，处理上下选择
        if (current.type === 'option' && current.options) {
            // 注意：因为 Input 类的 wasKeyPressed 检测的是单次按下，所以非常适合菜单选择
            if (input.wasKeyPressed('w') || input.wasKeyPressed('arrowup')) {
                this.selectedOptionIndex = (this.selectedOptionIndex - 1 + current.options.length) % current.options.length;
                this.renderCurrentDialog();
            } else if (input.wasKeyPressed('s') || input.wasKeyPressed('arrowdown')) {
                this.selectedOptionIndex = (this.selectedOptionIndex + 1) % current.options.length;
                this.renderCurrentDialog();
            }
        }

        // 2. 处理确认/下一步 (统使用 F 键)
        if (input.wasKeyPressed('f')) {
            this.next();
        }
    },

    next() {
        const current = this.dialogs[this.currentIndex];
        
        // 如果是选项模式，F 键触发的是确认逻辑
        if (current!.type === 'option') {
            this.confirmOption();
            return;
        }

        // 如果是普通文本，前往下一句
        this.currentIndex++;
        if (this.currentIndex >= this.dialogs.length) {
            this.resumeFromStack();
        } else {
            this.selectedOptionIndex = 0; 
            this.renderCurrentDialog();
        }
    },

    confirmOption() {
        const current = this.dialogs[this.currentIndex]!;
        if (current.type === 'option' && current.options) {
            const selectedOpt = current.options[this.selectedOptionIndex]!;

            this.dialogStack.push({
                dialogs: this.dialogs,
                returnIndex: this.currentIndex + 1
            });

            if (!selectedOpt.next || selectedOpt.next.length === 0) {
                this.resumeFromStack();
            } else {
                this.dialogs = selectedOpt.next;
                this.currentIndex = 0;
                this.selectedOptionIndex = 0; 
                this.renderCurrentDialog();
            }
        }
    },

    resumeFromStack() {
        if (this.dialogStack.length > 0) {
            const state = this.dialogStack.pop()!;
            this.dialogs = state.dialogs;
            this.currentIndex = state.returnIndex;

            if (this.currentIndex >= this.dialogs.length) {
                this.resumeFromStack(); 
            } else {
                this.selectedOptionIndex = 0;
                this.renderCurrentDialog();
            }
        } else {
            this.close();
        }
    },

    close() {
        this.isActive = false;
        this.uiContainer!.style.display = 'none';

        // 🌟 3. 对话彻底结束，执行恢复逻辑
        if (this.onCloseCallback) {
            this.onCloseCallback();
            this.onCloseCallback = null; // 执行完清理掉
        }
    }
};