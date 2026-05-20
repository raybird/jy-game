# TypeScript 漸進式型別化實施計畫

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在不改動 `.js` 副檔名的前提下，用 JSDoc `@typedef` + `@type` + `// @ts-check` 為 21 個 JS 檔案漸進式加入完整型別保護

**Architecture:** 第一階段定義核心型別（types.js），第二階段為 DataManager/SaveSystem 加 `@ts-check`，第三階段逐步覆蓋所有場景檔案，第四階段全面收尾。每個階段都可獨立驗證，不影響現有功能。

**Tech Stack:** JSDoc + `@ts-check`（無需 TypeScript 編譯器），IDE type-aware 檢查

---

## 設計決策

### 為什麼用 JSDoc 而非轉換成 .ts？

| 考量 | .ts 全轉換 | JSDoc 漸進 |
|------|-----------|-----------|
| 工程量 | 21 檔案全改，需調整 Vite/Phaser 設定 | 逐檔加標頭即可 |
| 風險 | 引進 tsconfig 可能與 Phaser 生態衝突 | 零風險，`@ts-check` fails open |
| sprite 資源 | 不影響 | 不影響 |
| 現有 JS 工具鏈 | 全改 | 維持不變 |
| strictNullChecks | ✅ | ✅ (全域 tsconfig 或 $schema) |

### 關鍵約定

1. **檔案不更名** — `.js` 維持，加 `// @ts-check` 在檔案第一行
2. **核心型別集中定義** — `src/types.js`（JSDoc `@typedef`，純型別不產出 runtime code）
3. **DataManager 不直接暴露 `this.data`** — 保留現有 `getData()` / 新增 `getPlayer()` 封裝對外存取
4. **場景內 `this.xxx`（Phaser 屬性）** — 在 class 頂端加 `/** @type {import('phaser').GameObjects.xxx} */` 宣告

### 覆蓋的錯誤類型（對照之前遇到的 bugs）

| Bug | 此計畫能否防止 |
|-----|---------------|
| `physics.add.sprite(null)` null texture | ✅ strictNullChecks |
| `setOrigin` 遺忘導致 overlay 偏移 | ❌（語意層，非型別層） |
| body offset 算錯 | ❌（數學層） |
| `getData('container')` 取不存在的 key | ⚠️ 部分（如用 typed accessor） |
| 屬性相剋用錯 index | ⚠️ 部分（enum 定義可防 typo） |

---

## Task 1: 建立核心型別定義 (`src/types.js`)

**Files:**
- Create: `src/types.js`

See the separate type definitions file at `src/types.js`.

---

## Task 2: 在 package.json 中加入 type check 指令

**Files:**
- Modify: `package.json`

- [ ] **Step 1: 新增 typecheck 腳本**

```json
"scripts": {
    "dev": "vite",
    "start": "vite",
    "build": "vite build",
    "typecheck": "npx -y typescript@latest --noEmit --checkJs --strict --allowJs --moduleResolution node --target ES2020 --lib ES2020,DOM src/**/*.js",
    "lint": "npm run typecheck"
}
```

- [ ] **Step 2: 驗證 typecheck 可執行**

Run: `npm run typecheck 2>&1 | head -10`
Expected: 指令可執行（可能報錯，但非 crash）

- [ ] **Step 3: Commit**

---

## Task 3: DataManager 型別化

**Files:**
- Modify: `src/systems/DataManager.js`

- [ ] **Step 1: 加入 `@ts-check` 和型別引用**

```js
// @ts-check (檔案第一行，在 import 之前)

// 在 import 區塊之後加入:
/** @typedef {import('../types.js').GameState} GameState */
/** @typedef {import('../types.js').PlayerData} PlayerData */
/** @typedef {import('../types.js').ItemUseResult} ItemUseResult */
/** @typedef {import('../types.js').CraftResult} CraftResult */
/** @typedef {import('../types.js').ActionResult} ActionResult */
```

- [ ] **Step 2: 加入 `getPlayer()` 方法**

```js
/**
 * @returns {PlayerData}
 */
getPlayer() {
    return this.data.player;
}
```

- [ ] **Step 3: 為每個 public 方法加 JSDoc**

例如：
```js
/**
 * @param {string} itemId
 * @returns {ItemUseResult}
 */
useItem(itemId) { ... }

/**
 * @param {string} recipeKey
 * @returns {CraftResult}
 */
craftItem(recipeKey) { ... }

/**
 * @param {string} spotId
 * @returns {boolean}
 */
canGather(spotId) { ... }
```

- [ ] **Step 4: 修復 `resetPlayer()` 重複定義**

抽取 `defaultPlayer()` 靜態工廠函數，constructor 和 resetPlayer 共用：

```js
class DataManager {
    /** @returns {PlayerData} */
    static defaultPlayer() { ... }

    constructor() {
        this.gatheringCooldowns = {};
        this.data = {
            player: DataManager.defaultPlayer(),
            // ... lifeSkills etc unchanged
        };
    }

    resetPlayer() {
        this.data.player = DataManager.defaultPlayer();
    }
}
```

- [ ] **Step 5: 執行型別檢查**

Run: `npm run typecheck`
Expected: DataManager.js 無報錯

- [ ] **Step 6: Commit**

---

## Task 4: GameData 型別化

**Files:**
- Modify: `src/data/GameData.js`

- [ ] **Step 1: 加入 `@ts-check` 和型別引用**

```js
// @ts-check
/** @typedef {import('../types.js').MartialArtDefinition} MartialArtDefinition */
/** @typedef {import('../types.js').FiveAttributes} FiveAttributes */
```

- [ ] **Step 2: 為主要的 `export const` 加 `@type`**

```js
/** @type {Record<string, {name:string, desc:string, baseHp:number, baseMp:number, str:number, con:number, agi:number, ip:number}>} */
export const CHARACTERS = { ... };

/** @type {Record<string, {name:string, hp:number, attack:number, defense:number, speed:number}>} */
export const ENEMIES = { ... };

/** @type {Record<string, {name:string, key:string, map:string, npcX:number, npcY:number, npcName:string, karmaRequirement:number, martialArts:MartialArtDefinition[]}>} */
export const SECTS = { ... };
```

- [ ] **Step 3: 修正 `gubai` → `gumu`**

在 `SECTS` 中將 key `gubai` 與 `key: 'gubai'` 統一改為 `gumu`。
同步搜尋 `src/` 下所有 `gubai` 參照一併修正。

Run: `rg gubai src/` — 確認所有引用後批量替換。

- [ ] **Step 4: 執行型別檢查**

Run: `npm run typecheck`
Expected: GameData.js 無報錯

- [ ] **Step 5: Commit**

---

## Task 5: SpriteManager defensive checks + 型別註解

**Files:**
- Modify: `src/systems/SpriteManager.js`

- [ ] **Step 1: 在 `createPlayerWalkSprite` 加入 key 檢查**

```js
/**
 * @param {Phaser.Scene} scene
 * @param {string} charId
 * @param {number} x
 * @param {number} y
 * @returns {Phaser.GameObjects.Sprite | Phaser.GameObjects.Graphics}
 */
createPlayerWalkSprite(scene, charId, x, y) {
    const entry = WALK_REGISTRY[charId];
    if (!entry || !entry.key) {
        console.warn(`SpriteManager: no walk sprite for "${charId}", using fallback`);
        return this._fallbackSprite(scene, x, y);
    }
    const key = entry.key;
    // ... 其餘不變
```

- [ ] **Step 2: 在 `updateWalkAnimation` 加入 defensive check**

```js
/**
 * @param {Phaser.GameObjects.Sprite} sprite
 * @param {number} vx
 * @param {number} vy
 */
updateWalkAnimation(sprite, vx, vy) {
    if (!sprite || !sprite.anims || !sprite.texture) return;
    // ... 其餘不變
```

- [ ] **Step 3: Build 驗證**

Run: `npx vite build`
Expected: Clean

- [ ] **Step 4: Commit**

---

## Task 6: BattleScene defensive checks

**Files:**
- Modify: `src/scenes/BattleScene.js`

- [ ] **Step 1: equippedSkills 載入防護**

```js
const equippedIds = dataManager.data.player.equippedSkills || [];
this.equippedSkills = equippedIds.map(id => {
    if (!id) return null;
    const def = sectManager.getArtDefinition(id);
    if (!def) {
        console.warn(`BattleScene: unknown art "${id}", skipping`);
        return null;
    }
    const entry = dataManager.data.player.martialArts.find(a => a.id === id);
    return { id, def, level: entry ? entry.level : 1 };
});
```

- [ ] **Step 2: `useSkill` 空技能檢查**

```js
useSkill(index) {
    if (!this.battleActive || !this.playerTurn) return;
    const skill = this.charSkills[index];
    if (!skill) {
        this.log('警告：未裝備招式！');
        return;
    }
    // ... 其餘不變
```

- [ ] **Step 3: Build 驗證**

Run: `npx vite build`
Expected: Clean

- [ ] **Step 4: Commit**

---

## Task 7: 場景檔案型別化 — 批量覆蓋

**Files:**
- Modify: `src/scenes/BootScene.js`
- Modify: `src/scenes/MenuScene.js`
- Modify: `src/scenes/CharacterSelectScene.js`
- Modify: `src/scenes/WorldScene.js`
- Modify: `src/scenes/SkillTreeScene.js`
- Modify: `src/scenes/PlayerInfoScene.js`
- Modify: `src/scenes/FusionScene.js`
- Modify: `src/scenes/QuestPanelScene.js`

- [ ] **Step 1: 每個檔案頂部加 `// @ts-check`**

在第一行（import 之前）插入 `// @ts-check`。

- [ ] **Step 2: 需要額外宣告的地方**

WorldScene 中宣告 Phaser 物件：

```js
/** @type {Phaser.Physics.Arcade.Sprite} */ this.player;
/** @type {Phaser.Input.Keyboard.CursorKeys} */ this.cursors;
/** @type {{ up: Phaser.Input.Keyboard.Key, down: Phaser.Input.Keyboard.Key, left: Phaser.Input.Keyboard.Key, right: Phaser.Input.Keyboard.Key }} */ this.wasd;
/** @type {Phaser.GameObjects.Rectangle} */ this.hpBar;
/** @type {Phaser.GameObjects.Rectangle} */ this.mpBar;
/** @type {Phaser.GameObjects.Text} */ this.hpText;
/** @type {number} */ this.encounterTimer;
/** @type {boolean} */ this.chatActive;
```

- [ ] **Step 3: 場景中改用 `dataManager.getPlayer()`**

所有 `const p = dataManager.data.player` 改為 `const p = dataManager.getPlayer()`。
這讓型別系統知道 `p` 是 `PlayerData`。

- [ ] **Step 4: Build 驗證**

Run: `npx vite build`
Expected: Clean

- [ ] **Step 5: 執行型別檢查**

Run: `npm run typecheck`
Expected: errors < 50（主要來自 Phaser 型別、遺留代碼等），逐一修正

- [ ] **Step 6: Commit**

---

## Task 8: 最終驗證與清理

- [ ] **Step 1: 完整 build**

Run: `npm run build`
Expected: Clean build, no errors

- [ ] **Step 2: 型別檢查收斂**

Run: `npm run typecheck 2>&1 | wc -l`
Expected: errors < 20（只來自舊遺留代碼）

- [ ] **Step 3: 功能迴歸測試**

1. 啟動遊戲 → 創角 → 進入襄陽城
2. WASD 移動確認人物行走 + 方向動畫
3. 切換地圖 → 遇敵 → 進入戰鬥
4. 回城 → 點擊門派 NPC → 加入門派
5. 按 V 開啟武功面板 → 學習/裝備武功
6. 按 C 開啟角色面板 → 確認五圍/門派顯示
7. 按 L 開啟生活技能面板 → 確認 8 技能顯示
8. 採集草藥 → 確認物品增加
9. 點擊鐵匠 → 確認製作面板正常

- [ ] **Step 4: Commit 最終狀態**

---

## 時間估算

| Task | 內容 | 預計時間 |
|------|------|---------|
| 1 | 建立核心型別定義 | 15 min |
| 2 | package.json typecheck | 5 min |
| 3 | DataManager 型別化 | 15 min |
| 4 | GameData 型別化 + gubai→gumu | 10 min |
| 5 | SpriteManager defensive | 5 min |
| 6 | BattleScene defensive | 5 min |
| 7 | 場景批量型別化 | 15 min |
| 8 | 最終驗證與清理 | 15 min |
| **Total** | | **~85 min** |

---

## 預期成果

完成後：
- **`null` 傳入 texture key** 這類錯誤 → `strictNullChecks` 攔截
- **屬性拼錯** (`dataManager.data.player.charecterId`) → TS 報錯
- **物件結構變更後忘記同步兩份定義** → 工廠函數單一來源
- **sprite sheet 不存在但不會 crash** → console.warn + fallback sprite
- **`jsconfig.json` 不影響執行** → Vite 仍用 esbuild 編譯，僅 IDE 啟用型別檢查
- **`gubai` vs `gumu`** key 不一致 → 全域統一為 `gumu`