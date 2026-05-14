# 對戰體驗優化 — 設計規格書

**版本：** 1.0
**日期：** 2026-05-11
**狀態：** 已批准

---

## 1. 總覽：四階段路線圖

### Phase 1 — 核心基礎重建（本期實作）
讓戰鬥「玩起來有意義」：修掉基礎 bug、賦予角色個性、串接養成系統。

| 項目 | 說明 |
|------|------|
| 1.1 | 幀率獨立遇敵 |
| 1.2 | 角色專屬武功 |
| 1.3 | 技能樹系統 |
| 1.4 | 戰鬥後保留 HP/MP |
| 1.5 | 基礎狀態系統 |

### Phase 2 — 戰鬥深度強化
統一 Phaser/Godot 為 ATB 制、完整屬性相剋與怒氣大招、裝備影響戰鬥。

| 項目 | 說明 |
|------|------|
| 2.1 | Phaser 導入 ATB |
| 2.2 | 武俠屬性相剋（陰柔/陽剛/輕靈/剛猛） |
| 2.3 | 怒氣大招系統 |
| 2.4 | 招架／閃避指令 |
| 2.5 | 裝備屬性實際影響戰鬥數值 |

### Phase 3 — 內容擴充
敵人分級、戰利品多樣化、角色技能動畫、音效。

| 項目 | 說明 |
|------|------|
| 3.1 | 敵人分級（普通/精英/頭目） |
| 3.2 | 多樣化掉落表 |
| 3.3 | 角色專屬技能視覺 |
| 3.4 | 音效系統 |

### Phase 4 — 體驗打磨
打擊感強化、UI 優化、成就系統。

| 項目 | 說明 |
|------|------|
| 4.1 | Hit freeze / 打擊停頓 |
| 4.2 | ATB 行動序列預覽 UI |
| 4.3 | 戰鬥轉場特效 |
| 4.4 | 成就／稱號系統 |

---

## 2. Phase 1 詳細設計

### 2.1 幀率獨立遇敵

**動機：** 現行 `Math.random() < 0.003` 在 `update()` 中每 frame 執行，遇敵機率隨幀率浮動（60fps vs 30fps 差一倍），屬於 bug。

**實作方式：**
- 在 WorldScene 中追蹤 `this.encounterTimer = 0`
- 每幀累加 `delta` 到計時器
- 當計時器超過閾值（如 500ms）時進行一次遇敵判定
- 判定後重置計時器（避免累積多次判定）

**偽代碼：**
```js
// WorldScene.update()
if (this.currentMap !== 'xianyang' && this.grassArea) {
    const bounds = this.grassArea.getBounds();
    if (bounds.contains(this.player.x, this.player.y)) {
        this.encounterTimer += delta;
        if (this.encounterTimer >= 500) {  // 每 500ms 判定一次
            this.encounterTimer = 0;
            if (Math.random() < 0.15) {    // 每次判定 15% 機率
                this.startRandomBattle();
            }
        }
    }
}
```

**參數：** 遇敵間隔 500ms、判定機率 15% → 平均每 3.3 秒觸發一次戰鬥。這些參數集中定義在 GameData.js 中。

**受影響檔案：**
- `src/scenes/WorldScene.js` — 修改遇敵邏輯
- `src/data/GameData.js` — 新增遇敵參數 `ENCOUNTER_INTERVAL`、`ENCOUNTER_CHANCE`

**Godot 版本：** `scripts/world/map_controller.gd` — 確認使用 `delta` 參數，依相同邏輯修改。

---

### 2.2 角色專屬武功

**動機：** 目前所有角色共用 `SKILL_NAMES = ['普通攻擊', '第一招式', '第二招式', '第三招式']`，技能無角色辨識度，傷害公式完全一致。

**設計：**

#### 武功資料結構

在 `GameData.js` 中新增 `CHARACTER_SKILLS`：

```js
export const CHARACTER_SKILLS = {
    guojing: [
        { name: '降龍十八掌', cost: 10, damageRatio: 1.8, type: 'inner', desc: '剛猛掌法，造成大量內功傷害' },
        { name: '空明拳',     cost: 8,  damageRatio: 1.2, type: 'outer', desc: '虛實交替，無視部分防禦' },
        { name: '左右互搏',   cost: 12, damageRatio: 1.0, type: 'outer', desc: '雙倍打擊，連續攻擊兩次', hits: 2 },
        { name: '九陰真經',   cost: 15, damageRatio: 2.0, type: 'inner', desc: '玄門正宗，附帶內傷效果' }
    ],
    yangguo: [
        { name: '黯然銷魂掌', cost: 10, damageRatio: 2.0, type: 'outer', desc: '情深黯然，暴擊率 +20%', critBonus: 0.2 },
        { name: '玄鐵劍法',   cost: 12, damageRatio: 2.5, type: 'outer', desc: '重劍無鋒，無視防禦' },
        { name: '彈指神通',   cost: 8,  damageRatio: 1.0, type: 'inner', desc: '遠程攻擊，附帶封穴效果' },
        { name: '玉女心經',   cost: 10, damageRatio: 1.5, type: 'inner', desc: '恢復自身 HP 15%', healRatio: 0.15 }
    ],
    xiaolongnu: [
        { name: '玉女劍法',   cost: 8,  damageRatio: 1.5, type: 'outer', desc: '輕靈迅捷，ATB 加速' },
        { name: '雙劍合璧',   cost: 15, damageRatio: 2.2, type: 'outer', desc: '左右夾擊，攻擊兩次', hits: 2 },
        { name: '天羅地網勢', cost: 10, damageRatio: 0.8, type: 'outer', desc: '大範圍攻擊，敵方全體', aoe: true },
        { name: '冰魄銀針',   cost: 12, damageRatio: 1.2, type: 'inner', desc: '淬毒暗器，附帶持續扣血' }
    ],
    zhangwuji: [
        { name: '乾坤大挪移', cost: 15, damageRatio: 0.5, type: 'inner', desc: '借力打力，反彈 50% 傷害', reflect: 0.5 },
        { name: '七傷拳',     cost: 12, damageRatio: 2.8, type: 'outer', desc: '一拳七傷，極高傷害但有自損', selfDamage: 0.1 },
        { name: '聖火令武功', cost: 10, damageRatio: 1.5, type: 'outer', desc: '波斯奇功，降低敵方防禦', defDown: 0.2 },
        { name: '九陽神功',   cost: 5,  damageRatio: 0.0, type: 'inner', desc: '內力充沛，恢復 MP 30%', mpRestore: 0.3 }
    ],
    linghu: [
        { name: '獨孤九劍',   cost: 8,  damageRatio: 1.8, type: 'outer', desc: '破盡天下武功，無視閃避' },
        { name: '吸星大法',   cost: 6,  damageRatio: 0.8, type: 'inner', desc: '吸取敵方 MP 20', mpSteal: 20 },
        { name: '易筋經',     cost: 10, damageRatio: 1.2, type: 'inner', desc: '洗髓伐脈，解除所有負面狀態', cleanse: true },
        { name: '沖靈劍法',   cost: 12, damageRatio: 2.0, type: 'outer', desc: '華山絕學，附帶封穴效果' }
    ]
};
```

**角色類型定位：**
| 角色 | 核心機制 | 強項 | 弱項 |
|------|----------|------|------|
| 郭靖 | 高防反擊 | 生存力強、穩定輸出 | 速度慢 |
| 楊過 | 暴擊一波 | 單體爆發極高 | 續航差、技能自損 |
| 小龍女 | 高速連擊 | ATB 充能快、多段攻擊 | 單發傷害低 |
| 張無忌 | 戰術輔助 | 回復/反彈/削弱 | 直接傷害不穩定 |
| 令狐冲 | 全能控場 | 封穴、吸 MP、淨化 | 無明顯專精 |

#### 傷害公式修改

移除統一的 `SKILL_NAMES` 和 `baseDamage + index * 8` 公式。

```
普攻傷害 = 10 + strength * 0.5
技能傷害 = (普攻傷害 * damageRatio) - (enemy.defense * ignoreDefRatio)
暴擊判定：若 critBonus > 0，暴擊率 += critBonus，暴擊傷害 × 1.5
```

**受影響檔案：**
- `src/data/GameData.js` — 新增 `CHARACTER_SKILLS`，移除 `SKILL_NAMES`
- `src/scenes/BattleScene.js` — 技能按鈕文字改讀角色專屬武功名稱，傷害計算使用對應係數
- `src/systems/DataManager.js` — `skills` 欄位含義調整為技能等級陣列（長度 4）
- `src/scenes/CharacterSelectScene.js` — 角色選擇畫面顯示角色專屬武功簡介

**Godot 版本：** `scripts/battle/battle_controller.gd`、`scripts/player/player_controller.gd` 同步更新技能資料與傷害計算。

---

### 2.3 技能樹系統

**動機：** 目前每級獲得 3 skill points 但無處可花，升級缺乏期待感。

**設計：**

每個角色有 4 個武功，每個武功有 3 個強化節點：

```
武功 ─┬─ LV2：傷害 +15%
      ├─ LV3：消耗 -20%
      └─ LV4：解鎖被動加成
```

**被動加成（依角色類型不同）：**
| 角色 | LV4 被動 |
|------|----------|
| 郭靖 | 受到傷害 -10% |
| 楊過 | HP < 30% 時暴擊率 +30% |
| 小龍女 | ATB 充能速度 +15% |
| 張無忌 | 每回合自動恢復 HP 5% |
| 令狐冲 | 技能 MP 消耗 -15% |

**升級花費：**
| 節點 | 花費 skill points |
|------|-------------------|
| LV2 | 2 |
| LV3 | 2 |
| LV4 | 3 |

一個角色全滿共需 `(2 + 2 + 3) × 4 = 28` 點。LV1-15 共獲得 `15 × 3 = 45` 點，足夠點滿一套且有餘裕做不同配置。

**UI：**
- 在 WorldScene 中新增「武功」按鈕或快捷鍵（按鍵 V）
- 開啟技能樹面板（覆蓋 UI）
- 顯示所有武功、當前等級、下一級效果、花費
- 點擊已解鎖節點進行升級
- 當前 skill points 顯示在 HUD

**資料結構修改（DataManager）：**
```js
player: {
    ...
    skillPoints: 3,
    skills: [0, 0, 0, 0],     // 武功等級 (0-4, 0=未解鎖)
    skillTree: [
        { skillIndex: 0, nodes: [false, false, false] },  // 3 個強化節點是否已點
        { skillIndex: 1, nodes: [false, false, false] },
        { skillIndex: 2, nodes: [false, false, false] },
        { skillIndex: 3, nodes: [false, false, false] }
    ]
}
```

**受影響檔案：**
- `src/data/GameData.js` — 新增 `SKILL_TREE_NODES` 定義
- `src/systems/DataManager.js` — 追蹤 skill tree 狀態，新增 `upgradeSkillNode()`、`canUpgradeNode()` 方法
- `src/systems/DataManager.js` — `checkLevelUp()` 維持每級 +3 點
- `src/scenes/BattleScene.js` — 武功傷害根據技能樹強化節點計算實際加成

#### 技能樹 UI 場景（新增）

建議新增 `src/scenes/SkillTreeScene.js`（Phaser）或 `scenes/ui/skill_tree.tscn`（Godot）：
- 讀取當前角色的武功資料
- 顯示 4 個武功卡片
- 每個卡片內顯示強化節點鏈（未點亮 / 已點亮）
- 點擊可升級節點 → 呼叫 DataManager 方法
- 關閉面板返回 WorldScene

**Godot 版本：** 新增 `scripts/ui/skill_tree.gd` 作為 UI 控制器。

---

### 2.4 戰鬥後保留 HP/MP

**動機：** 現行 `endBattle()` 中 `dataManager.data.player.hp = maxHp; mp = maxMp` 消除所有資源管理壓力，讓藥品、補給、生活技能與戰鬥完全脫鉤。

**設計：**

**核心規則：**
- 戰鬥勝利後不再自動回滿 HP/MP
- 改為每步（非戰鬥中）緩慢恢復：`HP += maxHp * 0.01/s`、`MP += maxMp * 0.005/s`（即每 100 秒回滿）
- 玩家可透過道具補給：使用草藥水（herb_potion）恢復 HP 50

**修改點：**

| 檔案 | 修改 |
|------|------|
| `BattleScene.js:endBattle()` | 移除 `player.hp = maxHp`、`player.mp = maxMp` 兩行 |
| `WorldScene.js:update()` | 新增非戰鬥時緩慢恢復（每秒恢復 HP 1%、MP 0.5%） |
| `WorldScene.js:HUD` | 顯示 HP/MP 條（已在 HUD 但有無皆可，確保顯示清晰） |
| `DataManager.js` | 新增 `regenHpMp(delta)` 方法 |
| 物品使用 UI | 新增簡易道具使用（按鍵 I 打開背包，點擊藥品使用） |

**戰敗處理：** 戰敗時 HP/MP 回滿（避免卡死），但損失 10% 銀兩（最低保留 100 兩）。

**Godot 版本：** 同步修改 `scripts/battle/battle_controller.gd:end_battle()` 和 `scripts/world/map_controller.gd`。

---

### 2.5 基礎狀態系統

**動機：** 目前戰鬥無任何狀態效果，無法體現武俠特色（點穴、內傷等）。

**設計：** 實作 3 種基礎狀態，作為 Phase 2 完整狀態系統的先導。

| 狀態 | 效果 | 持續回合 | 來源 |
|------|------|----------|------|
| 封穴（stun） | 跳過下一回合行動 | 1-2 回合 | 彈指神通、沖靈劍法 |
| 內傷（bleed） | 每回合結束扣 maxHp 5% | 3 回合 | 九陰真經、冰魄銀針 |
| 減防（defDown） | 防禦力 -30% | 2 回合 | 聖火令武功 |

**資料結構：**
```js
// BattleScene 中新增
this.statuses = {
    player: [],   // [{ type: 'bleed', duration: 3 }, ...]
    enemy: []
};
```

**流程修改：**
1. 技能命中時，根據技能定義的 `status` 欄位對目標附加狀態
2. 回合開始時，狀態效果觸發（如內傷扣血）
3. 回合結束時，狀態持續時間 -1，歸零則移除
4. UI 顯示狀態圖示（可先用文字標記，如「⚠ 封穴」「🩸 內傷」）

**狀態效果實作點：**

| 位置 | 修改 |
|------|------|
| `BattleScene.js` 角色行動前 | 檢查封穴狀態，跳過回合 |
| `BattleScene.js` 回合結束 | 內傷扣血、持續時間 -1 |
| `BattleScene.js` 傷害計算 | 減防狀態降低 target.defense |
| `BattleScene.js` UI | 在角色旁顯示狀態圖示 |
| `BattleScene.js` BattleLog | 狀態附加/移除時輸出訊息 |

**狀態規則：**
- 同類型狀態不疊加，但刷新持續時間
- 狀態效果均在回合邊界觸發（開始或結束時）
- 封穴 = 該回合完全無法行動（普攻 + 技能皆不可用）

**Godot 版本：** `scripts/battle/battle_controller.gd` 與 `scripts/player/player_controller.gd` 新增對應邏輯。

---

## 3. 實作順序（Phase 1 內部）

```
Step 1 ─ 2.1 幀率獨立遇敵（最小改動，先修 bug）
Step 2 ─ 2.4 戰鬥後保留 HP/MP（改動小，影響大，需先確認不會造成遊戲卡死）
Step 3 ─ 2.2 角色專屬武功（核心改動）
Step 4 ─ 2.3 技能樹系統（依賴 Step 3 的武功資料）
Step 5 ─ 2.5 基礎狀態系統（依賴 Step 3 的傷害流程）
```

---

## 4. Godot 版本對應

每個 Phase 1 項目需同步實作到 Godot 版本：
| 項目 | Godot 對應檔案 |
|------|---------------|
| 2.1 幀率獨立遇敵 | `scripts/world/map_controller.gd` |
| 2.2 角色專屬武功 | `scripts/battle/enemy_controller.gd`、`scripts/player/player_controller.gd`、`scripts/autoload/data_manager.gd` |
| 2.3 技能樹系統 | 新增 `scripts/ui/skill_tree.gd` + `scenes/ui/skill_tree.tscn` |
| 2.4 保留 HP/MP | `scripts/battle/battle_controller.gd`、`scripts/world/map_controller.gd` |
| 2.5 基礎狀態系統 | `scripts/battle/battle_controller.gd`、`scripts/player/player_controller.gd` |

---

## 5. 遊戲數值調整

因應 HP/MP 不再自動回滿，調整以下數值以維持遊戲平衡：

| 項目 | 調整前 | 調整後 |
|------|--------|--------|
| 草藥水（herb_potion）恢復量 | HP 50 | HP 50（維持，但變得更重要） |
| 戰鬥經驗值 | 50 | 60（補償續航壓力） |
| 戰鬥銀兩 | 100 | 80 |
| 材料掉落率 | 30% | 40% |
| 敵人攻擊力 | 10-25 | 維持（因非滿血進戰鬥難度自然提升） |
| 新手起始銀兩 | 1000 | 500 + 5 瓶草藥水 |

---

## 6. 技術注意事項

- 所有遇敵參數（間隔、機率）集中在 `GameData.js` 的 `ENCOUNTER_CONFIG`，方便調整
- 武功資料 `CHARACTER_SKILLS` 與角色資料 `CHARACTERS` 分離，保持關注點分離
- 技能樹 UI 使用 Phaser 的 Container + Rectangle + Text 組合，不依賴外部 UI 庫
- 狀態效果實作為函數式：`applyStatus(target, type, duration)` / `tickStatuses(target)` / `removeStatus(target, type)`
- Godot 版本保留與 Phaser 版本一致的資料結構，以 `data_manager.gd`（autoload）統一管理