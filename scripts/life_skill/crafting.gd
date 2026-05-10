extends Node

func can_craft(recipe_id: String) -> bool:
    var recipes = get_node("/root/LifeSkillRecipes")
    var recipe = recipes.get_recipe(recipe_id)
    if recipe.is_empty():
        return false

    var dm = get_node("/root/DataManager")
    var skill_level = dm.life_skill_data[recipe.skill]["level"]
    if skill_level < recipe.level_required:
        return false

    for material_id in recipe.materials:
        var needed = recipe.materials[material_id]
        if not has_material(material_id, needed):
            return false

    return true

func has_material(material_id: String, amount: int) -> bool:
    var dm = get_node("/root/DataManager")
    for slot in dm.player_data["inventory"]:
        if slot["id"] == material_id:
            return slot["amount"] >= amount
    return false

func craft(recipe_id: String) -> bool:
    if not can_craft(recipe_id):
        return false

    var recipes = get_node("/root/LifeSkillRecipes")
    var recipe = recipes.get_recipe(recipe_id)
    var dm = get_node("/root/DataManager")

    for material_id in recipe.materials:
        dm.remove_item(material_id, recipe.materials[material_id])

    dm.add_item(recipe.result, 1)

    var skill_exp = 10 * recipe.level_required
    dm.life_skill_data[recipe.skill]["exp"] += skill_exp
    check_skill_level_up(recipe.skill)

    return true

func check_skill_level_up(skill_id: String):
    var dm = get_node("/root/DataManager")
    var exp = dm.life_skill_data[skill_id]["exp"]
    var level = dm.life_skill_data[skill_id]["level"]
    var exp_needed = level * 100

    if exp >= exp_needed and level < 10:
        dm.life_skill_data[skill_id]["level"] += 1
        dm.life_skill_data[skill_id]["exp"] = 0