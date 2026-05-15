import { dataManager } from './DataManager.js';
import { sectManager } from './SectManager.js';
import { soundManager } from './SoundManager.js';

class FusionSystem {
    canFuse() {
        const p = dataManager.data.player;
        const artCount = p.martialArts.length;
        if (artCount < 8) return { ok: false, reason: `需要至少 8 套武功（當前 ${artCount}）` };
        const highLevel = p.martialArts.filter(a => a.level >= 3);
        if (highLevel.length < 2) return { ok: false, reason: `需要至少 2 套 LV3+ 武功（當前 ${highLevel.length}）` };
        if (p.studyPoints < 500) return { ok: false, reason: `需要 500 學點（當前 ${p.studyPoints}）` };
        return { ok: true };
    }

    getFuseableArts() {
        return dataManager.data.player.martialArts.filter(a => a.level >= 3);
    }

    fuse(baseArtId, subArtId, customName) {
        const baseEntry = dataManager.data.player.martialArts.find(a => a.id === baseArtId);
        const subEntry = dataManager.data.player.martialArts.find(a => a.id === subArtId);
        if (!baseEntry || !subEntry) return { ok: false, reason: '武功不存在' };
        if (baseEntry.level < 3 || subEntry.level < 3) return { ok: false, reason: '需要 LV3+ 的武功' };

        const p = dataManager.data.player;
        if (p.studyPoints < 500) return { ok: false, reason: '學點不足' };

        const baseDef = sectManager.getArtDefinition(baseArtId);
        const subDef = sectManager.getArtDefinition(subArtId);
        if (!baseDef || !subDef) return { ok: false, reason: '武功資料缺失' };

        const newId = 'custom_' + Date.now();
        const newArt = this.generateFusedArt(baseDef, subDef, customName, newId);

        p.studyPoints -= 500;
        p.martialArts.push({ id: newId, level: 1, ...newArt });
        soundManager.play('levelup');

        return { ok: true, art: newArt };
    }

    generateFusedArt(base, sub, name, id) {
        const isUltimateCombo = base.tier === 'ultimate' && sub.tier === 'ultimate';
        const extraChance = isUltimateCombo && Math.random() < 0.3;

        let type, ratio;
        const effects = {};

        if (base.type === 'outer' && sub.type === 'outer') {
            type = 'outer';
            ratio = (base.ratio || 1.0) + (sub.ratio || 1.0) * 0.7 + (extraChance ? 1.0 : 0);
        } else if (base.type === 'inner' && sub.type === 'inner') {
            type = 'inner';
            ratio = (base.ratio || 1.0) + (sub.ratio || 1.0) * 0.7 + (extraChance ? 0.8 : 0);
            effects.aoe = true;
        } else {
            type = base.type;
            ratio = (base.ratio || 1.0) + (sub.ratio || 1.0) * 0.5 + (extraChance ? 0.5 : 0);
            if (base.status) effects.status = base.status;
            if (base.ignoreDef) effects.ignoreDef = base.ignoreDef;
        }

        const tierLabel = extraChance ? '絕世' : '融合';

        return {
            id, name: name || (tierLabel + '武功'), tier: 'custom', type,
            mp: Math.floor((base.mp || 12) + (sub.mp || 12) * 0.5),
            ratio: Math.round(ratio * 10) / 10,
            desc: `${base.name} + ${sub.name} 融合而成`,
            fromBase: base.id, fromSub: sub.id, ...effects,
        };
    }
}

export const fusionSystem = new FusionSystem();