// @ts-check

/** @typedef {import('../types.js').MartialArtDefinition} MartialArtDefinition */
/** @typedef {import('../types.js').SectDefinition} SectDefinition */
/** @typedef {import('../types.js').EnemyData} EnemyData */
/** @typedef {import('../types.js').CharacterData} CharacterData */
/** @typedef {import('../types.js').CharacterSkill} CharacterSkill */
/** @typedef {import('../types.js').ItemDefinition} ItemDefinition */
/** @typedef {import('../types.js').RecipeDefinition} RecipeDefinition */
/** @typedef {import('../types.js').LootTable} LootTable */
/** @typedef {import('../types.js').GatheringSpot} GatheringSpot */
/** @typedef {import('../types.js').QuestTemplate} QuestTemplate */
/** @typedef {import('../types.js').AchievementDefinition} AchievementDefinition */
/** @typedef {import('../types.js').CraftQualityConfig} CraftQualityConfig */

export const GameData = {
    player: {
        name: '',
        characterId: 'guojing',
        level: 1,
        exp: 0,
        hp: 100,
        maxHp: 100,
        mp: 50,
        maxMp: 50,
        strength: 10,
        constitution: 10,
        agility: 10,
        innerPower: 10,
        skillPoints: 3,
        silver: 1000,
        skills: [0, 0, 0, 0],
        skillExp: [0, 0, 0, 0],
        inventory: [],
        equipped: { weapon: null, armor: null, accessory: null }
    },
    lifeSkills: {
        herbalism: { level: 1, exp: 0 },
        mining: { level: 1, exp: 0 },
        smithing: { level: 1, exp: 0 },
        tailoring: { level: 1, exp: 0 }
    },
    auction: { listings: [] },
    wallet: { transactions: [] },
    currentMap: 'xianyang',
    inBattle: false
};

/** @type {Record<string, CharacterData>} */
export const CHARACTERS = {
    guojing: { name: '郭靖', desc: '防御型，血量高', baseHp: 150, baseMp: 50, str: 15, con: 15, agi: 8, ip: 10 },
    yangguo: { name: '楊過', desc: '暴擊型，會心率高', baseHp: 100, baseMp: 60, str: 12, con: 10, agi: 15, ip: 12 },
    xiaolongnu: { name: '小龍女', desc: '速度型，ATB充能快', baseHp: 90, baseMp: 80, str: 8, con: 8, agi: 18, ip: 15 },
    zhangwuji: { name: '張無忌', desc: '法術型，範圍攻擊', baseHp: 110, baseMp: 100, str: 10, con: 12, agi: 10, ip: 18 },
    linghu: { name: '令狐冲', desc: '均衡型，適用性廣', baseHp: 120, baseMp: 70, str: 12, con: 12, agi: 12, ip: 12 }
};

/** @type {Record<string, EnemyData>} */
export const ENEMIES = {
    quanzhen_disciple: { name: '全真弟子', hp: 60, attack: 10, defense: 2, speed: 8 },
    taoist: { name: '道士', hp: 80, attack: 15, defense: 3, speed: 10 },
    mingjiao_member: { name: '明教教徒', hp: 90, attack: 20, defense: 5, speed: 12 },
    persian: { name: '波斯人', hp: 110, attack: 25, defense: 8, speed: 15 },
    wolf: { name: '野狼', hp: 35, attack: 8, defense: 1, speed: 14 },
    deer: { name: '野鹿', hp: 25, attack: 5, defense: 0, speed: 12 },
    bear: { name: '棕熊', hp: 70, attack: 18, defense: 4, speed: 6 },
    tiger: { name: '猛虎', hp: 90, attack: 22, defense: 5, speed: 11 },
};

/** @type {Record<string, RecipeDefinition>} */
export const RECIPES = {
    iron_sword: { name: '鐵劍', type: 'weapon', skill: 'smithing', levelRequired: 1, materials: { iron_ore: 2 }, result: 'iron_sword', stats: { attack: 10 } },
    herb_potion: { name: '草藥水', type: 'consumable', skill: 'alchemy', levelRequired: 1, materials: { herb: 3 }, result: 'herb_potion', effect: { hp: 50 } },
    leather_armor: { name: '皮甲', type: 'armor', skill: 'tailoring', levelRequired: 1, materials: { leather: 2 }, result: 'leather_armor', stats: { defense: 5 } },
    bronze_pickaxe: { name: '青銅鎬', type: 'tool', skill: 'smithing', levelRequired: 2, materials: { bronze_ore: 3 }, result: 'bronze_pickaxe', effect: { mining_bonus: 1 } },
    hp_pill: { name: '回命丹', type: 'consumable', skill: 'alchemy', levelRequired: 2, materials: { herb: 5, ginseng: 1 }, result: 'hp_pill', effect: { hp: 150 } },
    mp_pill: { name: '聚氣丹', type: 'consumable', skill: 'alchemy', levelRequired: 3, materials: { herb: 3, ginseng: 1 }, result: 'mp_pill', effect: { mp: 80 } },
    atk_food: { name: '力量飯糰', type: 'consumable', skill: 'cooking', levelRequired: 1, materials: { rice: 3, fish: 1 }, result: 'atk_food', effect: { atkBuff: { amount: 5, duration: 180 } } },
    def_food: { name: '鐵骨湯', type: 'consumable', skill: 'cooking', levelRequired: 2, materials: { fish: 2, herb: 1 }, result: 'def_food', effect: { defBuff: { amount: 3, duration: 180 } } },
};

/** @type {Record<string, ItemDefinition>} */
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

export const ENCOUNTER_CONFIG = {
    interval: 800,
    baseChance: 0.10,
    mapEnemies: {
        xianyang: ['wolf', 'deer'],
        zhongnan: ['quanzhen_disciple', 'taoist', 'wolf', 'deer', 'bear'],
        guangming: ['mingjiao_member', 'persian', 'wolf', 'bear', 'tiger']
    }
};

/** @type {Record<string, CharacterSkill[]>} */
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

/** @type {{ nodeCosts: number[], nodeEffects: Object<string, number|boolean>[], passives: Object<string, {desc:string, effect:Object<string,number>}> }} */
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

/** @type {import('../types.js').AttributeCycleConfig} */
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

/** @type {import('../types.js').RageConfig} */
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
    zhangwuji: { name: '乾坤大挪移', damageRatio: 0, reflect: 1.0, healRatio: 0.3, desc: '反彈所有傷害，恢復 HP' },
    linghu: { name: '獨孤九劍·破氣式', damageRatio: 3.0, ignoreDef: 1.0, status: { type: 'stun', duration: 2 }, desc: '破盡天下武功，附帶封穴' }
};

/** @type {import('../types.js').AtbSpeedConfig} */
export const ATB_SPEEDS_CONFIG = {
    fillRate: 0.001,
    maxAtb: 100,
    playerSpeedMultiplier: 1.5
};

/** @type {Object<string, { label: string, hpMul: number, atkMul: number, defMul: number, exp: number, silver: number, weight: number }>} */
export const ENEMY_TIERS = {
    normal: { label: '', hpMul: 1.0, atkMul: 1.0, defMul: 1.0, exp: 60, silver: 80, weight: 0.75 },
    elite: { label: '精英', hpMul: 2.0, atkMul: 1.5, defMul: 1.3, exp: 150, silver: 200, weight: 0.20 },
    boss: { label: '頭目', hpMul: 3.0, atkMul: 2.0, defMul: 1.5, exp: 300, silver: 500, weight: 0.05 }
};

/** @returns {string} */
export function rollEnemyTier() {
    const roll = Math.random();
    let cumulative = 0;
    for (const [tier, cfg] of Object.entries(ENEMY_TIERS)) {
        cumulative += cfg.weight;
        if (roll < cumulative) return tier;
    }
    return 'normal';
}

/** @type {Record<string, LootTable>} */
export const LOOT_TABLES = {
    quanzhen_disciple: {
        common: [{ id: 'iron_ore', min: 1, max: 2, chance: 0.4 }],
        rare: [{ id: 'herb', min: 2, max: 3, chance: 0.15 }],
        eliteGuaranteed: [{ id: 'herb', min: 1, max: 2 }],
        bossGuaranteed: [{ id: 'herb', min: 3, max: 5 }, { id: 'jade_pendant', min: 1, max: 1 }]
    },
    taoist: {
        common: [{ id: 'herb', min: 2, max: 3, chance: 0.4 }],
        rare: [{ id: 'herb_potion', min: 1, max: 1, chance: 0.15 }],
        eliteGuaranteed: [{ id: 'herb_potion', min: 1, max: 1 }],
        bossGuaranteed: [{ id: 'herb_potion', min: 2, max: 2 }, { id: 'amulet', min: 1, max: 1 }]
    },
    mingjiao_member: {
        common: [{ id: 'bronze_ore', min: 1, max: 2, chance: 0.4 }],
        rare: [{ id: 'iron_sword', min: 1, max: 1, chance: 0.15 }],
        eliteGuaranteed: [{ id: 'bronze_ore', min: 2, max: 3 }],
        bossGuaranteed: [{ id: 'iron_sword', min: 1, max: 1 }, { id: 'ring', min: 1, max: 1 }]
    },
    persian: {
        common: [{ id: 'bronze_ore', min: 1, max: 3, chance: 0.35 }],
        rare: [{ id: 'leather_armor', min: 1, max: 1, chance: 0.15 }],
        eliteGuaranteed: [{ id: 'bronze_ore', min: 3, max: 5 }],
        bossGuaranteed: [{ id: 'leather_armor', min: 1, max: 1 }, { id: 'waist_pendant', min: 1, max: 1 }]
    },
    wolf: {
        common: [{ id: 'leather', min: 1, max: 1, chance: 0.5 }],
        rare: [{ id: 'leather', min: 2, max: 3, chance: 0.2 }, { id: 'herb', min: 1, max: 1, chance: 0.2 }],
        eliteGuaranteed: [{ id: 'leather', min: 2, max: 3 }],
        bossGuaranteed: [{ id: 'leather', min: 5, max: 8 }, { id: 'leather_armor', min: 1, max: 1 }]
    },
    deer: {
        common: [{ id: 'leather', min: 1, max: 1, chance: 0.35 }, { id: 'herb', min: 1, max: 2, chance: 0.4 }],
        rare: [{ id: 'herb', min: 3, max: 5, chance: 0.2 }],
        eliteGuaranteed: [{ id: 'leather', min: 1, max: 2 }],
        bossGuaranteed: [{ id: 'leather', min: 3, max: 5 }, { id: 'herb_potion', min: 2, max: 3 }]
    },
    bear: {
        common: [{ id: 'leather', min: 2, max: 3, chance: 0.5 }],
        rare: [{ id: 'leather', min: 3, max: 5, chance: 0.2 }, { id: 'herb', min: 2, max: 3, chance: 0.25 }],
        eliteGuaranteed: [{ id: 'leather', min: 3, max: 5 }],
        bossGuaranteed: [{ id: 'leather', min: 6, max: 10 }, { id: 'leather_armor', min: 1, max: 1 }, { id: 'amulet', min: 1, max: 1 }]
    },
    tiger: {
        common: [{ id: 'leather', min: 2, max: 3, chance: 0.55 }],
        rare: [{ id: 'leather', min: 4, max: 6, chance: 0.2 }, { id: 'iron_ore', min: 2, max: 3, chance: 0.2 }],
        eliteGuaranteed: [{ id: 'leather', min: 3, max: 5 }],
        bossGuaranteed: [{ id: 'leather', min: 8, max: 12 }, { id: 'leather_armor', min: 1, max: 2 }, { id: 'ring', min: 1, max: 1 }]
    }
};

export const FIVE_ATTRS = {
    str: { label: '臂力', short: 'STR', desc: '影響物理攻擊力' },
    bra: { label: '膽識', short: 'BRA', desc: '影響暴擊率' },
    wis: { label: '悟性', short: 'WIS', desc: '影響學點消耗折扣' },
    luk: { label: '福緣', short: 'LUK', desc: '影響稀有掉落率' },
    con: { label: '定力', short: 'CON', desc: '影響防禦與狀態抗性' },
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

/** @type {Record<string, AchievementDefinition>} */
export const ACHIEVEMENTS = {
    first_battle: { name: '初出茅廬', desc: '完成第一次戰鬥', reward: { silver: 100 } },
    veteran: { name: '百戰勇士', desc: '戰鬥 10 次', reward: { item: 'herb_potion', amount: 3 } },
    slayer: { name: '千人斬', desc: '擊敗 100 個敵人', reward: { title: '千人斬' } },
    collector: { name: '裝備收藏家', desc: '獲得 5 件不同裝備', reward: { item: 'ring', amount: 1 } },
    skill_master: { name: '技能大師', desc: '點滿一個武功的技能樹', reward: { item: 'jade_pendant', amount: 1 } }
};

/** @type {Record<string, SectDefinition>} */
export const SECTS = {
    shaolin: {
        name: '少林', key: 'shaolin', map: 'xianyang', npcX: 200, npcY: 200, npcName: '玄慈方丈',
        karmaRequirement: 0,
        martialArts: [
            { id: 'shaolin_luohan', name: '羅漢拳', tier: 'basic', type: 'outer', mp: 8, ratio: 1.4, desc: '少林入門拳法' },
            { id: 'shaolin_changquan', name: '少林長拳', tier: 'basic', type: 'outer', mp: 8, ratio: 1.3, desc: '基礎拳法' },
            { id: 'shaolin_fengbai', name: '風擺柳葉腿', tier: 'basic', type: 'outer', mp: 10, ratio: 1.5, desc: '腿法攻擊' },
            { id: 'shaolin_jinzhong', name: '金鐘罩', tier: 'basic', type: 'passive', stats: { defense: 10 }, desc: '+防禦' },
            { id: 'shaolin_jingang', name: '大力金剛掌', tier: 'mid', type: 'outer', mp: 12, ratio: 1.9, desc: '剛猛掌法' },
            { id: 'shaolin_nianhua', name: '拈花指', tier: 'mid', type: 'inner', mp: 10, ratio: 1.6, status: { type: 'stun', duration: 1 }, desc: '遠程指法附封穴' },
            { id: 'shaolin_damo', name: '達摩劍法', tier: 'mid', type: 'outer', mp: 12, ratio: 1.7, desc: '達摩祖師劍法' },
            { id: 'shaolin_yiwei', name: '一葦渡江', tier: 'mid', type: 'passive', stats: { speed: 0.12 }, desc: '+速度' },
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
            { id: 'wudang_taijijian', name: '太極劍', tier: 'mid', type: 'outer', mp: 12, ratio: 1.6, desc: '防禦性劍法' },
            { id: 'wudang_chunyang', name: '純陽無極功', tier: 'mid', type: 'passive', stats: { hpRegenBonus: 0.02 }, desc: '+HP恢復' },
            { id: 'wudang_rao', name: '繞指柔劍', tier: 'mid', type: 'outer', mp: 12, ratio: 1.3, hits: 3, desc: '快速三連擊' },
            { id: 'wudang_taijizhen', name: '太極劍法·真義', tier: 'ultimate', type: 'outer', mp: 15, ratio: 2.2, desc: '高傷+減傷' },
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
    gumu: {
        name: '古墓', key: 'gumu', map: 'zhongnan', npcX: 900, npcY: 450, npcName: '小龍女',
        karmaRequirement: -50,
        martialArts: [
            { id: 'gumu_yunv', name: '玉女劍法', tier: 'basic', type: 'outer', mp: 8, ratio: 1.5, desc: '古墓入門劍法' },
            { id: 'gumu_meinv', name: '美女拳法', tier: 'basic', type: 'outer', mp: 10, ratio: 1.4, status: { type: 'bleed', duration: 2 }, desc: '附內傷' },
            { id: 'gumu_buque', name: '捕雀功', tier: 'basic', type: 'passive', stats: { dodgeBonus: 0.05 }, desc: '+閃避' },
            { id: 'gumu_yunvx', name: '玉女素心劍', tier: 'mid', type: 'outer', mp: 12, ratio: 1.3, hits: 2, desc: '雙擊' },
            { id: 'gumu_tianluo', name: '天羅地網勢', tier: 'mid', type: 'outer', mp: 12, ratio: 1.2, aoe: true, desc: '群體攻擊' },
            { id: 'gumu_yunvxinjing', name: '玉女心經', tier: 'mid', type: 'inner', mp: 12, healRatio: 0.25, cleanse: true, desc: '回HP+解狀態' },
            { id: 'gumu_shuangjian', name: '雙劍合璧', tier: 'ultimate', type: 'outer', mp: 15, ratio: 1.4, hits: 3, desc: '極高三連擊' },
            { id: 'gumu_bingpo', name: '冰魄銀針', tier: 'ultimate', type: 'inner', mp: 15, ratio: 2.0, status: { type: 'bleed', duration: 4 }, desc: '附毒傷' },
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
            { id: 'gaibang_zuiquan', name: '醉拳', tier: 'mid', type: 'outer', mp: 12, ratio: 1.6, status: { type: 'stun', duration: 1 }, desc: '附封穴' },
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
            { id: 'xingxiu_huagong1', name: '化功大法·引', tier: 'mid', type: 'inner', mp: 12, ratio: 1.0, mpSteal: 15, desc: '化去敵方MP' },
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
            { id: 'riyue_shehun', name: '攝魂大法', tier: 'mid', type: 'inner', mp: 12, ratio: 1.2, status: { type: 'stun', duration: 2 }, desc: '封穴' },
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

/** @type {Record<string, QuestTemplate>} */
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

export const NEW_ITEMS = {
    fish: { name: '魚', type: 'material' },
    rice: { name: '米', type: 'material' },
    gold_ore: { name: '金礦', type: 'material' },
    ginseng: { name: '人蔘', type: 'material' },
    hp_pill: { name: '回命丹', type: 'consumable', effect: { hp: 150 } },
    mp_pill: { name: '聚氣丹', type: 'consumable', effect: { mp: 80 } },
    atk_food: { name: '力量飯糰', type: 'consumable', effect: { atkBuff: { amount: 5, duration: 180 } } },
    def_food: { name: '鐵骨湯', type: 'consumable', effect: { defBuff: { amount: 3, duration: 180 } } },
};

/** @type {Record<string, GatheringSpot[]>} */
export const GATHERING_SPOTS = {
    xianyang: [
        { type: 'herb', x: 100, y: 620, name: '野草藥', yield: { id: 'herb', min: 1, max: 2 }, cd: 5000 },
        { type: 'herb', x: 1150, y: 580, name: '路邊藥草', yield: { id: 'herb', min: 1, max: 2 }, cd: 5000 },
        { type: 'mining', x: 1180, y: 460, name: '城牆礦石', yield: { id: 'iron_ore', min: 1, max: 2 }, cd: 6000 },
    ],
    zhongnan: [
        { type: 'herb', x: 200, y: 500, name: '山間藥草', yield: { id: 'herb', min: 2, max: 3 }, cd: 5000 },
        { type: 'herb', x: 1000, y: 400, name: '稀有藥草', yield: { id: 'herb', min: 1, max: 3 }, cd: 6000 },
        { type: 'mining', x: 600, y: 350, name: '山壁礦石', yield: { id: 'iron_ore', min: 1, max: 3 }, cd: 6000 },
        { type: 'mining', x: 800, y: 600, name: '青銅礦脈', yield: { id: 'bronze_ore', min: 1, max: 2 }, cd: 8000 },
        { type: 'fishing', x: 300, y: 300, name: '溪流釣點', yield: { id: 'fish', min: 1, max: 2 }, cd: 4000 },
    ],
    guangming: [
        { type: 'mining', x: 400, y: 550, name: '礦坑入口', yield: { id: 'bronze_ore', min: 2, max: 4, rare: { id: 'gold_ore', chance: 0.1 } }, cd: 7000 },
        { type: 'herb', x: 900, y: 300, name: '高山靈藥', yield: { id: 'herb', min: 2, max: 4 }, cd: 6000 },
        { type: 'fishing', x: 1100, y: 550, name: '山泉釣點', yield: { id: 'fish', min: 1, max: 2 }, cd: 4000 },
        { type: 'farming', x: 200, y: 650, name: '肥沃農地', yield: { id: 'rice', min: 2, max: 4, rare: { id: 'ginseng', chance: 0.05 } }, cd: 10000 },
    ],
};

/** @type {CraftQualityConfig} */
export const CRAFT_QUALITY = {
    tiers: ['普通', '精良', '極品'],
    chances: [0.6, 0.3, 0.1],
    statMultiplier: [1.0, 1.3, 1.8],
};