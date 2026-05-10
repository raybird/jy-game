extends CharacterBody2D

@export var enemy_id: String = ""
@export var enemy_name: String = "敌人"

@onready var sprite = $Sprite2D
@onready var hp_bar = $HPBar
@onready var name_label = $NameLabel

var hp: int = 50
var max_hp: int = 50
var attack: int = 10
var defense: int = 0
var atb: float = 0.0

var enemy_data = {
    "quanzhen_disciple": {"name": "全真弟子", "hp": 50, "attack": 10, "defense": 2},
    "taoist": {"name": "道士", "hp": 70, "attack": 15, "defense": 3},
    "mingjiao_member": {"name": "明教教徒", "hp": 80, "attack": 20, "defense": 5},
    "persian": {"name": "波斯人", "hp": 100, "attack": 25, "defense": 8}
}

func _ready():
    if enemy_id == "":
        enemy_id = "quanzhen_disciple"
    load_enemy_data()
    if name_label:
        name_label.text = enemy_name
    if hp_bar:
        hp_bar.max_value = max_hp
        hp_bar.value = hp

func set_enemy_id(id: String):
    enemy_id = id
    load_enemy_data()
    if name_label:
        name_label.text = enemy_name
    if hp_bar:
        hp_bar.max_value = max_hp
        hp_bar.value = hp

func load_enemy_data():
    var data = enemy_data.get(enemy_id, enemy_data["quanzhen_disciple"])
    enemy_name = data.name
    max_hp = data.hp
    attack = data.attack
    defense = data.defense
    hp = max_hp

func get_is_enemy() -> bool:
    return true

func get_atb() -> float:
    return atb

func add_atb(amount: float):
    atb += amount

func reset_atb():
    atb = 0.0

func get_hp() -> int:
    return hp

func get_stats() -> Dictionary:
    return {"speed": 8, "attack": attack}

func take_damage(amount: int) -> int:
    var actual_damage = max(1, amount - defense)
    hp -= actual_damage
    if hp < 0:
        hp = 0
    if hp_bar:
        hp_bar.value = hp
    if hp <= 0:
        queue_free()
    return actual_damage

func is_player_unit() -> bool:
    return false