# 金庸武俠 Online

基於 Phaser 3 的金庸群俠傳風格 RPG 網頁遊戲。支援 12 門派、百套武功、屬性相剋、自創武功、任務系統、生活技能等經典金庸Online玩法。

## 快速開始

```bash
npm install
npm run dev      # 開發模式 http://localhost:5173
npm run build    # 生產構建
```

## 操作說明

| 按鍵 | 功能 |
|------|------|
| WASD / 方向鍵 | 移動 |
| Enter | 聊天（切換頻道 `/綜合` `/區域` `/門派`） |
| C | 角色面板（五圍、門派、職位、裝備武功） |
| V | 武功管理（升級、裝備切換） |
| J | 任務追蹤 |
| 空白鍵 | 普攻 |
| 1-4 | 招式 |
| F | 防禦 |
| R | 怒氣絕招（怒氣滿時） |

## 核心系統

### 門派與武功
- **12 門派**：少林、武當、華山、全真、古墓、丐幫、明教、峨眉、星宿、血刀門、日月神教、逍遙派
- **~100 套武功**，分初階（學習 50 學點）、中階（150 學點）、絕學（400 學點）
- 武功可升級至 Lv.5（消耗學點 + 實戰經驗）
- 學習需門派聲望門檻：初階 0 / 中階 500 / 絕學 2000
- 門派職位 5 階（弟子 → 掌門，靠聲望/捐獻晉升）

### 五圍屬性（創角配點）
| 屬性 | 影響 |
|------|------|
| 臂力 (STR) | 物理攻擊力 |
| 膽識 (BRA) | 暴擊率、ATB 速度 |
| 悟性 (WIS) | 內功傷害加成 |
| 福緣 (LUK) | 稀有掉落、奇遇 |
| 定力 (CON) | 防禦、狀態抗性 |

### 屬性相剋（四象）
陽剛 → 清靈 → 陰柔 → 剛猛 → 陽剛（克制 +30% 傷害，被克 -30%）

### ATB 戰鬥系統
- ATB 進度條即時填充（速度 = 膽識 × 係數）
- 怒氣系統（滿怒按 R 釋放角色絕招）
- 狀態效果：中毒、燒傷、冰凍、眩暈
- 敵人分級：普通(75%) / 精英(20%) / 頭目(5%)

### 自創武功（融合系統）
- 條件：擁有 ≥8 套武功，≥2 套 Lv.3+，≥500 學點
- 外功 + 外功 → 物理系 / 內功 + 內功 → 內功系(AOE) / 混合 → 均衡系
- 絕學 + 絕學 → 30% 機率出絕世武功
- 隱士高人 NPC 觸發（WorldScene 左下角）

### 任務系統
- 鏢局護送 / 賞金任務
- 擊殺計數 / 抵達地圖觸發
- 面板 J 追蹤進度

### 生活技能
- **採集**：採藥 🌿、挖礦 ⛏、釣魚 🎣、耕種 🌾（各 12 個採集點）
- **製作**：鑄造(武器)、煉丹(藥水)、廚藝(食物)、縫紉(護甲)
- 品質三階：普通(60%) / 精良(30%) / 極品(10%)，技能等級影響機率

### 聊天系統
- Enter 開啟/發送，Esc 關閉
- 頻道：`/綜合` `/區域` `/門派`

## 技術架構

```
src/
├── main.js              # Phaser 遊戲主配置
├── data/
│   └── GameData.js      # 核心配置（門派、武功、敵人、物品、配方）
├── scenes/
│   ├── BootScene.js     # 預載入（精靈圖、動畫）
│   ├── MenuScene.js     # 主選單
│   ├── CharacterSelectScene.js  # 創角（五圍配點、選角色）
│   ├── WorldScene.js    # 世界地圖（移動、NPC、採集、聊天）
│   ├── BattleScene.js   # ATB 回合戰鬥
│   ├── SkillTreeScene.js   # 武功管理/升級面板(V)
│   ├── PlayerInfoScene.js  # 角色面板(C)
│   ├── QuestPanelScene.js  # 任務追蹤(J)
│   └── FusionScene.js      # 自創武功融合
└── systems/
    ├── DataManager.js   # 玩家資料/物品/經驗管理
    ├── SaveSystem.js    # localStorage 存檔
    ├── SoundManager.js  # 音效管理
    ├── SectManager.js   # 門派邏輯（加入/叛派/學習/升級/職位）
    ├── QuestManager.js  # 任務管理
    ├── FusionSystem.js  # 武功融合演算法
    ├── ChatSystem.js    # 聊天頻道
    └── SpriteManager.js # 精靈圖管理（載入、動畫、行走）
```

## 精靈圖生成（Codex CLI + agent-sprite-forge）

```bash
# 安裝 Codex CLI
npm install -g @anthropic/codex

# 安裝 sprite forge skills
git clone https://github.com/anthropics/agent-sprite-forge /tmp/agent-sprite-forge
cp -r /tmp/agent-sprite-forge/skills/generate2dsprite ~/.codex/skills/

# 生成角色精靈（需 danger-full-access）
codex exec --sandbox danger-full-access \
  "Use \$generate2dsprite to create a 3x3 idle sprite sheet for [角色描述]..."
```

## 地圖

| 地圖 | 名稱 | 門派 NPC | 遇敵 |
|------|------|---------|------|
| 襄陽城 (xianyang) | 起始城鎮 | 少林、丐幫、日月神教 | — |
| 終南山 (zhongnan) | 山林 | 武當、華山、全真、古墓、峨眉、逍遙 | 全真弟子、道士 |
| 光明頂 (guangming) | 沙漠高地 | 明教、星宿、血刀門 | 明教教徒、波斯人 |

## 存檔系統

- 自動存檔至 `localStorage`
- 切換場景 / 戰鬥結束時觸發
- Key: `jinyong_save_data`

## 技術棧

- **Phaser 3** (^3.70) — 遊戲引擎
- **Vite 5** — 建構工具
- **JavaScript (ES Module)** — 純 JS，無 TypeScript
- **Python** — Codex sprite forge 後處理（Pillow, numpy）