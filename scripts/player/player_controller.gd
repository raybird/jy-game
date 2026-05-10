extends CharacterBody2D

@export var speed: float = 200.0
@export var character_id: String = "guojing"

var player_name: String = "侠客"
var hp: int = 100
var max_hp: int = 100
var mp: int = 50
var max_mp: int = 50
var atb: float = 0.0
var can_act: bool = false
var is_in_battle: bool = false

var stats: Dictionary = {
    "strength": 10,
    "constitution": 10,
    "agility": 10,
    "inner_power": 10,
    "speed": 10
}

var skill_cooldowns: Array = [0.0, 0.0, 0.0, 0.0]
var skills: Array = []

var character_stats = {
    "guojing": {"hp": 150, "mp": 50, "strength": 15, "constitution": 15, "agility": 8, "inner_power": 10, "speed": 8},
    "yangguo": {"hp": 100, "mp": 60, "strength": 12, "constitution": 10, "agility": 15, "inner_power": 12, "speed": 12},
    "xiaolongnu": {"hp": 90, "mp": 80, "strength": 8, "constitution": 8, "agility": 18, "inner_power": 15, "speed": 15},
    "zhangwuji": {"hp": 110, "mp": 100, "strength": 10, "constitution": 12, "agility": 10, "inner_power": 18, "speed": 8},
    "linghu": {"hp": 120, "mp": 70, "strength": 12, "constitution": 12, "agility": 12, "inner_power": 12, "speed": 12}
}

func _ready():
    add_to_group("player")
    load_character_data()
    initialize_skills()

func load_character_data():
    var dm = get_node("/root/DataManager")
    character_id = dm.player_data["character_id"]
    player_name = dm.player_data["name"]

    var base_stats = character_stats.get(character_id, character_stats["guojing"])
    stats.strength = dm.player_data["strength"]
    stats.constitution = dm.player_data["constitution"]
    stats.agility = dm.player_data["agility"]
    stats.inner_power = dm.player_data["inner_power"]

    max_hp = base_stats.hp + (dm.player_data["constitution"] - 10) * 5
    max_mp = base_stats.mp + (dm.player_data["inner_power"] - 10) * 3

    var saved_hp = dm.player_data["hp"]
    var saved_mp = dm.player_data["mp"]
    hp = saved_hp if saved_hp > 0 and saved_hp <= max_hp else max_hp
    mp = saved_mp if saved_mp > 0 and saved_mp <= max_mp else max_mp

func initialize_skills():
    skills = []
    var skill_names = ["普通攻击", "第一招式", "第二招式", "第三招式"]
    var base_damage = 10 + stats.strength - 10

    for i in range(4):
        var skill_data = {
            "name": skill_names[i],
            "mp_cost": 10 + i * 5,
            "damage": base_damage + i * 8,
            "cooldown": 0.0
        }
        skills.append(skill_data)

func _physics_process(delta):
    var gm = get_node("/root/GameManager")
    if gm.current_state == gm.GameState.BATTLE:
        return

    var direction = Vector2.ZERO
    if Input.is_action_pressed("move_up"):
        direction.y -= 1
    if Input.is_action_pressed("move_down"):
        direction.y += 1
    if Input.is_action_pressed("move_left"):
        direction.x -= 1
    if Input.is_action_pressed("move_right"):
        direction.x += 1

    if direction != Vector2.ZERO:
        direction = direction.normalized()
        velocity = direction * speed
    else:
        velocity = Vector2.ZERO

    move_and_slide()

    var dm = get_node("/root/DataManager")
    dm.player_data["hp"] = hp
    dm.player_data["mp"] = mp

func get_is_enemy() -> bool:
    return false

func get_atb() -> float:
    return atb

func add_atb(amount: float):
    atb += amount

func reset_atb():
    atb = 0.0

func get_hp() -> int:
    return hp

func get_max_hp() -> int:
    return max_hp

func get_stats() -> Dictionary:
    return stats

func is_player_unit() -> bool:
    return true

func set_can_act(value: bool):
    can_act = value

func get_can_act() -> bool:
    return can_act

func take_damage(amount: int) -> int:
    var dm = get_node("/root/DataManager")
    var defense_bonus = 0
    if dm.player_data["equipped"]["armor"] != null:
        defense_bonus = 5

    var actual_damage = max(1, amount - defense_bonus)
    hp -= actual_damage
    dm.player_data["hp"] = hp

    if hp <= 0:
        hp = 0
        die()

    return actual_damage

func heal(amount: int):
    hp = min(hp + amount, max_hp)

func use_skill(skill_index: int, targets: Array) -> bool:
    if skill_index < 0 or skill_index >= skills.size():
        return false

    var skill = skills[skill_index]

    if mp < skill.mp_cost:
        return false

    if skill_cooldowns[skill_index] > 0:
        return false

    mp -= skill.mp_cost
    skill_cooldowns[skill_index] = skill.cooldown

    var damage = skill.damage
    for target in targets:
        if target.has_method("take_damage"):
            target.take_damage(damage)

    return true

func die():
    var gm = get_node("/root/GameManager")
    if gm.in_combat:
        hp = max_hp
        dm.player_data["hp"] = hp
        gm.exit_battle()

func _process(delta):
    for i in range(skill_cooldowns.size()):
        if skill_cooldowns[i] > 0:
            skill_cooldowns[i] -= delta