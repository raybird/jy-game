extends Node

signal turn_ready(unit)

var units: Array = []
var current_turn_index: int = 0

func _process(delta):
    for unit in units:
        if not unit.has_method("get_is_enemy"):
            continue

        var is_enemy = unit.get_is_enemy()
        var speed = unit.get_stats().get("speed", 10) if unit.has_method("get_stats") else 10

        if unit.has_method("add_atb"):
            unit.add_atb(speed * delta * 0.1 * (1.0 if is_enemy else 1.0))

        if unit.has_method("get_atb") and unit.get_atb() >= 100:
            emit_signal("turn_ready", unit)

func add_unit(unit):
    if not unit in units:
        units.append(unit)

func remove_unit(unit):
    units.erase(unit)
    if current_turn_index >= units.size():
        current_turn_index = 0

func get_next_turn():
    var highest_atb = -1
    var next_unit = null

    for unit in units:
        if unit.has_method("get_atb"):
            var atb = unit.get_atb()
            if atb >= 100 and atb > highest_atb:
                highest_atb = atb
                next_unit = unit

    if next_unit and next_unit.has_method("reset_atb"):
        next_unit.reset_atb()

    return next_unit

func reset():
    for unit in units:
        if unit.has_method("reset_atb"):
            unit.reset_atb()
    units.clear()
    current_turn_index = 0