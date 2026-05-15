# Phase B — 門派與武功 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 建立 12 門派資料、武功學習系統、門派聲望、武功裝備欄、叛派機制

**Architecture:** GameData.js 新增 SECTS 和 MARTIAL_ARTS 巨量資料，SectManager.js 管理門派邏輯，WorldScene 新增門派師父 NPC，BattleScene 武功來源改為 equippedSkills

**Tech Stack:** Phaser 3 (JavaScript), Vite

---

### Task 1: 門派與武功資料 (GameData.js)

**Files:**
- Modify: `src/data/GameData.js`

- [ ] **Step 1: 在 GameData.js 尾部加入全部門派和武功定義**

```js
export const SECTS = {
    shaolin: {
        name: '少林', key: 'shaolin', map: 'xianyang', npcX: 200, npcY: 200, npcName: '玄慈方丈',
        karmaRequirement: 0,
        martialArts: [
            { id: 'shaolin_luohan', name: '羅漢拳', tier: 'basic', type: 'outer', mp: 8, ratio: 1.4, desc: '少林入門拳法' },
            { id: 'shaolin_changquan', name: '少林長拳', tier: 'basic', type: 'outer', mp: 8, ratio: 1.3, desc: '基礎拳法' },
            { id: 'shaolin_fengbai', name: '風擺柳葉腿', tier: 'basic', type: 'outer', mp: 10, ratio: 1.5, desc: '腿法攻擊' },
            { id: 'shaolin_jinzhong', name: '金鐘罩', tier: 'basic', type: 'passive', stats: { defenseBonus: 10 }, desc: '+防禦' },
            { id: 'shaolin_jingang', name: '大力金剛掌', tier: 'mid', type: 'outer', mp: 12, ratio: 1.9, desc: '剛猛掌法' },
            { id: 'shaolin_nianhua', name: '拈花指', tier: 'mid', type: 'inner', mp: 10, ratio: 1.6, status: { type: 'stun', duration: 1 }, desc: '遠程指法附封穴' },
            { id: 'shaolin_damo', name: '達摩劍法', tier: 'mid', type: 'outer', mp: 12, ratio: 1.7, desc: '達摩祖師劍法' },
            { id: 'shaolin_yiwei', name: '一葦渡江', tier: 'mid', type: 'passive', stats: { speedBonus: 0.12 }, desc: '+速度' },
            { id: 'shaolin_yijinjing', name: '易筋經', tier: 'ultimate', type: 'inner', mp: 15, healRatio: 0.4, cleanse: true, desc: '大幅回血+解狀態' },
            { id: 'shaolin_fumo', name: '金剛伏魔圈', tier: 'ultimate', type: 'outer', mp: 15, ratio: 2.5, aoe: true, desc: '群體高傷' },
        ],
    },
    wudang: {
        name: '武當', key: 'wudang', map: 'zhongnan', npcX: 500, npcY: 250, npcName: '張三丰',
        karmaRequirement: 100,
        martialArts: [
            { id: 'wudang_changquan', name: '武當長拳', tier: 'basic', type: 'outer', mp: 8, ratio: 1.3, desc: '入門拳法' },
            { id: 'wudang_mianzhang', name: '綿掌', tier: 'basic', type: 'outer', mp: 8, ratio: 1.4, desc: '輕柔掌法' },
            { id: 'wudang_tiyun', name: '梯雲縱', tier: 'basic', type: 'passive', stats: { dodgeBonus: 0.04 }, desc: '+閃避' },
            { id: 'wudang_taiji', name: '太極拳', tier: 'mid', type: 'outer', mp: 10, ratio: 1.5, reflect: 0.2, desc: '借力打力，附反彈' },
            { id: 'wudang_taijijian', name: '太極劍', tier: 'mid', type: 'outer', mp: 12, ratio: 1.6, selfDmgReduction: 0.2, desc: '防禦性劍法' },
            { id: 'wudang_chunyang', name: '純陽無極功', tier: 'mid', type: 'passive', stats: { hpRegenBonus: 0.02 }, desc: '+HP恢復' },
            { id: 'wudang_raozhijian', name: '繞指柔劍', tier: 'mid', type: 'outer', mp: 12, ratio: 1.3, hits: 3, desc: '快速三連擊' },
            { id: 'wudang_taijizhen', name: '太極劍法·真義', tier: 'ultimate', type: 'outer', mp: 15, ratio: 2.2, selfDmgReduction: 0.3, desc: '高傷+減傷' },
            { id: 'wudang_zhenwu', name: '真武七截陣', tier: 'ultimate', type: 'inner', mp: 15, ratio: 1.5, aoe: true, desc: '群體攻擊' },
        ],
    },
    huashan: {
        name: '華山', key: 'huashan', map: 'zhongnan', npcX: 700, npcY: 250, npcName: '岳不群',
        karmaRequirement: 50,
        martialArts: [
            { id: 'huashan_jianfa', name: '華山劍法', tier: 'basic', type: 'outer', mp: 8, ratio: 1.4, desc: '華山基礎劍法' },
            { id: 'huashan_pishi', name: '劈石拳', tier: 'basic', type: 'outer', mp: 10, ratio: 1.5, desc: '碎石拳法' },
            { id: 'huashan_shenfa', name: '華山身法', tier: 'basic', type: 'passive', stats: { critBonus: 0.05 }, desc: '+暴擊' },
            { id: 'huashan_sanxian', name: '奪命連環三仙劍', tier: 'mid', type: 'outer', mp: 12, ratio: 1.3, hits: 3, desc: '三連擊' },
            { id: 'huashan_zixia', name: '紫霞神功', tier: 'mid', type: 'passive', stats: { innerDmgBonus: 0.15 }, desc: '+內功傷害' },
            { id: 'huashan_fanliangyi', name: '反兩儀刀法', tier: 'mid', type: 'outer', mp: 10, ratio: 1.7, desc: '刀法攻擊' },
            { id: 'huashan_dugu9jian', name: '獨孤九劍', tier: 'ultimate', type: 'outer', mp: 15, ratio: 2.5, ignoreDef: 1.0, desc: '無視防禦+無視閃避' },
            { id: 'huashan_poqi', name: '獨孤九劍·破氣式', tier: 'ultimate', type: 'outer', mp: 18, ratio: 3.0, ignoreDef: 1.0, status: { type: 'stun', duration: 2 }, desc: '絕世劍法附封穴' },
        ],
    },
    quanzhen: {
        name: '全真', key: 'quanzhen', map: 'zhongnan', npcX: 300, npcY: 450, npcName: '丘處機',
        karmaRequirement: 80,
        martialArts: [
            { id: 'quanzhen_jianfa', name: '全真劍法', tier: 'basic', type: 'outer', mp: 8, ratio: 1.3, desc: '全真基礎劍法' },
            { id: 'quanzhen_xinfa', name: '全真心法', tier: 'basic', type: 'passive', stats: { mpRegenBonus: 0.01 }, desc: '+MP恢復' },
            { id: 'quanzhen_jinyan', name: '金雁功', tier: 'basic', type: 'passive', stats: { speedBonus: 0.08 }, desc: '+速度' },
            { id: 'quanzhen_chongyang', name: '重陽劍法', tier: 'mid', type: 'outer', mp: 12, ratio: 1.8, desc: '王重陽之劍法' },
            { id: 'quanzhen_xiantian', name: '先天功', tier: 'mid', type: 'inner', mp: 15, healRatio: 0.35, desc: '恢復HP' },
            { id: 'quanzhen_yijian', name: '一劍化三清', tier: 'mid', type: 'outer', mp: 12, ratio: 1.2, hits: 3, desc: '三連擊' },
            { id: 'quanzhen_kongming', name: '空明拳', tier: 'ultimate', type: 'outer', mp: 15, ratio: 2.5, ignoreDef: 1.0, desc: '無視防禦' },
            { id: 'quanzhen_xiantianqi', name: '先天罡氣', tier: 'ultimate', type: 'inner', mp: 15, ratio: 1.2, aoe: true, desc: '群體內功' },
        ],
    },
    gubai: {
        name: '古墓', key: 'gubai', map: 'zhongnan', npcX: 900, npcY: 450, npcName: '小龍女',
        karmaRequirement: -50,
        martialArts: [
            { id: 'gubai_yunv', name: '玉女劍法', tier: 'basic', type: 'outer', mp: 8, ratio: 1.5, desc: '古墓入門劍法' },
            { id: 'gubai_meinv', name: '美女拳法', tier: 'basic', type: 'outer', mp: 10, ratio: 1.4, status: { type: 'confuse', duration: 1 }, desc: '迷惑拳法' },
            { id: 'gubai_buque', name: '捕雀功', tier: 'basic', type: 'passive', stats: { dodgeBonus: 0.05 }, desc: '+閃避' },
            { id: 'gubai_yunvx', name: '玉女素心劍', tier: 'mid', type: 'outer', mp: 12, ratio: 1.3, hits: 2, desc: '雙擊' },
            { id: 'gubai_tianluo', name: '天羅地網勢', tier: 'mid', type: 'outer', mp: 12, ratio: 1.2, aoe: true, desc: '群體攻擊' },
            { id: 'gubai_yunvxinjing', name: '玉女心經', tier: 'mid', type: 'inner', mp: 12, healRatio: 0.25, cleanse: true, desc: '回HP+解狀態' },
            { id: 'gubai_shuangjian', name: '雙劍合璧', tier: 'ultimate', type: 'outer', mp: 15, ratio: 1.4, hits: 3, desc: '極高三連擊' },
            { id: 'gubai_bingpo', name: '冰魄銀針', tier: 'ultimate', type: 'inner', mp: 15, ratio: 2.0, status: { type: 'bleed', duration: 4 }, desc: '附毒傷' },
        ],
    },
    gaibang: {
        name: '丐幫', key: 'gaibang', map: 'xianyang', npcX: 1050, npcY: 300, npcName: '洪七公',
        karmaRequirement: 0,
        martialArts: [
            { id: 'gaibang_quanfa', name: '丐幫拳法', tier: 'basic', type: 'outer', mp: 8, ratio: 1.3, desc: '入門拳法' },
            { id: 'gaibang_xiaoyao', name: '逍遙遊', tier: 'basic', type: 'passive', stats: { speedBonus: 0.1 }, desc: '+速度' },
            { id: 'gaibang_hunyuan', name: '混元功', tier: 'basic', type: 'passive', stats: { hpBonus: 30 }, desc: '+HP' },
            { id: 'gaibang_xianglong1', name: '降龍十八掌·初式', tier: 'mid', type: 'outer', mp: 12, ratio: 2.0, desc: '強力掌法' },
            { id: 'gaibang_dagou', name: '打狗棒法', tier: 'mid', type: 'outer', mp: 10, ratio: 1.7, desc: '棒法攻擊' },
            { id: 'gaibang_zuiquan', name: '醉拳', tier: 'mid', type: 'outer', mp: 12, ratio: 1.6, status: { type: 'confuse', duration: 1 }, desc: '附混亂' },
            { id: 'gaibang_xianglong2', name: '降龍十八掌·真傳', tier: 'ultimate', type: 'outer', mp: 18, ratio: 3.0, desc: '極高傷害' },
            { id: 'gaibang_tianxiawugou', name: '天下無狗', tier: 'ultimate', type: 'outer', mp: 20, ratio: 2.2, aoe: true, desc: '群體高傷' },
        ],
    },
    mingjiao: {
        name: '明教', key: 'mingjiao', map: 'guangming', npcX: 500, npcY: 300, npcName: '張無忌',
        karmaRequirement: -20,
        martialArts: [
            { id: 'mingjiao_daofa', name: '明教刀法', tier: 'basic', type: 'outer', mp: 8, ratio: 1.4, desc: '入門刀法' },
            { id: 'mingjiao_shenghuo', name: '聖火心法', tier: 'basic', type: 'passive', stats: { innerDmgBonus: 0.08 }, desc: '+內功' },
            { id: 'mingjiao_wuxing', name: '五行旗陣', tier: 'basic', type: 'outer', mp: 10, ratio: 1.0, aoe: true, desc: '群體基礎攻擊' },
            { id: 'mingjiao_qishang', name: '七傷拳', tier: 'mid', type: 'outer', mp: 12, ratio: 2.3, selfDamage: 0.08, desc: '高傷+自損' },
            { id: 'mingjiao_shenghuoling', name: '聖火令武功', tier: 'mid', type: 'outer', mp: 10, ratio: 1.6, status: { type: 'defDown', duration: 2 }, desc: '附減防' },
            { id: 'mingjiao_qiankun1', name: '乾坤大挪移·引', tier: 'mid', type: 'inner', mp: 12, reflect: 0.4, desc: '反彈傷害' },
            { id: 'mingjiao_qiankun2', name: '乾坤大挪移·極', tier: 'ultimate', type: 'inner', mp: 18, reflect: 0.7, healRatio: 0.25, desc: '大幅反彈+回血' },
            { id: 'mingjiao_shenghuotian', name: '聖火焚天', tier: 'ultimate', type: 'inner', mp: 15, ratio: 2.0, aoe: true, desc: '群體火傷' },
        ],
    },
    emei: {
        name: '峨眉', key: 'emei', map: 'zhongnan', npcX: 1100, npcY: 200, npcName: '滅絕師太',
        karmaRequirement: 100,
        martialArts: [
            { id: 'emei_jianfa', name: '峨眉劍法', tier: 'basic', type: 'outer', mp: 8, ratio: 1.3, desc: '入門劍法' },
            { id: 'emei_xinfa', name: '峨眉心法', tier: 'basic', type: 'passive', stats: { mpBonus: 20 }, desc: '+MP' },
            { id: 'emei_huifeng', name: '迴風拂柳', tier: 'basic', type: 'outer', mp: 10, ratio: 1.4, desc: '輕柔攻擊' },
            { id: 'emei_miejian', name: '滅劍', tier: 'mid', type: 'outer', mp: 12, ratio: 1.8, desc: '強力劍法' },
            { id: 'emei_juejian', name: '絕劍', tier: 'mid', type: 'outer', mp: 12, ratio: 2.0, ignoreDef: 0.5, desc: '破防劍法' },
            { id: 'emei_foguang', name: '佛光普照', tier: 'mid', type: 'inner', mp: 15, healRatio: 0.2, aoe: true, desc: '群體恢復' },
            { id: 'emei_jiuyang', name: '九陽神功·啟', tier: 'ultimate', type: 'inner', mp: 15, healRatio: 0.4, cleanse: true, desc: '大幅恢復+解狀態' },
            { id: 'emei_yitian', name: '倚天劍法', tier: 'ultimate', type: 'outer', mp: 18, ratio: 2.8, ignoreDef: 0.5, desc: '倚天絕學' },
        ],
    },
    xingxiu: {
        name: '星宿', key: 'xingxiu', map: 'guangming', npcX: 700, npcY: 500, npcName: '丁春秋',
        karmaRequirement: -300,
        martialArts: [
            { id: 'xingxiu_zhangfa', name: '星宿掌法', tier: 'basic', type: 'outer', mp: 8, ratio: 1.2, status: { type: 'bleed', duration: 2 }, desc: '基礎掌法+毒' },
            { id: 'xingxiu_rumen', name: '毒功入門', tier: 'basic', type: 'passive', stats: { poisonChance: 0.15 }, desc: '攻擊附帶毒' },
            { id: 'xingxiu_sanxiao', name: '三笑逍遙散', tier: 'basic', type: 'inner', mp: 10, ratio: 0.8, status: { type: 'bleed', duration: 3 }, desc: '持續毒傷' },
            { id: 'xingxiu_huagong1', name: '化功大法·引', tier: 'mid', type: 'inner', mp: 12, ratio: 1.0, mpSteal: 15, desc: '化去敵方攻擊力' },
            { id: 'xingxiu_bilin', name: '碧磷針', tier: 'mid', type: 'inner', mp: 10, ratio: 1.3, status: { type: 'bleed', duration: 3 }, desc: '遠程毒傷' },
            { id: 'xingxiu_wandu', name: '萬毒蝕骨', tier: 'mid', type: 'inner', mp: 15, ratio: 1.5, status: { type: 'bleed', duration: 4 }, desc: '強力毒傷' },
            { id: 'xingxiu_huagong2', name: '化功大法·極', tier: 'ultimate', type: 'inner', mp: 20, ratio: 1.8, mpSteal: 30, status: { type: 'bleed', duration: 3 }, desc: '化HP+MP' },
            { id: 'xingxiu_laoxian', name: '星宿老仙', tier: 'ultimate', type: 'inner', mp: 18, ratio: 1.5, aoe: true, status: { type: 'bleed', duration: 3 }, desc: '群體毒傷' },
        ],
    },
    xuedao: {
        name: '血刀門', key: 'xuedao', map: 'guangming', npcX: 300, npcY: 500, npcName: '血刀老祖',
        karmaRequirement: -500,
        martialArts: [
            { id: 'xuedao_daofa', name: '血刀刀法', tier: 'basic', type: 'outer', mp: 8, ratio: 1.5, desc: '入門刀法' },
            { id: 'xuedao_xuesha', name: '血煞功', tier: 'basic', type: 'passive', stats: { lifesteal: 0.08 }, desc: '攻擊吸血' },
            { id: 'xuedao_xiuluo', name: '修羅刀', tier: 'basic', type: 'outer', mp: 10, ratio: 1.7, selfDamage: 0.05, desc: '狂暴攻擊' },
            { id: 'xuedao_xuehai', name: '血海魔功', tier: 'mid', type: 'passive', stats: { lowHpAtkBonus: 0.3 }, desc: '低HP時+攻擊' },
            { id: 'xuedao_shixue', name: '噬血斬', tier: 'mid', type: 'outer', mp: 12, ratio: 1.8, lifesteal: 0.15, desc: '高傷+吸血' },
            { id: 'xuedao_xueying', name: '血影神行', tier: 'mid', type: 'passive', stats: { speedBonus: 0.1 }, desc: '+速度' },
            { id: 'xuedao_xuedaoda', name: '血刀大法', tier: 'ultimate', type: 'outer', mp: 18, ratio: 2.8, lifesteal: 0.3, desc: '極高傷+大量吸血' },
            { id: 'xuedao_xueji', name: '血祭蒼生', tier: 'ultimate', type: 'inner', mp: 20, ratio: 2.5, aoe: true, selfDamage: 0.15, desc: '犧牲HP換群體傷害' },
        ],
    },
    riyue: {
        name: '日月神教', key: 'riyue', map: 'xianyang', npcX: 850, npcY: 200, npcName: '東方不敗',
        karmaRequirement: -200,
        martialArts: [
            { id: 'riyue_daofa', name: '日月刀法', tier: 'basic', type: 'outer', mp: 8, ratio: 1.4, desc: '入門刀法' },
            { id: 'riyue_kuihuaxf', name: '葵花心法', tier: 'basic', type: 'passive', stats: { speedBonus: 0.1 }, desc: '+速度' },
            { id: 'riyue_heixue', name: '黑血神針', tier: 'basic', type: 'inner', mp: 10, ratio: 1.2, status: { type: 'bleed', duration: 2 }, desc: '遠程毒傷' },
            { id: 'riyue_xixing1', name: '吸星大法·引', tier: 'mid', type: 'inner', mp: 12, ratio: 1.0, mpSteal: 20, desc: '吸取敵方MP' },
            { id: 'riyue_pixie', name: '辟邪劍法', tier: 'mid', type: 'outer', mp: 10, ratio: 1.3, hits: 3, desc: '高速三連擊' },
            { id: 'riyue_shehun', name: '攝魂大法', tier: 'mid', type: 'inner', mp: 12, ratio: 1.2, status: { type: 'confuse', duration: 2 }, desc: '混亂敵人' },
            { id: 'riyue_xixing2', name: '吸星大法·極', tier: 'ultimate', type: 'inner', mp: 18, ratio: 1.5, mpSteal: 30, lifesteal: 0.15, desc: '吸取HP+MP' },
            { id: 'riyue_kuihua', name: '葵花寶典', tier: 'ultimate', type: 'passive', stats: { speedBonus: 0.2, comboChance: 0.3 }, desc: '大幅+速度+連擊率' },
        ],
    },
    xiaoyao: {
        name: '逍遙派', key: 'xiaoyao', map: 'zhongnan', npcX: 100, npcY: 600, npcName: '無崖子',
        karmaRequirement: 0,
        martialArts: [
            { id: 'xiaoyao_quan', name: '逍遙拳', tier: 'basic', type: 'outer', mp: 8, ratio: 1.3, desc: '入門拳法' },
            { id: 'xiaoyao_beiming1', name: '北冥神功·引', tier: 'basic', type: 'inner', mp: 10, ratio: 0.8, mpSteal: 10, desc: '吸取MP' },
            { id: 'xiaoyao_lingbo', name: '凌波微步', tier: 'basic', type: 'passive', stats: { dodgeBonus: 0.06 }, desc: '+閃避' },
            { id: 'xiaoyao_tianshan', name: '天山折梅手', tier: 'mid', type: 'outer', mp: 12, ratio: 1.8, ignoreDef: 0.3, desc: '破防攻擊' },
            { id: 'xiaoyao_xiaowuxiang', name: '小無相功', tier: 'mid', type: 'inner', mp: 12, ratio: 1.0, reflect: 0.3, desc: '模仿反擊' },
            { id: 'xiaoyao_baihong', name: '白虹掌力', tier: 'mid', type: 'inner', mp: 12, ratio: 1.6, desc: '遠程內功攻擊' },
            { id: 'xiaoyao_beiming2', name: '北冥神功·極', tier: 'ultimate', type: 'inner', mp: 18, ratio: 1.2, mpSteal: 40, lifesteal: 0.15, desc: '吸取大量MP+轉HP' },
            { id: 'xiaoyao_bahuang', name: '八荒六合唯我獨尊功', tier: 'ultimate', type: 'inner', mp: 20, ratio: 2.5, desc: '全屬性提升' },
        ],
    },
};

export const SKILL_COSTS = {
    studyPointsLearn: { basic: 50, mid: 150, ultimate: 400 },
    repRequiredLearn: { basic: 0, mid: 500, ultimate: 2000 },
    studyPointsUpgrade: [0, 30, 80, 150, 300],
    combatExpUpgrade: [0, 100, 300, 600, 1000],
};
```

- [ ] **Step 2: 確認無錯誤**

Run: `npm run build`
Expected: build 成功

- [ ] **Step 3: Commit**

```bash
git add src/data/GameData.js
git commit -m "feat(phase-b): add 12 sects and ~100 martial arts data"
```

---

### Task 2: 建立 SectManager

**Files:**
- Create: `src/systems/SectManager.js`

- [ ] **Step 1: 建立檔**

```js
import { dataManager } from './DataManager.js';
import { SECTS, SKILL_COSTS } from '../data/GameData.js';
import { soundManager } from './SoundManager.js';

class SectManager {
    getAvailableSects() {
        return Object.entries(SECTS).map(([key, sect]) => ({
            key,
            name: sect.name,
            map: sect.map,
            npcName: sect.npcName,
            npcX: sect.npcX,
            npcY: sect.npcY,
            karmaRequirement: sect.karmaRequirement,
            martialArtCount: sect.martialArts.length,
        }));
    }

    getSect(sectKey) {
        return SECTS[sectKey] || null;
    }

    canJoin(sectKey) {
        const p = dataManager.data.player;
        if (p.sect) return false;
        const sect = SECTS[sectKey];
        if (!sect) return false;
        if (p.karma < sect.karmaRequirement) return false;
        return true;
    }

    joinSect(sectKey) {
        if (!this.canJoin(sectKey)) return { ok: false, reason: '無法加入此門派' };
        const sect = SECTS[sectKey];
        dataManager.data.player.sect = sectKey;
        dataManager.data.player.sectReputation = 0;
        const basicArts = sect.martialArts.filter(m => m.tier === 'basic');
        basicArts.forEach(m => {
            if (!dataManager.data.player.martialArts.find(a => a.id === m.id)) {
                dataManager.data.player.martialArts.push({ id: m.id, level: 1 });
            }
        });
        return { ok: true, sectName: sect.name };
    }

    leaveSect() {
        const p = dataManager.data.player;
        if (!p.sect) return { ok: false, reason: '無門派可脫離' };
        const sectArts = SECTS[p.sect].martialArts.map(m => m.id);
        p.martialArts = p.martialArts.filter(a => !sectArts.includes(a.id));
        p.equippedSkills = [null, null, null, null];
        p.sect = null;
        p.sectReputation = 0;
        p.karma = Math.max(-1000, p.karma - 100);
        p.fame = Math.max(0, p.fame - 50);
        return { ok: true };
    }

    getLearnableArts(sectKey) {
        const sect = SECTS[sectKey];
        if (!sect) return [];
        const p = dataManager.data.player;
        return sect.martialArts.filter(art => {
            const alreadyLearned = p.martialArts.some(a => a.id === art.id);
            if (alreadyLearned) return false;
            const repRequired = SKILL_COSTS.repRequiredLearn[art.tier];
            if (p.sectReputation < repRequired) return false;
            return true;
        });
    }

    learnArt(sectKey, artId) {
        const sect = SECTS[sectKey];
        if (!sect) return { ok: false, reason: '門派不存在' };
        const art = sect.martialArts.find(m => m.id === artId);
        if (!art) return { ok: false, reason: '武功不存在' };
        const p = dataManager.data.player;
        const alreadyLearned = p.martialArts.find(a => a.id === artId);
        if (alreadyLearned) return { ok: false, reason: '已學過此武功' };
        const cost = SKILL_COSTS.studyPointsLearn[art.tier];
        if (p.studyPoints < cost) return { ok: false, reason: `學點不足 (需要 ${cost})` };
        p.studyPoints -= cost;
        p.martialArts.push({ id: artId, level: 1 });
        soundManager.play('skill');
        return { ok: true, artName: art.name };
    }

    canUpgradeArt(artId) {
        const p = dataManager.data.player;
        const entry = p.martialArts.find(a => a.id === artId);
        if (!entry) return { ok: false, reason: '尚未學習此武功' };
        if (entry.level >= 5) return { ok: false, reason: '已達最高等級' };
        const spCost = SKILL_COSTS.studyPointsUpgrade[entry.level];
        const expReq = SKILL_COSTS.combatExpUpgrade[entry.level];
        if (p.studyPoints < spCost) return { ok: false, reason: `學點不足 (需要 ${spCost})` };
        if (p.combatExp < expReq) return { ok: false, reason: `實戰經驗不足 (需要 ${expReq})` };
        return { ok: true };
    }

    upgradeArt(artId) {
        const check = this.canUpgradeArt(artId);
        if (!check.ok) return check;
        const p = dataManager.data.player;
        const entry = p.martialArts.find(a => a.id === artId);
        const spCost = SKILL_COSTS.studyPointsUpgrade[entry.level];
        p.studyPoints -= spCost;
        entry.level += 1;
        return { ok: true, newLevel: entry.level };
    }

    getArtDefinition(artId) {
        for (const [key, sect] of Object.entries(SECTS)) {
            const art = sect.martialArts.find(m => m.id === artId);
            if (art) return { ...art, sectKey: key, sectName: sect.name };
        }
        return null;
    }
}

export const sectManager = new SectManager();
```

- [ ] **Step 2: 確認無錯誤**

Run: `npm run build`
Expected: build 成功

- [ ] **Step 3: Commit**

```bash
git add src/systems/SectManager.js
git commit -m "feat(phase-b): add SectManager with join/leave/learn/upgrade logic"
```

---

### Task 3: 門派師父 NPC 與對話選單

**Files:**
- Modify: `src/scenes/WorldScene.js`

- [ ] **Step 1: 在 WorldScene.js 頂部新增 import**

```js
import { SECTS } from '../data/GameData.js';
import { sectManager } from '../systems/SectManager.js';
```

- [ ] **Step 2: 在 create() 中呼叫 setupSectNPCs**

在 `setupNPCs()` 之後新增：

```js
this.setupSectNPCs();
```

- [ ] **Step 3: 加入 setupSectNPCs 方法**

在 `setupExits()` 方法後新增：

```js
setupSectNPCs() {
    const sects = Object.entries(SECTS).filter(([key, s]) => s.map === this.currentMap);
    if (sects.length === 0) return;

    sects.forEach(([key, sect]) => {
        const x = sect.npcX || 640;
        const y = sect.npcY || 400;
        const container = this.add.container(x, y);

        const shadow = this.add.ellipse(0, 35, 50, 20, 0x000000, 0.3);
        const body = this.add.rectangle(0, 10, 40, 50, 0xc9a227);
        const head = this.add.circle(0, -20, 18, 0xffdbac);
        const label = this.add.text(0, -55, sect.npcName + ' [' + sect.name + ']', {
            fontSize: '14px', color: '#ffd700', fontFamily: 'serif',
            stroke: '#000', strokeThickness: 2
        }).setOrigin(0.5);
        const icon = this.add.text(0, 10, '👤', { fontSize: '24px' }).setOrigin(0.5);
        const interactHint = this.add.text(0, 60, '點擊互動', {
            fontSize: '12px', color: '#c9a227', fontFamily: 'serif'
        }).setOrigin(0.5).setAlpha(0);

        container.add([shadow, body, head, icon, label, interactHint]);

        const hitbox = this.add.rectangle(x, y, 60, 80, 0xffffff, 0)
            .setInteractive({ useHandCursor: true });
        hitbox.setData('npcId', 'sect_' + key);
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
        hitbox.on('pointerdown', () => this.interactWithSectNPC(key));
    });
}
```

- [ ] **Step 4: 加入 interactWithSectNPC 方法**

在 `interactWithNPC` 方法後新增：

```js
interactWithSectNPC(sectKey) {
    const p = dataManager.data.player;
    const sect = SECTS[sectKey];

    const overlay = this.add.rectangle(0, 0, 1280, 720, 0x000000, 0.7).setInteractive();
    const panel = this.add.rectangle(640, 360, 500, 450, 0x1a1a2e).setStrokeStyle(3, 0xc9a227);
    const elements = [overlay, panel];

    let iy = 140;

    const title = this.add.text(640, iy, `${sect.name} — ${sect.npcName}`, {
        fontSize: '26px', fill: '#ffd700', fontFamily: 'serif'
    }).setOrigin(0.5);
    elements.push(title);
    iy += 40;

    const isMember = p.sect === sectKey;

    if (!p.sect) {
        const canJoin = sectManager.canJoin(sectKey);
        const joinText = canJoin
            ? `善惡要求：${sect.karmaRequirement}（當前：${p.karma}） ✅`
            : `善惡要求：${sect.karmaRequirement}（當前：${p.karma}） ❌`;

        const infoText = this.add.text(640, iy, joinText, {
            fontSize: '16px', fill: canJoin ? '#88ff88' : '#ff8888', fontFamily: 'serif'
        }).setOrigin(0.5);
        elements.push(infoText);
        iy += 30;

        const joinBtn = this.add.text(640, iy, '[ 加入門派 ]', {
            fontSize: '20px', fill: canJoin ? '#ffd700' : '#666', fontFamily: 'serif',
            backgroundColor: '#333', padding: { x: 12, y: 6 }
        }).setOrigin(0.5);
        elements.push(joinBtn);

        if (canJoin) {
            joinBtn.setInteractive({ useHandCursor: true });
            joinBtn.on('pointerdown', () => {
                const result = sectManager.joinSect(sectKey);
                if (result.ok) {
                    this.closePanel(elements);
                    this.updateHUD();
                }
            });
        }
        iy += 50;
    } else if (isMember) {
        const repText = this.add.text(640, iy, `門派聲望：${p.sectReputation}`, {
            fontSize: '18px', fill: '#fff', fontFamily: 'serif'
        }).setOrigin(0.5);
        elements.push(repText);
        iy += 35;

        const learnBtn = this.add.text(640, iy, '[ 學習武功 ]', {
            fontSize: '20px', fill: '#ffd700', fontFamily: 'serif',
            backgroundColor: '#333', padding: { x: 12, y: 6 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        elements.push(learnBtn);
        learnBtn.on('pointerdown', () => {
            this.closePanel(elements);
            this.showArtLearningPanel(sectKey);
        });
        iy += 45;

        const leaveBtn = this.add.text(640, iy, '[ 叛離門派 ]', {
            fontSize: '18px', fill: '#ff6666', fontFamily: 'serif',
            backgroundColor: '#333', padding: { x: 12, y: 6 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        elements.push(leaveBtn);
        leaveBtn.on('pointerdown', () => {
            const result = sectManager.leaveSect();
            if (result.ok) {
                this.closePanel(elements);
                this.updateHUD();
            }
        });
        iy += 45;
    } else {
        const otherText = this.add.text(640, iy, `你已是 ${SECTS[p.sect]?.name || '其他'} 門人`, {
            fontSize: '18px', fill: '#888', fontFamily: 'serif'
        }).setOrigin(0.5);
        elements.push(otherText);
        iy += 40;
    }

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

- [ ] **Step 5: 加入武功學習子面板**

```js
showArtLearningPanel(sectKey) {
    const sect = SECTS[sectKey];
    const learnable = sectManager.getLearnableArts(sectKey);
    const p = dataManager.data.player;

    const overlay = this.add.rectangle(0, 0, 1280, 720, 0x000000, 0.7).setInteractive();
    const panel = this.add.rectangle(640, 360, 520, 500, 0x1a1a2e).setStrokeStyle(3, 0xc9a227);
    const elements = [overlay, panel];

    let iy = 100;
    const title = this.add.text(640, iy, `學習武功 — ${sect.name}  學點：${p.studyPoints}`, {
        fontSize: '22px', fill: '#ffd700', fontFamily: 'serif'
    }).setOrigin(0.5);
    elements.push(title);
    iy += 40;

    if (learnable.length === 0) {
        const empty = this.add.text(640, iy, '暫無可學武功（檢查門派聲望或學點）', {
            fontSize: '16px', fill: '#888', fontFamily: 'serif'
        }).setOrigin(0.5);
        elements.push(empty);
    } else {
        learnable.forEach(art => {
            const cost = SKILL_COSTS.studyPointsLearn[art.tier];
            const tierLabel = { basic: '初階', mid: '中階', ultimate: '絕學' }[art.tier];
            const row = this.add.text(640, iy, `${tierLabel} ${art.name}  [${cost} 學點]`, {
                fontSize: '16px', fill: '#fff', fontFamily: 'serif',
                backgroundColor: '#2a2a4a', padding: { x: 8, y: 4 }
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });
            row.on('pointerdown', () => {
                const result = sectManager.learnArt(sectKey, art.id);
                if (result.ok) {
                    this.closePanel(elements);
                } else {
                    row.setText(`${art.name} - ${result.reason}`);
                    row.setColor('#ff6666');
                }
            });
            elements.push(row);
            iy += 32;
        });
    }

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

- [ ] **Step 6: 更新 closePanel 方法支援更多元素**

目前 `closePanel` 只收 array → fade + destroy。確認無需修改即可用。

- [ ] **Step 7: 確認無錯誤**

Run: `npm run build`
Expected: build 成功

- [ ] **Step 8: Commit**

```bash
git add src/scenes/WorldScene.js
git commit -m "feat(phase-b): add sect NPCs with dialogue menu and martial art learning"
```

---

### Task 4: 武功管理面板 (取代 SkillTreeScene)

**Files:**
- Modify: `src/scenes/SkillTreeScene.js`

- [ ] **Step 1: 重構 SkillTreeScene 為 MartialArtsPanelScene**

將整個檔案替換為武功管理面板：

```js
import Phaser from 'phaser';
import { dataManager } from '../systems/DataManager.js';
import { sectManager } from '../systems/SectManager.js';

export default class SkillTreeScene extends Phaser.Scene {
    constructor() {
        super('SkillTreeScene');
    }

    create() {
        this.cameras.main.setBackgroundColor('#000000');
        const p = dataManager.data.player;
        const cx = 400;
        let iy = 30;

        const title = this.add.text(cx, iy, '武功管理', {
            fontSize: '26px', fill: '#ffd700', fontFamily: 'serif'
        }).setOrigin(0.5);
        iy += 40;

        const spText = this.add.text(cx, iy, `學點：${p.studyPoints}  實戰：${p.combatExp}`, {
            fontSize: '16px', fill: '#aaa', fontFamily: 'serif'
        }).setOrigin(0.5);
        iy += 30;

        this.add.text(cx, iy, '--- 已學武功 ---', {
            fontSize: '18px', fill: '#ffd700', fontFamily: 'serif'
        }).setOrigin(0.5);
        iy += 28;

        if (p.martialArts.length === 0) {
            this.add.text(cx, iy, '尚未學習任何武功', {
                fontSize: '16px', fill: '#666', fontFamily: 'serif'
            }).setOrigin(0.5);
            iy += 30;
        } else {
            const scrollableY = iy;
            let rowY = scrollableY;

            p.martialArts.forEach(entry => {
                const artDef = sectManager.getArtDefinition(entry.id);
                if (!artDef) return;

                const nameText = `Lv.${entry.level} ${artDef.name} [${artDef.tier === 'basic' ? '初' : artDef.tier === 'mid' ? '中' : '絕'}]`;
                const row = this.add.text(cx, rowY, nameText, {
                    fontSize: '15px', fill: '#fff', fontFamily: 'serif',
                    backgroundColor: '#2a2a4a', padding: { x: 8, y: 4 }
                }).setOrigin(0.5).setInteractive({ useHandCursor: true });

                row.on('pointerdown', () => {
                    if (entry.level < 5) {
                        const result = sectManager.upgradeArt(entry.id);
                        if (result.ok) {
                            row.setText(`Lv.${result.newLevel} ${artDef.name} [${artDef.tier === 'basic' ? '初' : artDef.tier === 'mid' ? '中' : '絕'}]`);
                        } else {
                            row.setColor('#ff6666');
                            this.time.delayedCall(2000, () => row.setColor('#fff'));
                        }
                    }
                });
                rowY += 30;
            });
            iy = rowY + 20;
        }

        iy += 10;
        this.add.text(cx, iy, '--- 裝備欄位 (1-4) ---', {
            fontSize: '18px', fill: '#ffd700', fontFamily: 'serif'
        }).setOrigin(0.5);
        iy += 28;

        for (let slot = 0; slot < 4; slot++) {
            const equippedId = p.equippedSkills[slot];
            let slotLabel;
            if (equippedId) {
                const artDef = sectManager.getArtDefinition(equippedId);
                slotLabel = `欄${slot + 1}: ${artDef?.name || equippedId}`;
            } else {
                slotLabel = `欄${slot + 1}: 空`;
            }

            const slotText = this.add.text(cx, iy, slotLabel, {
                fontSize: '16px', fill: equippedId ? '#00ffcc' : '#666', fontFamily: 'serif',
                backgroundColor: '#333', padding: { x: 8, y: 4 }
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });

            slotText.on('pointerdown', () => {
                this.showSkillPicker(slot);
            });
            iy += 30;
        }

        iy += 20;
        const closeBtn = this.add.text(cx, iy, '[ 關閉 (V) ]', {
            fontSize: '18px', fill: '#ff6666', fontFamily: 'serif',
            backgroundColor: '#333', padding: { x: 12, y: 6 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        closeBtn.on('pointerdown', () => {
            this.scene.resume('WorldScene');
            this.scene.stop();
        });
        this.input.keyboard.on('keydown-V', () => {
            this.scene.resume('WorldScene');
            this.scene.stop();
        });
    }

    showSkillPicker(slotIndex) {
        const p = dataManager.data.player;
        const cx = 400;
        const overlay = this.add.rectangle(0, 0, 1280, 720, 0x000000, 0.8).setInteractive().setDepth(10);
        const panel = this.add.rectangle(cx, 360, 350, 400, 0x1a1a2e).setStrokeStyle(2, 0xc9a227).setDepth(10);
        const elements = [overlay, panel];

        let iy = 160;
        const title = this.add.text(cx, iy, `選擇欄位 ${slotIndex + 1} 武功`, {
            fontSize: '20px', fill: '#ffd700', fontFamily: 'serif'
        }).setOrigin(0.5).setDepth(10);
        elements.push(title);
        iy += 35;

        const clearBtn = this.add.text(cx, iy, '[ 清空 ]', {
            fontSize: '16px', fill: '#ff6666', fontFamily: 'serif',
            backgroundColor: '#333', padding: { x: 8, y: 4 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(10);
        elements.push(clearBtn);
        clearBtn.on('pointerdown', () => {
            p.equippedSkills[slotIndex] = null;
            elements.forEach(e => e.destroy());
            this.scene.restart();
        });
        iy += 35;

        p.martialArts.forEach(entry => {
            const artDef = sectManager.getArtDefinition(entry.id);
            if (!artDef) return;
            if (artDef.type === 'passive') return;

            const label = `Lv.${entry.level} ${artDef.name}`;
            const row = this.add.text(cx, iy, label, {
                fontSize: '15px', fill: '#fff', fontFamily: 'serif',
                backgroundColor: '#2a2a4a', padding: { x: 8, y: 4 }
            }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(10);
            elements.push(row);

            row.on('pointerdown', () => {
                p.equippedSkills[slotIndex] = entry.id;
                elements.forEach(e => e.destroy());
                this.scene.restart();
            });
            iy += 28;
        });

        iy += 20;
        const closeBtn = this.add.text(cx, iy, '[ 取消 ]', {
            fontSize: '16px', fill: '#888', fontFamily: 'serif',
            backgroundColor: '#333', padding: { x: 8, y: 4 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(10);
        elements.push(closeBtn);
        closeBtn.on('pointerdown', () => elements.forEach(e => e.destroy()));
    }
}
```

- [ ] **Step 2: 確認無錯誤**

Run: `npm run build`
Expected: build 成功

- [ ] **Step 3: Commit**

```bash
git add src/scenes/SkillTreeScene.js
git commit -m "feat(phase-b): replace skill tree with martial arts management panel"
```

---

### Task 5: 更新 BattleScene 使用 equippedSkills

**Files:**
- Modify: `src/scenes/BattleScene.js`

- [ ] **Step 1: 修改 create() 中技能按鈕來源**

找到 `createSkillButtons()` 方法中的技能按鈕邏輯，改為從 `equippedSkills` 讀取：

找到：
```js
const charSkills = CHARACTER_SKILLS[charId];
this.charSkills = charSkills;
this.skillLevels = dataManager.data.player.skills;
```

替換為：
```js
import { sectManager } from '../systems/SectManager.js';
```

然後修改 create()：
```js
const equippedIds = dataManager.data.player.equippedSkills;
this.equippedSkills = equippedIds.map(id => {
    if (!id) return null;
    const def = sectManager.getArtDefinition(id);
    if (!def) return null;
    const entry = dataManager.data.player.martialArts.find(a => a.id === id);
    return { id, def, level: entry ? entry.level : 1 };
});
this.charSkills = this.equippedSkills.map(s => s ? s.def : null);
```

- [ ] **Step 2: 修改 useSkill 中 skill 參數取得**

在 `useSkill(index)` 中，`skill` 目前從 `this.charSkills[index]` 取得。因為我已經在 create() 中設定 `this.charSkills` 為 equippedSkills 的定義，所以不需要改這個部分。

但是 `skillLevel` 需要改，目前從 `dataManager.data.player.skills` 讀。改為：
```js
const skillLevel = this.equippedSkills[index] ? this.equippedSkills[index].level : 0;
```

- [ ] **Step 3: 處理預設攻擊（普攻）**

當 `equippedSkills` 中有 null 時，`useSkill(index)` 應該跳過：
在 `useSkill(index)` 開頭加入：
```js
const skill = this.charSkills[index];
if (!skill) return;
```

- [ ] **Step 4: 計算傷害時使用五圍屬性**

更新 `calculateSkillDamage` 使用新的 attributes：
```js
// 原本使用 dataManager.data.player.strength
// 改為從 attributes.str 和 attributes.bra 計算
const attrs = dataManager.data.player.attributes;
const str = attrs ? attrs.str : dataManager.data.player.strength;
const baseAtk = 10 + str * 0.5;
```

- [ ] **Step 5: 確認無錯誤**

Run: `npm run build`
Expected: build 成功

- [ ] **Step 6: Commit**

```bash
git add src/scenes/BattleScene.js
git commit -m "feat(phase-b): update BattleScene to use equippedSkills and five-attribute stats"
```