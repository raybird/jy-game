# 對戰體驗優化 Phase 4 實作計畫

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans.

**Goal:** Hit freeze、ATB 行動序列預覽、戰鬥轉場特效、成就系統

---

### Task 1: BattleScene — Hit freeze

- [ ] **Step 1: 新增 hitFreeze 輔助方法**

```js
hitFreeze(duration = 80) {
    this.time.timeScale = 0;
    this.time.delayedCall(duration, () => {
        this.time.timeScale = 1;
    });
}
```

- [ ] **Step 2: 在 dealDamageToEnemy 中呼叫**

在 `this.log(...傷害！)` 之後、`soundManager.play('hit')` 之後新增：
```js
const freezeDuration = (skill && skill.damageRatio > 2.5) ? 150 : (skill ? 80 : 50);
this.hitFreeze(freezeDuration);
```

- [ ] **Step 3: 在暴擊時延長 freeze**

在 `calculateSkillDamage` 的 crit 區塊中，呼叫 `this.hitFreeze(120);`

### Task 2: BattleScene — ATB 行動序列預覽

- [ ] **Step 1: 新增 turnOrder UI**

在 `createUI()` 中、ATB bars 之後新增：
```js
this.add.text(860, 75, '下一步', {
    fontSize: '14px', color: '#aaaaaa', fontFamily: 'Microsoft JhengHei'
});
this.turnPreviewText = this.add.text(860, 95, '', {
    fontSize: '12px', color: '#ffffff', fontFamily: 'Microsoft JhengHei',
    lineSpacing: 4
});
```

- [ ] **Step 2: 新增 updateTurnPreview 方法**

```js
updateTurnPreview() {
    const order = [];
    const pPct = this.playerAtb / ATB_SPEEDS_CONFIG.maxAtb;
    const ePct = this.enemyAtb / ATB_SPEEDS_CONFIG.maxAtb;

    if (this.playerTurn) {
        order.push('▶ 玩家（行動中）');
    } else if (this.enemyReady) {
        order.push('▶ ' + ENEMIES[this.enemyId].name + '（行動中）');
    } else {
        const pTime = pPct >= 1 ? 0 : ((1 - pPct) * ATB_SPEEDS_CONFIG.maxAtb) / (this.playerSpeed * ATB_SPEEDS_CONFIG.fillRate) / 60;
        const eTime = ePct >= 1 ? 0 : ((1 - ePct) * ATB_SPEEDS_CONFIG.maxAtb) / (this.enemySpeed * ATB_SPEEDS_CONFIG.fillRate) / 60;

        if (pTime <= eTime) {
            order.push('① 玩家 (' + pTime.toFixed(1) + 's)');
            order.push('② ' + ENEMIES[this.enemyId].name + ' (' + eTime.toFixed(1) + 's)');
        } else {
            order.push('① ' + ENEMIES[this.enemyId].name + ' (' + eTime.toFixed(1) + 's)');
            order.push('② 玩家 (' + pTime.toFixed(1) + 's)');
        }
    }

    this.turnPreviewText.setText(order.join('\n'));
}
```

- [ ] **Step 3: 在 update() 結尾呼叫**

在 `updateAtbBars()` 之後新增 `this.updateTurnPreview();`

### Task 3: BattleScene — 戰鬥轉場特效

- [ ] **Step 1: 進入戰鬥特效（在 create() 結尾）**

```js
this.cameras.main.flash(300, 255, 255, 255);
this.cameras.main.shake(200, 0.005);
```

頭目遭遇時加強特效：
```js
if (this.enemyTier === 'boss') {
    this.cameras.main.shake(400, 0.01);
    this.add.text(640, 200, '⚠ 頭目出現！ ⚠', {
        fontSize: '48px', color: '#ff0000', fontFamily: 'Microsoft JhengHei',
        stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5);
} else if (this.enemyTier === 'elite') {
    this.add.text(640, 200, '⚔ 精英敵人', {
        fontSize: '36px', color: '#ff8800', fontFamily: 'Microsoft JhengHei',
        stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5);
}
```

- [ ] **Step 2: 離開戰鬥特效（在 endBattle 中）**

勝利時用金色 flash：
```js
this.cameras.main.flash(500, 255, 215, 0);
```

戰敗時用紅色 flash：
```js
this.cameras.main.flash(500, 255, 0, 0);
```

放在 endBattle 的 victory/defeat 分支中。

### Task 4: GameData + DataManager — 成就系統

- [ ] **Step 1: 在 GameData.js 新增 ACHIEVEMENTS**

```js
export const ACHIEVEMENTS = {
    first_battle: { name: '初出茅廬', desc: '完成第一次戰鬥', reward: { silver: 100 } },
    veteran: { name: '百戰勇士', desc: '戰鬥 10 次', reward: { item: 'herb_potion', amount: 3 } },
    slayer: { name: '千人斬', desc: '擊敗 100 個敵人', reward: { title: '千人斬' } },
    collector: { name: '裝備收藏家', desc: '獲得 5 件不同裝備', reward: { item: 'ring', amount: 1 } },
    skill_master: { name: '技能大師', desc: '點滿一個武功的技能樹', reward: { item: 'jade_pendant', amount: 1 } }
};
```

- [ ] **Step 2: 在 DataManager 中新增成就狀態**

在 constructor 和 resetPlayer 的 `inBattle: false` 之後新增：
```js
achievements: {},
battleCount: 0,
killCount: 0,
titles: []
```

在 resetPlayer 中也加入對應欄位。

- [ ] **Step 3: 新增成就解鎖邏輯**

```js
checkAchievements() {
    const p = this.data.player;
    for (const [id, ach] of Object.entries(ACHIEVEMENTS)) {
        if (p.achievements[id]) continue;

        let unlock = false;
        if (id === 'first_battle' && p.battleCount >= 1) unlock = true;
        if (id === 'veteran' && p.battleCount >= 10) unlock = true;
        if (id === 'slayer' && p.killCount >= 100) unlock = true;
        if (id === 'collector') {
            const equipped = p.equipped;
            const count = [equipped.weapon, equipped.armor, equipped.accessory].filter(Boolean).length;
            if (count >= 3) unlock = true; // 簡化：擁有至少 3 格裝備
        }
        if (id === 'skill_master') {
            unlock = p.skillTree.some(s => s.nodes.every(Boolean));
        }

        if (unlock) {
            p.achievements[id] = true;
            if (ach.reward.silver) p.silver += ach.reward.silver;
            if (ach.reward.item) this.addItem(ach.reward.item, ach.reward.amount || 1);
            if (ach.reward.title) p.titles.push(ach.reward.title);
            console.log('🏆 解鎖成就：' + ach.name);
        }
    }
}
```

- [ ] **Step 4: 在 BattleScene endBattle 中追蹤戰鬥/擊殺**

在勝利分支中新增：
```js
dataManager.data.player.battleCount++;
dataManager.data.player.killCount++;
dataManager.checkAchievements();
```

在 defeat 分支中（只計戰鬥不計擊殺）：
```js
dataManager.data.player.battleCount++;
dataManager.checkAchievements();
```