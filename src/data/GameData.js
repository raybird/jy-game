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

export const CHARACTERS = {
    guojing: { name: '郭靖', desc: '防御型，血量高', baseHp: 150, baseMp: 50, str: 15, con: 15, agi: 8, ip: 10 },
    yangguo: { name: '楊過', desc: '暴擊型，會心率高', baseHp: 100, baseMp: 60, str: 12, con: 10, agi: 15, ip: 12 },
    xiaolongnu: { name: '小龍女', desc: '速度型，ATB充能快', baseHp: 90, baseMp: 80, str: 8, con: 8, agi: 18, ip: 15 },
    zhangwuji: { name: '張無忌', desc: '法術型，範圍攻擊', baseHp: 110, baseMp: 100, str: 10, con: 12, agi: 10, ip: 18 },
    linghu: { name: '令狐冲', desc: '均衡型，適用性廣', baseHp: 120, baseMp: 70, str: 12, con: 12, agi: 12, ip: 12 }
};

export const ENEMIES = {
    quanzhen_disciple: { name: '全真弟子', hp: 60, attack: 10, defense: 2, speed: 8 },
    taoist: { name: '道士', hp: 80, attack: 15, defense: 3, speed: 10 },
    mingjiao_member: { name: '明教教徒', hp: 90, attack: 20, defense: 5, speed: 12 },
    persian: { name: '波斯人', hp: 110, attack: 25, defense: 8, speed: 15 }
};

export const RECIPES = {
    iron_sword: { name: '鐵劍', type: 'weapon', skill: 'smithing', levelRequired: 1, materials: { iron_ore: 2 }, result: 'iron_sword', stats: { attack: 10 } },
    herb_potion: { name: '草藥水', type: 'consumable', skill: 'herbalism', levelRequired: 1, materials: { herb: 3 }, result: 'herb_potion', effect: { hp: 50 } },
    leather_armor: { name: '皮甲', type: 'armor', skill: 'tailoring', levelRequired: 1, materials: { leather: 2 }, result: 'leather_armor', stats: { defense: 5 } },
    bronze_pickaxe: { name: '青銅鎬', type: 'tool', skill: 'smithing', levelRequired: 2, materials: { bronze_ore: 3 }, result: 'bronze_pickaxe', effect: { mining_bonus: 1 } }
};

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
        zhongnan: ['quanzhen_disciple', 'taoist'],
        guangming: ['mingjiao_member', 'persian']
    }
};

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

export const ATB_SPEEDS_CONFIG = {
    fillRate: 0.001,
    maxAtb: 100,
    playerSpeedMultiplier: 1.5
};

export const ENEMY_TIERS = {
    normal: { label: '', hpMul: 1.0, atkMul: 1.0, defMul: 1.0, exp: 60, silver: 80, weight: 0.75 },
    elite: { label: '精英', hpMul: 2.0, atkMul: 1.5, defMul: 1.3, exp: 150, silver: 200, weight: 0.20 },
    boss: { label: '頭目', hpMul: 3.0, atkMul: 2.0, defMul: 1.5, exp: 300, silver: 500, weight: 0.05 }
};

export function rollEnemyTier() {
    const roll = Math.random();
    let cumulative = 0;
    for (const [tier, cfg] of Object.entries(ENEMY_TIERS)) {
        cumulative += cfg.weight;
        if (roll < cumulative) return tier;
    }
    return 'normal';
}

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
        common: [{ id: 'leather', min: 2, max: 3, chance: 0.4 }],
        rare: [{ id: 'leather_armor', min: 1, max: 1, chance: 0.15 }],
        eliteGuaranteed: [{ id: 'leather', min: 3, max: 5 }],
        bossGuaranteed: [{ id: 'leather_armor', min: 1, max: 1 }, { id: 'waist_pendant', min: 1, max: 1 }]
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

export const ACHIEVEMENTS = {
    first_battle: { name: '初出茅廬', desc: '完成第一次戰鬥', reward: { silver: 100 } },
    veteran: { name: '百戰勇士', desc: '戰鬥 10 次', reward: { item: 'herb_potion', amount: 3 } },
    slayer: { name: '千人斬', desc: '擊敗 100 個敵人', reward: { title: '千人斬' } },
    collector: { name: '裝備收藏家', desc: '獲得 5 件不同裝備', reward: { item: 'ring', amount: 1 } },
    skill_master: { name: '技能大師', desc: '點滿一個武功的技能樹', reward: { item: 'jade_pendant', amount: 1 } }
};