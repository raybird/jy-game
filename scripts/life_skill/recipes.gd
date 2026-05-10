extends Node

var all_recipes = {
    "iron_sword": {
        "name": "铁剑",
        "type": "weapon",
        "skill": "smithing",
        "level_required": 1,
        "materials": {"iron_ore": 2},
        "result": "iron_sword",
        "stats": {"attack": 10}
    },
    "herb_potion": {
        "name": "草药水",
        "type": "consumable",
        "skill": "herbalism",
        "level_required": 1,
        "materials": {"herb": 3},
        "result": "herb_potion",
        "effect": {"hp": 50}
    },
    "leather_armor": {
        "name": "皮甲",
        "type": "armor",
        "skill": "tailoring",
        "level_required": 1,
        "materials": {"leather": 2},
        "result": "leather_armor",
        "stats": {"defense": 5}
    },
    "bronze_pickaxe": {
        "name": "青铜镐",
        "type": "tool",
        "skill": "smithing",
        "level_required": 2,
        "materials": {"bronze_ore": 3},
        "result": "bronze_pickaxe",
        "effect": {"mining_bonus": 1}
    }
}

func get_recipe(recipe_id: String) -> Dictionary:
    return all_recipes.get(recipe_id, {})

func get_recipes_by_skill(skill_id: String) -> Array:
    var result = []
    for recipe_id in all_recipes:
        if all_recipes[recipe_id]["skill"] == skill_id:
            result.append(recipe_id)
    return result