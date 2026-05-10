extends Node

enum GameState { MENU, CHARACTER_SELECT, MAIN_CITY, EXPLORING, BATTLE, PAUSED }

var current_state = GameState.MENU
var current_map = ""
var in_combat = false
var current_enemy_id = ""

signal state_changed(new_state)

func _ready():
    add_to_group("GameManager")

func change_state(new_state: GameState):
    current_state = new_state
    state_changed.emit(new_state)

func _input(event):
    if event.is_action_pressed("ui_cancel"):
        if current_state == GameState.BATTLE:
            pass
        elif current_state == GameState.PAUSED:
            change_state(last_state)
        else:
            last_state = current_state
            change_state(GameState.PAUSED)

func start_new_game():
    var dm = get_node("/root/DataManager")
    dm.reset_player_data()
    change_state(GameState.MAIN_CITY)
    current_map = "xianyang"
    get_tree().change_scene_to_file("res://scenes/world/xianyang.tscn")

func continue_game():
    var ss = get_node("/root/SaveSystem")
    ss.load_game()
    change_state(GameState.MAIN_CITY)
    current_map = "xianyang"
    get_tree().change_scene_to_file("res://scenes/world/xianyang.tscn")

func enter_battle(enemy_id: String):
    in_combat = true
    current_enemy_id = enemy_id
    change_state(GameState.BATTLE)
    get_tree().change_scene_to_file("res://scenes/battle/battle.tscn")

func exit_battle():
    in_combat = false
    change_state(GameState.MAIN_CITY)
    get_tree().change_scene_to_file("res://scenes/world/" + current_map + ".tscn")

var last_state = GameState.MENU