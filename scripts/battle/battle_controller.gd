extends Node2D

@onready var atb_system = $ATBSystem
@onready var battle_log = $BattleLog
@onready var skill_bar = $SkillBar

var current_enemy_id: String = ""
var enemies: Array = []
var battle_active: bool = true

func _ready():
    var gm = get_node("/root/GameManager")
    current_enemy_id = gm.current_enemy_id

    atb_system.turn_ready.connect(_on_turn_ready)
    skill_bar.skill_selected.connect(_on_skill_selected)

    spawn_enemies()
    start_battle()

func spawn_enemies():
    var enemy_scene = load("res://scenes/battle/enemy.tscn")
    var enemy = enemy_scene.instantiate()
    enemy.set_enemy_id(current_enemy_id)
    enemy.position = Vector2(800, 300)
    add_child(enemy)
    enemies.append(enemy)
    atb_system.add_unit(enemy)

    var player = get_node_or_null("/root/Main/Player")
    if player:
        atb_system.add_unit(player)

func start_battle():
    battle_log.add_item("战斗开始！")

func _on_turn_ready(unit):
    if not battle_active:
        return

    if unit.has_method("is_player_unit") and unit.is_player_unit():
        var player = unit
        player.set_can_act(true)
        battle_log.add_item("轮到你了！")
    elif unit.has_method("get_is_enemy") and unit.get_is_enemy():
        execute_enemy_turn(unit)

func execute_enemy_turn(enemy):
    if not battle_active:
        return

    await get_tree().create_timer(0.8).timeout

    if not is_instance_valid(enemy) or not battle_active:
        return

    var damage = randi() % 20 + 10
    var player = get_node_or_null("/root/Main/Player")
    if player and player.has_method("take_damage"):
        player.take_damage(damage)
        battle_log.add_item(enemy.get_name() + " 攻击造成 " + str(damage) + " 伤害！")

    if player and player.has_method("get_hp") and player.get_hp() <= 0:
        end_battle(false)
        return

    atb_system.get_next_turn()

func _on_skill_selected(skill_index: int):
    if not battle_active:
        return

    var player = get_node_or_null("/root/Main/Player")
    if not player or not player.has_method("use_skill"):
        return

    var success = player.use_skill(skill_index, enemies)
    if success:
        battle_log.add_item("你使用了技能 " + str(skill_index + 1) + "！")
        check_battle_end()
    else:
        battle_log.add_item("MP不足或技能冷却中！")

    atb_system.get_next_turn()

func check_battle_end():
    var all_dead = true
    for enemy in enemies:
        if is_instance_valid(enemy) and enemy.has_method("get_hp") and enemy.get_hp() > 0:
            all_dead = false
            break

    if all_dead:
        end_battle(true)
        return

    var player = get_node_or_null("/root/Main/Player")
    if player and player.has_method("get_hp") and player.get_hp() <= 0:
        end_battle(false)

func end_battle(victory: bool):
    if not battle_active:
        return
    battle_active = false

    if victory:
        battle_log.add_item("战斗胜利！")
        var dm = get_node("/root/DataManager")
        var exp_gained = 50
        var silver_gained = 100
        dm.player_data["exp"] += exp_gained
        dm.add_silver(silver_gained)
        dm.check_level_up()
        battle_log.add_item("获得 " + str(exp_gained) + " 经验，" + str(silver_gained) + " 银子")

        if randf() < 0.3:
            var items = ["iron_ore", "herb", "leather", "bronze_ore"]
            var item_id = items[randi() % items.size()]
            dm.add_item(item_id, randi() % 3 + 1)
            battle_log.add_item("获得材料！")

        var ss = get_node("/root/SaveSystem")
        ss.save_game()
    else:
        battle_log.add_item("战斗失败...")

    await get_tree().create_timer(2.0).timeout
    get_node("/root/GameManager").exit_battle()