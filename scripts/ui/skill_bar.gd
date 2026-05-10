extends HBoxContainer

signal skill_selected(index: int)

@onready var skill_buttons: Array = []

func _ready():
    skill_buttons = [$Skill1, $Skill2, $Skill3, $Skill4]

    for i in range(4):
        if skill_buttons[i]:
            skill_buttons[i].pressed.connect(_on_skill_button_pressed.bind(i))

func _on_skill_button_pressed(index: int):
    skill_selected.emit(index)

func update_skills(skills_data: Array):
    for i in range(min(4, skills_data.size())):
        if skill_buttons[i]:
            var skill_name = skills_data[i].get("name", "技能" + str(i + 1))
            skill_buttons[i].text = skill_name
            skill_buttons[i].disabled = false