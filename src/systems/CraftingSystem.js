import { dataManager } from './DataManager.js';
import { RECIPES } from '../data/GameData.js';

class CraftingSystem {
    canCraft(recipeId) {
        const recipe = RECIPES[recipeId];
        if (!recipe) return false;

        const skills = dataManager.data.lifeSkills;
        const skillLevel = skills[recipe.skill]?.level || 1;
        if (skillLevel < recipe.levelRequired) return false;

        for (const mat in recipe.materials) {
            if (dataManager.getItemCount(mat) < recipe.materials[mat]) return false;
        }
        return true;
    }

    craft(recipeId) {
        if (!this.canCraft(recipeId)) return false;

        const recipe = RECIPES[recipeId];

        for (const mat in recipe.materials) {
            dataManager.removeItem(mat, recipe.materials[mat]);
        }

        dataManager.addItem(recipe.result, 1);

        const skillExp = 10 * recipe.levelRequired;
        dataManager.data.lifeSkills[recipe.skill].exp += skillExp;
        this.checkSkillLevelUp(recipe.skill);

        return true;
    }

    checkSkillLevelUp(skillId) {
        const skill = dataManager.data.lifeSkills[skillId];
        const expNeeded = skill.level * 100;
        if (skill.exp >= expNeeded && skill.level < 10) {
            skill.level++;
            skill.exp = 0;
            console.log(skillId + ' 等級提升到 ' + skill.level + '！');
        }
    }

    getRecipesBySkill(skillId) {
        return Object.entries(RECIPES)
            .filter(([_, r]) => r.skill === skillId)
            .map(([id, _]) => id);
    }
}

export const craftingSystem = new CraftingSystem();