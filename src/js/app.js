/**
 * CCBalance - 应用入口
 * 初始化所有模块并启动应用
 */

// 应用配置
const AppConfig = {
    version: '1.0.0',
    name: 'CCBalance',
    debug: false
};

// 主应用对象
const App = {
    // 背景粒子系统实例
    bgParticles: null,
    
    // 初始化状态
    initialized: false,

    /**
     * 初始化应用
     */
    async init() {
        if (this.initialized) return;

        console.log(`${AppConfig.name} v${AppConfig.version} 正在初始化...`);

        try {
            // 初始化存储
            StorageManager.init();

            // 初始化UI
            UIManager.init();

            // 初始化游戏
            Game.init();

            // 初始化键盘处理
            KeyboardHandler.init();

            // 初始化粒子系统
            this.initParticles();

            // 初始化动画管理器
            AnimationManager.init();

            // 初始化图表
            this.initCharts();

            // 加载设置
            this.applySettings();

            // 显示主菜单
            UIManager.showScreen('mainMenu');

            // 解锁第一关
            StorageManager.unlockLevel(1);

            this.initialized = true;
            console.log('初始化完成');
            
            // 隐藏启动画面
            this.hideSplash();

        } catch (error) {
            console.error('初始化失败:', error);
            this.showError('游戏初始化失败,请刷新页面重试');
        }
    },

    /**
     * 隐藏启动画面
     */
    hideSplash() {
        setTimeout(() => {
            const splash = document.getElementById('splash-screen');
            if (splash) {
                splash.classList.add('hidden');
                setTimeout(() => {
                    splash.style.display = 'none';
                }, 500);
            }
        }, 1500);
    },

    /**
     * 初始化粒子系统
     */
    initParticles() {
        const canvas = document.getElementById('bg-particles');
        if (!canvas) {
            console.warn('粒子画布未找到');
            return;
        }

        // 设置画布大小
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // 创建背景粒子系统
        this.bgParticles = new BackgroundParticleSystem(canvas);
        window.bgParticles = this.bgParticles;

        // 根据设置初始化粒子数量
        const settings = StorageManager.getSettings();
        const counts = { low: 50, medium: 200, high: 500 };
        this.bgParticles.init(counts[settings.particleCount] || 200);
        
        // 启动动画循环
        this.bgParticles.start();

        // 响应窗口大小变化
        window.addEventListener('resize', Utils.debounce(() => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            this.bgParticles.resize();
        }, 250));

        // 鼠标交互
        canvas.addEventListener('mousemove', Utils.throttle((e) => {
            this.bgParticles.setMousePosition(e.clientX, e.clientY);
        }, 16));

        canvas.addEventListener('click', (e) => {
            this.bgParticles.burst(e.clientX, e.clientY, 20);
        });
    },

    /**
     * 初始化图表
     */
    initCharts() {
        // 使用已存在的画布
        const chartCanvas = document.getElementById('chart-canvas');
        if (chartCanvas) {
            ChartRenderer.init('chart-canvas');
        }
    },

    /**
     * 应用设置
     */
    applySettings() {
        const settings = StorageManager.getSettings();

        // 应用动画设置
        if (!settings.enableAnimations) {
            document.body.classList.add('reduce-motion');
        }

        // 应用音量设置
        // 这里可以设置音频系统的音量
    },

    /**
     * 显示错误信息
     */
    showError(message) {
        const overlay = document.createElement('div');
        overlay.className = 'error-overlay';
        overlay.innerHTML = `
            <div class="error-box">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>出错了</h3>
                <p>${message}</p>
                <button onclick="location.reload()">刷新页面</button>
            </div>
        `;
        document.body.appendChild(overlay);
    },

    /**
     * 获取游戏状态
     */
    getState() {
        return {
            game: Game.state,
            storage: {
                progress: StorageManager.getProgress(),
                settings: StorageManager.getSettings(),
                collection: StorageManager.getCollection()
            }
        };
    },

    /**
     * 调试模式
     */
    enableDebug() {
        AppConfig.debug = true;
        window.DEBUG = {
            game: Game,
            ui: UIManager,
            storage: StorageManager,
            chemistry: ChemistryEngine,
            levels: LevelData,
            ai: AISystem,
            cards: CardSystem,
            particles: this.bgParticles,
            animations: AnimationManager,
            charts: ChartRenderer,
            keyboard: KeyboardHandler
        };
        console.log('调试模式已启用,使用 window.DEBUG 访问所有模块');
    }
};

// 错误样式
const errorStyle = document.createElement('style');
errorStyle.textContent = `
    .error-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    }
    
    .error-box {
        background: rgba(255, 0, 100, 0.2);
        border: 2px solid #ff0066;
        border-radius: 12px;
        padding: 40px;
        text-align: center;
        max-width: 400px;
    }
    
    .error-box i {
        font-size: 48px;
        color: #ff0066;
        margin-bottom: 20px;
    }
    
    .error-box h3 {
        color: #fff;
        margin-bottom: 15px;
    }
    
    .error-box p {
        color: rgba(255, 255, 255, 0.7);
        margin-bottom: 25px;
    }
    
    .error-box button {
        background: linear-gradient(135deg, #ff0066, #ff00aa);
        border: none;
        color: white;
        padding: 12px 30px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 14px;
    }
    
    .reduce-motion * {
        animation-duration: 0.001ms !important;
        transition-duration: 0.001ms !important;
    }
`;
document.head.appendChild(errorStyle);

// Toast容器
const toastContainer = document.createElement('div');
toastContainer.id = 'toast-container';
toastContainer.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 10px;
`;
document.body.appendChild(toastContainer);

// Toast样式
const toastStyle = document.createElement('style');
toastStyle.textContent = `
    .toast {
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(10px);
        border-radius: 8px;
        padding: 12px 20px;
        color: white;
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideIn 0.3s ease-out, fadeOut 0.3s ease-out 2.7s forwards;
        border-left: 3px solid #00d4ff;
    }
    
    .toast.success { border-color: #00ff88; }
    .toast.error { border-color: #ff4444; }
    .toast.warning { border-color: #ffaa00; }
    .toast.info { border-color: #00d4ff; }
    
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
`;
document.head.appendChild(toastStyle);

// DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// 窗口加载完成后的额外初始化
window.addEventListener('load', () => {
    // 隐藏加载画面(如果有的话)
    const loader = document.getElementById('loading-screen');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => loader.remove(), 500);
    }
});

// 导出到全局
window.App = App;
window.AppConfig = AppConfig;

// 快捷调试命令
window.debug = () => App.enableDebug();
