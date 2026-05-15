# Phase D+E — 自創武功 + 聊天系統 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 建立武功融合覺醒系統（自創命名）與聊天頻道系統

**Architecture:** FusionSystem.js 處理融合邏輯，WorldScene 加入隱士高人 NPC，新增 FusionScene 融合 UI；ChatSystem.js 處理聊天邏輯，聊天 UI 內嵌於 WorldScene HUD

**Tech Stack:** Phaser 3 (JavaScript), Vite

---

### Task 1: 自創武功 — FusionSystem

**Files:**
- Create: `src/systems/FusionSystem.js`

- [ ] **Step 1: 建立檔案**

```js
import { dataManager } from './DataManager.js';
import { sectManager } from './SectManager.js';
import { soundManager } from './SoundManager.js';

class FusionSystem {
    canFuse() {
        const p = dataManager.data.player;
        const artCount = p.martialArts.length;
        if (artCount < 8) return { ok: false, reason: `需要至少 8 套武功（當前 ${artCount}）` };
        const highLevel = p.martialArts.filter(a => a.level >= 3);
        if (highLevel.length < 2) return { ok: false, reason: `需要至少 2 套 LV3+ 武功（當前 ${highLevel.length}）` };
        if (p.studyPoints < 500) return { ok: false, reason: `需要 500 學點（當前 ${p.studyPoints}）` };
        return { ok: true };
    }

    getFuseableArts() {
        return dataManager.data.player.martialArts.filter(a => a.level >= 3);
    }

    fuse(baseArtId, subArtId, customName) {
        const baseArt = dataManager.data.player.martialArts.find(a => a.id === baseArtId);
        const subArt = dataManager.data.player.martialArts.find(a => a.id === subArtId);
        if (!baseArt || !subArt) return { ok: false, reason: '武功不存在' };
        if (baseArt.level < 3 || subArt.level < 3) return { ok: false, reason: '需要 LV3+ 的武功' };

        const p = dataManager.data.player;
        if (p.studyPoints < 500) return { ok: false, reason: '學點不足' };

        const baseDef = sectManager.getArtDefinition(baseArtId);
        const subDef = sectManager.getArtDefinition(subArtId);
        if (!baseDef || !subDef) return { ok: false, reason: '武功資料缺失' };

        const newId = 'custom_' + Date.now();
        const newArt = this.generateFusedArt(baseDef, subDef, customName, newId);

        p.studyPoints -= 500;
        p.martialArts.push({ id: newId, level: 1 });

        return { ok: true, art: newArt };
    }

    generateFusedArt(base, sub, name, id) {
        const isUltimateCombo = base.tier === 'ultimate' && sub.tier === 'ultimate';
        const extraChance = isUltimateCombo ? Math.random() < 0.3 : false;

        let type, ratio, effects = {};

        if (base.type === 'outer' && sub.type === 'outer') {
            type = 'outer';
            ratio = (base.ratio || 1.0) + (sub.ratio || 1.0) * 0.7 + (extraChance ? 1.0 : 0);
        } else if (base.type === 'inner' && sub.type === 'inner') {
            type = 'inner';
            ratio = (base.ratio || 1.0) + (sub.ratio || 1.0) * 0.7 + (extraChance ? 0.8 : 0);
            effects.aoe = true;
        } else {
            type = base.type;
            ratio = (base.ratio || 1.0) + (sub.ratio || 1.0) * 0.5 + (extraChance ? 0.5 : 0);
            if (base.status) effects.status = base.status;
            if (base.ignoreDef) effects.ignoreDef = base.ignoreDef;
        }

        const tierLabel = extraChance ? '絕世' : '融合';
        const artName = name || (tierLabel + '武功');

        return {
            id, name: artName, tier: 'custom', type, mp: Math.floor((base.mp || 12) + (sub.mp || 12) * 0.5),
            ratio: Math.round(ratio * 10) / 10, desc: `${base.name} + ${sub.name} 融合而成`,
            fromBase: base.id, fromSub: sub.id, ...effects,
        };
    }
}

export const fusionSystem = new FusionSystem();
```

- [ ] **Step 2: 確認無錯誤**

Run: `npm run build`
Expected: build 成功

- [ ] **Step 3: Commit**

```bash
git add src/systems/FusionSystem.js
git commit -m "feat(phase-d): add FusionSystem for custom martial art creation"
```

---

### Task 2: 自創武功 — UI

**Files:**
- Create: `src/scenes/FusionScene.js`
- Modify: `src/main.js`
- Modify: `src/scenes/WorldScene.js`

- [ ] **Step 1: 建立 FusionScene.js**

```js
import Phaser from 'phaser';
import { dataManager } from '../systems/DataManager.js';
import { sectManager } from '../systems/SectManager.js';
import { fusionSystem } from '../systems/FusionSystem.js';

export class FusionScene extends Phaser.Scene {
    constructor() {
        super('FusionScene');
    }

    create() {
        this.cameras.main.setBackgroundColor('#000000');
        const cx = 400;
        let iy = 30;

        this.add.text(cx, iy, '自創武功 — 融會貫通', {
            fontSize: '24px', fill: '#ffd700', fontFamily: 'serif'
        }).setOrigin(0.5);
        iy += 30;

        const check = fusionSystem.canFuse();
        if (!check.ok) {
            this.add.text(cx, iy + 20, check.reason, {
                fontSize: '16px', fill: '#ff6666', fontFamily: 'serif'
            }).setOrigin(0.5);
        }

        iy += 40;

        const arts = fusionSystem.getFuseableArts();
        if (arts.length < 2) {
            this.add.text(cx, iy, '可融合武功不足', {
                fontSize: '16px', fill: '#666', fontFamily: 'serif'
            }).setOrigin(0.5);
        }

        this.selectedBase = null;
        this.selectedSub = null;
        this.customName = '';

        this.add.text(cx, iy, '--- 選擇基底武功 ---', {
            fontSize: '16px', fill: '#aaa', fontFamily: 'serif'
        }).setOrigin(0.5);
        iy += 25;

        arts.forEach(a => {
            const def = sectManager.getArtDefinition(a.id);
            if (!def) return;
            const row = this.add.text(cx, iy, `Lv.${a.level} ${def.name}`, {
                fontSize: '15px', fill: '#fff', fontFamily: 'serif',
                backgroundColor: '#2a2a4a', padding: { x: 8, y: 4 }
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });
            row.on('pointerdown', () => {
                this.selectedBase = a.id;
                if (this.baseText) this.baseText.setText(`基底: ${def.name}`);
            });
            iy += 26;
        });

        iy += 10;
        this.baseText = this.add.text(cx, iy, '基底: 未選擇', {
            fontSize: '15px', fill: '#888', fontFamily: 'serif'
        }).setOrigin(0.5);
        iy += 30;

        this.add.text(cx, iy, '--- 選擇副武功 ---', {
            fontSize: '16px', fill: '#aaa', fontFamily: 'serif'
        }).setOrigin(0.5);
        iy += 25;

        arts.forEach(a => {
            const def = sectManager.getArtDefinition(a.id);
            if (!def) return;
            const row = this.add.text(cx, iy, `Lv.${a.level} ${def.name}`, {
                fontSize: '15px', fill: '#fff', fontFamily: 'serif',
                backgroundColor: '#2a2a4a', padding: { x: 8, y: 4 }
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });
            row.on('pointerdown', () => {
                this.selectedSub = a.id;
                if (this.subText) this.subText.setText(`副: ${def.name}`);
            });
            iy += 26;
        });

        iy += 10;
        this.subText = this.add.text(cx, iy, '副: 未選擇', {
            fontSize: '15px', fill: '#888', fontFamily: 'serif'
        }).setOrigin(0.5);
        iy += 30;

        this.add.text(cx, iy, '武功名稱（點擊修改）:', {
            fontSize: '14px', fill: '#aaa', fontFamily: 'serif'
        }).setOrigin(0.5);
        iy += 20;
        this.nameText = this.add.text(cx, iy, '融合武功', {
            fontSize: '20px', fill: '#ffd700', fontFamily: 'serif',
            backgroundColor: '#333', padding: { x: 12, y: 6 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        this.nameText.on('pointerdown', () => {
            this.customName = prompt('輸入自創武功名稱 (最多 8 字):', this.customName) || this.customName;
            if (this.customName) {
                this.nameText.setText(this.customName.slice(0, 8));
            }
        });

        iy += 40;

        const fuseBtn = this.add.text(cx, iy, '[ 融合覺醒 ]', {
            fontSize: '22px', fill: '#ffd700', fontFamily: 'serif',
            backgroundColor: '#444', padding: { x: 16, y: 8 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        fuseBtn.on('pointerdown', () => {
            if (!this.selectedBase || !this.selectedSub) return;
            if (this.selectedBase === this.selectedSub) return;
            const result = fusionSystem.fuse(this.selectedBase, this.selectedSub, this.customName);
            if (result.ok) {
                this.scene.restart();
            }
        });

        iy += 50;
        const closeBtn = this.add.text(cx, iy, '[ 關閉 ]', {
            fontSize: '16px', fill: '#ff6666', fontFamily: 'serif',
            backgroundColor: '#333', padding: { x: 12, y: 6 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        closeBtn.on('pointerdown', () => {
            this.scene.resume('WorldScene');
            this.scene.stop();
        });
    }
}
```

- [ ] **Step 2: 加入隱士高人 NPC (WorldScene)**

在 `setupSectNPCs()` 之後新增 `setupFusionNPC()` call，然後加方法：

```js
this.setupFusionNPC();

// ...

setupFusionNPC() {
    const x = 150, y = 600;
    const container = this.add.container(x, y);
    const shadow = this.add.ellipse(0, 35, 50, 20, 0x000000, 0.3);
    const body = this.add.rectangle(0, 10, 40, 50, 0x9370db);
    const head = this.add.circle(0, -20, 18, 0xffdbac);
    const label = this.add.text(0, -55, '隱士高人', {
        fontSize: '14px', color: '#9370db', fontFamily: 'serif', stroke: '#000', strokeThickness: 2
    }).setOrigin(0.5);
    const icon = this.add.text(0, 10, '🧙', { fontSize: '24px' }).setOrigin(0.5);
    const interactHint = this.add.text(0, 60, '點擊互動(F鍵)', {
        fontSize: '12px', color: '#c9a227', fontFamily: 'serif'
    }).setOrigin(0.5).setAlpha(0);

    container.add([shadow, body, head, icon, label, interactHint]);

    const hitbox = this.add.rectangle(x, y, 60, 80, 0xffffff, 0)
        .setInteractive({ useHandCursor: true });
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
    hitbox.on('pointerdown', () => this.openFusionPanel());
}

openFusionPanel() {
    this.scene.pause();
    this.scene.launch('FusionScene');
}
```

- [ ] **Step 3: 註冊 FusionScene (main.js)**

```js
import { FusionScene } from './scenes/FusionScene.js';
// scene 陣列新增 FusionScene
```

- [ ] **Step 4: 處理自創武功在戰鬥中的使用**

自創武功的 id format 是 `custom_*`，不在 SECTS 中，`sectManager.getArtDefinition()` 需要額外處理。更新 SectManager：

```js
getArtDefinition(artId) {
    for (const [key, sect] of Object.entries(SECTS)) {
        const art = sect.martialArts.find(m => m.id === artId);
        if (art) return { ...art, sectKey: key, sectName: sect.name };
    }
    const p = dataManager.data.player;
    const entry = p.martialArts.find(a => a.id === artId);
    if (entry && entry.id && entry.id.startsWith('custom_')) {
        return entry;
    }
    return null;
}
```

Wait, custom arts are stored as entries in martialArts with their own data embedded. Let me actually embed the full art definition when fusing.

Actually, the fusion result includes all needed properties (name, ratio, type, mp, etc.) and is stored in martialArts via push. The getArtDefinition needs to handle custom arts by returning the entry data directly if the entry contains the full art definition.

Let me update FusionSystem to store the full definition in the entry:

```js
p.martialArts.push({ id: newId, level: 1, ...newArt });
```

Then in SectManager:
```js
getArtDefinition(artId) {
    for (const [key, sect] of Object.entries(SECTS)) {
        const art = sect.martialArts.find(m => m.id === artId);
        if (art) return { ...art, sectKey: key, sectName: sect.name };
    }
    const p = dataManager.data.player;
    const entry = p.martialArts.find(a => a.id === artId);
    if (entry && entry.ratio) return entry;
    return null;
}
```

- [ ] **Step 5: 確認無錯誤**

Run: `npm run build`
Expected: build 成功

- [ ] **Step 6: Commit**

```bash
git add src/scenes/FusionScene.js src/scenes/WorldScene.js src/main.js src/systems/FusionSystem.js
git commit -m "feat(phase-d): custom martial art fusion system with UI"
```

---

### Task 3: 聊天系統

**Files:**
- Create: `src/systems/ChatSystem.js`
- Modify: `src/scenes/WorldScene.js`

- [ ] **Step 1: 建立 ChatSystem.js**

```js
class ChatSystem {
    constructor() {
        this.messages = [];
        this.channel = 'all';
        this.listeners = [];
    }

    send(text, channel = null) {
        const ch = channel || this.channel;
        const msg = { text, channel: ch, time: Date.now() };
        this.messages.push(msg);
        if (this.messages.length > 100) this.messages.shift();
        this.listeners.forEach(fn => fn(msg));
    }

    switchChannel(ch) {
        this.channel = ch;
    }

    getMessages(channel = null) {
        const ch = channel || this.channel;
        if (ch === 'all') return this.messages.slice(-20);
        return this.messages.filter(m => m.channel === ch).slice(-20);
    }

    onMessage(fn) {
        this.listeners.push(fn);
    }
}

export const chatSystem = new ChatSystem();
```

- [ ] **Step 2: 在 WorldScene 加入聊天 HUD**

在 `create()` 末加入聊天 UI：

```js
this.setupChatUI();
```

方法：

```js
setupChatUI() {
    this.chatActive = false;
    this.chatMessages = [];
    this.chatChannel = 'all';

    this.chatBg = this.add.rectangle(0, 540, 280, 160, 0x000000, 0.6).setOrigin(0, 0).setStrokeStyle(1, 0x444444).setDepth(20);
    this.chatText = this.add.text(5, 545, '', {
        fontSize: '12px', fill: '#aaa', fontFamily: 'serif', lineSpacing: 2, wordWrap: { width: 270 }
    }).setDepth(20);

    this.inputText = '';
    this.chatInputBox = this.add.rectangle(5, 700, 270, 20, 0x222222, 0.9).setOrigin(0, 0).setStrokeStyle(1, 0x666666).setDepth(20).setVisible(false);
    this.chatInputText = this.add.text(8, 702, '', {
        fontSize: '13px', fill: '#fff', fontFamily: 'serif'
    }).setDepth(20).setVisible(false);

    this.chatChannelText = this.add.text(5, 680, '頻道: 綜合 / 區域 / 門派', {
        fontSize: '11px', fill: '#666', fontFamily: 'serif'
    }).setDepth(20);

    this.input.keyboard.on('keydown-ENTER', () => {
        if (!this.chatActive) {
            this.chatActive = true;
            this.chatInputBox.setVisible(true);
            this.chatInputText.setVisible(true);
            this.inputText = '';
        } else {
            if (this.inputText.startsWith('/')) {
                const parts = this.inputText.slice(1).split(' ');
                const cmd = parts[0];
                if (cmd === '綜合') this.chatChannel = 'all';
                else if (cmd === '區域') this.chatChannel = 'area';
                else if (cmd === '門派') this.chatChannel = 'sect';
                else this.chatChannel = 'all';
            } else if (this.inputText.trim()) {
                this.addChatMessage(this.inputText);
            }
            this.chatActive = false;
            this.chatInputBox.setVisible(false);
            this.chatInputText.setVisible(false);
            this.inputText = '';
        }
    });

    this.input.keyboard.on('keydown-ESC', () => {
        if (this.chatActive) {
            this.chatActive = false;
            this.chatInputBox.setVisible(false);
            this.chatInputText.setVisible(false);
            this.inputText = '';
        }
    });

    this.input.keyboard.on('keydown', (event) => {
        if (!this.chatActive) return;
        if (event.key === 'Backspace') {
            this.inputText = this.inputText.slice(0, -1);
        } else if (event.key.length === 1) {
            this.inputText += event.key;
        }
        this.chatInputText.setText('> ' + this.inputText.slice(-40));
    });
}

addChatMessage(text) {
    this.chatMessages.push({ text, time: Date.now() });
    if (this.chatMessages.length > 30) this.chatMessages.shift();
    const lines = this.chatMessages.map(m => m.text).join('\n');
    this.chatText.setText(lines);
}
```

- [ ] **Step 3: 確認無錯誤**

Run: `npm run build`
Expected: build 成功

- [ ] **Step 4: Commit**

```bash
git add src/systems/ChatSystem.js src/scenes/WorldScene.js
git commit -m "feat(phase-e): add chat system with channel switching (Enter/F)"
```