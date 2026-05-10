extends Area2D

@export var npc_id: String = ""
@export var dialog: String = "..."

@onready var collision_shape = $CollisionShape2D
@onready var label = $Label
@onready var interaction_prompt = $InteractionPrompt

var player_nearby: bool = false

func _ready():
    body_entered.connect(_on_body_entered)
    body_exited.connect(_on_body_exited)

    if label:
        label.text = npc_id

    if interaction_prompt:
        interaction_prompt.hide()

func _process(delta):
    if player_nearby and Input.is_action_just_pressed("interact"):
        _show_dialog()

    if interaction_prompt:
        interaction_prompt.visible = player_nearby

func _on_body_entered(body):
    if body.is_in_group("player"):
        player_nearby = true

func _on_body_exited(body):
    if body.is_in_group("player"):
        player_nearby = false

func _show_dialog():
    var gm = get_node("/root/GameManager")
    var current_scene = get_tree().current_scene

    if current_scene.has_method("_on_npc_interact"):
        current_scene._on_npc_interact(npc_id)
    else:
        print("NPC " + npc_id + " : " + dialog)

func get_npc_id() -> String:
    return npc_id