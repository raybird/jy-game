extends Node

const SAVE_PATH = "user://save/"

func _ready():
    DirAccess.make_dir_recursive_absolute(SAVE_PATH)

func save_game():
    var dm = get_node("/root/DataManager")

    var player_file = FileAccess.open(SAVE_PATH + "player_save.json", FileAccess.WRITE)
    if player_file:
        player_file.store_line(JSON.stringify(dm.player_data, JSON.SEPARATOR_INDENT))
        player_file.close()

    var skills_file = FileAccess.open(SAVE_PATH + "skills_save.json", FileAccess.WRITE)
    if skills_file:
        skills_file.store_line(JSON.stringify(dm.life_skill_data, JSON.SEPARATOR_INDENT))
        skills_file.close()

    var auction_file = FileAccess.open(SAVE_PATH + "auction_save.json", FileAccess.WRITE)
    if auction_file:
        auction_file.store_line(JSON.stringify(dm.auction_data, JSON.SEPARATOR_INDENT))
        auction_file.close()

    var wallet_file = FileAccess.open(SAVE_PATH + "wallet_save.json", FileAccess.WRITE)
    if wallet_file:
        wallet_file.store_line(JSON.stringify(dm.wallet_data, JSON.SEPARATOR_INDENT))
        wallet_file.close()

    print("Game saved!")

func load_game():
    var dm = get_node("/root/DataManager")

    var player_file = FileAccess.open(SAVE_PATH + "player_save.json", FileAccess.READ)
    if player_file:
        var json_str = player_file.get_as_text()
        var json = JSON.new()
        if json.parse(json_str) == OK:
            dm.player_data = json.get_data()
        player_file.close()

    var skills_file = FileAccess.open(SAVE_PATH + "skills_save.json", FileAccess.READ)
    if skills_file:
        var json_str = skills_file.get_as_text()
        var json = JSON.new()
        if json.parse(json_str) == OK:
            dm.life_skill_data = json.get_data()
        skills_file.close()

    var auction_file = FileAccess.open(SAVE_PATH + "auction_save.json", FileAccess.READ)
    if auction_file:
        var json_str = auction_file.get_as_text()
        var json = JSON.new()
        if json.parse(json_str) == OK:
            dm.auction_data = json.get_data()
        auction_file.close()

    var wallet_file = FileAccess.open(SAVE_PATH + "wallet_save.json", FileAccess.READ)
    if wallet_file:
        var json_str = wallet_file.get_as_text()
        var json = JSON.new()
        if json.parse(json_str) == OK:
            dm.wallet_data = json.get_data()
        wallet_file.close()

    print("Game loaded!")

func has_save() -> bool:
    return FileAccess.file_exists(SAVE_PATH + "player_save.json")

func delete_save():
    if FileAccess.file_exists(SAVE_PATH + "player_save.json"):
        DirAccess.remove_absolute(SAVE_PATH + "player_save.json")
    if FileAccess.file_exists(SAVE_PATH + "skills_save.json"):
        DirAccess.remove_absolute(SAVE_PATH + "skills_save.json")
    if FileAccess.file_exists(SAVE_PATH + "auction_save.json"):
        DirAccess.remove_absolute(SAVE_PATH + "auction_save.json")
    if FileAccess.file_exists(SAVE_PATH + "wallet_save.json"):
        DirAccess.remove_absolute(SAVE_PATH + "wallet_save.json")
    print("Save deleted!")