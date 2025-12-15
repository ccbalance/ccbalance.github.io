# CCBalance - 化学平衡策略游戏

一款赛博朋克风格的化学平衡策略对战游戏。通过调节温度、压强和浓度来控制化学平衡,与AI进行对战。

## 安装与运行

```bash
# 安装依赖
npm install

# 运行游戏
npm start

# 开发模式
npm run dev
```

## 游戏玩法

### 目标

每局游戏会随机分配目标: 促进正向反应或促进逆向反应。通过调节条件使化学平衡朝有利于自己的方向移动。

### 控制方式

#### 鼠标操作

- 拖动滑块调节温度、压强和浓度
- 点击能力卡牌使用特殊技能
- 点击确认按钮结束回合

#### 键盘快捷键

| 按键 | 功能 |
|------|------|
| W/S 或 方向键 | 增大/减小当前参数 |
| A/D 或 方向键 | 调整当前参数 |
| Tab | 切换参数类型 |
| Space / Enter | 确认回合 |
| R | 重置本回合调整 |
| 1-4 | 使用对应能力卡牌 |
| ESC | 暂停游戏 |
| F | 切换全屏 |

### 能力卡牌

1. **催化剂** (按键1) - 加速平衡移动效果
2. **缓冲液** (按键2) - 减少对手调整的影响
3. **热交换** (按键3) - 快速改变温度
4. **量子干扰** (按键4) - 随机扰动平衡状态

### 胜利条件

- 进度条先达到100%的一方获胜
- 如果回合结束时双方都未达到100%,进度更高者获胜

## 化学知识点

游戏涵盖高中化学所有化学平衡相关方程式:

- **离子反应**: 酸碱中和、沉淀溶解等
- **氧化还原**: 金属与酸反应、电化学反应等
- **溶解平衡**: 难溶盐溶解度平衡
- **电离平衡**: 弱酸弱碱电离
- **复杂平衡**: 工业合成反应等

## 技术栈

- **框架**: Electron 28.0.0
- **渲染**: Canvas 2D / WebGL
- **图标**: FontAwesome 6.5.1 (本地)
- **样式**: CSS3 (玻璃态效果、粒子动画)

## 项目结构

ccbalance/
├── main.js              # Electron主进程
├── preload.js           # 预加载脚本
├── index.html           # 主页面
├── fontawesome/         # FontAwesome字体图标
└── src/
    ├── styles/
    │   ├── main.css          # 主样式
    │   ├── ui-components.css # UI组件
    │   ├── game-board.css    # 游戏界面
    │   ├── particles.css     # 粒子效果
    │   └── animations.css    # 动画效果
    └── js/
        ├── utils.js           # 工具函数
        ├── storage-manager.js # 本地存储
        ├── particle-system.js # 粒子系统
        ├── animation-manager.js # 动画管理
        ├── chemistry-engine.js # 化学引擎
        ├── levels.js          # 关卡数据
        ├── ai-system.js       # AI系统
        ├── card-system.js     # 能力卡牌
        ├── ui-manager.js      # UI管理
        ├── keyboard-handler.js # 键盘处理
        ├── chart-renderer.js  # 图表渲染
        ├── game.js            # 游戏主循环
        └── app.js             # 应用入口

## 开发调试

在控制台输入 `debug()` 启用调试模式,可通过 `window.DEBUG` 访问所有模块。

## 许可证

MIT License
