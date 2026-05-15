# Phase C — 任務系統 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 建立 NPC 對話框架、四類任務系統（鏢局/賞金/門派/劇情）、任務追蹤面板 J 鍵

**Architecture:** QuestManager.js 管理任務邏輯，WorldScene 加入任務 NPC 與對話選單，新增 QuestPanelScene 追蹤任務進度

**Tech Stack:** Phaser 3 (JavaScript), Vite

---

### Task 1: 任務資料與 QuestManager

**Files:**
- Create: `src/systems/QuestManager.js`
- Modify: `src/data/GameData.js`

- [ ] **Step 1: 在 GameData.js 尾部新增任務樣板**

```js
export const QUEST_TEMPLATES = {
    escort_1: {
        id: 'escort_1', title: '護送鏢物', type: 'escort',
        desc: '將鏢物從襄陽城護送到光明頂',
        objectives: [{ type: 'escort', target: 'guangming', label: '抵達光明頂', current: 0, count: 1 }],
        rewards: { silver: 500, fame: 15, studyPoints: 30 },
    },
    bounty_1: {
        id: 'bounty_1', title: '賞金獵人：全真弟子', type: 'bounty',
        desc: '擊敗 5 名全真弟子',
        objectives: [{ type: 'kill', target: 'quanzhen_disciple', label: '擊敗全真弟子', current: 0, count: 5 }],
        rewards: { silver: 300, studyPoints: 40 },
    },
    bounty_2: {
        id: 'bounty_2', title: '賞金獵人：明教教徒', type: 'bounty',
        desc: '擊敗 3 名明教教徒',
        objectives: [{ type: 'kill', target: 'mingjiao_member', label: '擊敗明教教徒', current: 0, count: 3 }],
        rewards: { silver: 400, studyPoints: 50 },
    },
    sect_1: {
        id: 'sect_1', title: '門派巡邏', type: 'sect',
        desc: '清除門派周邊的敵人',
        objectives: [{ type: 'kill', target: 'any', label: '擊敗任意敵人', current: 0, count: 3 }],
        rewards: { sectRep: 100, studyPoints: 20 },
    },
    sect_2: {
        id: 'sect_2', title: '收集草藥', type: 'sect',
        desc: '收集 5 株草藥',
        objectives: [{ type: 'collect', target: 'herb', label: '收集草藥', current: 0, count: 5 }],
        rewards: { sectRep: 80, silver: 100 },
    },
};
```

- [ ] **Step 2: 建立 QuestManager.js**

```js
import { dataManager } from './DataManager.js';
import { QUEST_TEMPLATES, ITEMS } from '../data/GameData.js';
import { soundManager } from './SoundManager.js';

class QuestManager {
    constructor() {
        this.activeQuests = [];
        this.completedQuests = [];
    }

    startQuest(templateId) {
        const template = QUEST_TEMPLATES[templateId];
        if (!template) return { ok: false, reason: '任務不存在' };
        if (this.activeQuests.length >= 5) return { ok: false, reason: '最多接 5 個任務' };
        if (this.activeQuests.find(q => q.id === templateId)) return { ok: false, reason: '已接此任務' };
        if (this.completedQuests.includes(templateId)) return { ok: false, reason: '已完成此任務' };

        const quest = JSON.parse(JSON.stringify(template));
        this.activeQuests.push(quest);
        return { ok: true, title: quest.title };
    }

    onKill(enemyId) {
        this.activeQuests.forEach(q => {
            q.objectives.forEach(obj => {
                if (obj.type === 'kill' && (obj.target === 'any' || obj.target === enemyId)) {
                    if (obj.current < obj.count) obj.current++;
                }
            });
        });
    }

    onCollect(itemId) {
        this.activeQuests.forEach(q => {
            q.objectives.forEach(obj => {
                if (obj.type === 'collect' && obj.target === itemId) {
                    if (obj.current < obj.count) {
                        const owned = dataManager.getItemCount(itemId);
                        obj.current = Math.min(owned, obj.count);
                    }
                }
            });
        });
    }

    onArriveMap(mapKey) {
        this.activeQuests.forEach(q => {
            q.objectives.forEach(obj => {
                if (obj.type === 'escort' && obj.target === mapKey) {
                    obj.current = 1;
                }
            });
        });
    }

    checkCompletion() {
        const completed = [];
        this.activeQuests.forEach(q => {
            if (this.isComplete(q)) completed.push(q);
        });
        completed.forEach(q => {
            this.completeQuest(q);
        });
    }

    isComplete(quest) {
        return quest.objectives.every(obj => obj.current >= obj.count);
    }

    completeQuest(quest) {
        this.activeQuests = this.activeQuests.filter(q => q.id !== quest.id);
        this.completedQuests.push(quest.id);

        const r = quest.rewards;
        if (r.silver) dataManager.addSilver(r.silver);
        if (r.studyPoints) dataManager.addStudyPoints(r.studyPoints);
        if (r.fame) dataManager.addFame(r.fame);
        if (r.karma) dataManager.addKarma(r.karma);
        if (r.sectRep) {
            dataManager.data.player.sectReputation = (dataManager.data.player.sectReputation || 0) + r.sectRep;
        }

        soundManager.play('levelup');
        return { ok: true, title: quest.title, rewards: r };
    }

    getActiveQuests() {
        return this.activeQuests;
    }

    abandonQuest(questId) {
        this.activeQuests = this.activeQuests.filter(q => q.id !== questId);
    }
}

export const questManager = new QuestManager();
```

- [ ] **Step 3: 確認無錯誤**

Run: `npm run build`
Expected: build 成功

- [ ] **Step 4: Commit**

```bash
git add src/systems/QuestManager.js src/data/GameData.js
git commit -m "feat(phase-c): add QuestManager and quest templates"
```

---

### Task 2: WorldScene 任務 NPC 與對話框

**Files:**
- Modify: `src/scenes/WorldScene.js`

- [ ] **Step 1: 新增 import**

```js
import { questManager } from '../systems/QuestManager.js';
import { QUEST_TEMPLATES } from '../data/GameData.js';
```

- [ ] **Step 2: 在 setupNPCs 後新增任務 NPC**

在 `setupSectNPCs()` 前面加入（襄陽城地圖）：

```js
this.setupQuestNPCs();
```

- [ ] **Step 3: 新增 setupQuestNPCs 方法**

```js
setupQuestNPCs() {
    if (this.currentMap !== 'xianyang') return;

    const npcs = [
        { id: 'escort', x: 500, y: 150, name: '鏢局', color: 0xdaa520, icon: '🛡' },
        { id: 'bounty', x: 380, y: 550, name: '告示板', color: 0x8b4513, icon: '📋' },
    ];

    npcs.forEach(npc => {
        const container = this.add.container(npc.x, npc.y);
        const shadow = this.add.ellipse(0, 35, 50, 20, 0x000000, 0.3);
        const body = this.add.rectangle(0, 10, 40, 50, npc.color);
        const head = this.add.circle(0, -20, 18, 0xffdbac);
        const label = this.add.text(0, -55, npc.name, {
            fontSize: '14px', color: '#ffd700', fontFamily: 'serif',
            stroke: '#000', strokeThickness: 2
        }).setOrigin(0.5);
        const icon = this.add.text(0, 10, npc.icon, { fontSize: '24px' }).setOrigin(0.5);
        const interactHint = this.add.text(0, 60, '點擊互動', {
            fontSize: '12px', color: '#c9a227', fontFamily: 'serif'
        }).setOrigin(0.5).setAlpha(0);

        container.add([shadow, body, head, icon, label, interactHint]);

        const hitbox = this.add.rectangle(npc.x, npc.y, 60, 80, 0xffffff, 0)
            .setInteractive({ useHandCursor: true });
        hitbox.setData('npcId', 'quest_' + npc.id);
        hitbox.setData('container', container);
        hitbox.setData('hint', interactHint);

        hitbox.on('pointerover', () => {
            this.tweens.add({ targets: interactHint, alpha: 1, duration: 200 });
            container.setScale(1.05);
        });
        hitbox.on('pointerout', () => {
            this.tweens.add({ targets: interactHint, alpha: 0, duration: 200 });
            container.setScale(1);
        });
        hitbox.on('pointerdown', () => this.interactWithQuestNPC(npc.id));
    });
}
```

- [ ] **Step 4: 新增 interactWithQuestNPC 方法**

```js
interactWithQuestNPC(npcId) {
    const overlay = this.add.rectangle(0, 0, 1280, 720, 0x000000, 0.7).setInteractive();
    const panel = this.add.rectangle(640, 360, 500, 420, 0x1a1a2e).setStrokeStyle(3, 0xc9a227);
    const elements = [overlay, panel];

    let iy = 120;
    const titles = { escort: '🛡 鏢局護送', bounty: '📋 賞金任務' };
    const title = this.add.text(640, iy, titles[npcId] || '任務', {
        fontSize: '26px', fill: '#ffd700', fontFamily: 'serif'
    }).setOrigin(0.5);
    elements.push(title);
    iy += 45;

    const quests = {
        escort: [{ id: 'escort_1', name: '護送鏢物 → 光明頂', desc: '鏢局委託，將鏢物送至光明頂' }],
        bounty: [
            { id: 'bounty_1', name: '擊敗全真弟子 ×5', desc: '賞金：消除全真弟子的威脅' },
            { id: 'bounty_2', name: '擊敗明教教徒 ×3', desc: '賞金：消除明教教徒的威脅' },
        ],
    };

    const npcQuests = quests[npcId] || [];
    npcQuests.forEach(q => {
        const row = this.add.text(640, iy, `${q.name}`, {
            fontSize: '16px', fill: '#fff', fontFamily: 'serif',
            backgroundColor: '#2a2a4a', padding: { x: 8, y: 4 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        row.on('pointerdown', () => {
            const result = questManager.startQuest(q.id);
            if (result.ok) {
                row.setColor('#88ff88');
                row.setText(`${q.name} ✅`);
            } else {
                row.setColor('#ff6666');
                this.time.delayedCall(2000, () => {
                    row.setColor('#fff');
                    row.setText(`${q.name}`);
                });
            }
        });
        elements.push(row);
        iy += 32;
    });

    iy += 30;
    const closeBtn = this.add.rectangle(640, iy + 20, 100, 36, 0x8b0000)
        .setStrokeStyle(2, 0xff4444).setInteractive({ useHandCursor: true });
    const closeLabel = this.add.text(640, iy + 20, '關閉', {
        fontSize: '16px', fill: '#fff', fontFamily: 'serif'
    }).setOrigin(0.5);
    elements.push(closeBtn, closeLabel);
    closeBtn.on('pointerdown', () => this.closePanel(elements));
}
```

- [ ] **Step 5: 確認無錯誤**

Run: `npm run build`
Expected: build 成功

- [ ] **Step 6: Commit**

```bash
git add src/scenes/WorldScene.js
git commit -m "feat(phase-c): add quest NPCs and dialogue in WorldScene"
```

---

### Task 3: 任務觸發（戰鬥擊殺、地圖切換）

**Files:**
- Modify: `src/scenes/BattleScene.js`
- Modify: `src/scenes/WorldScene.js`

- [ ] **Step 1: BattleScene 擊殺回報**

在 BattleScene.js 的 endBattle 勝利路徑中加入：

```js
import { questManager } from '../systems/QuestManager.js';

// 在 endBattle() 勝利部分，grantLoot() 之前：
questManager.onKill(this.enemyId);
questManager.checkCompletion();
```

- [ ] **Step 2: WorldScene 地圖抵達回報**

在 WorldScene.js 的 `create()` 中（`dataManager.data.currentMap = this.currentMap;` 之後）：

```js
questManager.onArriveMap(this.currentMap);
questManager.checkCompletion();
```

- [ ] **Step 3: 確認無錯誤**

Run: `npm run build`
Expected: build 成功

- [ ] **Step 4: Commit**

```bash
git add src/scenes/BattleScene.js src/scenes/WorldScene.js
git commit -m "feat(phase-c): connect quest triggers (kill, arrive map) to QuestManager"
```

---

### Task 4: 任務追蹤面板 (J 鍵)

**Files:**
- Create: `src/scenes/QuestPanelScene.js`
- Modify: `src/main.js`
- Modify: `src/scenes/WorldScene.js`

- [ ] **Step 1: 建立 QuestPanelScene.js**

```js
import Phaser from 'phaser';
import { questManager } from '../systems/QuestManager.js';

export class QuestPanelScene extends Phaser.Scene {
    constructor() {
        super('QuestPanelScene');
    }

    create() {
        this.cameras.main.setBackgroundColor('#000000');
        const cx = 400;
        let iy = 40;
        const quests = questManager.getActiveQuests();

        this.add.text(cx, iy, '任務追蹤', {
            fontSize: '26px', fill: '#ffd700', fontFamily: 'serif'
        }).setOrigin(0.5);
        iy += 40;

        if (quests.length === 0) {
            this.add.text(cx, iy, '沒有進行中的任務', {
                fontSize: '18px', fill: '#666', fontFamily: 'serif'
            }).setOrigin(0.5);
            iy += 40;
        } else {
            quests.forEach(q => {
                this.add.text(cx, iy, `【${this.getTypeLabel(q.type)}】${q.title}`, {
                    fontSize: '18px', fill: '#ffd700', fontFamily: 'serif'
                }).setOrigin(0.5);
                iy += 28;

                q.objectives.forEach(obj => {
                    const pct = Math.min(100, Math.floor((obj.current / obj.count) * 100));
                    const done = obj.current >= obj.count;
                    const line = `  ${done ? '✅' : '▫'} ${obj.label}: ${obj.current}/${obj.count}`;
                    this.add.text(cx, iy, line, {
                        fontSize: '15px', fill: done ? '#88ff88' : '#fff', fontFamily: 'serif'
                    }).setOrigin(0.5);
                    iy += 24;
                });

                const abandonBtn = this.add.text(cx + 160, iy - 24 * q.objectives.length + 12, '[放棄]', {
                    fontSize: '13px', fill: '#ff6666', fontFamily: 'serif',
                    backgroundColor: '#333', padding: { x: 4, y: 2 }
                }).setOrigin(0.5).setInteractive({ useHandCursor: true });
                abandonBtn.on('pointerdown', () => {
                    questManager.abandonQuest(q.id);
                    this.scene.restart();
                });

                iy += 10;
            });
        }

        iy += 30;
        const closeBtn = this.add.text(cx, iy, '[ 關閉 (J) ]', {
            fontSize: '18px', fill: '#ff6666', fontFamily: 'serif',
            backgroundColor: '#333', padding: { x: 12, y: 6 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        closeBtn.on('pointerdown', () => this.close());
        this.input.keyboard.on('keydown-J', () => this.close());
    }

    getTypeLabel(type) {
        return { escort: '鏢局', bounty: '賞金', sect: '門派', story: '劇情' }[type] || type;
    }

    close() {
        this.scene.resume('WorldScene');
        this.scene.stop();
    }
}
```

- [ ] **Step 2: 在 main.js 註冊場景**

```js
import { QuestPanelScene } from './scenes/QuestPanelScene.js';

// scene 陣列中加入 QuestPanelScene:
scene: [BootScene, MenuScene, CharacterSelectScene, WorldScene, BattleScene, SkillTreeScene, PlayerInfoScene, QuestPanelScene],
```

- [ ] **Step 3: 在 WorldScene 綁定 J 鍵**

在 `create()` 中的 C 鍵綁定後：

```js
this.input.keyboard.on('keydown-J', () => {
    this.scene.pause();
    this.scene.launch('QuestPanelScene');
});
```

- [ ] **Step 4: 確認無錯誤**

Run: `npm run build`
Expected: build 成功

- [ ] **Step 5: Commit**

```bash
git add src/scenes/QuestPanelScene.js src/main.js src/scenes/WorldScene.js
git commit -m "feat(phase-c): add quest tracking panel (J key)"
```