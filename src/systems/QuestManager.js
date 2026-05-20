// @ts-check
import { dataManager } from './DataManager.js';
import { QUEST_TEMPLATES, ITEMS } from '../data/GameData.js';
import { soundManager } from './SoundManager.js';

class QuestManager {
    constructor() {
        this.activeQuests = [];
        this.completedQuests = [];
    }

    startQuest(templateId) {
        const template = QUEST_TEMPLATES[templateId];
        if (!template) return { ok: false, reason: '任務不存在' };
        if (this.activeQuests.length >= 5) return { ok: false, reason: '最多接 5 個任務' };
        if (this.activeQuests.find(q => q.id === templateId)) return { ok: false, reason: '已接此任務' };
        if (this.completedQuests.includes(templateId)) return { ok: false, reason: '已完成此任務' };

        const quest = JSON.parse(JSON.stringify(template));
        this.activeQuests.push(quest);
        return { ok: true, title: quest.title };
    }

    onKill(enemyId) {
        this.activeQuests.forEach(q => {
            q.objectives.forEach(obj => {
                if (obj.type === 'kill' && (obj.target === 'any' || obj.target === enemyId)) {
                    if (obj.current < obj.count) obj.current++;
                }
            });
        });
    }

    onCollect(itemId) {
        this.activeQuests.forEach(q => {
            q.objectives.forEach(obj => {
                if (obj.type === 'collect' && obj.target === itemId) {
                    if (obj.current < obj.count) {
                        const owned = dataManager.getItemCount(itemId);
                        obj.current = Math.min(owned, obj.count);
                    }
                }
            });
        });
    }

    onArriveMap(mapKey) {
        this.activeQuests.forEach(q => {
            q.objectives.forEach(obj => {
                if (obj.type === 'escort' && obj.target === mapKey) {
                    obj.current = 1;
                }
            });
        });
    }

    checkCompletion() {
        const completed = [];
        this.activeQuests.forEach(q => {
            if (this.isComplete(q)) completed.push(q);
        });
        completed.forEach(q => {
            this.completeQuest(q);
        });
    }

    isComplete(quest) {
        return quest.objectives.every(obj => obj.current >= obj.count);
    }

    completeQuest(quest) {
        this.activeQuests = this.activeQuests.filter(q => q.id !== quest.id);
        this.completedQuests.push(quest.id);

        const r = quest.rewards;
        if (r.silver) dataManager.addSilver(r.silver);
        if (r.studyPoints) dataManager.addStudyPoints(r.studyPoints);
        if (r.fame) dataManager.addFame(r.fame);
        if (r.karma) dataManager.addKarma(r.karma);
        if (r.sectRep) {
            dataManager.getPlayer().sectReputation = (dataManager.getPlayer().sectReputation || 0) + r.sectRep;
        }

        soundManager.play('levelup');
        return { ok: true, title: quest.title, rewards: r };
    }

    getActiveQuests() {
        return this.activeQuests;
    }

    abandonQuest(questId) {
        this.activeQuests = this.activeQuests.filter(q => q.id !== questId);
    }
}

export const questManager = new QuestManager();