/**
 * CCBalance - 卡牌系统模块
 * 处理特殊能力卡牌
 */

const CardSystem = {
    // 卡牌定义
    cards: {
        catalyst: {
            id: 'catalyst',
            name: '催化剂',
            icon: 'fa-bolt',
            description: '加速反应达到平衡，但不改变平衡位置',
            cooldown: 3,
            effect: 'accelerate',
            color: '#00d4ff'
        },
        buffer: {
            id: 'buffer',
            name: '缓冲液',
            icon: 'fa-shield-alt',
            description: '减缓对方操作的效果（持续2回合）',
            cooldown: 4,
            effect: 'protect',
            duration: 2,
            color: '#00ff88'
        },
        heatexchange: {
            id: 'heatexchange',
            name: '热交换',
            icon: 'fa-fire-alt',
            description: '瞬间大幅改变温度',
            cooldown: 3,
            effect: 'temperature',
            magnitude: 100,
            color: '#ff4466'
        },
        quantum: {
            id: 'quantum',
            name: '量子跃迁',
            icon: 'fa-atom',
            description: '随机大幅改变平衡状态',
            cooldown: 5,
            effect: 'random',
            color: '#7b2dff'
        }
    },

    // 玩家卡牌状态
    playerCards: {},
    
    // AI卡牌状态
    aiCards: {},

    // 激活的效果
    activeEffects: {
        player: [],
        ai: []
    },

    /**
     * 初始化卡牌系统
     */
    init() {
        // 初始化玩家卡牌
        this.playerCards = {};
        for (const [id, card] of Object.entries(this.cards)) {
            this.playerCards[id] = {
                ...card,
                available: true,
                currentCooldown: 0
            };
        }

        // 初始化AI卡牌
        this.aiCards = {};
        for (const [id, card] of Object.entries(this.cards)) {
            this.aiCards[id] = {
                ...card,
                available: true,
                currentCooldown: 0
            };
        }

        // 清除激活效果
        this.activeEffects = {
            player: [],
            ai: []
        };
    },

    /**
     * 使用卡牌
     */
    useCard(cardId, user = 'player') {
        const cards = user === 'player' ? this.playerCards : this.aiCards;
        const card = cards[cardId];
        
        if (!card || !card.available) {
            return { success: false, message: '卡牌不可用' };
        }

        // 设置冷却
        card.available = false;
        card.currentCooldown = card.cooldown;

        // 应用效果
        const result = this.applyCardEffect(card, user);

        return { 
            success: true, 
            card: card,
            effect: result 
        };
    },

    /**
     * 应用卡牌效果
     */
    applyCardEffect(card, user) {
        const opponent = user === 'player' ? 'ai' : 'player';
        let result = {};

        switch (card.effect) {
            case 'accelerate':
                // 催化剂：加速平衡
                result = this.applyCatalyst();
                break;

            case 'protect':
                // 缓冲液：保护效果
                result = this.applyBuffer(user, card.duration);
                break;

            case 'temperature':
                // 热交换：改变温度
                result = this.applyHeatExchange(user, card.magnitude);
                break;

            case 'random':
                // 量子跃迁：随机效果
                result = this.applyQuantumTunnel();
                break;
        }

        result.cardId = card.id;
        result.user = user;
        
        return result;
    },

    /**
     * 催化剂效果
     */
    applyCatalyst() {
        // 让系统快速趋近平衡
        const state = ChemistryEngine.applyCatalyst();
        
        return {
            type: 'catalyst',
            description: '反应速率大幅提升',
            newState: state
        };
    },

    /**
     * 缓冲液效果
     */
    applyBuffer(user, duration) {
        // 添加保护效果
        this.activeEffects[user].push({
            type: 'buffer',
            duration: duration,
            reduction: 0.5 // 减少50%效果
        });

        return {
            type: 'buffer',
            description: `获得缓冲保护（${duration}回合）`,
            duration: duration
        };
    },

    /**
     * 热交换效果
     */
    applyHeatExchange(user, magnitude) {
        const state = ChemistryEngine.getState();
        if (!state) return { type: 'heatexchange', success: false };

        // 根据使用者目标决定温度变化方向
        const reaction = ChemistryEngine.currentReaction;
        const deltaH = reaction?.deltaH || 0;
        const goal = user === 'player' ? Game.state.playerGoal : AISystem.goal;
        
        // 计算最优温度变化方向
        let tempChange = magnitude;
        if (goal === 'forward') {
            // 想要正向反应
            if (deltaH > 0) {
                // 吸热反应，升温促进正向
                tempChange = magnitude;
            } else {
                // 放热反应，降温促进正向
                tempChange = -magnitude;
            }
        } else {
            // 想要逆向反应
            if (deltaH > 0) {
                tempChange = -magnitude;
            } else {
                tempChange = magnitude;
            }
        }

        const newState = ChemistryEngine.adjustTemperature(tempChange);

        return {
            type: 'heatexchange',
            description: `温度${tempChange > 0 ? '升高' : '降低'}${Math.abs(tempChange)}K`,
            tempChange: tempChange,
            newState: newState
        };
    },

    /**
     * 量子跃迁效果
     */
    applyQuantumTunnel() {
        const state = ChemistryEngine.getState();
        if (!state) return { type: 'quantum', success: false };

        // 随机改变多个参数
        const changes = [];
        
        // 随机改变温度
        const tempChange = Utils.random(-80, 80);
        ChemistryEngine.adjustTemperature(tempChange);
        changes.push(`温度${tempChange > 0 ? '+' : ''}${Math.round(tempChange)}K`);
        
        // 随机改变一个物种的浓度
        const species = Utils.randomChoice(
            [...ChemistryEngine.currentReaction.reactants, 
             ...ChemistryEngine.currentReaction.products]
        );
        const concChange = Utils.random(-0.3, 0.3);
        ChemistryEngine.adjustConcentration(species, concChange);
        changes.push(`[${species}]${concChange > 0 ? '+' : ''}${concChange.toFixed(2)}`);

        // 如果有气体，随机改变压强
        if (ChemistryEngine.currentReaction.hasGas) {
            const pressChange = Utils.random(-50, 50);
            ChemistryEngine.adjustPressure(pressChange);
            changes.push(`压强${pressChange > 0 ? '+' : ''}${Math.round(pressChange)}kPa`);
        }

        return {
            type: 'quantum',
            description: '量子态跃迁: ' + changes.join(', '),
            changes: changes,
            newState: ChemistryEngine.getState()
        };
    },

    /**
     * 回合结束更新冷却
     */
    updateCooldowns() {
        // 更新玩家卡牌冷却
        for (const card of Object.values(this.playerCards)) {
            if (card.currentCooldown > 0) {
                card.currentCooldown--;
                if (card.currentCooldown === 0) {
                    card.available = true;
                }
            }
        }

        // 更新AI卡牌冷却
        for (const card of Object.values(this.aiCards)) {
            if (card.currentCooldown > 0) {
                card.currentCooldown--;
                if (card.currentCooldown === 0) {
                    card.available = true;
                }
            }
        }

        // 更新激活效果持续时间
        for (const side of ['player', 'ai']) {
            this.activeEffects[side] = this.activeEffects[side].filter(effect => {
                effect.duration--;
                return effect.duration > 0;
            });
        }
    },

    /**
     * 检查是否有激活的缓冲效果
     */
    hasBufferEffect(target) {
        return this.activeEffects[target].some(e => e.type === 'buffer');
    },

    /**
     * 获取效果减免系数
     */
    getEffectReduction(target) {
        const bufferEffect = this.activeEffects[target].find(e => e.type === 'buffer');
        return bufferEffect ? bufferEffect.reduction : 0;
    },

    /**
     * 应用缓冲效果到决策
     */
    applyBufferEffect(decision, target) {
        if (!this.hasBufferEffect(target)) {
            return decision;
        }

        const reduction = this.getEffectReduction(target);
        return {
            ...decision,
            magnitude: decision.magnitude * (1 - reduction)
        };
    },

    /**
     * 获取卡牌状态
     */
    getCardStatus(cardId, user = 'player') {
        const cards = user === 'player' ? this.playerCards : this.aiCards;
        return cards[cardId];
    },

    /**
     * 获取所有玩家卡牌
     */
    getPlayerCards() {
        return this.playerCards;
    },

    /**
     * 获取所有AI卡牌
     */
    getAICards() {
        return this.aiCards;
    },

    /**
     * 检查卡牌是否可用
     */
    isCardAvailable(cardId, user = 'player') {
        const cards = user === 'player' ? this.playerCards : this.aiCards;
        return cards[cardId]?.available || false;
    },

    /**
     * 应用激活的效果
     */
    applyActiveEffects(gameState) {
        // 应用催化剂效果（加速平衡移动）
        for (const side of ['player', 'ai']) {
            const catalystEffect = this.activeEffects[side].find(e => e.type === 'catalyst');
            if (catalystEffect) {
                // 催化剂加速反应，但不改变平衡
                // 这里可以增加Q趋向K的速度
            }
        }
    },

    /**
     * 减少所有卡牌冷却时间
     */
    reduceCooldowns() {
        // 减少玩家卡牌冷却
        for (const [id, card] of Object.entries(this.playerCards)) {
            if (card.currentCooldown > 0) {
                card.currentCooldown--;
                if (card.currentCooldown === 0) {
                    card.available = true;
                }
            }
        }

        // 减少AI卡牌冷却
        for (const [id, card] of Object.entries(this.aiCards)) {
            if (card.currentCooldown > 0) {
                card.currentCooldown--;
                if (card.currentCooldown === 0) {
                    card.available = true;
                }
            }
        }

        // 减少激活效果持续时间
        for (const side of ['player', 'ai']) {
            this.activeEffects[side] = this.activeEffects[side].filter(effect => {
                effect.duration--;
                return effect.duration > 0;
            });
        }
    },

    /**
     * 重置所有卡牌
     */
    reset() {
        this.init();
    }
};

// 导出
window.CardSystem = CardSystem;
