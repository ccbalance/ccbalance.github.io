/**
 * CCBalance - 图表渲染模块
 * 绘制浓度曲线和反应进程图
 */

const ChartRenderer = {
    // 画布配置
    canvas: null,
    ctx: null,
    
    // 图表配置
    config: {
        width: 300,
        height: 150,
        padding: { top: 20, right: 20, bottom: 30, left: 40 },
        colors: {
            background: 'rgba(0, 0, 0, 0.3)',
            grid: 'rgba(255, 255, 255, 0.1)',
            axis: 'rgba(255, 255, 255, 0.5)',
            text: 'rgba(255, 255, 255, 0.8)',
            reactants: ['#ff6b6b', '#ffa94d', '#ffd43b'],
            products: ['#00d4ff', '#69db7c', '#9775fa'],
            equilibrium: '#ff00aa'
        },
        maxDataPoints: 50
    },

    // 数据存储
    data: {
        timestamps: [],
        concentrations: {},
        equilibriumLine: []
    },

    /**
     * 初始化图表
     */
    init(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            this.createCanvas(canvasId);
        }
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        
        window.addEventListener('resize', () => this.resize());
    },

    /**
     * 创建画布
     */
    createCanvas(canvasId) {
        this.canvas = document.createElement('canvas');
        this.canvas.id = canvasId;
        this.canvas.className = 'concentration-chart';
        
        const container = document.getElementById('chart-container');
        if (container) {
            container.appendChild(this.canvas);
        }
    },

    /**
     * 调整大小
     */
    resize() {
        if (!this.canvas) return;
        
        const container = this.canvas.parentElement;
        if (container) {
            const rect = container.getBoundingClientRect();
            this.canvas.width = rect.width || this.config.width;
            this.canvas.height = rect.height || this.config.height;
            this.config.width = this.canvas.width;
            this.config.height = this.canvas.height;
        }
        
        this.render();
    },

    /**
     * 重置数据
     */
    reset(species) {
        this.data = {
            timestamps: [],
            concentrations: {},
            equilibriumLine: []
        };
        
        for (const s of species) {
            this.data.concentrations[s] = [];
        }
    },

    /**
     * 添加数据点
     */
    addDataPoint(concentrations, equilibriumReached) {
        const timestamp = this.data.timestamps.length;
        this.data.timestamps.push(timestamp);
        
        for (const [species, value] of Object.entries(concentrations)) {
            if (!this.data.concentrations[species]) {
                this.data.concentrations[species] = [];
            }
            this.data.concentrations[species].push(value);
        }
        
        this.data.equilibriumLine.push(equilibriumReached ? 1 : 0);
        
        // 限制数据点数量
        if (this.data.timestamps.length > this.config.maxDataPoints) {
            this.data.timestamps.shift();
            for (const species in this.data.concentrations) {
                this.data.concentrations[species].shift();
            }
            this.data.equilibriumLine.shift();
        }
        
        this.render();
    },

    /**
     * 渲染图表
     */
    render() {
        if (!this.ctx) return;
        
        const { width, height, padding, colors } = this.config;
        const ctx = this.ctx;
        
        // 清空画布
        ctx.clearRect(0, 0, width, height);
        
        // 绘制背景
        ctx.fillStyle = colors.background;
        ctx.fillRect(0, 0, width, height);
        
        // 绘制网格
        this.drawGrid();
        
        // 绘制坐标轴
        this.drawAxes();
        
        // 绘制数据线
        this.drawDataLines();
        
        // 绘制图例
        this.drawLegend();
    },

    /**
     * 绘制网格
     */
    drawGrid() {
        const { width, height, padding, colors } = this.config;
        const ctx = this.ctx;
        
        ctx.strokeStyle = colors.grid;
        ctx.lineWidth = 1;
        
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;
        
        // 横向网格线
        const yLines = 5;
        for (let i = 0; i <= yLines; i++) {
            const y = padding.top + (chartHeight / yLines) * i;
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(width - padding.right, y);
            ctx.stroke();
        }
        
        // 纵向网格线
        const xLines = 10;
        for (let i = 0; i <= xLines; i++) {
            const x = padding.left + (chartWidth / xLines) * i;
            ctx.beginPath();
            ctx.moveTo(x, padding.top);
            ctx.lineTo(x, height - padding.bottom);
            ctx.stroke();
        }
    },

    /**
     * 绘制坐标轴
     */
    drawAxes() {
        const { width, height, padding, colors } = this.config;
        const ctx = this.ctx;
        
        ctx.strokeStyle = colors.axis;
        ctx.lineWidth = 2;
        
        // Y轴
        ctx.beginPath();
        ctx.moveTo(padding.left, padding.top);
        ctx.lineTo(padding.left, height - padding.bottom);
        ctx.stroke();
        
        // X轴
        ctx.beginPath();
        ctx.moveTo(padding.left, height - padding.bottom);
        ctx.lineTo(width - padding.right, height - padding.bottom);
        ctx.stroke();
        
        // Y轴标签
        ctx.fillStyle = colors.text;
        ctx.font = '10px "Rajdhani", sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        
        const chartHeight = height - padding.top - padding.bottom;
        const maxConc = this.getMaxConcentration();
        
        for (let i = 0; i <= 5; i++) {
            const y = padding.top + (chartHeight / 5) * i;
            const value = maxConc * (1 - i / 5);
            ctx.fillText(value.toFixed(1), padding.left - 5, y);
        }
        
        // X轴标签
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText('时间 (回合)', width / 2, height - 10);
        
        // Y轴标题
        ctx.save();
        ctx.translate(12, height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = 'center';
        ctx.fillText('浓度 (M)', 0, 0);
        ctx.restore();
    },

    /**
     * 绘制数据线
     */
    drawDataLines() {
        const { width, height, padding, colors } = this.config;
        const ctx = this.ctx;
        
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;
        const maxConc = this.getMaxConcentration();
        
        const dataLength = this.data.timestamps.length;
        if (dataLength < 2) return;
        
        let colorIndex = 0;
        
        for (const [species, values] of Object.entries(this.data.concentrations)) {
            if (values.length < 2) continue;
            
            // 确定颜色
            const isReactant = colorIndex < 3;
            const colorArray = isReactant ? colors.reactants : colors.products;
            const color = colorArray[colorIndex % colorArray.length];
            colorIndex++;
            
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            for (let i = 0; i < values.length; i++) {
                const x = padding.left + (i / (dataLength - 1)) * chartWidth;
                const y = padding.top + (1 - values[i] / maxConc) * chartHeight;
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            
            ctx.stroke();
            
            // 绘制数据点
            ctx.fillStyle = color;
            for (let i = 0; i < values.length; i++) {
                const x = padding.left + (i / (dataLength - 1)) * chartWidth;
                const y = padding.top + (1 - values[i] / maxConc) * chartHeight;
                
                ctx.beginPath();
                ctx.arc(x, y, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    },

    /**
     * 绘制图例
     */
    drawLegend() {
        const { colors } = this.config;
        const ctx = this.ctx;
        
        const species = Object.keys(this.data.concentrations);
        if (species.length === 0) return;
        
        const legendX = this.config.width - this.config.padding.right - 80;
        const legendY = this.config.padding.top + 5;
        const lineHeight = 14;
        
        ctx.font = '10px "Rajdhani", sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        
        let colorIndex = 0;
        
        for (const s of species) {
            const isReactant = colorIndex < 3;
            const colorArray = isReactant ? colors.reactants : colors.products;
            const color = colorArray[colorIndex % colorArray.length];
            colorIndex++;
            
            const y = legendY + colorIndex * lineHeight;
            
            // 颜色方块
            ctx.fillStyle = color;
            ctx.fillRect(legendX, y - 5, 10, 10);
            
            // 文字
            ctx.fillStyle = colors.text;
            ctx.fillText(s, legendX + 15, y);
        }
    },

    /**
     * 获取最大浓度
     */
    getMaxConcentration() {
        let max = 1;
        
        for (const values of Object.values(this.data.concentrations)) {
            for (const v of values) {
                if (v > max) max = v;
            }
        }
        
        return Math.ceil(max * 1.2 * 10) / 10;
    },

    /**
     * 绘制迷你图表(用于结果界面)
     */
    renderMiniChart(canvasId, data) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        ctx.clearRect(0, 0, width, height);
        
        // 简化的图表绘制
        const padding = 10;
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;
        
        // 背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(0, 0, width, height);
        
        // 绘制进度曲线
        if (data && data.progress && data.progress.length > 1) {
            const gradient = ctx.createLinearGradient(0, padding, 0, height - padding);
            gradient.addColorStop(0, 'rgba(0, 212, 255, 0.8)');
            gradient.addColorStop(1, 'rgba(0, 212, 255, 0.2)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.moveTo(padding, height - padding);
            
            for (let i = 0; i < data.progress.length; i++) {
                const x = padding + (i / (data.progress.length - 1)) * chartWidth;
                const y = height - padding - data.progress[i] / 100 * chartHeight;
                ctx.lineTo(x, y);
            }
            
            ctx.lineTo(padding + chartWidth, height - padding);
            ctx.closePath();
            ctx.fill();
            
            // 绘制线条
            ctx.strokeStyle = '#00d4ff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            for (let i = 0; i < data.progress.length; i++) {
                const x = padding + (i / (data.progress.length - 1)) * chartWidth;
                const y = height - padding - data.progress[i] / 100 * chartHeight;
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            
            ctx.stroke();
        }
    },

    /**
     * 创建反应进程图
     */
    createReactionProgressChart(containerId, level) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const width = container.clientWidth || 400;
        const height = 200;
        
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        container.innerHTML = '';
        container.appendChild(canvas);
        
        const ctx = canvas.getContext('2d');
        
        // 绘制能量图
        this.drawEnergyDiagram(ctx, width, height, level);
    },

    /**
     * 绘制能量图
     */
    drawEnergyDiagram(ctx, width, height, level) {
        const padding = { top: 30, right: 20, bottom: 40, left: 50 };
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;
        
        // 背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(0, 0, width, height);
        
        const deltaH = level.deltaH || -50;
        const isEndothermic = deltaH > 0;
        
        // 反应物能级
        const reactantY = isEndothermic ? 
            padding.top + chartHeight * 0.7 : 
            padding.top + chartHeight * 0.4;
        
        // 产物能级
        const productY = isEndothermic ?
            padding.top + chartHeight * 0.4 :
            padding.top + chartHeight * 0.7;
        
        // 活化能峰值
        const activationY = padding.top + chartHeight * 0.1;
        
        // 绘制能量曲线
        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, '#00d4ff');
        gradient.addColorStop(0.5, '#ff00aa');
        gradient.addColorStop(1, '#00ff88');
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        // 起点
        ctx.moveTo(padding.left, reactantY);
        
        // 反应物平台
        ctx.lineTo(padding.left + chartWidth * 0.2, reactantY);
        
        // 上升到活化能
        const cp1x = padding.left + chartWidth * 0.3;
        const cp1y = reactantY;
        const cp2x = padding.left + chartWidth * 0.4;
        const cp2y = activationY;
        const peakX = padding.left + chartWidth * 0.5;
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, peakX, activationY);
        
        // 下降到产物
        const cp3x = padding.left + chartWidth * 0.6;
        const cp3y = activationY;
        const cp4x = padding.left + chartWidth * 0.7;
        const cp4y = productY;
        const endX = padding.left + chartWidth * 0.8;
        ctx.bezierCurveTo(cp3x, cp3y, cp4x, cp4y, endX, productY);
        
        // 产物平台
        ctx.lineTo(width - padding.right, productY);
        
        ctx.stroke();
        
        // 绘制能级标注
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = '12px "Rajdhani", sans-serif';
        ctx.textAlign = 'left';
        
        // 反应物标签
        ctx.fillText('反应物', padding.left + 5, reactantY - 10);
        
        // 产物标签
        ctx.fillText('产物', width - padding.right - 40, productY - 10);
        
        // 活化能标签
        ctx.fillText('Ea', peakX - 10, activationY - 10);
        
        // deltaH标注
        const arrowY1 = Math.min(reactantY, productY) - 10;
        const arrowY2 = Math.max(reactantY, productY) + 10;
        const arrowX = width - padding.right - 60;
        
        ctx.strokeStyle = isEndothermic ? '#ff6b6b' : '#00ff88';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(arrowX, reactantY);
        ctx.lineTo(arrowX, productY);
        ctx.stroke();
        
        // 箭头
        const arrowDir = isEndothermic ? -1 : 1;
        ctx.beginPath();
        ctx.moveTo(arrowX, productY);
        ctx.lineTo(arrowX - 5, productY - arrowDir * 10);
        ctx.lineTo(arrowX + 5, productY - arrowDir * 10);
        ctx.closePath();
        ctx.fill();
        
        // deltaH值
        ctx.fillStyle = isEndothermic ? '#ff6b6b' : '#00ff88';
        ctx.textAlign = 'center';
        ctx.fillText(
            `ΔH = ${deltaH > 0 ? '+' : ''}${deltaH} kJ/mol`,
            arrowX,
            (reactantY + productY) / 2
        );
        
        // 坐标轴
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1;
        
        // Y轴
        ctx.beginPath();
        ctx.moveTo(padding.left, padding.top);
        ctx.lineTo(padding.left, height - padding.bottom);
        ctx.stroke();
        
        // X轴
        ctx.beginPath();
        ctx.moveTo(padding.left, height - padding.bottom);
        ctx.lineTo(width - padding.right, height - padding.bottom);
        ctx.stroke();
        
        // 轴标签
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = '11px "Rajdhani", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('反应进程', width / 2, height - 10);
        
        ctx.save();
        ctx.translate(15, height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('能量', 0, 0);
        ctx.restore();
    }
};

// 导出
window.ChartRenderer = ChartRenderer;
