extends Node

var player_data = {
    "name": "",
    "character_id": "",
    "level": 1,
    "exp": 0,
    "hp": 100,
    "max_hp": 100,
    "mp": 50,
    "max_mp": 50,
    "strength": 10,
    "constitution": 10,
    "agility": 10,
    "inner_power": 10,
    "skill_points": 3,
    "silver": 1000,
    "skills": [0, 0, 0, 0],
    "skill_exp": [0, 0, 0, 0],
    "inventory": [],
    "equipped": {
        "weapon": null,
        "armor": null,
        "accessory": null
    }
}

var life_skill_data = {
    "herbalism": {"level": 1, "exp": 0},
    "mining": {"level": 1, "exp": 0},
    "smithing": {"level": 1, "exp": 0},
    "tailoring": {"level": 1, "exp": 0}
}

var auction_data = {
    "listings": []
}

var wallet_data = {
    "transactions": []
}

func reset_player_data():
    player_data = {
        "name": "",
        "character_id": "",
        "level": 1,
        "exp": 0,
        "hp": 100,
        "max_hp": 100,
        "mp": 50,
        "max_mp": 50,
        "strength": 10,
        "constitution": 10,
        "agility": 10,
        "inner_power": 10,
        "skill_points": 3,
        "silver": 1000,
        "skills": [0, 0, 0, 0],
        "skill_exp": [0, 0, 0, 0],
        "inventory": [],
        "equipped": {
            "weapon": null,
            "armor": null,
            "accessory": null
        }
    }

func add_item(item_id: String, amount: int = 1):
    for slot in player_data["inventory"]:
        if slot["id"] == item_id:
            slot["amount"] += amount
            return
    player_data["inventory"].append({"id": item_id, "amount": amount})

func remove_item(item_id: String, amount: int = 1) -> bool:
    for i in range(player_data["inventory"].size()):
        if player_data["inventory"][i]["id"] == item_id:
            if player_data["inventory"][i]["amount"] >= amount:
                player_data["inventory"][i]["amount"] -= amount
                if player_data["inventory"][i]["amount"] <= 0:
                    player_data["inventory"].remove_at(i)
                return true
    return false

func get_item_count(item_id: String) -> int:
    for slot in player_data["inventory"]:
        if slot["id"] == item_id:
            return slot["amount"]
    return 0

func add_silver(amount: int):
    player_data["silver"] += amount

func remove_silver(amount: int) -> bool:
    if player_data["silver"] >= amount:
        player_data["silver"] -= amount
        return true
    return false

func check_level_up():
    var exp_needed = player_data["level"] * 100
    while player_data["exp"] >= exp_needed and player_data["level"] < 15:
        player_data["exp"] -= exp_needed
        player_data["level"] += 1
        player_data["skill_points"] += 3
        print(player_data["name"] + " level up to " + str(player_data["level"]) + "!")

func check_skill_level_up(skill_index: int):
    var skill_exp = player_data["skill_exp"][skill_index]
    var skill_level = player_data["skills"][skill_index]
    var max_level = player_data["level"] / 2
    if max_level < 1:
        max_level = 1

    var exp_needed = (skill_level + 1) * 50
    while skill_exp >= exp_needed and skill_level < max_level:
        skill_exp -= exp_needed
        player_data["skills"][skill_index] += 1
        print("Skill upgraded to Lv." + str(player_data["skills"][skill_index]) + "!")