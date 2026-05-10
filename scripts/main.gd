extends Control

@onready var title_label = $TitleLabel
@onready var new_game_btn = $VBoxContainer/NewGameButton
@onready var continue_btn = $VBoxContainer/ContinueButton
@onready var character_select = $CharacterSelectPanel
@onready var name_input = $CharacterSelectPanel/VBoxContainer/NameInput
@onready var character_buttons = $CharacterSelectPanel/VBoxContainer/CharacterGrid

var characters = {
    "guojing": {"name": "郭靖", "desc": "防御型，血量高", "base_hp": 150, "base_mp": 50, "str": 15, "con": 15, "agi": 8, "ip": 10},
    "yangguo": {"name": "杨过", "desc": "暴击型，会心率高", "base_hp": 100, "base_mp": 60, "str": 12, "con": 10, "agi": 15, "ip": 12},
    "xiaolongnu": {"name": "小龙女", "desc": "速度型，ATB充能快", "base_hp": 90, "base_mp": 80, "str": 8, "con": 8, "agi": 18, "ip": 15},
    "zhangwuji": {"name": "张无忌", "desc": "法术型，范围攻击", "base_hp": 110, "base_mp": 100, "str": 10, "con": 12, "agi": 10, "ip": 18},
    "linghu": {"name": "令狐冲", "desc": "均衡型，适用性广", "base_hp": 120, "base_mp": 70, "str": 12, "con": 12, "agi": 12, "ip": 12}
}

var selected_character: String = "guojing"

func _ready():
    new_game_btn.pressed.connect(_on_new_game_pressed)
    continue_btn.pressed.connect(_on_continue_pressed)
    character_select.visible = false

    if not SaveSystem.has_save():
        continue_btn.disabled = true
    else:
        continue_btn.disabled = false

    _setup_character_buttons()

func _setup_character_buttons():
    for char_id in characters:
        var btn = Button.new()
        btn.text = characters[char_id]["name"]
        btn.connect("pressed", Callable(self, "_on_character_selected").bind(char_id))
        character_buttons.add_child(btn)

func _on_new_game_pressed():
    character_select.visible = true

func _on_continue_pressed():
    GameManager.continue_game()

func _on_character_selected(char_id: String):
    selected_character = char_id
    var name = name_input.text.strip_edges()
    if name == "":
        name = characters[char_id]["name"]

    var dm = get_node("/root/DataManager")
    dm.player_data["character_id"] = selected_character
    dm.player_data["name"] = name

    var char_data = characters[selected_character]
    dm.player_data["strength"] = char_data["str"]
    dm.player_data["constitution"] = char_data["con"]
    dm.player_data["agility"] = char_data["agi"]
    dm.player_data["inner_power"] = char_data["ip"]
    dm.player_data["hp"] = char_data["base_hp"]
    dm.player_data["max_hp"] = char_data["base_hp"]
    dm.player_data["mp"] = char_data["base_mp"]
    dm.player_data["max_mp"] = char_data["base_mp"]

    GameManager.start_new_game()