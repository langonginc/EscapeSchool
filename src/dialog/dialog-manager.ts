import * as ex from 'excalibur';
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
    optionsContainer: null as HTMLElement | null, // 【新增】专门存放选项按钮的容器
    hintElement: null as HTMLElement | null,      // 【新增】保存“按F继续”的引用，方便隐藏

    init() {
        if (this.uiContainer) return;

        // 1. 主容器 (UI 底板)
        this.uiContainer = document.createElement('div');
        this.uiContainer.style.position = 'absolute';
        this.uiContainer.style.bottom = '20px';
        this.uiContainer.style.left = '50%';
        this.uiContainer.style.transform = 'translateX(-50%)';
        this.uiContainer.style.width = '80%';
        this.uiContainer.style.maxWidth = '800px';
        this.uiContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
        this.uiContainer.style.border = '4px solid #fff';
        this.uiContainer.style.borderRadius = '8px';
        this.uiContainer.style.padding = '20px';
        this.uiContainer.style.color = '#fff';
        this.uiContainer.style.fontFamily = 'sans-serif';
        this.uiContainer.style.fontSize = '24px';
        this.uiContainer.style.lineHeight = '1.5';
        this.uiContainer.style.boxSizing = 'border-box';
        this.uiContainer.style.display = 'none'; 
        this.uiContainer.style.pointerEvents = 'auto'; 
        
        // 阻止点击对话框时触发游戏底层的点击事件
        this.uiContainer.addEventListener('pointerdown', (e) => e.stopPropagation());

        // 2. 文字容器
        this.textElement = document.createElement('div');
        this.uiContainer.appendChild(this.textElement);

        // 3. 选项容器 【新增】
        this.optionsContainer = document.createElement('div');
        this.optionsContainer.style.marginTop = '20px';
        this.optionsContainer.style.display = 'flex';
        this.optionsContainer.style.flexDirection = 'column';
        this.optionsContainer.style.gap = '10px';
        this.uiContainer.appendChild(this.optionsContainer);

        // 4. 按键提示
        this.hintElement = document.createElement('div');
        this.hintElement.innerText = '按 [F] 继续 ▼';
        this.hintElement.style.fontSize = '14px';
        this.hintElement.style.color = '#ccc';
        this.hintElement.style.textAlign = 'right';
        this.hintElement.style.marginTop = '10px';
        this.hintElement.style.animation = 'blink 1s infinite';
        this.uiContainer.appendChild(this.hintElement);

        document.body.appendChild(this.uiContainer);
    },

    start(dialogData: Dialog[]) {
        if (!dialogData || dialogData.length === 0) return;
        this.isActive = true;
        this.dialogs = dialogData;
        this.currentIndex = 0;
        this.selectedOptionIndex = 0;
        this.uiContainer!.style.display = 'block';
        this.dialogStack = [];
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
            this.hintElement!.style.display = 'none';
            if (current.options) {
                current.options.forEach((opt, index) => {
                    const btn = document.createElement('div'); // 改用 div 避免 button 默认焦点干扰
                    btn.className = 'dialog-option-btn';
                    // 【核心】如果是当前选中的，加上 active 类
                    if (index === this.selectedOptionIndex) {
                        btn.classList.add('active');
                    }
                    btn.innerText = (index === this.selectedOptionIndex ? '> ' : '  ') + opt.text;
                    this.optionsContainer!.appendChild(btn);
                });
            }
        }
    },

    handleInput(key: ex.Keys) {
        const current = this.dialogs[this.currentIndex]!;
        if (current.type !== 'option' || !current.options) return;

        if (key === ex.Keys.W || key === ex.Keys.Up) {
            this.selectedOptionIndex = (this.selectedOptionIndex - 1 + current.options.length) % current.options.length;
            this.renderCurrentDialog();
        } else if (key === ex.Keys.S || key === ex.Keys.Down) {
            this.selectedOptionIndex = (this.selectedOptionIndex + 1) % current.options.length;
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
                this.selectedOptionIndex = 0; // 进入新分支重置预选
                this.renderCurrentDialog();
            }
        }
    },

    next() {
        // 如果是选项模式，F 键触发 confirmOption
        if (this.dialogs[this.currentIndex]!.type === 'option') {
            this.confirmOption();
            return;
        }

        this.currentIndex++;
        if (this.currentIndex >= this.dialogs.length) {
            // 【核心修改】：播完了不要直接 close()，先去看看栈里有没有上一级要恢复
            this.resumeFromStack();
        } else {
            this.selectedOptionIndex = 0; 
            this.renderCurrentDialog();
        }
    },

    resumeFromStack() {
        // 如果栈里有东西，说明我们是在一个分支里
        if (this.dialogStack.length > 0) {
            // 弹出最后压入的状态
            const state = this.dialogStack.pop()!;
            this.dialogs = state.dialogs;
            this.currentIndex = state.returnIndex;

            // 这里有一个边界情况：万一上一级恢复回来的 returnIndex 也超出数组长度了怎么办？
            // (比如这个 option 就是上一级数组的最后一句话)
            if (this.currentIndex >= this.dialogs.length) {
                // 递归调用自己，继续往外层弹，直到找到还有话没说完的层级，或者栈被弹空
                this.resumeFromStack(); 
            } else {
                // 成功回到了上一级，并且还有话没说，继续渲染！
                this.selectedOptionIndex = 0;
                this.renderCurrentDialog();
            }
        } else {
            // 栈彻底空了，说明最外层的主干剧情也跑完了，这才是真正的结束
            this.close();
        }
    },

    close() {
        this.isActive = false;
        this.uiContainer!.style.display = 'none';
    }
};