/**
 * CCBalance - 键盘控制模块
 * 处理所有键盘输入
 */

const KeyboardHandler = {
    // 按键映射
    keyMap: {
        // WASD - 参数调整
        'w': { action: 'paramUp', code: 'KeyW' },
        's': { action: 'paramDown', code: 'KeyS' },
        'a': { action: 'paramLeft', code: 'KeyA' },
        'd': { action: 'paramRight', code: 'KeyD' },
        
        // 数字键 - 能力卡牌
        '1': { action: 'ability1', code: 'Digit1' },
        '2': { action: 'ability2', code: 'Digit2' },
        '3': { action: 'ability3', code: 'Digit3' },
        '4': { action: 'ability4', code: 'Digit4' },
        
        // 功能键
        'Tab': { action: 'switchParam', code: 'Tab' },
        'Escape': { action: 'pause', code: 'Escape' },
        'r': { action: 'reset', code: 'KeyR' },
        'f': { action: 'fullscreen', code: 'KeyF' },
        
        // 方向键 - 备选参数调整
        'ArrowUp': { action: 'paramUp', code: 'ArrowUp' },
        'ArrowDown': { action: 'paramDown', code: 'ArrowDown' },
        'ArrowLeft': { action: 'paramLeft', code: 'ArrowLeft' },
        'ArrowRight': { action: 'paramRight', code: 'ArrowRight' }
    },

    // 当前选中的参数
    currentParam: 'temperature',
    
    // 参数列表
    params: ['temperature', 'pressure', 'concentration'],
    
    // 是否启用
    enabled: true,

    // 按键状态
    keyStates: {},

    /**
     * 初始化键盘处理
     */
    init() {
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        // 阻止某些默认行为
        document.addEventListener('keydown', (e) => {
            if (['Tab'].includes(e.code) && this.isGameScreen()) {
                e.preventDefault();
            }
        });
    },

    /**
     * 检查是否在游戏界面
     */
    isGameScreen() {
        const gameScreen = document.getElementById('game-screen');
        return gameScreen && gameScreen.classList.contains('active');
    },

    /**
     * 处理按键按下
     */
    handleKeyDown(e) {
        if (!this.enabled) return;
        
        // 如果在输入框中，不处理
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }

        const key = e.key.toLowerCase();
        const mapping = this.keyMap[key] || this.keyMap[e.key];
        
        if (!mapping) return;

        // 防止重复触发
        if (this.keyStates[mapping.action]) return;
        this.keyStates[mapping.action] = true;

        // 执行对应操作
        this.executeAction(mapping.action, e);
    },

    /**
     * 处理按键释放
     */
    handleKeyUp(e) {
        const key = e.key.toLowerCase();
        const mapping = this.keyMap[key] || this.keyMap[e.key];
        
        if (mapping) {
            this.keyStates[mapping.action] = false;
        }
    },

    /**
     * 执行操作
     */
    executeAction(action, e) {
        // 全局操作
        switch (action) {
            case 'fullscreen':
                window.electronAPI?.toggleFullscreen();
                return;
            
            case 'pause':
                if (this.isGameScreen()) {
                    Game.togglePause();
                } else {
                    // 在其他界面按ESC返回主菜单
                    UIManager.showScreen('mainMenu');
                }
                return;
        }

        // 游戏界面操作
        if (!this.isGameScreen()) return;
        if (Game.isPaused) {
            // 暂停状态只响应特定按键
            if (action === 'pause') {
                Game.togglePause();
            }
            return;
        }

        switch (action) {
            case 'paramUp':
                this.adjustCurrentParam(1);
                break;
            
            case 'paramDown':
                this.adjustCurrentParam(-1);
                break;
            
            case 'paramLeft':
                this.adjustCurrentParam(-1);
                break;
            
            case 'paramRight':
                this.adjustCurrentParam(1);
                break;
            
            case 'switchParam':
                this.switchToNextParam();
                e.preventDefault();
                break;
            
            case 'reset':
                Game.resetTurn();
                break;
            
            case 'ability1':
                this.useAbility('catalyst');
                break;
            
            case 'ability2':
                this.useAbility('buffer');
                break;
            
            case 'ability3':
                this.useAbility('heatexchange');
                break;
            
            case 'ability4':
                this.useAbility('quantum');
                break;
        }
    },

    /**
     * 调整当前参数
     */
    adjustCurrentParam(direction) {
        const step = 5; // 每次调整5单位
        
        switch (this.currentParam) {
            case 'temperature':
                this.adjustSlider('temp-slider', direction * step);
                break;
            
            case 'pressure':
                this.adjustSlider('pressure-slider', direction * step);
                break;
            
            case 'concentration':
                this.adjustConcentration(direction * step);
                break;
        }
    },

    /**
     * 调整滑块
     */
    adjustSlider(sliderId, delta) {
        const slider = document.getElementById(sliderId);
        if (!slider) return;
        
        const newValue = Math.max(0, Math.min(100, 
            parseFloat(slider.value) + delta
        ));
        
        slider.value = newValue;
        slider.dispatchEvent(new Event('input', { bubbles: true }));
        
        // 显示视觉反馈
        this.showAdjustmentFeedback(slider.parentElement, delta);
    },

    /**
     * 调整浓度
     */
    adjustConcentration(delta) {
        const sliders = document.querySelectorAll('.conc-slider');
        if (sliders.length === 0) return;
        
        // 调整所有浓度滑块或选中的浓度
        sliders.forEach(slider => {
            const newValue = Math.max(0, Math.min(100,
                parseFloat(slider.value) + delta
            ));
            slider.value = newValue;
            slider.dispatchEvent(new Event('input', { bubbles: true }));
        });
    },

    /**
     * 切换到下一个参数
     */
    switchToNextParam() {
        const currentIndex = this.params.indexOf(this.currentParam);
        const nextIndex = (currentIndex + 1) % this.params.length;
        this.currentParam = this.params[nextIndex];
        
        // 更新UI高亮
        if (UIManager.highlightParam) {
            UIManager.highlightParam(this.currentParam);
        }
        
        // 显示提示
        const paramNames = {
            temperature: '温度',
            pressure: '压强',
            concentration: '浓度'
        };
        if (Utils.showToast) {
            Utils.showToast(`切换到 ${paramNames[this.currentParam]}`, 'info');
        }
    },

    /**
     * 使用能力卡牌
     */
    useAbility(ability) {
        Game.useAbility(ability);
    },

    /**
     * 显示调整反馈
     */
    showAdjustmentFeedback(element, delta) {
        const indicator = document.createElement('span');
        indicator.className = 'adjustment-indicator';
        indicator.textContent = delta > 0 ? '+' : '-';
        indicator.style.cssText = `
            position: absolute;
            right: 10px;
            top: 50%;
            transform: translateY(-50%);
            color: ${delta > 0 ? '#00ff88' : '#ff4444'};
            font-weight: bold;
            animation: fadeOut 0.5s ease-out forwards;
            pointer-events: none;
        `;
        
        element.style.position = 'relative';
        element.appendChild(indicator);
        
        setTimeout(() => indicator.remove(), 500);
    },

    /**
     * 启用键盘控制
     */
    enable() {
        this.enabled = true;
    },

    /**
     * 禁用键盘控制
     */
    disable() {
        this.enabled = false;
        this.keyStates = {};
    },

    /**
     * 重置状态
     */
    reset() {
        this.currentParam = 'temperature';
        this.keyStates = {};
    },

    /**
     * 获取按键提示文本
     */
    getKeyHints() {
        return {
            movement: 'W/A/S/D 或 方向键调整参数',
            switchParam: 'Tab 切换参数类型',
            abilities: '1-4 使用能力卡牌',
            reset: 'R 重置当前回合',
            pause: 'ESC 暂停游戏',
            fullscreen: 'F 切换全屏'
        };
    }
};

// 添加fadeOut动画样式
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from { opacity: 1; transform: translateY(-50%); }
        to { opacity: 0; transform: translateY(-100%); }
    }
`;
document.head.appendChild(style);

// 导出
window.KeyboardHandler = KeyboardHandler;
