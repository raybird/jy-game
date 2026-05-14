# Phase A — 江湖歷練核心 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 建立五圍屬性、實戰/學點、名聲/善惡、角色面板 UI 等江湖歷練核心系統

**Architecture:** 在現有 DataManager.js 基礎上擴充 player 資料結構，新增五圍運算邏輯，新增角色面板場景。戰鬥結算時增加學點與名聲獎勵。

**Tech Stack:** Phaser 3 (JavaScript), Vite

---

### Task 1: 擴充 player 資料結構 (GameData.js)

**Files:**
- Modify: `src/data/GameData.js`
- Modify: `src/systems/DataManager.js`

- [ ] **Step 1: 在 GameData.js 加入五圍設定與初始玩家樣板**

在 `src/data/GameData.js` 尾部新增：

```js
export const ATTRIBUTE_CONFIG = {
    str: { label: '臂力', short: 'STR', default: 10, min: 5, max: 15, desc: '影響物理攻擊力' },
    bra: { label: '膽識', short: 'BRA', default: 10, min: 5, max: 15, desc: '影響暴擊率' },
    wis: { label: '悟性', short: 'WIS', default: 10, min: 5, max: 15, desc: '影響學點消耗' },
    luk: { label: '福緣', short: 'LUK', default: 10, min: 5, max: 15, desc: '影響稀有掉落' },
    con: { label: '定力', short: 'CON', default: 10, min: 5, max: 15, desc: '影響防禦與抗性' },
};

export const INITIAL_PLAYER = {
    name: '少俠',
    level: 1,
    attributes: { str: 10, bra: 10, wis: 10, luk: 10, con: 10 },
    attributePoints: 50,
    hp: 100,
    maxHp: 100,
    mp: 50,
    maxMp: 50,
    combatExp: 0,
    studyPoints: 0,
    fame: 0,
    karma: 0,
    sect: null,
    sectReputation: 0,
    martialArts: [],
    equippedSkills: [null, null, null, null],
    inventory: [],
    equipped: { weapon: null, armor: null, accessory: null },
    silver: 1000,
    currentMap: 'xianyang',
};
```

- [ ] **Step 2: 更新 DataManager.js 初始化邏輯**

在 `src/systems/DataManager.js` 中：

找到 `constructor` 或 `init` 方法中的 player 初始化，替換為使用 `INITIAL_PLAYER`：

```js
import { INITIAL_PLAYER, ATTRIBUTE_CONFIG } from '../data/GameData.js';

// 在建構式或 init 方法中：
this.player = JSON.parse(JSON.stringify(INITIAL_PLAYER));
```

- [ ] **Step 3: 加入屬性公式輔助方法**

在 DataManager.js 中加入：

```js
getLevelExpRequirement() {
    return this.player.level * 200;
}

addCombatExp(amount) {
    this.player.combatExp += amount;
    const required = this.getLevelExpRequirement();
    while (this.player.combatExp >= required) {
        this.player.combatExp -= required;
        this.player.level += 1;
        this.player.maxHp += 20;
        this.player.hp = this.player.maxHp;
        this.player.maxMp += 10;
        this.player.mp = this.player.maxMp;
    }
}

addStudyPoints(amount) {
    this.player.studyPoints += Math.floor(amount);
}

addFame(amount) {
    this.player.fame = Math.max(0, this.player.fame + amount);
}

addKarma(amount) {
    this.player.karma = Math.max(-1000, Math.min(1000, this.player.karma + amount));
}

getKarmaTitle() {
    const k = this.player.karma;
    if (k >= 500) return '大俠';
    if (k >= 200) return '俠士';
    if (k > -200) return '中立';
    if (k > -500) return '惡徒';
    return '魔頭';
}
```

- [ ] **Step 4: 確認無錯誤**

Run: `npm run build` 或 `npx vite build`
Expected: build 成功

- [ ] **Step 5: Commit**

```bash
git add src/data/GameData.js src/systems/DataManager.js
git commit -m "feat(phase-a): add attribute config and expanded player data structure"
```

---

### Task 2: 戰鬥結算加入學點與名聲獎勵

**Files:**
- Modify: `src/scenes/BattleScene.js`

- [ ] **Step 1: 在戰鬥勝利邏輯中加入獎勵計算**

找到 BattleScene.js 中戰鬥勝利的處理處（應在擊敗所有敵人後的 `handleVictory` 或類似方法），新增：

```js
handleVictory() {
    const dataManager = this.dataManager || this.registry.get('dataManager');
    let totalExp = 0;
    let totalStudyPoints = 0;
    let totalFame = 0;

    this.enemies.forEach(enemy => {
        const expReward = enemy.expReward || 30;
        totalExp += expReward;
        totalStudyPoints += Math.floor(expReward * 0.5);
        if (enemy.isBoss) totalFame += 30;
        else if (enemy.isElite) totalFame += 10;
        else totalFame += 2;
    });

    dataManager.addCombatExp(totalExp);
    dataManager.addStudyPoints(totalStudyPoints);
    dataManager.addFame(totalFame);
    dataManager.addKarma(2);

    dataManager.save();

    // 顯示獎勵文字
    this.showBattleRewards({ exp: totalExp, studyPoints: totalStudyPoints, fame: totalFame });

    // 原 victory 動畫 / 跳轉邏輯
    // ...
}

showBattleRewards(rewards) {
    const text = `實戰 +${rewards.exp}  學點 +${rewards.studyPoints}  名聲 +${rewards.fame}`;
    // 使用 Phaser Text 在畫面中央顯示，2 秒後淡出
    const rewardText = this.add.text(400, 300, text, {
        fontSize: '22px', fill: '#ffd700', fontFamily: 'serif',
        stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5).setDepth(100);
    this.tweens.add({
        targets: rewardText, alpha: 0, y: 260, duration: 2000, ease: 'Power2',
        onComplete: () => rewardText.destroy()
    });
}
```

- [ ] **Step 2: 確認無錯誤**

Run: `npm run build`
Expected: build 成功

- [ ] **Step 3: Commit**

```bash
git add src/scenes/BattleScene.js
git commit -m "feat(phase-a): add combat exp, study points, and fame rewards on victory"
```

---

### Task 3: 角色屬性面板 UI (C 鍵開啟)

**Files:**
- Create: `src/scenes/PlayerInfoScene.js`
- Modify: `src/main.js` (註冊場景)
- Modify: `src/scenes/WorldScene.js` (按鍵綁定)

- [ ] **Step 1: 建立 PlayerInfoScene.js**

```js
import Phaser from 'phaser';
import { DataManager } from '../systems/DataManager.js';

export class PlayerInfoScene extends Phaser.Scene {
    constructor() {
        super('PlayerInfoScene');
    }

    create() {
        this.cameras.main.setBackgroundColor('#000000');
        this.dataManager = this.registry.get('dataManager');
        const p = this.dataManager.player;

        const cx = 400;
        let iy = 40;

        // 標題
        this.add.text(cx, iy, '角色資訊', { fontSize: '28px', fill: '#ffd700', fontFamily: 'serif' }).setOrigin(0.5);
        iy += 50;

        // 基本資訊
        const info = [
            `名稱：${p.name}`,
            `等級：${p.level} (Lv)`,
            `HP：${p.hp} / ${p.maxHp}`,
            `MP：${p.mp} / ${p.maxMp}`,
            `實戰經驗：${p.combatExp} / ${this.dataManager.getLevelExpRequirement()}`,
            `學點：${p.studyPoints}`,
        ];
        info.forEach(line => {
            this.add.text(cx, iy, line, { fontSize: '18px', fill: '#ffffff', fontFamily: 'serif' }).setOrigin(0.5);
            iy += 30;
        });

        iy += 20;

        // 江湖歷練
        const karmaTitle = this.dataManager.getKarmaTitle();
        const statusLines = [
            `名聲：${p.fame}`,
            `善惡：${p.karma} （${karmaTitle}）`,
        ];
        statusLines.forEach(line => {
            this.add.text(cx, iy, line, { fontSize: '18px', fill: '#ffffff', fontFamily: 'serif' }).setOrigin(0.5);
            iy += 30;
        });

        iy += 20;

        // 門派
        const sectName = p.sect || '無門派';
        const sectLine = `門派：${sectName}${p.sect ? `  聲望：${p.sectReputation}` : ''}`;
        this.add.text(cx, iy, sectLine, { fontSize: '18px', fill: '#ffffff', fontFamily: 'serif' }).setOrigin(0.5);
        iy += 30;

        // 裝備
        const weapon = p.equipped.weapon ? p.equipped.weapon.name : '無';
        const armor = p.equipped.armor ? p.equipped.armor.name : '無';
        const accessory = p.equipped.accessory ? p.equipped.accessory.name : '無';

        iy += 20;
        const equipLines = [
            `武器：${weapon}`,
            `護甲：${armor}`,
            `飾品：${accessory}`,
        ];
        equipLines.forEach(line => {
            this.add.text(cx, iy, line, { fontSize: '18px', fill: '#00ccff', fontFamily: 'serif' }).setOrigin(0.5);
            iy += 30;
        });

        iy += 20;

        // 五圍
        this.add.text(cx, iy, '--- 五圍屬性 ---', { fontSize: '20px', fill: '#ffd700', fontFamily: 'serif' }).setOrigin(0.5);
        iy += 30;
        const attrMap = {
            str: '臂力 STR', bra: '膽識 BRA', wis: '悟性 WIS', luk: '福緣 LUK', con: '定力 CON'
        };
        Object.entries(attrMap).forEach(([key, label]) => {
            this.add.text(cx, iy, `${label}：${p.attributes[key]}`, { fontSize: '18px', fill: '#ffffff', fontFamily: 'serif' }).setOrigin(0.5);
            iy += 30;
        });

        iy += 40;

        // 關閉按鈕
        const closeBtn = this.add.text(cx, iy, '[ 關閉 (C) ]', {
            fontSize: '20px', fill: '#ff6666', fontFamily: 'serif', backgroundColor: '#333', padding: { x: 16, y: 8 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        closeBtn.on('pointerdown', () => this.closePanel());

        this.input.keyboard.on('keydown-C', () => this.closePanel());
    }

    closePanel() {
        this.scene.resume('WorldScene');
        this.scene.stop();
    }
}
```

- [ ] **Step 2: 在 main.js 註冊場景**

在 `src/main.js` 的 scene 列表中新增 `PlayerInfoScene`：

```js
import { PlayerInfoScene } from './scenes/PlayerInfoScene.js';

// 在 game config 的 scene 陣列中：
scene: [/* 既有場景 */, PlayerInfoScene],
```

- [ ] **Step 3: 在 WorldScene 中綁定 C 鍵**

在 `src/scenes/WorldScene.js` 的 `create` 方法中新增：

```js
this.input.keyboard.on('keydown-C', () => {
    this.scene.pause();
    this.scene.launch('PlayerInfoScene');
});
```

- [ ] **Step 4: 確認無錯誤**

Run: `npm run build`
Expected: build 成功

- [ ] **Step 5: Commit**

```bash
git add src/scenes/PlayerInfoScene.js src/main.js src/scenes/WorldScene.js
git commit -m "feat(phase-a): add player info panel (C key)"
```

---

### Task 4: 創角配點介面 (取代角色選擇)

**Files:**
- Modify: `src/scenes/CharacterSelectScene.js`
- Modify: `src/main.js`

- [ ] **Step 1: 重構 CharacterSelectScene 為配點介面**

將 `src/scenes/CharacterSelectScene.js` 完全替換為：

```js
import Phaser from 'phaser';
import { INITIAL_PLAYER, ATTRIBUTE_CONFIG } from '../data/GameData.js';

export class CharacterSelectScene extends Phaser.Scene {
    constructor() {
        super('CharacterSelectScene');
    }

    create() {
        this.cameras.main.setBackgroundColor('#1a1a2e');
        const p = JSON.parse(JSON.stringify(INITIAL_PLAYER));
        this.playerData = p;
        this.remainingPoints = 50;

        const cx = 400;
        let iy = 40;

        this.add.text(cx, iy, '創建角色', { fontSize: '32px', fill: '#ffd700', fontFamily: 'serif' }).setOrigin(0.5);
        iy += 60;

        // 名稱輸入
        this.add.text(cx - 150, iy, '角色名稱：', { fontSize: '20px', fill: '#fff', fontFamily: 'serif' });
        const nameText = this.add.text(cx + 20, iy, '少俠', { fontSize: '20px', fill: '#00ff88', fontFamily: 'serif' }).setOrigin(0, 0.5);
        iy += 40;

        // 剩餘點數
        this.pointsText = this.add.text(cx, iy, `剩餘點數：${this.remainingPoints}`, {
            fontSize: '22px', fill: '#ffd700', fontFamily: 'serif'
        }).setOrigin(0.5);
        iy += 50;

        // 五圍調整區
        this.attrTexts = {};
        const keys = ['str', 'bra', 'wis', 'luk', 'con'];
        keys.forEach(key => {
            const cfg = ATTRIBUTE_CONFIG[key];
            this.add.text(cx - 200, iy, `${cfg.label} (${cfg.short})`, { fontSize: '18px', fill: '#aaa', fontFamily: 'serif' }).setOrigin(0, 0.5);
            const minusBtn = this.add.text(cx + 50, iy, '◀', { fontSize: '22px', fill: '#ff6666', fontFamily: 'serif' })
                .setOrigin(0.5).setInteractive({ useHandCursor: true });
            const valText = this.add.text(cx + 90, iy, `${p.attributes[key]}`, {
                fontSize: '22px', fill: '#fff', fontFamily: 'serif'
            }).setOrigin(0.5);
            const plusBtn = this.add.text(cx + 130, iy, '▶', { fontSize: '22px', fill: '#66ff66', fontFamily: 'serif' })
                .setOrigin(0.5).setInteractive({ useHandCursor: true });
            this.attrTexts[key] = valText;

            minusBtn.on('pointerdown', () => {
                if (p.attributes[key] > cfg.min) {
                    p.attributes[key] -= 1;
                    this.remainingPoints += 1;
                    this.updateDisplay();
                }
            });
            plusBtn.on('pointerdown', () => {
                if (p.attributes[key] < cfg.max && this.remainingPoints > 0) {
                    p.attributes[key] += 1;
                    this.remainingPoints -= 1;
                    this.updateDisplay();
                }
            });

            iy += 40;
        });

        iy += 30;

        // 確認創建
        const confirmBtn = this.add.text(cx, iy, '[ 踏入江湖 ]', {
            fontSize: '24px', fill: '#ffd700', fontFamily: 'serif',
            backgroundColor: '#444', padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        confirmBtn.on('pointerdown', () => {
            const dataManager = this.registry.get('dataManager');
            p.name = nameText.text;
            Object.assign(dataManager.player, JSON.parse(JSON.stringify(p)));
            dataManager.save();
            this.scene.start('WorldScene');
        });
    }

    updateDisplay() {
        this.pointsText.setText(`剩餘點數：${this.remainingPoints}`);
        Object.entries(this.attrTexts).forEach(([key, text]) => {
            text.setText(`${this.playerData.attributes[key]}`);
        });
    }
}
```

- [ ] **Step 2: 確認 main.js 已正確引用**

確保 `src/main.js` 的場景列表中 `CharacterSelectScene` 仍存在（只是內容被替換）。

- [ ] **Step 3: 確認無錯誤**

Run: `npm run build`
Expected: build 成功

- [ ] **Step 4: Commit**

```bash
git add src/scenes/CharacterSelectScene.js
git commit -m "feat(phase-a): replace character select with attribute allocation UI"
```