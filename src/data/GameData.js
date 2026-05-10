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
    quanzhen_disciple: { name: '全真弟子', hp: 50, attack: 10, defense: 2 },
    taoist: { name: '道士', hp: 70, attack: 15, defense: 3 },
    mingjiao_member: { name: '明教教徒', hp: 80, attack: 20, defense: 5 },
    persian: { name: '波斯人', hp: 100, attack: 25, defense: 8 }
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
    iron_sword: { name: '鐵劍', type: 'weapon' },
    herb_potion: { name: '草藥水', type: 'consumable' },
    leather_armor: { name: '皮甲', type: 'armor' },
    bronze_pickaxe: { name: '青銅鎬', type: 'tool' }
};

export const SKILL_NAMES = ['普通攻擊', '第一招式', '第二招式', '第三招式'];