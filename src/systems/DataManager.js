import { SKILL_TREE_CONFIG, ITEMS, ACHIEVEMENTS } from '../data/GameData.js';
import { soundManager } from './SoundManager.js';

class DataManager {
    constructor() {
        this.data = {
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
                titles: []
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
    }

    resetPlayer() {
        this.data.player = {
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
            titles: []
        };
    }

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

    addItem(itemId, amount = 1) {
        const inv = this.data.player.inventory;
        const existing = inv.find(i => i.id === itemId);
        if (existing) {
            existing.amount += amount;
        } else {
            inv.push({ id: itemId, amount });
        }
    }

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

    getItemCount(itemId) {
        const item = this.data.player.inventory.find(i => i.id === itemId);
        return item ? item.amount : 0;
    }

    addSilver(amount) {
        this.data.player.silver += amount;
    }

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

    canUpgradeNode(skillIndex, nodeIndex) {
        const p = this.data.player;
        const tree = p.skillTree;

        if (!tree[skillIndex]) return false;
        if (tree[skillIndex].nodes[nodeIndex]) return false;
        return p.skillPoints >= SKILL_TREE_CONFIG.nodeCosts[nodeIndex];
    }

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

    equipItem(itemId) {
        const item = ITEMS[itemId];
        if (!item) return false;

        const typeMap = { weapon: 'weapon', armor: 'armor', accessory: 'accessory' };
        const slot = typeMap[item.type];
        if (!slot) return false;

        this.data.player.equipped[slot] = itemId;
        return true;
    }

    unequipItem(slot) {
        this.data.player.equipped[slot] = null;
    }

    getData() {
        return this.data;
    }

    setData(data) {
        this.data = data;
    }
}

export const dataManager = new DataManager();