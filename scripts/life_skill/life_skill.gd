extends Control

@export var skill_to_learn: String = ""

@onready var skill_list = $VBoxContainer/SkillList
@onready var craft_button = $VBoxContainer/CraftButton

var crafting_scene = preload("res://scenes/ui/crafting.tscn")

func _ready():
    refresh_skill_list()
    craft_button.pressed.connect(_on_craft_pressed)

func refresh_skill_list():
    skill_list.clear()
    var dm = get_node("/root/DataManager")

    var skills = ["herbalism", "mining", "smithing", "tailoring"]
    var skill_names = {"herbalism": "采药", "mining": "采矿", "smithing": "铸造", "tailoring": "缝纫"}

    for skill in skills:
        var level = dm.life_skill_data[skill]["level"]
        var exp = dm.life_skill_data[skill]["exp"]
        var exp_needed = level * 100
        skill_list.add_item(skill_names[skill] + " Lv." + str(level) + " (" + str(exp) + "/" + str(exp_needed) + ")")

func _on_craft_pressed():
    var panel = crafting_scene.instantiate()
    add_child(panel)