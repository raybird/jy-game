extends Area2D

@export var target_map: String = "xianyang"
@export var target_position: Vector2 = Vector2(640, 500)

@onready var collision_shape = $CollisionShape2D

func _ready():
    body_entered.connect(_on_body_entered)

func _on_body_entered(body):
    if body.is_in_group("player"):
        _transition_to_map()

func _transition_to_map():
    var gm = get_node("/root/GameManager")
    gm.current_map = target_map
    get_tree().change_scene_to_file("res://scenes/world/" + target_map + ".tscn")