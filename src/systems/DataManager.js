// @ts-check

import { SKILL_TREE_CONFIG, ITEMS, ACHIEVEMENTS, INITIAL_PLAYER, FIVE_ATTRS, RECIPES, CRAFT_QUALITY } from '../data/GameData.js';
import { soundManager } from './SoundManager.js';

/** @typedef {import('../types.js').GameState} GameState */
/** @typedef {import('../types.js').PlayerData} PlayerData */
/** @typedef {import('../types.js').ItemUseResult} ItemUseResult */
/** @typedef {import('../types.js').CraftResult} CraftResult */
/** @typedef {import('../types.js').ActionResult} ActionResult */
/** @typedef {import('../types.js').FiveAttributes} FiveAttributes */
/** @typedef {import('../types.js').BattleBuff} BattleBuff */
/** @typedef {import('../types.js').ItemStat} ItemStat */

class DataManager {
    constructor() {
        /** @type {Record<string, number>} */
        this.gatheringCooldowns = {};
        /** @type {GameState} */
        this.data = {
            player: DataManager.defaultPlayer(),
            lifeSkills: {
                herbalism: { level: 1, exp: 0 },
                mining: { level: 1, exp: 0 },
                smithing: { level: 1, exp: 0 },
                tailoring: { level: 1, exp: 0 },
                alchemy: { level: 1, exp: 0 },
                cooking: { level: 1, exp: 0 },
                fishing: { level: 1, exp: 0 },
                farming: { level: 1, exp: 0 },
            },
            auction: { listings: [] },
            wallet: { transactions: [] },
            currentMap: 'xianyang',
            inBattle: false
        };
    }

    /**
     * @returns {PlayerData}
     */
    static defaultPlayer() {
        return {
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
            skillTree: [
                { nodes: [false, false, false] },
                { nodes: [false, false, false] },
                { nodes: [false, false, false] },
                { nodes: [false, false, false] }
            ],
            inventory: [],
            equipped: { weapon: null, armor: null, accessory: null },
            achievements: {},
            battleCount: 0,
            killCount: 0,
            titles: [],
            combatExp: 0,
            studyPoints: 0,
            fame: 0,
            karma: 0,
            sect: null,
            sectReputation: 0,
            martialArts: [],
            equippedSkills: [null, null, null, null],
            attributes: { str: 10, bra: 10, wis: 10, luk: 10, con: 10 },
            attributePoints: 50
        };
    }

    /**
     * @returns {PlayerData}
     */
    getPlayer() {
        return this.data.player;
    }

    resetPlayer() {
        this.data.player = DataManager.defaultPlayer();
    }

    /**
     * @param {string} charId
     * @param {{ str: number, con: number, agi: number, ip: number, baseHp: number, baseMp: number }} charData
     */
    setCharacter(charId, charData) {
        this.data.player.characterId = charId;
        this.data.player.strength = charData.str;
        this.data.player.constitution = charData.con;
        this.data.player.agility = charData.agi;
        this.data.player.innerPower = charData.ip;
        this.data.player.maxHp = charData.baseHp;
        this.data.player.hp = charData.baseHp;
        this.data.player.maxMp = charData.baseMp;
        this.data.player.mp = charData.baseMp;
    }

    /**
     * @param {string} itemId
     * @param {number} [amount=1]
     */
    addItem(itemId, amount = 1) {
        const inv = this.data.player.inventory;
        const existing = inv.find(i => i.id === itemId);
        if (existing) {
            existing.amount += amount;
        } else {
            inv.push({ id: itemId, amount });
        }
    }

    /**
     * @param {string} itemId
     * @param {number} [amount=1]
     * @returns {boolean}
     */
    removeItem(itemId, amount = 1) {
        const inv = this.data.player.inventory;
        const idx = inv.findIndex(i => i.id === itemId);
        if (idx !== -1) {
            inv[idx].amount -= amount;
            if (inv[idx].amount <= 0) inv.splice(idx, 1);
            return true;
        }
        return false;
    }

    /**
     * @param {string} itemId
     * @returns {ItemUseResult}
     */
    useItem(itemId) {
        const itemDef = ITEMS[itemId];
        if (!itemDef || itemDef.type !== 'consumable') return { ok: false, reason: '無法使用此物品' };
        if (this.getItemCount(itemId) <= 0) return { ok: false, reason: '物品數量不足' };

        this.removeItem(itemId, 1);

        const effect = itemDef.effect || {};
        const result = { ok: true, itemName: itemDef.name };

        if (effect.hp) result.hpRestore = effect.hp;
        if (effect.mp) result.mpRestore = effect.mp;
        if (effect.atkBuff) result.atkBuff = effect.atkBuff;
        if (effect.defBuff) result.defBuff = effect.defBuff;
        if (effect.hpRegenCombat) result.hpRegenCombat = effect.hpRegenCombat;

        return result;
    }

    /**
     * @param {string} itemId
     * @returns {number}
     */
    getItemCount(itemId) {
        const item = this.data.player.inventory.find(i => i.id === itemId);
        return item ? item.amount : 0;
    }

    /**
     * @param {number} amount
     */
    addSilver(amount) {
        this.data.player.silver += amount;
    }

    /**
     * @param {number} amount
     * @returns {boolean}
     */
    removeSilver(amount) {
        if (this.data.player.silver >= amount) {
            this.data.player.silver -= amount;
            return true;
        }
        return false;
    }

    checkLevelUp() {
        const p = this.data.player;
        const expNeeded = p.level * 100;
        while (p.exp >= expNeeded && p.level < 15) {
            p.exp -= expNeeded;
            p.level++;
            p.skillPoints += 3;
            soundManager.play('levelup');
            console.log(p.name + ' 等級提升到 ' + p.level + '！');
        }
    }

    checkAchievements() {
        const p = this.data.player;
        for (const [id, ach] of Object.entries(ACHIEVEMENTS)) {
            if (p.achievements[id]) continue;

            let unlock = false;
            if (id === 'first_battle' && p.battleCount >= 1) unlock = true;
            if (id === 'veteran' && p.battleCount >= 10) unlock = true;
            if (id === 'slayer' && p.killCount >= 100) unlock = true;
            if (id === 'collector') {
                const eq = p.equipped;
                const count = [eq.weapon, eq.armor, eq.accessory].filter(Boolean).length;
                if (count >= 3) unlock = true;
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

    /**
     * @param {number} skillIndex
     * @param {number} nodeIndex
     * @returns {boolean}
     */
    upgradeSkillNode(skillIndex, nodeIndex) {
        const p = this.data.player;
        const tree = p.skillTree;

        if (!tree[skillIndex]) return false;
        if (tree[skillIndex].nodes[nodeIndex]) return false;

        const cost = SKILL_TREE_CONFIG.nodeCosts[nodeIndex];
        if (p.skillPoints < cost) return false;

        p.skillPoints -= cost;
        tree[skillIndex].nodes[nodeIndex] = true;
        return true;
    }

    /**
     * @param {number} skillIndex
     * @param {number} nodeIndex
     * @returns {boolean}
     */
    canUpgradeNode(skillIndex, nodeIndex) {
        const p = this.data.player;
        const tree = p.skillTree;

        if (!tree[skillIndex]) return false;
        if (tree[skillIndex].nodes[nodeIndex]) return false;
        return p.skillPoints >= SKILL_TREE_CONFIG.nodeCosts[nodeIndex];
    }

    /**
     * @returns {ItemStat}
     */
    getBattleStats() {
        const equipped = this.data.player.equipped;
        const stats = { attack: 0, defense: 0, critBonus: 0, dmgReduction: 0, hpRegenCombat: 0, rageBoost: 1.0 };

        const slots = ['weapon', 'armor', 'accessory'];
        for (const slot of slots) {
            const itemId = equipped[slot];
            if (itemId && ITEMS[itemId] && ITEMS[itemId].battleStats) {
                const bs = ITEMS[itemId].battleStats;
                if (bs.attack) stats.attack += bs.attack;
                if (bs.defense) stats.defense += bs.defense;
                if (bs.critBonus) stats.critBonus += bs.critBonus;
                if (bs.dmgReduction) stats.dmgReduction = Math.min(0.5, stats.dmgReduction + bs.dmgReduction);
                if (bs.hpRegenCombat) stats.hpRegenCombat = Math.max(stats.hpRegenCombat, bs.hpRegenCombat);
                if (bs.rageBoost) stats.rageBoost = Math.max(stats.rageBoost, bs.rageBoost);
            }
        }
        return stats;
    }

    /**
     * @param {string} itemId
     * @returns {boolean}
     */
    equipItem(itemId) {
        const item = ITEMS[itemId];
        if (!item) return false;

        const typeMap = { weapon: 'weapon', armor: 'armor', accessory: 'accessory' };
        const slot = typeMap[item.type];
        if (!slot) return false;

        this.data.player.equipped[slot] = itemId;
        return true;
    }

    /**
     * @param {'weapon'|'armor'|'accessory'} slot
     */
    unequipItem(slot) {
        this.data.player.equipped[slot] = null;
    }

    /**
     * @returns {number}
     */
    getLevelExpRequirement() {
        return this.data.player.level * 200;
    }

    /**
     * @param {number} amount
     */
    addCombatExp(amount) {
        this.data.player.combatExp += amount;
        const required = this.getLevelExpRequirement();
        while (this.data.player.combatExp >= required) {
            this.data.player.combatExp -= required;
            this.data.player.level += 1;
            this.data.player.maxHp += 20;
            this.data.player.hp = this.data.player.maxHp;
            this.data.player.maxMp += 10;
            this.data.player.mp = this.data.player.maxMp;
        }
    }

    /**
     * @param {number} amount
     */
    addStudyPoints(amount) {
        this.data.player.studyPoints += Math.floor(amount);
    }

    /**
     * @param {number} amount
     */
    addFame(amount) {
        this.data.player.fame = Math.max(0, this.data.player.fame + amount);
    }

    /**
     * @param {number} amount
     */
    addKarma(amount) {
        this.data.player.karma = Math.max(-1000, Math.min(1000, this.data.player.karma + amount));
    }

    getKarmaTitle() {
        const k = this.data.player.karma;
        if (k >= 500) return '大俠';
        if (k >= 200) return '俠士';
        if (k > -200) return '中立';
        if (k > -500) return '惡徒';
        return '魔頭';
    }

    /**
     * @param {string} skillId
     * @param {number} amount
     */
    addLifeSkillExp(skillId, amount) {
        const skill = this.data.lifeSkills[skillId];
        if (!skill) return;
        skill.exp += amount;
        const expNeeded = skill.level * 100;
        while (skill.exp >= expNeeded) {
            skill.exp -= expNeeded;
            skill.level++;
        }
    }

    canGather(spotId) {
        const now = Date.now();
        const cd = this.gatheringCooldowns[spotId] || 0;
        return now >= cd;
    }

    /**
     * @param {string} spotId
     * @param {number} ms
     */
    setGatherCooldown(spotId, ms) {
        this.gatheringCooldowns[spotId] = Date.now() + ms;
    }

    /**
     * @param {string} recipeKey
     * @returns {CraftResult}
     */
    craftItem(recipeKey) {
        const recipe = RECIPES[recipeKey];
        if (!recipe) return { ok: false, reason: '配方不存在' };

        const skill = this.data.lifeSkills[recipe.skill];
        if (!skill || skill.level < recipe.levelRequired)
            return { ok: false, reason: `需要 ${recipe.skill} Lv.${recipe.levelRequired}` };

        for (const [matId, count] of Object.entries(recipe.materials)) {
            if (this.getItemCount(matId) < count)
                return { ok: false, reason: `材料不足: ${matId} x${count}` };
        }

        for (const [matId, count] of Object.entries(recipe.materials)) {
            this.removeItem(matId, count);
        }

        const roll = Math.random();
        let cum = 0, qualityIdx = 0;
        for (let i = 0; i < CRAFT_QUALITY.chances.length; i++) {
            cum += CRAFT_QUALITY.chances[i] + (skill.level * 0.01);
            if (roll < cum) { qualityIdx = i; break; }
        }
        const quality = CRAFT_QUALITY.tiers[qualityIdx];
        const statMul = CRAFT_QUALITY.statMultiplier[qualityIdx];

        this.addItem(recipe.result, 1);
        this.addLifeSkillExp(recipe.skill, 20 + skill.level * 5);

        return { ok: true, item: recipe.result, quality, statMul, recipeName: recipe.name };
    }

    /**
     * @returns {GameState}
     */
    getData() {
        return this.data;
    }

    /**
     * @param {GameState} data
     */
    setData(data) {
        this.data = data;
    }
}

export const dataManager = new DataManager();