# 對戰體驗優化 Phase 2 實作計畫

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** ATB 半即時制 + 屬性相剋 + 怒氣大招 + 招架閃避 + 裝備戰鬥影響

**Architecture:** ATB 引擎直接整合在 BattleScene 中（`process(delta)` 驅動），屬性/怒氣/招架為獨立方法群組，裝備計算由 DataManager 提供 `getBattleStats()` 方法

**Tech Stack:** Phaser 3 (JavaScript, Vite)

---

## 檔案結構

| 檔案 | 狀態 | 職責 |
|------|------|------|
| `src/data/GameData.js` | 修改 | 新增 ATB_SPEEDS、ATTRIBUTE_CONFIG、RAGE_CONFIG、ULTIMATE_SKILLS、飾品 battleStats |
| `src/scenes/BattleScene.js` | 修改 | ATB 引擎、屬性傷害計算、怒氣系統、招架/閃避、裝備加成 |
| `src/systems/DataManager.js` | 修改 | 新增 `getBattleStats()` 計算裝備總和效果 |
| `src/scenes/CharacterSelectScene.js` | 修改 | 角色卡片顯示屬性標籤 |
| `src/scenes/WorldScene.js` | 修改 | 簡易裝備管理（按 I 打開背包使用裝備） |

---

### Task 1: GameData — 新增 ATB/屬性/怒氣/裝備配置

**Files:**
- Modify: `src/data/GameData.js`

- [ ] **Step 1: 在 ENEMIES 中新增 speed 欄位**

將 ENEMIES 改為：
```js
export const ENEMIES = {
    quanzhen_disciple: { name: '全真弟子', hp: 60, attack: 10, defense: 2, speed: 8 },
    taoist: { name: '道士', hp: 80, attack: 15, defense: 3, speed: 10 },
    mingjiao_member: { name: '明教教徒', hp: 90, attack: 20, defense: 5, speed: 12 },
    persian: { name: '波斯人', hp: 110, attack: 25, defense: 8, speed: 15 }
};
```

- [ ] **Step 2: 新增 ATTRIBUTE_CONFIG**

在 SKILL_TREE_CONFIG 之後新增：
```js
export const ATTRIBUTE_CONFIG = {
    cycle: ['yinrou', 'yanggang', 'gangmeng', 'qingling'],
    names: { yinrou: '陰柔', yanggang: '陽剛', gangmeng: '剛猛', qingling: '輕靈' },
    icons: { yinrou: '❄', yanggang: '⚡', gangmeng: '⛰', qingling: '🍃' },
    advantages: { yinrou: 'yanggang', yanggang: 'gangmeng', gangmeng: 'qingling', qingling: 'yinrou' },
    disadvantage: { yinrou: 'qingling', yanggang: 'yinrou', gangmeng: 'yanggang', qingling: 'gangmeng' },
    damageMultiplier: 1.3,
    characterAttribute: {
        guojing: 'gangmeng',
        yangguo: 'yanggang',
        xiaolongnu: 'qingling',
        zhangwuji: 'yinrou',
        linghu: null
    },
    skillAttributes: {
        guojing:  ['gangmeng', 'gangmeng', 'gangmeng', 'yinrou'],
        yangguo:  ['yanggang', 'yanggang', 'qingling', null],
        xiaolongnu: ['qingling', 'qingling', 'qingling', 'yinrou'],
        zhangwuji: [null, 'gangmeng', 'yanggang', 'yinrou'],
        linghu:   [null, null, null, null]
    }
};
```

- [ ] **Step 3: 新增 RAGE_CONFIG + ULTIMATE_SKILLS**

```js
export const RAGE_CONFIG = {
    maxRage: 100,
    gainOnDamage: 10,
    gainOnHit: 15,
    gainPerTurn: 5
};

export const ULTIMATE_SKILLS = {
    guojing: { name: '亢龍有悔', damageRatio: 3.0, ignoreDef: 1.0, desc: '降龍十八掌最強一式，無視防禦' },
    yangguo: { name: '玄鐵重劍', damageRatio: 4.0, selfDamage: 0.1, desc: '重劍無鋒，大巧不工' },
    xiaolongnu: { name: '玉女素心劍', damageRatio: 1.5, hits: 3, desc: '玉女劍法極致，三連擊' },
    zhangwuji: { name: '乾坤大挪移', damageRatio: 0, reflect: 1.0, healRatio: 0.3, desc: '反彈所有傷害，恢復 HP', duration: 3 },
    linghu: { name: '獨孤九劍·破氣式', damageRatio: 3.0, ignoreDef: 1.0, status: { type: 'stun', duration: 2 }, desc: '破盡天下武功，附帶封穴' }
};
```

- [ ] **Step 4: 擴充 ITEMS 加入 battleStats**

```js
export const ITEMS = {
    iron_ore: { name: '鐵礦', type: 'material' },
    bronze_ore: { name: '青銅礦', type: 'material' },
    herb: { name: '草藥', type: 'material' },
    leather: { name: '皮革', type: 'material' },
    iron_sword: { name: '鐵劍', type: 'weapon', battleStats: { attack: 10 } },
    herb_potion: { name: '草藥水', type: 'consumable', effect: { hp: 50 } },
    leather_armor: { name: '皮甲', type: 'armor', battleStats: { defense: 5 } },
    bronze_pickaxe: { name: '青銅鎬', type: 'tool' },
    jade_pendant: { name: '玉珮', type: 'accessory', battleStats: { hpRegenCombat: 0.02 } },
    amulet: { name: '護身符', type: 'accessory', battleStats: { dmgReduction: 0.05 } },
    ring: { name: '戒指', type: 'accessory', battleStats: { critBonus: 0.05 } },
    waist_pendant: { name: '腰墜', type: 'accessory', battleStats: { rageBoost: 1.2 } }
};
```

- [ ] **Step 5: 新增 ATB_SPEEDS_CONFIG**

```js
export const ATB_SPEEDS_CONFIG = {
    fillRate: 0.001,
    maxAtb: 100,
    playerSpeedMultiplier: 1.5,
    enemySpeedBase: { quanzhen_disciple: 8, taoist: 10, mingjiao_member: 12, persian: 15 }
};
```

- [ ] **Step 6: 驗證**

Run: `npx vite build`
Expected: build 通過（此時 BattleScene 尚未更新，但新增 config 不影響既有引用）

---

### Task 2: BattleScene — ATB 核心引擎 + ATB UI

**Files:**
- Modify: `src/scenes/BattleScene.js`

- [ ] **Step 1: 在 create() 中初始化 ATB 系統**

在 `this.statuses = ...` 之後新增：
```js
this.playerAtb = 0;
this.enemyAtb = 0;
this.atbActive = true;
this.playerSpeed = dataManager.data.player.agility * ATB_SPEEDS_CONFIG.playerSpeedMultiplier;
this.enemySpeed = ENEMIES[this.enemyId].speed || 10;
```

新增 import：
```js
import { CHARACTERS, ENEMIES, CHARACTER_SKILLS, SKILL_TREE_CONFIG, ATTRIBUTE_CONFIG, RAGE_CONFIG, ULTIMATE_SKILLS, ATB_SPEEDS_CONFIG, ITEMS } from '../data/GameData.js';
```

- [ ] **Step 2: 實作 ATB update 邏輯**

新增 `update(time, delta)` 方法：
```js
update(time, delta) {
    if (!this.battleActive || !this.atbActive) return;

    const fillRate = ATB_SPEEDS_CONFIG.fillRate;
    this.playerAtb = Math.min(ATB_SPEEDS_CONFIG.maxAtb, this.playerAtb + this.playerSpeed * delta * fillRate);
    this.enemyAtb = Math.min(ATB_SPEEDS_CONFIG.maxAtb, this.enemyAtb + this.enemySpeed * delta * fillRate);

    this.updateAtbBars();

    if (this.playerAtb >= ATB_SPEEDS_CONFIG.maxAtb && this.playerTurn === false) {
        this.playerTurn = true;
        this.atbActive = false;
        this.add.text(640, 500, '選擇你的行動！', {
            fontSize: '24px', color: '#ffd700', fontFamily: 'Microsoft JhengHei'
        }).setOrigin(0.5);
    }

    if (this.enemyAtb >= ATB_SPEEDS_CONFIG.maxAtb && !this.enemyReady) {
        this.enemyReady = true;
        this.atbActive = false;
        this.time.delayedCall(500, () => this.enemyTurn());
    }
}
```

- [ ] **Step 3: 實作 ATB UI**

在 `createUI()` 中新增 ATB 條：
```js
// ATB bars at the top
this.add.text(300, 88, 'ATB', { fontSize: '16px', color: '#ffffff', fontFamily: 'Arial' }).setOrigin(0.5);

this.playerAtbBg = this.add.rectangle(500, 80, 300, 20, 0x333333).setStrokeStyle(1, 0x666666);
this.playerAtbBar = this.add.rectangle(500, 80, 0, 16, 0x4488ff).setOrigin(0, 0.5);

this.add.text(350, 80, '玩家', { fontSize: '12px', color: '#88bbff', fontFamily: 'Microsoft JhengHei' }).setOrigin(0, 0.5);

this.enemyAtbBg = this.add.rectangle(500, 110, 300, 20, 0x333333).setStrokeStyle(1, 0x666666);
this.enemyAtbBar = this.add.rectangle(500, 110, 0, 16, 0xff4444).setOrigin(0, 0.5);

this.add.text(350, 110, ENEMIES[this.enemyId].name, { fontSize: '12px', color: '#ff8888', fontFamily: 'Microsoft JhengHei' }).setOrigin(0, 0.5);
```

新增 `updateAtbBars()` 方法：
```js
updateAtbBars() {
    const maxW = 296;
    this.playerAtbBar.width = (this.playerAtb / ATB_SPEEDS_CONFIG.maxAtb) * maxW;
    this.enemyAtbBar.width = (this.enemyAtb / ATB_SPEEDS_CONFIG.maxAtb) * maxW;

    if (this.playerAtbBar.width) this.playerAtbBar.setAlpha(this.playerAtb >= ATB_SPEEDS_CONFIG.maxAtb ? 1 : 0.6);
    if (this.enemyAtbBar.width) this.enemyAtbBar.setAlpha(this.enemyAtb >= ATB_SPEEDS_CONFIG.maxAtb ? 1 : 0.6);
}
```

- [ ] **Step 4: 初始化 ATB UI 顯示**

在 `create()` 中 `this.log(...)` 之前呼叫：
```js
this.playerAtb = 0;
this.enemyAtb = 0;
this.playerTurn = false;
this.enemyReady = false;
this.atbActive = true;
```

移除原本的 `this.playerTurn = true;`

- [ ] **Step 5: 確保場景有 `update` 方法**

BattleScene 需要繼承 Phaser.Scene 的 update 生命週期。確認場景類別已正確註冊 update 方法（Phaser 會自動呼叫）。若無，需確認。

- [ ] **Step 6: 修改 enemyTurn 使用 ATB reset**

在 enemyTurn 的最後（行動完成後），將 `this.enemyAtb = 0; this.enemyReady = false; this.atbActive = true;` 而不是直接設 playerTurn = true。

修改 enemyTurn 回調中的這段：
```js
if (this.battleActive) {
    this.time.delayedCall(1000, () => {
        this.tickStatuses('player');
        this.enemyAtb = 0;
        this.enemyReady = false;
        this.atbActive = true;
    });
}
```

- [ ] **Step 7: 驗證**

`npx vite build` 無錯誤。啟動遊戲進入戰鬥，確認：
- ATB 條在頂部顯示，緩慢填充
- 玩家 ATB 滿時出現行動提示
- 敵人 ATB 滿時自動攻擊
- 屬性差異影響充能速度（郭靖慢、小龍女快）

---

### Task 3: BattleScene — 屬性相剋系統

**Files:**
- Modify: `src/scenes/BattleScene.js`

- [ ] **Step 1: 新增 getAttributeBonus 方法**

```js
getAttributeBonus(skillAttr, enemyId) {
    if (!skillAttr) return 1.0;

    const charId = dataManager.data.player.characterId;
    const charAttr = ATTRIBUTE_CONFIG.characterAttribute[charId];

    const enemyAttrMap = {
        quanzhen_disciple: 'yanggang',
        taoist: 'yinrou',
        mingjiao_member: 'gangmeng',
        persian: 'yanggang'
    };
    const enemyAttr = enemyAttrMap[enemyId] || 'gangmeng';

    if (ATTRIBUTE_CONFIG.advantages[skillAttr] === enemyAttr) {
        this.log('⚡ ' + ATTRIBUTE_CONFIG.icons[skillAttr] + ' ' + ATTRIBUTE_CONFIG.names[skillAttr] + ' 克制 ' + ATTRIBUTE_CONFIG.names[enemyAttr] + '！傷害 +30%');
        return ATTRIBUTE_CONFIG.damageMultiplier;
    }
    if (ATTRIBUTE_CONFIG.disadvantage[skillAttr] === enemyAttr) {
        this.log('⚠ ' + ATTRIBUTE_CONFIG.icons[skillAttr] + ' ' + ATTRIBUTE_CONFIG.names[skillAttr] + ' 被 ' + ATTRIBUTE_CONFIG.names[enemyAttr] + ' 克制！傷害 -30%');
        return (2 - ATTRIBUTE_CONFIG.damageMultiplier);
    }
    return 1.0;
}
```

- [ ] **Step 2: 在 calculateSkillDamage 中整合屬性加成**

在 `calculateSkillDamage` 中，計算出 `damage` 之後、回傳之前新增：
```js
const skillAttr = ATTRIBUTE_CONFIG.skillAttributes[dataManager.data.player.characterId];
if (skillAttr && skillAttr[index]) {
    const attrBonus = this.getAttributeBonus(skillAttr[index], this.enemyId);
    damage = Math.floor(damage * attrBonus);
}
```

注意：`calculateSkillDamage` 現在需要傳入 `index` 和 `enemyId`。修改方法簽名為：
```js
calculateSkillDamage(skill, skillLevel, nodeEffects, index) {
```
並在呼叫處傳入 index。

- [ ] **Step 3: 驗證**

- 郭靖（剛猛）vs 全真弟子（陽剛）：剛猛克制陽剛 → +30%
- 張無忌（陰柔）vs 道士（陰柔）：無克制
- 令狐冲所有技能：無屬性，無加成/減成
- ATB 速度不受屬性影響

---

### Task 4: BattleScene — 怒氣大招系統

**Files:**
- Modify: `src/scenes/BattleScene.js`

- [ ] **Step 1: 初始化怒氣系統**

在 `create()` 的 ATB 初始化之後新增：
```js
this.rage = 0;
this.rageActive = true;
```

在 `createUI()` 中新增怒氣條：
```js
this.rageBg = this.add.rectangle(640, 140, 400, 20, 0x333333).setStrokeStyle(1, 0xff6600);
this.rageBar = this.add.rectangle(440, 140, 0, 16, 0xff4400).setOrigin(0, 0.5);
this.rageText = this.add.text(640, 160, '怒氣: 0 / 100', {
    fontSize: '12px', color: '#ff6600', fontFamily: 'Microsoft JhengHei'
}).setOrigin(0.5);
```

- [ ] **Step 2: 新增怒氣增減方法**

```js
addRage(amount) {
    if (!this.rageActive) return;
    const boost = this.getEquipmentStat('rageBoost', 1);
    this.rage = Math.min(RAGE_CONFIG.maxRage, this.rage + Math.floor(amount * boost));
    this.updateRageUI();
    if (this.rage >= RAGE_CONFIG.maxRage && !this.rageFullNotified) {
        this.rageFullNotified = true;
        this.log('🔥 怒氣已滿！按 R 釋放絕招！');
    }
}

updateRageUI() {
    const maxW = 396;
    this.rageBar.width = (this.rage / RAGE_CONFIG.maxRage) * maxW;
    this.rageText.setText('怒氣: ' + this.rage + ' / ' + RAGE_CONFIG.maxRage);
}
```

- [ ] **Step 3: 在傷害/受擊流程中增加怒氣**

在 `dealDamageToEnemy` 中（造成傷害後）新增：`this.addRage(RAGE_CONFIG.gainOnDamage);`
在 `dealDamageToPlayer` 中（受到傷害後）新增：`this.addRage(RAGE_CONFIG.gainOnHit);`
在 `endPlayerTurn` 中新增：`this.addRage(RAGE_CONFIG.gainPerTurn);`

- [ ] **Step 4: 註冊 R 鍵觸發絕招**

在 `create()` 的 keyboard 監聽中新增：
```js
this.input.keyboard.on('keydown-R', () => this.useUltimate());
```

- [ ] **Step 5: 實作 useUltimate 方法**

```js
useUltimate() {
    if (!this.battleActive || !this.playerTurn || this.rage < RAGE_CONFIG.maxRage) return;

    this.rage = 0;
    this.rageFullNotified = false;
    this.updateRageUI();

    const charId = dataManager.data.player.characterId;
    const ultimate = ULTIMATE_SKILLS[charId];
    this.log('🔥 釋放絕招：' + ultimate.name + '！');

    if (ultimate.damageRatio > 0) {
        const baseAtk = 10 + dataManager.data.player.strength * 0.5;
        const weaponAtk = this.getEquipmentStat('attack', 0);
        const damage = Math.floor((baseAtk + weaponAtk) * ultimate.damageRatio);
        this.dealDamageToEnemy(damage, { ignoreDef: ultimate.ignoreDef || false, hits: ultimate.hits || 1 });
    }

    if (ultimate.healRatio) {
        this.playerHp = Math.min(this.playerMaxHp, this.playerHp + Math.floor(this.playerMaxHp * ultimate.healRatio));
        this.updatePlayerHpBar();
    }

    if (ultimate.reflect) {
        this.rageActive = false;
        this.log('🛡️ 乾坤大挪移發動，反彈所有傷害 3 回合！');
    }

    if (ultimate.status) {
        this.applyStatus('enemy', ultimate.status.type, ultimate.status.duration);
    }
}
```

- [ ] **Step 6: 驗證**

- 戰鬥中造成/受到傷害，怒氣條增加
- 怒氣全滿時出現提示
- 按 R 釋放絕招，怒氣歸零
- 各角色絕招效果不同

---

### Task 5: BattleScene — 招架 / 閃避

**Files:**
- Modify: `src/scenes/BattleScene.js`

- [ ] **Step 1: 註冊 F 鍵招架**

在 `create()` 的 keyboard 監聽中新增：
```js
this.input.keyboard.on('keydown-F', () => this.defend());
```

- [ ] **Step 2: 實作 defend 方法**

```js
defend() {
    if (!this.battleActive || !this.playerTurn) return;
    this.isDefending = true;
    this.playerTurn = false;
    this.log('🛡️ 進入防禦姿態！');
    this.endPlayerTurn();
}
```

- [ ] **Step 3: 在 dealDamageToPlayer 中整合招架/閃避**

修改 `dealDamageToPlayer`：

```js
dealDamageToPlayer(damage) {
    // 閃避判定
    const agi = dataManager.data.player.agility;
    const dodgeChance = agi / (agi + 50);
    if (Math.random() < dodgeChance) {
        this.log('💨 閃避了攻擊！');
        return;
    }

    // 招架減傷
    let actualDamage = Math.max(1, damage);
    if (this.isDefending) {
        actualDamage = Math.floor(actualDamage * 0.5);
        this.log('🛡️ 招架減傷 50%！');
        this.isDefending = false;
    }

    // 飾品減傷
    const dmgReduction = this.getEquipmentStat('dmgReduction', 0);
    actualDamage = Math.floor(actualDamage * (1 - dmgReduction));

    this.playerHp -= actualDamage;
    dataManager.data.player.hp = this.playerHp;

    this.log('你受到 ' + actualDamage + ' 傷害！');
    // ... 其餘動畫邏輯保持不變 ...
}
```

- [ ] **Step 4: 新增 getEquipmentStat 輔助方法**

```js
getEquipmentStat(statName, defaultValue) {
    const equipped = dataManager.data.player.equipped;
    const slots = ['weapon', 'armor', 'accessory'];
    let total = defaultValue;
    for (const slot of slots) {
        const itemId = equipped[slot];
        if (itemId && ITEMS[itemId] && ITEMS[itemId].battleStats && ITEMS[itemId].battleStats[statName] !== undefined) {
            total += ITEMS[itemId].battleStats[statName];
        }
    }
    return total;
}
```

- [ ] **Step 5: 驗證**

- 按 F 進入防禦姿態，本回合受到傷害減半
- 閃避跳過傷害（小龍女閃避率高）
- 獨孤九劍無視閃避（ignoreDodge 邏輯可後續添加）

---

### Task 6: DataManager — 裝備戰鬥數值計算

**Files:**
- Modify: `src/systems/DataManager.js`

- [ ] **Step 1: 新增 import**

```js
import { ITEMS } from '../data/GameData.js';
```

- [ ] **Step 2: 新增 getBattleStats 方法**

在 `canUpgradeNode` 之後新增：
```js
getBattleStats() {
    const equipped = this.data.player.equipped;
    const stats = { attack: 0, defense: 0, critBonus: 0, dmgReduction: 0, hpRegenCombat: 0, rageBoost: 1.0 };

    const slots = ['weapon', 'armor', 'accessory'];
    for (const slot of slots) {
        const itemId = equipped[slot];
        if (itemId && ITEMS[itemId] && ITEMS[itemId].battleStats) {
            const bs = ITEMS[itemId].battleStats;
            if (bs.attack) stats.attack += bs.attack;
            if (bs.defense) stats.defense += bs.defense;
            if (bs.critBonus) stats.critBonus += bs.critBonus;
            if (bs.dmgReduction) stats.dmgReduction = Math.min(0.5, stats.dmgReduction + bs.dmgReduction);
            if (bs.hpRegenCombat) stats.hpRegenCombat = Math.max(stats.hpRegenCombat, bs.hpRegenCombat);
            if (bs.rageBoost) stats.rageBoost = Math.max(stats.rageBoost, bs.rageBoost);
        }
    }
    return stats;
}

equipItem(itemId) {
    const item = ITEMS[itemId];
    if (!item) return false;

    const typeMap = { weapon: 'weapon', armor: 'armor', accessory: 'accessory' };
    const slot = typeMap[item.type];
    if (!slot) return false;

    this.data.player.equipped[slot] = itemId;
    return true;
}

unequipItem(slot) {
    this.data.player.equipped[slot] = null;
}
```

- [ ] **Step 3: 驗證**

```js
// console test:
// dataManager.equipItem('iron_sword')
// dataManager.getBattleStats().attack → 10
// dataManager.unequipItem('weapon')
// dataManager.getBattleStats().attack → 0
```

---

### Task 7: CharacterSelectScene — 顯示角色屬性

**Files:**
- Modify: `src/scenes/CharacterSelectScene.js`

- [ ] **Step 1: 新增 import**

```js
import { CHARACTERS, CHARACTER_SKILLS, ATTRIBUTE_CONFIG } from '../data/GameData.js';
```

- [ ] **Step 2: 在角色卡片中顯示屬性標籤**

在角色卡片區塊中，`char.desc` 文字下方，武功列表上方新增：
```js
const charAttr = ATTRIBUTE_CONFIG.characterAttribute[id];
if (charAttr) {
    this.add.text(x, cy + 54, ATTRIBUTE_CONFIG.icons[charAttr] + ' ' + ATTRIBUTE_CONFIG.names[charAttr], {
        fontSize: '14px', color: '#ffcc00', fontFamily: 'Microsoft JhengHei',
        align: 'center'
    }).setOrigin(0.5);
}
```

- [ ] **Step 3: 驗證**

- 郭靖卡片顯示「⛰ 剛猛」
- 小龍女卡片顯示「🍃 輕靈」
- 令狐冲卡片不顯示屬性（無屬性）

---

### Task 8: WorldScene — 簡易裝備管理

**Files:**
- Modify: `src/scenes/WorldScene.js`

- [ ] **Step 1: 在 HUD 中顯示當前裝備**

在 `setupHUD()` 中，`this.levelText` 之後新增：
```js
const eq = dataManager.data.player.equipped;
this.equipText = this.add.text(280, 720, '武:' + (ITEMS[eq.weapon] ? ITEMS[eq.weapon].name : '無')
    + ' 防:' + (ITEMS[eq.armor] ? ITEMS[eq.armor].name : '無')
    + ' 飾:' + (ITEMS[eq.accessory] ? ITEMS[eq.accessory].name : '無'), {
    fontSize: '11px', color: '#888888', fontFamily: 'Microsoft JhengHei'
});
```

需要 import `ITEMS`.

- [ ] **Step 2: 驗證**

- 初始裝備顯示「武:無 防:無 飾:無」
- 未來透過背包 UI 裝備後，文字更新

---

## 自檢清單

- [ ] 每項 spec 要求都有對應 task:
  - 1.1 ATB 半即時制 → Task 1 + Task 2
  - 1.2 屬性相剋 → Task 1 + Task 3
  - 1.3 怒氣大招 → Task 1 + Task 4
  - 1.4 招架／閃避 → Task 5
  - 1.5 裝備影響戰鬥 → Task 1 + Task 6 + Task 8
- [ ] 無 placeholder
- [ ] 方法簽名前後一致
- [ ] 所有 import 路徑正確