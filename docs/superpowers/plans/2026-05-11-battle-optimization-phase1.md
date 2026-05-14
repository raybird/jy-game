# 對戰體驗優化 Phase 1 實作計畫

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 完成戰鬥系統 Phase 1 五項改造：幀率獨立遇敵、角色專屬武功、技能樹、HP/MP 保留、基礎狀態系統

**Architecture:** 所有配置資料集中在 GameData.js，戰鬥邏輯在 BattleScene.js 以模組化函式重構，狀態系統使用純函式管理（apply/tick/remove），技能樹為獨立 Scene 透過 DataManager 讀寫狀態

**Tech Stack:** Phaser 3 (JavaScript, Vite), localStorage persistence

---

## 檔案結構

| 檔案 | 狀態 | 職責 |
|------|------|------|
| `src/data/GameData.js` | 修改 | 新增 ENCOUNTER_CONFIG、CHARACTER_SKILLS、SKILL_TREE_CONFIG |
| `src/scenes/WorldScene.js` | 修改 | 遇敵邏輯改為 time-based、非戰鬥 HP/MP 緩慢恢復 |
| `src/scenes/BattleScene.js` | 修改 | 移除自動回滿、角色專屬武功傷害計算、狀態系統 |
| `src/systems/DataManager.js` | 修改 | skill tree 狀態欄位、upgradeSkillNode/canUpgradeNode 方法、regenHpMp |
| `src/scenes/SkillTreeScene.js` | 新增 | 技能樹 UI 面板（獨立場景） |
| `src/scenes/CharacterSelectScene.js` | 修改 | 角色選擇時顯示專屬武功列表 |

---

### Task 1: GameData — 新增遇敵/武功/技能樹配置

**Files:**
- Modify: `src/data/GameData.js`

- [ ] **Step 1: 新增 ENCOUNTER_CONFIG**

在 `GameData.js` 底部新增：

```js
export const ENCOUNTER_CONFIG = {
    interval: 500,
    baseChance: 0.15,
    mapEnemies: {
        zhongnan: ['quanzhen_disciple', 'taoist'],
        guangming: ['mingjiao_member', 'persian']
    }
};
```

- [ ] **Step 2: 新增 CHARACTER_SKILLS**

在 `ENCOUNTER_CONFIG` 之後新增：

```js
export const CHARACTER_SKILLS = {
    guojing: [
        { name: '降龍十八掌', cost: 10, damageRatio: 1.8, type: 'inner', desc: '剛猛掌法，造成大量內功傷害' },
        { name: '空明拳', cost: 8, damageRatio: 1.2, type: 'outer', desc: '虛實交替，無視部分防禦', ignoreDef: 0.3 },
        { name: '左右互搏', cost: 12, damageRatio: 1.0, type: 'outer', desc: '雙倍打擊，連續攻擊兩次', hits: 2 },
        { name: '九陰真經', cost: 15, damageRatio: 2.0, type: 'inner', desc: '玄門正宗，附帶內傷效果', status: { type: 'bleed', duration: 3 } }
    ],
    yangguo: [
        { name: '黯然銷魂掌', cost: 10, damageRatio: 2.0, type: 'outer', desc: '情深黯然，暴擊率 +20%', critBonus: 0.2 },
        { name: '玄鐵劍法', cost: 12, damageRatio: 2.5, type: 'outer', desc: '重劍無鋒，無視防禦', ignoreDef: 1.0 },
        { name: '彈指神通', cost: 8, damageRatio: 1.0, type: 'inner', desc: '遠程攻擊，附帶封穴效果', status: { type: 'stun', duration: 1 } },
        { name: '玉女心經', cost: 10, damageRatio: 1.5, type: 'inner', desc: '恢復自身 HP 15%', healRatio: 0.15 }
    ],
    xiaolongnu: [
        { name: '玉女劍法', cost: 8, damageRatio: 1.5, type: 'outer', desc: '輕靈迅捷，ATB 充能加速' },
        { name: '雙劍合璧', cost: 15, damageRatio: 2.2, type: 'outer', desc: '左右夾擊，攻擊兩次', hits: 2 },
        { name: '天羅地網勢', cost: 10, damageRatio: 0.8, type: 'outer', desc: '大範圍攻擊，敵方全體', aoe: true },
        { name: '冰魄銀針', cost: 12, damageRatio: 1.2, type: 'inner', desc: '淬毒暗器，附帶內傷效果', status: { type: 'bleed', duration: 3 } }
    ],
    zhangwuji: [
        { name: '乾坤大挪移', cost: 15, damageRatio: 0.5, type: 'inner', desc: '借力打力，反彈 50% 傷害', reflect: 0.5 },
        { name: '七傷拳', cost: 12, damageRatio: 2.8, type: 'outer', desc: '一拳七傷，極高傷害但有自損', selfDamage: 0.1 },
        { name: '聖火令武功', cost: 10, damageRatio: 1.5, type: 'outer', desc: '波斯奇功，降低敵方防禦', status: { type: 'defDown', duration: 2 } },
        { name: '九陽神功', cost: 5, damageRatio: 0.0, type: 'inner', desc: '內力充沛，恢復 MP 30%', mpRestore: 0.3 }
    ],
    linghu: [
        { name: '獨孤九劍', cost: 8, damageRatio: 1.8, type: 'outer', desc: '破盡天下武功，無視防禦', ignoreDef: 1.0 },
        { name: '吸星大法', cost: 6, damageRatio: 0.8, type: 'inner', desc: '吸取敵方 MP 20', mpSteal: 20 },
        { name: '易筋經', cost: 10, damageRatio: 1.2, type: 'inner', desc: '洗髓伐脈，解除所有負面狀態', cleanse: true },
        { name: '沖靈劍法', cost: 12, damageRatio: 2.0, type: 'outer', desc: '華山絕學，附帶封穴效果', status: { type: 'stun', duration: 1 } }
    ]
};
```

- [ ] **Step 3: 新增 SKILL_TREE_CONFIG**

在 `CHARACTER_SKILLS` 之後新增：

```js
export const SKILL_TREE_CONFIG = {
    nodeCosts: [2, 2, 3],
    nodeEffects: [
        { damageBonus: 0.15 },
        { costReduction: 0.20 },
        { unlockPassive: true }
    ],
    passives: {
        guojing: { desc: '受到傷害 -10%', effect: { dmgReduction: 0.1 } },
        yangguo: { desc: 'HP < 30% 時暴擊率 +30%', effect: { critBonusLowHp: 0.3 } },
        xiaolongnu: { desc: 'ATB 充能速度 +15%', effect: { atbSpeedBonus: 0.15 } },
        zhangwuji: { desc: '每回合自動恢復 HP 5%', effect: { hpRegenCombat: 0.05 } },
        linghu: { desc: '技能 MP 消耗 -15%', effect: { mpCostReduction: 0.15 } }
    }
};
```

- [ ] **Step 4: 移除 SKILL_NAMES**

刪除檔案底部這行：
```js
export const SKILL_NAMES = ['普通攻擊', '第一招式', '第二招式', '第三招式'];
```

- [ ] **Step 5: 驗證沒有 Syntax Error**

Run: `node -e "import('./src/data/GameData.js').then(m => console.log('OK', Object.keys(m)))" --input-type=module`
如果 ES module 無法直接在 node 執行，改為 `npx vite build` 確認 build 通過

---

### Task 2: WorldScene — 遇敵改為 time-based + HP/MP 恢復

**Files:**
- Modify: `src/scenes/WorldScene.js`

- [ ] **Step 1: 在 create() 中初始化 encounter timer**

在 `create()` 方法中（在 `this.updateHUD()` 之前）新增：
```js
this.encounterTimer = 0;
```

同時新增 `ENCOUNTER_CONFIG` 的 import：
```js
import { CHARACTERS, SKILL_NAMES, ENCOUNTER_CONFIG } from '../data/GameData.js';
```

變更為：
```js
import { CHARACTERS, ENCOUNTER_CONFIG } from '../data/GameData.js';
```

- [ ] **Step 2: 取代 frame-based 遇敵邏輯**

找到 `update()` 中的這段（約第 485-492 行）：
```js
if (this.currentMap !== 'xianyang' && this.grassArea) {
    const bounds = this.grassArea.getBounds();
    if (bounds.contains(this.player.x, this.player.y)) {
        if (Math.random() < 0.003) {
            this.startRandomBattle();
        }
    }
}
```

取代為：
```js
if (this.currentMap !== 'xianyang' && this.grassArea) {
    const bounds = this.grassArea.getBounds();
    if (bounds.contains(this.player.x, this.player.y)) {
        this.encounterTimer += delta;
        if (this.encounterTimer >= ENCOUNTER_CONFIG.interval) {
            this.encounterTimer = 0;
            if (Math.random() < ENCOUNTER_CONFIG.baseChance) {
                this.startRandomBattle();
            }
        }
    }
}
```

- [ ] **Step 3: 新增非戰鬥 HP/MP 緩慢恢復**

在 `update()` 方法中，遇敵邏輯之後、`this.updateHUD()` 之前新增：
```js
if (this.currentMap === 'xianyang' || !this.grassArea || !this.grassArea.getBounds().contains(this.player.x, this.player.y)) {
    const p = dataManager.data.player;
    if (p.hp < p.maxHp) {
        p.hp = Math.min(p.maxHp, p.hp + p.maxHp * 0.01 * delta / 1000);
    }
    if (p.mp < p.maxMp) {
        p.mp = Math.min(p.maxMp, p.mp + p.maxMp * 0.005 * delta / 1000);
    }
}
```

- [ ] **Step 4: 修改 startRandomBattle 使用 ENCOUNTER_CONFIG**

```js
startRandomBattle() {
    const enemies = ENCOUNTER_CONFIG.mapEnemies[this.currentMap] || ['quanzhen_disciple'];
    const enemyId = enemies[Math.floor(Math.random() * enemies.length)];
    dataManager.data.inBattle = true;
    this.cameras.main.fade(300, 0, 0, 0);
    this.time.delayedCall(300, () => {
        this.scene.start('BattleScene', { enemyId });
    });
}
```

- [ ] **Step 5: 驗證**

執行 `npm run dev`，前往非城鎮地圖（zhongnan/guangming），確認：
- 在草地移動約 3-10 秒應觸發戰鬥（非立即、非過快）
- 戰鬥後回到地圖，HP/MP 應保留非滿值狀態
- 在安全區域（xianyang 或非草地）HP/MP 緩慢上升

---

### Task 3: BattleScene — 角色專屬武功 + 移除自動回滿

**Files:**
- Modify: `src/scenes/BattleScene.js`

- [ ] **Step 1: 更新 import**

```js
import { CHARACTERS, ENEMIES, CHARACTER_SKILLS } from '../data/GameData.js';
```

移除 `SKILL_NAMES` 的引用。

- [ ] **Step 2: 在 create() 中載入角色武功**

在 `const charData = CHARACTERS[charId];` 之後新增：
```js
const charSkills = CHARACTER_SKILLS[charId];
this.charSkills = charSkills;
this.skillLevels = dataManager.data.player.skills;
```

- [ ] **Step 3: 更新技能按鈕文字**

修改 `createSkillButtons()` 方法，使用角色專屬武功名稱取代 `SKILL_NAMES[i]`：

```js
createSkillButtons() {
    const startX = 450;
    const y = 650;

    for (let i = 0; i < this.charSkills.length; i++) {
        const skill = this.charSkills[i];
        const btn = this.add.rectangle(startX + i * 90, y, 80, 50, 0x1a1a4a)
            .setStrokeStyle(2, 0xc9a227)
            .setInteractive({ useHandCursor: true });

        const label = this.add.text(startX + i * 90, y - 8, skill.name, {
            fontSize: '13px', color: '#ffffff', fontFamily: 'Microsoft JhengHei'
        }).setOrigin(0.5);

        const cost = this.add.text(startX + i * 90, y + 12, `MP: ${skill.cost}`, {
            fontSize: '10px', color: '#888888', fontFamily: 'Arial'
        }).setOrigin(0.5);

        btn.on('pointerover', () => {
            btn.setFillStyle(0x2a2a6a);
            btn.setStrokeStyle(3, 0xffd700);
        });
        btn.on('pointerout', () => {
            btn.setFillStyle(0x1a1a4a);
            btn.setStrokeStyle(2, 0xc9a227);
        });
        btn.on('pointerdown', () => this.useSkill(i));
    }
}
```

- [ ] **Step 4: 重寫 useSkill() 使用角色專屬係數**

```js
useSkill(index) {
    if (!this.battleActive || !this.playerTurn) return;

    const skill = this.charSkills[index];
    const skillLevel = this.skillLevels[index] || 0;
    const nodeEffects = dataManager.data.player.skillTree[index].nodes || [];
    const costReduction = nodeEffects[1] ? SKILL_TREE_CONFIG.nodeEffects[1].costReduction : 0;
    const mpCost = Math.floor(skill.cost * (1 - costReduction));

    if (this.playerMp < mpCost) {
        this.log('⚠️ MP不足！');
        this.flashText('MP不足！', 0xff0000);
        return;
    }

    this.playerMp -= mpCost;

    // 特殊技能：不造成傷害的輔助技能
    if (skill.mpRestore) {
        this.playerMp = Math.min(this.playerMaxMp, this.playerMp + Math.floor(this.playerMaxMp * skill.mpRestore));
        this.log(`✨ 使用 ${skill.name}，恢復 MP！`);
        this.endPlayerTurn();
        return;
    }

    if (skill.healRatio) {
        const heal = Math.floor(this.playerMaxHp * skill.healRatio);
        this.playerHp = Math.min(this.playerMaxHp, this.playerHp + heal);
        this.log(`✨ 使用 ${skill.name}，恢復 HP ${heal}！`);
        this.updatePlayerHpBar();
        this.endPlayerTurn();
        return;
    }

    if (skill.cleanse) {
        this.statuses.player = [];
        this.log(`✨ 使用 ${skill.name}，解除所有負面狀態！`);
        this.endPlayerTurn();
        return;
    }

    this.log(`✨ 使用 ${skill.name}！`);
    this.skillAnimation(index);
    this.time.delayedCall(400, () => {
        const damage = this.calculateSkillDamage(skill, skillLevel, nodeEffects);
        this.dealDamageToEnemy(damage, skill);
    });
}
```

- [ ] **Step 5: 新增 calculateSkillDamage 方法**

```js
calculateSkillDamage(skill, skillLevel, nodeEffects) {
    const str = dataManager.data.player.strength;
    const ip = dataManager.data.player.innerPower;
    const baseAtk = 10 + str * 0.5;

    let damage = baseAtk * skill.damageRatio;

    if (skill.type === 'inner') {
        damage += ip * 0.3;
    }

    const damageBonus = nodeEffects[0] ? SKILL_TREE_CONFIG.nodeEffects[0].damageBonus : 0;
    damage *= (1 + damageBonus);

    // 暴擊
    let critRate = 0.1;
    if (skill.critBonus) critRate += skill.critBonus;

    const isCrit = Math.random() < critRate;
    if (isCrit) {
        damage *= 1.5;
        this.log('💥 暴擊！');
    }

    // 自損
    if (skill.selfDamage) {
        const selfDmg = Math.floor(this.playerMaxHp * skill.selfDamage);
        this.playerHp -= selfDmg;
        this.updatePlayerHpBar();
        this.log(`⚠️ 受到 ${selfDmg} 自損傷害！`);
    }

    return Math.floor(damage);
}
```

- [ ] **Step 6: 重寫 dealDamageToEnemy 支援技能特殊效果**

```js
dealDamageToEnemy(damage, skill = null) {
    const enemyData = ENEMIES[this.enemyId];
    let defense = enemyData.defense || 0;

    if (skill && skill.ignoreDef) {
        defense = Math.floor(defense * (1 - skill.ignoreDef));
    }

    // 減防狀態
    const hasDefDown = this.statuses.enemy.some(s => s.type === 'defDown');
    if (hasDefDown) defense = Math.floor(defense * 0.7);

    const actualDamage = Math.max(1, damage - defense);
    this.enemyHp -= actualDamage;

    this.log(`${enemyData.name} 受到 ${actualDamage} 傷害！`);

    // 反彈
    if (skill && skill.reflect) {
        const reflectDmg = Math.floor(actualDamage * skill.reflect);
        this.playerHp -= reflectDmg;
        this.updatePlayerHpBar();
        this.log(`🛡️ 反彈 ${reflectDmg} 傷害！`);
    }

    // MP 吸取
    if (skill && skill.mpSteal) {
        const stolen = Math.min(skill.mpSteal, this.enemyMp || 0);
        this.playerMp = Math.min(this.playerMaxMp, this.playerMp + stolen);
        this.log(`💧 吸取 ${stolen} MP！`);
    }

    // 狀態附加
    if (skill && skill.status) {
        this.applyStatus('enemy', skill.status.type, skill.status.duration);
    }

    this.tweens.add({
        targets: this.enemyContainer,
        x: this.enemyContainer.x + 20,
        duration: 50,
        yoyo: true,
        repeat: 3
    });

    this.tweens.add({
        targets: this.enemyHpBar,
        width: Math.max(0, (this.enemyHp / this.enemyMaxHp) * 136),
        duration: 300
    });
    this.enemyHpText.setText(`${Math.max(0, this.enemyHp)}/${this.enemyMaxHp}`);

    this.createDamageNumber(this.enemyContainer.x, this.enemyContainer.y - 60, actualDamage);

    // 多段攻擊
    if (skill && skill.hits && skill.hits > 1) {
        this.log(`⚡ 連擊！第 2 段！`);
        this.time.delayedCall(300, () => {
            const secondDmg = this.calculateSkillDamage(skill, 0, []);
            this.dealDamageToEnemy(secondDmg, null);
        });
        return;
    }

    if (this.enemyHp <= 0) {
        this.endBattle(true);
    } else {
        this.endPlayerTurn();
    }
}
```

- [ ] **Step 7: 移除 endBattle 中的自動回滿**

找到 `endBattle()` 方法中的這兩行並刪除：
```js
dataManager.data.player.hp = dataManager.data.player.maxHp;
dataManager.data.player.mp = dataManager.data.player.maxMp;
```

同時在 `endBattle()` 的 defeat 分支中，戰敗時保留自動回滿（避免卡死）：
在 defeat 分支（`else { ... }` 區塊內）新增：
```js
dataManager.data.player.hp = dataManager.data.player.maxHp;
dataManager.data.player.mp = dataManager.data.player.maxMp;
```

- [ ] **Step 8: 新增 updatePlayerHpBar 輔助方法**

```js
updatePlayerHpBar() {
    this.tweens.add({
        targets: this.playerHpBar,
        width: Math.max(0, (this.playerHp / this.playerMaxHp) * 136),
        duration: 200
    });
    this.playerHpText.setText(`${Math.max(0, Math.floor(this.playerHp))}/${this.playerMaxHp}`);
    dataManager.data.player.hp = this.playerHp;
    dataManager.data.player.mp = this.playerMp;
}
```

- [ ] **Step 9: 新增 endPlayerTurn 輔助方法**

```js
endPlayerTurn() {
    dataManager.data.player.hp = this.playerHp;
    dataManager.data.player.mp = this.playerMp;
    this.playerTurn = false;
    this.tickStatuses('enemy');
    this.time.delayedCall(1000, () => this.enemyTurn());
}
```

- [ ] **Step 10: 驗證**

- 選擇不同角色進入戰鬥，技能按鈕應顯示對應的專屬武功名稱
- 使用武功消耗正確 MP、造成預期傷害
- 楊過的黯然銷魂掌應有暴擊加成
- 使用九陽神功應恢復 MP 而非造成傷害
- 戰鬥勝利後 HP/MP 維持戰鬥結束時的數值（戰敗則回滿）
- `npx vite build` 無錯誤

---

### Task 4: BattleScene — 基礎狀態系統

**Files:**
- Modify: `src/scenes/BattleScene.js`

- [ ] **Step 1: 在 create() 中初始化狀態**

在 `create()` 方法中（`createUI()` 之後）新增：
```js
this.statuses = {
    player: [],
    enemy: []
};
this.statusIcons = { player: null, enemy: null };
```

- [ ] **Step 2: 新增 applyStatus / removeStatus / tickStatuses 方法**

```js
applyStatus(target, type, duration) {
    const list = this.statuses[target];
    const existing = list.find(s => s.type === type);
    if (existing) {
        existing.duration = duration;
    } else {
        list.push({ type, duration });
    }
    const targetName = target === 'enemy' ? ENEMIES[this.enemyId].name : '你';
    this.log(`⚡ ${targetName} 中了 ${this.getStatusName(type)}！`);
    this.updateStatusDisplay(target);
}

removeStatus(target, type) {
    const list = this.statuses[target];
    const idx = list.findIndex(s => s.type === type);
    if (idx !== -1) {
        list.splice(idx, 1);
        this.updateStatusDisplay(target);
    }
}

tickStatuses(target) {
    const list = this.statuses[target];
    const targetName = target === 'enemy' ? ENEMIES[this.enemyId].name : '你';
    for (let i = list.length - 1; i >= 0; i--) {
        const status = list[i];
        if (status.type === 'bleed') {
            const dmg = Math.floor((target === 'player' ? this.playerMaxHp : this.enemyMaxHp) * 0.05);
            if (target === 'player') {
                this.playerHp -= dmg;
                this.updatePlayerHpBar();
            } else {
                this.enemyHp -= dmg;
                this.tweens.add({
                    targets: this.enemyHpBar,
                    width: Math.max(0, (this.enemyHp / this.enemyMaxHp) * 136),
                    duration: 200
                });
                this.enemyHpText.setText(`${Math.max(0, this.enemyHp)}/${this.enemyMaxHp}`);
            }
            this.log(`🩸 ${targetName} 內傷發作，損失 ${dmg} 生命！`);
            this.createDamageNumber(
                target === 'player' ? this.playerContainer.x : this.enemyContainer.x,
                (target === 'player' ? this.playerContainer.y : this.enemyContainer.y) - 60,
                dmg
            );
        }
        status.duration--;
        if (status.duration <= 0) {
            list.splice(i, 1);
            this.log(`✅ ${targetName} 的 ${this.getStatusName(status.type)} 已解除`);
        }
    }
    this.updateStatusDisplay(target);
}
```

- [ ] **Step 3: 新增 getStatusName / updateStatusDisplay 輔助方法**

```js
getStatusName(type) {
    const names = { stun: '封穴', bleed: '內傷', defDown: '減防' };
    return names[type] || type;
}

updateStatusDisplay(target) {
    const list = this.statuses[target];
    const x = target === 'player' ? 250 : 950;
    const y = target === 'player' ? 340 : 240;

    if (target === 'player' && this.statusIcons.player) {
        this.statusIcons.player.destroy();
    }
    if (target === 'enemy' && this.statusIcons.enemy) {
        this.statusIcons.enemy.destroy();
    }

    if (list.length === 0) return;

    const icons = list.map(s => {
        const symbols = { stun: '⏸', bleed: '🩸', defDown: '⬇' };
        return symbols[s.type] || '?';
    }).join(' ');

    const icon = this.add.text(x, y, icons, {
        fontSize: '20px'
    }).setOrigin(0.5);

    if (target === 'player') this.statusIcons.player = icon;
    else this.statusIcons.enemy = icon;
}
```

- [ ] **Step 4: 在 enemyTurn 之前檢查封穴狀態**

修改 `endPlayerTurn()` 方法，在 `this.playerTurn = false` 之前加入：

將 `endPlayerTurn` 內容改為：
```js
endPlayerTurn() {
    dataManager.data.player.hp = this.playerHp;
    dataManager.data.player.mp = this.playerMp;
    this.playerTurn = false;
    this.tickStatuses('enemy');
    this.checkPlayerStatus();
}

checkPlayerStatus() {
    const hasStun = this.statuses.player.some(s => s.type === 'stun');
    if (hasStun) {
        this.log('⏸ 你被封穴了！跳過回合！');
        this.removeStatus('player', 'stun');
        this.tickStatuses('player');
        this.time.delayedCall(1000, () => this.enemyTurn());
    } else {
        this.time.delayedCall(1000, () => this.enemyTurn());
    }
}
```

- [ ] **Step 5: 在 enemyTurn 之後檢查敵人死亡**

修改 `enemyTurn()` 方法結尾，在 `dealDamageToPlayer` 之後檢查敵人是否因內傷死亡：

在 `enemyTurn()` 的結尾處，`this.time.delayedCall(1000, ...)` 回調中新增：
```js
if (this.enemyHp <= 0) {
    this.endBattle(true);
    return;
}
```

讓完整的 enemyTurn 變成：
```js
enemyTurn() {
    if (!this.battleActive) return;

    const hasStun = this.statuses.enemy.some(s => s.type === 'stun');
    if (hasStun) {
        this.log(`⏸ ${ENEMIES[this.enemyId].name} 被封穴了！跳過回合！`);
        this.removeStatus('enemy', 'stun');
        this.tickStatuses('player');
        this.playerTurn = true;
        this.log('選擇你的行動！');
        return;
    }

    this.log(`${ENEMIES[this.enemyId].name} 的回合！`);

    this.tweens.add({
        targets: this.enemyContainer,
        x: this.enemyContainer.x - 40,
        duration: 200,
        yoyo: true,
        ease: 'Power2'
    });

    this.time.delayedCall(600, () => {
        const damage = ENEMIES[this.enemyId].attack;
        this.createSlashEffect(this.enemyContainer.x - 80, this.enemyContainer.y);
        this.time.delayedCall(300, () => this.dealDamageToPlayer(damage));

        if (this.battleActive) {
            this.time.delayedCall(1000, () => {
                if (this.enemyHp <= 0) {
                    this.endBattle(true);
                    return;
                }
                this.tickStatuses('player');
                this.playerTurn = true;
                this.log('選擇你的行動！');
            });
        }
    });
}
```

- [ ] **Step 6: 驗證**

- 使用帶封穴效果的技能（彈指神通、沖靈劍法）→ 敵人跳過一回合
- 使用帶內傷效果的技能（九陰真經、冰魄銀針）→ 敵人每回合結束扣血
- 使用帶減防效果的技能（聖火令武功）→ 傷害提升
- 使用易筋經解除自己身上的狀態
- `npx vite build` 無錯誤

---

### Task 5: DataManager — 技能樹狀態管理

**Files:**
- Modify: `src/systems/DataManager.js`

- [ ] **Step 1: 在 player data 中新增 skillTree 欄位**

在 constructor 和 resetPlayer 的 `skills: [0, 0, 0, 0]` 之後新增：
```js
skillTree: [
    { nodes: [false, false, false] },
    { nodes: [false, false, false] },
    { nodes: [false, false, false] },
    { nodes: [false, false, false] }
]
```

- [ ] **Step 2: 新增 upgradeSkillNode 方法**

在 `checkLevelUp()` 方法之後新增：
```js
upgradeSkillNode(skillIndex, nodeIndex) {
    const p = this.data.player;
    const tree = p.skillTree;
    const { SKILL_TREE_CONFIG } = require('../data/GameData.js');

    if (!tree[skillIndex]) return false;
    if (tree[skillIndex].nodes[nodeIndex]) return false;

    const cost = SKILL_TREE_CONFIG.nodeCosts[nodeIndex];
    if (p.skillPoints < cost) return false;

    p.skillPoints -= cost;
    tree[skillIndex].nodes[nodeIndex] = true;
    return true;
}

canUpgradeNode(skillIndex, nodeIndex) {
    const p = this.data.player;
    const tree = p.skillTree;
    const { SKILL_TREE_CONFIG } = require('../data/GameData.js');

    if (!tree[skillIndex]) return false;
    if (tree[skillIndex].nodes[nodeIndex]) return false;
    return p.skillPoints >= SKILL_TREE_CONFIG.nodeCosts[nodeIndex];
}
```

- [ ] **Step 3: 修正為 ES module import 方式（不用 require）**

將 `upgradeSkillNode` 和 `canUpgradeNode` 中的 `require` 改為在建構子中暫存 config（或直接在方法中引用）：

新增 import 在檔案頂部：
```js
import { SKILL_TREE_CONFIG } from '../data/GameData.js';
```

簡化兩個方法：
```js
upgradeSkillNode(skillIndex, nodeIndex) {
    const p = this.data.player;
    const tree = p.skillTree;

    if (!tree[skillIndex]) return false;
    if (tree[skillIndex].nodes[nodeIndex]) return false;

    const cost = SKILL_TREE_CONFIG.nodeCosts[nodeIndex];
    if (p.skillPoints < cost) return false;

    p.skillPoints -= cost;
    tree[skillIndex].nodes[nodeIndex] = true;
    return true;
}

canUpgradeNode(skillIndex, nodeIndex) {
    const p = this.data.player;
    const tree = p.skillTree;

    if (!tree[skillIndex]) return false;
    if (tree[skillIndex].nodes[nodeIndex]) return false;
    return p.skillPoints >= SKILL_TREE_CONFIG.nodeCosts[nodeIndex];
}
```

- [ ] **Step 4: 驗證**

```js
// 在瀏覽器 console 測試：
// dataManager.upgradeSkillNode(0, 0) → true（若 skillPoints >= 2）
// dataManager.canUpgradeNode(0, 0) → false（已升級不可重複）
// dataManager.data.player.skillPoints 應減少 2
```

---

### Task 6: SkillTreeScene — 技能樹 UI

**Files:**
- Create: `src/scenes/SkillTreeScene.js`
- Modify: `src/main.js`（註冊新場景）
- Modify: `src/scenes/WorldScene.js`（添加快捷鍵開啟技能樹）

- [ ] **Step 1: 在 main.js 註冊 SkillTreeScene**

```js
import SkillTreeScene from './scenes/SkillTreeScene.js';
```

在 scene 陣列中新增：
```js
SkillTreeScene,
```

- [ ] **Step 2: 在 WorldScene 中註冊快捷鍵 V 開啟技能樹**

在 `create()` 中，`this.updateHUD()` 之前新增：
```js
this.input.keyboard.on('keydown-V', () => {
    this.scene.pause();
    this.scene.launch('SkillTreeScene');
});
```

- [ ] **Step 3: 新增 skill_tree.js 提示文字**

在 WorldScene 的 HUD 附近新增技能樹快捷提示：
```js
this.add.text(1200, 20, 'V: 武功', {
    fontSize: '14px', color: '#888888', fontFamily: 'Microsoft JhengHei'
});
```

- [ ] **Step 4: 建立 SkillTreeScene.js**

```js
import Phaser from 'phaser';
import { dataManager } from '../systems/DataManager.js';
import { CHARACTERS, CHARACTER_SKILLS, SKILL_TREE_CONFIG } from '../data/GameData.js';

export default class SkillTreeScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SkillTreeScene' });
    }

    create() {
        const p = dataManager.data.player;
        const charId = p.characterId;
        const charData = CHARACTERS[charId];
        const skills = CHARACTER_SKILLS[charId];
        const tree = p.skillTree;

        this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.85);

        this.add.text(640, 40, `${charData.name} · 武功強化`, {
            fontSize: '36px', color: '#ffd700', fontFamily: 'Microsoft JhengHei'
        }).setOrigin(0.5);

        this.add.text(640, 80, `技能點：${p.skillPoints}`, {
            fontSize: '20px', color: '#00ff00', fontFamily: 'Microsoft JhengHei'
        }).setOrigin(0.5);

        const startY = 130;
        const skillH = 130;

        for (let si = 0; si < skills.length; si++) {
            const skill = skills[si];
            const y = startY + si * skillH;
            const level = p.skills[si] || 0;

            const bg = this.add.rectangle(640, y + 10, 900, 120, 0x1a1a2e, 0.8)
                .setStrokeStyle(1, 0x333366);

            this.add.text(220, y - 25, `${skill.name}`, {
                fontSize: '22px', color: '#ffffff', fontFamily: 'Microsoft JhengHei'
            }).setOrigin(0, 0.5);

            this.add.text(220, y + 5, skill.desc, {
                fontSize: '13px', color: '#aaaaaa', fontFamily: 'Microsoft JhengHei'
            }).setOrigin(0, 0.5);

            const nodeLabels = ['傷害+15%', '消耗-20%', '被動加成'];
            for (let ni = 0; ni < 3; ni++) {
                const nx = 520 + ni * 120;
                const isUnlocked = tree[si] && tree[si].nodes[ni];
                const canAfford = p.skillPoints >= SKILL_TREE_CONFIG.nodeCosts[ni];

                const nodeBg = this.add.rectangle(nx, y + 10, 100, 30, isUnlocked ? 0x006600 : 0x333333)
                    .setStrokeStyle(1, isUnlocked ? 0x00ff00 : 0x666666);

                if (isUnlocked) {
                    this.add.text(nx, y + 10, `✔ ${nodeLabels[ni]}`, {
                        fontSize: '12px', color: '#00ff00', fontFamily: 'Microsoft JhengHei'
                    }).setOrigin(0.5);
                } else if (canAfford) {
                    const costText = this.add.text(nx, y + 10, `${nodeLabels[ni]} (${SKILL_TREE_CONFIG.nodeCosts[ni]}P)`, {
                        fontSize: '12px', color: '#ffd700', fontFamily: 'Microsoft JhengHei'
                    }).setOrigin(0.5);

                    nodeBg.setInteractive({ useHandCursor: true });
                    nodeBg.on('pointerover', () => nodeBg.setFillStyle(0x444466));
                    nodeBg.on('pointerout', () => nodeBg.setFillStyle(0x333333));
                    nodeBg.on('pointerdown', () => {
                        if (dataManager.upgradeSkillNode(si, ni)) {
                            this.scene.restart();
                        }
                    });
                } else {
                    this.add.text(nx, y + 10, `${nodeLabels[ni]} (${SKILL_TREE_CONFIG.nodeCosts[ni]}P)`, {
                        fontSize: '12px', color: '#555555', fontFamily: 'Microsoft JhengHei'
                    }).setOrigin(0.5);
                }
            }

            // 被動加成說明
            if (tree[si] && tree[si].nodes[2]) {
                const passive = SKILL_TREE_CONFIG.passives[charId];
                this.add.text(900, y + 10, `被動: ${passive.desc}`, {
                    fontSize: '12px', color: '#88ff88', fontFamily: 'Microsoft JhengHei'
                }).setOrigin(0, 0.5);
            }
        }

        const closeBtn = this.add.text(640, 680, '按 ESC 或 V 關閉', {
            fontSize: '20px', color: '#888888', fontFamily: 'Microsoft JhengHei'
        }).setOrigin(0.5);

        this.input.keyboard.on('keydown-ESC', () => this.close());
        this.input.keyboard.on('keydown-V', () => this.close());
    }

    close() {
        this.scene.resume('WorldScene');
        this.scene.stop();
    }
}
```

- [ ] **Step 5: 驗證**

- 按下 V 鍵開啟技能樹面板
- 確認 4 個武功皆有顯示，節點狀態正確
- 花費技能點升級節點，面板即時刷新
- 點滿 3 節點後顯示被動加成說明
- 按下 ESC 或 V 關閉面板返回世界
- `npx vite build` 無錯誤

---

### Task 7: CharacterSelectScene — 顯示角色專屬武功

**Files:**
- Modify: `src/scenes/CharacterSelectScene.js`

- [ ] **Step 1: 更新 import**

```js
import { CHARACTERS, CHARACTER_SKILLS } from '../data/GameData.js';
```

- [ ] **Step 2: 在角色卡片中新增武功預覽**

在每個角色卡片的 `char.desc` 文字下方新增武功列表：

找到 `chars.forEach(([id, char], i) => { ... }` 區塊，在 `char.desc` 文字之後新增：
```js
const skills = CHARACTER_SKILLS[id];
if (skills) {
    const skillText = skills.map((s, idx) => `${idx+1}.${s.name}`).join('  ');
    this.add.text(x, cy + 70, skillText, {
        fontSize: '11px', color: '#88aacc', fontFamily: 'Microsoft JhengHei',
        align: 'center'
    }).setOrigin(0.5);
}
```

- [ ] **Step 3: 驗證**

- 角色選擇畫面每個角色卡片下方顯示 4 個專屬武功名稱
- 文字不超出卡片範圍（若超出縮小字體至 10px）
- `npx vite build` 無錯誤

---

## 自檢清單

- [ ] 每項 spec 要求都有對應 task:
  - 2.1 幀率獨立遇敵 → Task 2
  - 2.2 角色專屬武功 → Task 1 + Task 3
  - 2.3 技能樹系統 → Task 1 + Task 5 + Task 6
  - 2.4 戰鬥後保留 HP/MP → Task 3 (Step 7)
  - 2.5 基礎狀態系統 → Task 4
- [ ] 無 placeholder（TBD/TODO/留空）
- [ ] 所有參考的函式名稱前後一致（upgradeSkillNode / canUpgradeNode / applyStatus / tickStatuses 等）
- [ ] 所有 import 路徑正確
- [ ] `npm run dev` 可正常啟動
- [ ] `npx vite build` 無錯誤