extends Node2D

@export var map_name: String = "地图"
@export var map_description: String = ""

var encounter_rate: float = 0.01

func _ready():
    var gm = get_node("/root/GameManager")
    current_map = gm.current_map

    player_spawn_position = Vector2(640, 500)

func _on_npc_interact(npc_id: String):
    match npc_id:
        "smith":
            _show_life_skill_panel("smithing")
        "auction":
            _show_auction_panel()
        "herbalist":
            _show_life_skill_panel("herbalism")
        "miner":
            _show_life_skill_panel("mining")
        "tailor":
            _show_life_skill_panel("tailoring")

func _show_life_skill_panel(skill_id: String):
    var scene = load("res://scenes/ui/life_skill.tscn")
    var panel = scene.instantiate()
    add_child(panel)

func _show_auction_panel():
    var scene = load("res://scenes/ui/auction.tscn")
    var panel = scene.instantiate()
    add_child(panel)