import { dataManager } from './DataManager.js';
import { SECTS, SKILL_COSTS } from '../data/GameData.js';
import { soundManager } from './SoundManager.js';

export const SECT_RANKS = [
    { name: '弟子', minRep: 0 },
    { name: '精英弟子', minRep: 300 },
    { name: '入室弟子', minRep: 1000 },
    { name: '護法', minRep: 2500 },
    { name: '掌門', minRep: 5000 },
];

class SectManager {
    getAvailableSects() {
        return Object.entries(SECTS).map(([key, sect]) => ({
            key, name: sect.name, map: sect.map,
            npcName: sect.npcName, npcX: sect.npcX, npcY: sect.npcY,
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
        soundManager.play('skill');
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
        dataManager.addKarma(-100);
        dataManager.addFame(-50);
        return { ok: true };
    }

    addReputation(amount) {
        if (!dataManager.data.player.sect) return;
        dataManager.data.player.sectReputation = Math.max(0, dataManager.data.player.sectReputation + amount);
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
        soundManager.play('levelup');
        return { ok: true, newLevel: entry.level };
    }

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

    getRank() {
        const rep = dataManager.data.player.sectReputation || 0;
        let rank = SECT_RANKS[0];
        for (const r of SECT_RANKS) {
            if (rep >= r.minRep) rank = r;
        }
        return rank;
    }

    donate(sectKey, silver, studyPoints) {
        const p = dataManager.data.player;
        if (p.sect !== sectKey) return { ok: false, reason: '非本門派' };
        if (silver > p.silver) return { ok: false, reason: '銀兩不足' };
        if (studyPoints > p.studyPoints) return { ok: false, reason: '學點不足' };
        p.silver -= silver;
        p.studyPoints -= studyPoints;
        const repGain = Math.floor(silver / 10) + studyPoints;
        p.sectReputation = (p.sectReputation || 0) + repGain;
        return { ok: true, repGain };
    }
}

export const sectManager = new SectManager();