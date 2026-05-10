extends Area2D

@export var item_id: String = "chest_item"
@export var is_opened: bool = false

@onready var collision_shape = $CollisionShape2D
@onready var sprite = $Sprite2D
@onready var label = $Label

func _ready():
    body_entered.connect(_on_body_entered)

    if is_opened and sprite:
        sprite.modulate = Color(0.5, 0.5, 0.5, 0.5)

func _on_body_entered(body):
    if not body.is_in_group("player"):
        return

    if is_opened:
        return

    _open_chest()

func _open_chest():
    is_opened = true
    if sprite:
        sprite.modulate = Color(0.5, 0.5, 0.5, 0.5)

    var dm = get_node("/root/DataManager")
    dm.add_item(item_id, 1)

    if label:
        label.text = "已开启"
        label.visible = true

    print("获得物品: " + item_id)