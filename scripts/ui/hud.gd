extends Control

@onready var player_hp_bar = $PlayerHPBar
@onready var player_mp_bar = $PlayerMPBar
@onready var silver_label = $SilverLabel
@onready var level_label = $LevelLabel
@onready var map_label = $MapLabel

func _ready():
    var gm = get_node("/root/GameManager")
    gm.state_changed.connect(_on_game_state_changed)
    update_ui()

func _on_game_state_changed(new_state):
    update_ui()

func _process(delta):
    if GameManager.current_state != GameManager.GameState.BATTLE:
        update_ui()

func update_ui():
    var dm = get_node("/root/DataManager")
    var hp = dm.player_data["hp"]
    var max_hp = dm.player_data["max_hp"]
    var mp = dm.player_data["mp"]
    var max_mp = dm.player_data["max_mp"]

    player_hp_bar.value = (float(hp) / max_hp) * 100
    player_mp_bar.value = (float(mp) / max_mp) * 100
    silver_label.text = str(dm.player_data["silver"]) + " 银子"
    level_label.text = "等级 " + str(dm.player_data["level"])
    map_label.text = GameManager.current_map