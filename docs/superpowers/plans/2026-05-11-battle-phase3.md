# 對戰體驗優化 Phase 3 實作計畫

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans.

**Goal:** 敵人分級、多樣化戰利品、角色專屬技能動畫、音效系統

**Architecture:** 敵人分級在 BattleScene init 時隨機決定，掉落表為 GameData 配置，技能動畫依角色 ID 分派，音效由 SoundManager singleton 管理

**Tech Stack:** Phaser 3, Web Audio API

---

### Task 1: GameData — 新增敵人分級 + 掉落表

**Files:**
- Modify: `src/data/GameData.js`

- [ ] **Step 1: 新增 ENEMY_TIERS**

在 `ATB_SPEEDS_CONFIG` 之前新增：
```js
export const ENEMY_TIERS = {
    normal: { label: '', hpMul: 1.0, atkMul: 1.0, defMul: 1.0, exp: 60, silver: 80, weight: 0.75 },
    elite: { label: '精英', hpMul: 2.0, atkMul: 1.5, defMul: 1.3, exp: 150, silver: 200, weight: 0.20 },
    boss: { label: '頭目', hpMul: 3.0, atkMul: 2.0, defMul: 1.5, exp: 300, silver: 500, weight: 0.05 }
};

export function rollEnemyTier() {
    const roll = Math.random();
    let cumulative = 0;
    for (const [tier, cfg] of Object.entries(ENEMY_TIERS)) {
        cumulative += cfg.weight;
        if (roll < cumulative) return tier;
    }
    return 'normal';
}
```

- [ ] **Step 2: 新增 LOOT_TABLES**

```js
export const LOOT_TABLES = {
    quanzhen_disciple: {
        common: [{ id: 'iron_ore', min: 1, max: 2, chance: 0.4 }],
        rare: [{ id: 'herb', min: 2, max: 3, chance: 0.15 }],
        eliteGuaranteed: [{ id: 'herb', min: 1, max: 2 }],
        bossGuaranteed: [{ id: 'herb', min: 3, max: 5 }, { id: 'jade_pendant', min: 1, max: 1 }]
    },
    taoist: {
        common: [{ id: 'herb', min: 2, max: 3, chance: 0.4 }],
        rare: [{ id: 'herb_potion', min: 1, max: 1, chance: 0.15 }],
        eliteGuaranteed: [{ id: 'herb_potion', min: 1, max: 1 }],
        bossGuaranteed: [{ id: 'herb_potion', min: 2, max: 2 }, { id: 'amulet', min: 1, max: 1 }]
    },
    mingjiao_member: {
        common: [{ id: 'bronze_ore', min: 1, max: 2, chance: 0.4 }],
        rare: [{ id: 'iron_sword', min: 1, max: 1, chance: 0.15 }],
        eliteGuaranteed: [{ id: 'bronze_ore', min: 2, max: 3 }],
        bossGuaranteed: [{ id: 'iron_sword', min: 1, max: 1 }, { id: 'ring', min: 1, max: 1 }]
    },
    persian: {
        common: [{ id: 'leather', min: 2, max: 3, chance: 0.4 }],
        rare: [{ id: 'leather_armor', min: 1, max: 1, chance: 0.15 }],
        eliteGuaranteed: [{ id: 'leather', min: 3, max: 5 }],
        bossGuaranteed: [{ id: 'leather_armor', min: 1, max: 1 }, { id: 'waist_pendant', min: 1, max: 1 }]
    }
};
```

- [ ] **Step 3: 驗證**

Run: `npx vite build`
Expected: 通過（尚未被引用）

---

### Task 2: BattleScene — 敵人分級 + 戰利品

**Files:**
- Modify: `src/scenes/BattleScene.js`

- [ ] **Step 1: 更新 import**

```js
import { CHARACTERS, ENEMIES, CHARACTER_SKILLS, SKILL_TREE_CONFIG, ATTRIBUTE_CONFIG, RAGE_CONFIG, ULTIMATE_SKILLS, ATB_SPEEDS_CONFIG, ITEMS, ENEMY_TIERS, rollEnemyTier, LOOT_TABLES } from '../data/GameData.js';
```

- [ ] **Step 2: 在 init 中決定敵人分級**

```js
init(data) {
    this.enemyId = data.enemyId || 'quanzhen_disciple';
    this.enemyTier = rollEnemyTier();
}
```

- [ ] **Step 3: 在 create 中用分級強化敵人**

在 `createEnemy(enemyData)` 之前或呼叫處套用分級。修改 `createEnemy`：

```js
createEnemy(enemyData) {
    const tierCfg = ENEMY_TIERS[this.enemyTier];
    const namePrefix = tierCfg.label ? tierCfg.label + ' ' : '';
    this.enemyHp = Math.floor(enemyData.hp * tierCfg.hpMul);
    this.enemyMaxHp = this.enemyHp;
    this.enemyAttack = Math.floor(enemyData.attack * tierCfg.atkMul);
    this.enemyDefense = Math.floor((enemyData.defense || 0) * tierCfg.defMul);
    this.enemySpeed = enemyData.speed || 10;
    // ... 其餘創建敵人 sprite 和 UI 的代碼，使用 this.enemyMaxHp, this.enemyHp ...
```

然後在 createEnemy 中，enemyData.name 引用改為 `namePrefix + enemyData.name`。

在 createEnemy 中原本的 `this.enemyHp = enemyData.hp; this.enemyMaxHp = enemyData.hp;` 和 `this.enemySpeed = enemyData.speed || 10;` 改為使用 tierCfg 加成。

- [ ] **Step 4: 修改 endBattle 使用新掉落邏輯**

將 endBattle 中的掉落代碼：

```js
if (Math.random() < 0.3) {
    const items = ['iron_ore', 'herb', 'leather', 'bronze_ore'];
    const item = items[Math.floor(Math.random() * items.length)];
    dataManager.addItem(item, Math.floor(Math.random() * 3) + 1);
    this.log(`📦 獲得材料: ${item}！`);
}
```

取代為：

```js
this.grantLoot();
```

- [ ] **Step 5: 新增 grantLoot 方法**

```js
grantLoot() {
    const table = LOOT_TABLES[this.enemyId];
    if (!table) return;

    const tier = this.enemyTier;
    const dropped = [];

    for (const entry of table.common) {
        if (Math.random() < entry.chance) {
            const amount = entry.min + Math.floor(Math.random() * (entry.max - entry.min + 1));
            dataManager.addItem(entry.id, amount);
            dropped.push(ITEMS[entry.id].name + '×' + amount);
        }
    }

    if (Math.random() < 0.15) {
        for (const entry of table.rare) {
            const amount = entry.min + Math.floor(Math.random() * (entry.max - entry.min + 1));
            dataManager.addItem(entry.id, amount);
            dropped.push(ITEMS[entry.id].name + '×' + amount);
        }
    }

    if (tier === 'elite' || tier === 'boss') {
        for (const entry of table.eliteGuaranteed) {
            const amount = entry.min + Math.floor(Math.random() * (entry.max - entry.min + 1));
            dataManager.addItem(entry.id, amount);
            dropped.push(ITEMS[entry.id].name + '×' + amount);
        }
    }

    if (tier === 'boss') {
        for (const entry of table.bossGuaranteed) {
            const amount = entry.min + Math.floor(Math.random() * (entry.max - entry.min + 1));
            dataManager.addItem(entry.id, amount);
            dropped.push(ITEMS[entry.id].name + '×' + amount);
        }
    }

    if (dropped.length > 0) {
        this.log('📦 獲得: ' + dropped.join(', '));
    }
}
```

- [ ] **Step 6: 更新 endBattle 經驗/銀兩使用分級加成**

在 endBattle 中：
```js
const tierCfg = ENEMY_TIERS[this.enemyTier];
const expGain = tierCfg.exp;
const silverGain = tierCfg.silver;
```

取代原本的 `const expGain = 50; const silverGain = 100;`

- [ ] **Step 7: 驗證**

`npx vite build` 通過。戰鬥時留意：
- 敵人名稱前可能出現「精英全真弟子」「頭目波斯人」
- 精英/頭目 HP 明顯更多
- 勝利時獲得經驗和銀兩不同
- 掉落物更豐富

---

### Task 3: BattleScene — 角色專屬技能動畫

**Files:**
- Modify: `src/scenes/BattleScene.js`

- [ ] **Step 1: 取代 skillAnimation 方法**

```js
skillAnimation(index) {
    const charId = dataManager.data.player.characterId;

    const animations = {
        guojing: [
            () => this.animGuojingPalm(),      // 降龍十八掌
            () => this.animGuojingFist(),       // 空明拳
            () => this.animDualStrike(0xffd700), // 左右互搏
            () => this.animInnerWave(0x4488ff)   // 九陰真經
        ],
        yangguo: [
            () => this.animDarkSlash(0x8b0000),  // 黯然銷魂掌
            () => this.animHeavySlash(0x333333),  // 玄鐵劍法
            () => this.animQuickShot(0x66ccff),   // 彈指神通
            () => this.animHeal(0xff88ff)          // 玉女心經
        ],
        xiaolongnu: [
            () => this.animSwiftSlash(0xffffff),  // 玉女劍法
            () => this.animDualSlash(0xccccff),   // 雙劍合璧
            () => this.animSpread(0x88ccff),      // 天羅地網勢
            () => this.animIceNeedle(0x88ddff)    // 冰魄銀針
        ],
        zhangwuji: [
            () => this.animShield(0xffd700),      // 乾坤大挪移
            () => this.animFist(0xff3300),        // 七傷拳
            () => this.animFlame(0xff6600),       // 聖火令武功
            () => this.animHeal(0x44ff44)          // 九陽神功
        ],
        linghu: [
            () => this.animQuickSlash(0x4488ff),  // 獨孤九劍
            () => this.animVortex(0x9944ff),      // 吸星大法
            () => this.animCleanse(0x88ff88),     // 易筋經
            () => this.animStunSlash(0x44aaff)    // 沖靈劍法
        ]
    };

    const charAnim = animations[charId];
    if (charAnim && charAnim[index]) {
        charAnim[index]();
    } else {
        this.genericSkillAnimation(index);
    }
}
```

- [ ] **Step 2: 新增各角色專屬動畫方法**

在 `skillAnimation` 之後新增：

```js
genericSkillAnimation(index) {
    const colors = [0xffffff, 0x4169e1, 0x9400d3, 0xffd700];
    this.launchOrbs(this.playerContainer.x + 80, this.playerContainer.y, colors[index]);
}

// 郭靖
animGuojingPalm() {
    this.launchOrbs(this.playerContainer.x + 80, this.playerContainer.y, 0xffd700, 8);
}
animGuojingFist() {
    this.launchHits(0x8b6914, 3);
}
animDualStrike(color) {
    this.launchOrbs(this.playerContainer.x + 80, this.playerContainer.y - 20, color, 3);
    this.time.delayedCall(200, () => this.launchOrbs(this.playerContainer.x + 80, this.playerContainer.y + 20, color, 3));
}

// 楊過
animDarkSlash(color) {
    this.createSlashEffect(this.playerContainer.x + 120, this.playerContainer.y, color, 2);
}
animHeavySlash(color) {
    this.createSlashEffect(this.playerContainer.x + 140, this.playerContainer.y - 20, color, 2.5);
}
animQuickShot(color) {
    this.launchOrbs(this.playerContainer.x + 100, this.playerContainer.y - 30, color, 1);
}

// 小龍女
animSwiftSlash(color) {
    this.createSlashEffect(this.playerContainer.x + 100, this.playerContainer.y, color, 1.2);
}
animDualSlash(color) {
    this.createSlashEffect(this.playerContainer.x + 100, this.playerContainer.y - 15, color, 1);
    this.time.delayedCall(150, () => this.createSlashEffect(this.playerContainer.x + 110, this.playerContainer.y + 15, color, 1));
}
animSpread(color) {
    for (let i = -2; i <= 2; i++) {
        this.launchOrbs(this.playerContainer.x + 80, this.playerContainer.y + i * 30, color, 1);
    }
}
animIceNeedle(color) {
    this.launchOrbs(this.playerContainer.x + 100, this.playerContainer.y - 10, color, 1, 3);
}

// 張無忌
animShield(color) {
    const shield = this.add.circle(this.playerContainer.x + 50, this.playerContainer.y, 40, color, 0.3);
    this.tweens.add({
        targets: shield, scaleX: 2, scaleY: 2, alpha: 0, duration: 600,
        onComplete: () => shield.destroy()
    });
}
animFist(color) {
    this.launchHits(color, 5);
}
animFlame(color) {
    this.launchOrbs(this.playerContainer.x + 80, this.playerContainer.y, color, 6);
}

// 令狐冲
animQuickSlash(color) {
    this.createSlashEffect(this.playerContainer.x + 110, this.playerContainer.y - 10, color, 1.5);
}
animVortex(color) {
    const vortex = this.add.circle(this.playerContainer.x + 120, this.playerContainer.y, 10, color, 0.6);
    this.tweens.add({
        targets: vortex, scaleX: 5, scaleY: 5, alpha: 0, duration: 800,
        onComplete: () => vortex.destroy()
    });
}
animCleanse(color) {
    const ring = this.add.circle(this.playerContainer.x, this.playerContainer.y, 20, color, 0.5);
    this.tweens.add({
        targets: ring, scaleX: 3, scaleY: 3, alpha: 0, duration: 500,
        onComplete: () => ring.destroy()
    });
}
animStunSlash(color) {
    this.createSlashEffect(this.playerContainer.x + 100, this.playerContainer.y, color, 1.3);
}

// 輔助方法
launchHits(color, count) {
    for (let i = 0; i < count; i++) {
        this.time.delayedCall(i * 100, () => {
            this.createSlashEffect(
                this.playerContainer.x + 80 + Math.random() * 60,
                this.playerContainer.y + (Math.random() - 0.5) * 40,
                color, 1
            );
        });
    }
}

launchOrbs(x, y, color, count = 5, size = 12) {
    for (let i = 0; i < count; i++) {
        this.time.delayedCall(i * 80, () => {
            const orb = this.add.circle(x, y, size * (1 - i * 0.1), color);
            this.tweens.add({
                targets: orb,
                x: x + 200,
                duration: 400 + i * 20,
                onComplete: () => {
                    orb.destroy();
                    this.createImpact(x + 200, y, color);
                }
            });
        });
    }
}
```

修改 `createSlashEffect` 支援顏色和縮放：
```js
createSlashEffect(x, y, color = 0xffffff, scale = 1) {
    const symbols = ['💥', '⚔', '✦', '☆'];
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];
    const slash = this.add.text(x, y, symbol, { fontSize: String(36 * scale) + 'px' }).setOrigin(0.5);
    if (color) slash.setTint(color);
    this.tweens.add({
        targets: slash,
        x: x + 60 * scale,
        alpha: 0,
        scale: scale * 2,
        duration: 300,
        onComplete: () => slash.destroy()
    });
}
```

- [ ] **Step 3: 驗證**

`npx vite build` 通過。各角色使用技能時應有不同視覺效果。

---

### Task 4: SoundManager + 整合

**Files:**
- Create: `src/systems/SoundManager.js`
- Modify: `src/scenes/BattleScene.js`
- Modify: `src/scenes/WorldScene.js`
- Modify: `src/main.js`

- [ ] **Step 1: 建立 SoundManager.js**

```js
class SoundManager {
    constructor() {
        this.ctx = null;
    }

    ensureContext() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    play(type) {
        try {
            this.ensureContext();
            const methods = {
                hit: () => this.tone(200, 100, 'square', 0.3),
                skill: () => this.sweep(300, 600, 300, 'sine', 0.2),
                crit: () => this.tone(400, 200, 'sawtooth', 0.25),
                hurt: () => this.tone(150, 150, 'triangle', 0.3),
                victory: () => {
                    this.tone(523, 100, 'sine', 0.2);
                    setTimeout(() => this.tone(659, 100, 'sine', 0.2), 120);
                    setTimeout(() => this.tone(784, 150, 'sine', 0.2), 240);
                },
                defeat: () => this.sweep(400, 100, 500, 'sine', 0.3),
                levelup: () => {
                    this.tone(500, 100, 'sine', 0.2);
                    setTimeout(() => this.tone(800, 300, 'sine', 0.2), 120);
                }
            };
            if (methods[type]) methods[type]();
        } catch (e) {
            // silently fail - audio is not critical
        }
    }

    tone(freq, duration, type, volume) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(volume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration / 1000);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration / 1000);
    }

    sweep(startFreq, endFreq, duration, type, volume) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(startFreq, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(endFreq, this.ctx.currentTime + duration / 1000);
        gain.gain.setValueAtTime(volume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration / 1000);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration / 1000);
    }
}

export const soundManager = new SoundManager();
```

- [ ] **Step 2: 在 main.js 初始化音效上下文（點擊時喚醒）**

在 `game` 創建後新增：
```js
document.addEventListener('click', () => {
    import('./systems/SoundManager.js').then(m => m.soundManager.ensureContext());
}, { once: true });
```

- [ ] **Step 3: 在 BattleScene 中整合音效**

在 `dealDamageToEnemy` 中（實際傷害之後）：
```js
soundManager.play('hit');
```

在 `dealDamageToPlayer` 中（實際傷害之後）：
```js
soundManager.play('hurt');
```

在 `calculateSkillDamage` 中（暴擊時）：
```js
soundManager.play('crit');
```

在 `useSkill` 中（技能施展時）：
```js
soundManager.play('skill');
```

在 `endBattle` 中（勝利/失敗時）：
```js
soundManager.play(victory ? 'victory' : 'defeat');
```

- [ ] **Step 4: 在 WorldScene 中整合升級音效**

在 `updateHUD()` 中檢查 level 是否變化並播放音效。或在 DataManager 的 `checkLevelUp()` 中播放。

若在 DataManager 中播放，需 import：
```js
import { soundManager } from './SoundManager.js';
```

並在 `checkLevelUp()` 中升級時呼叫：
```js
soundManager.play('levelup');
```

- [ ] **Step 5: 驗證**

`npx vite build` 通過。點擊遊戲畫面喚醒 AudioContext，進入戰鬥：
- 普攻命中聽到短噪音
- 技能施展聽到上升音
- 暴擊聽到高亢撞擊音
- 勝利/失敗聽到對應音效

---

## 自檢清單

- [ ] 每項 spec 要求都有對應 task
- [ ] 無 placeholder
- [ ] 方法簽名前後一致
- [ ] 所有 import 路徑正確