extends Control

@onready var listings = $VBoxContainer/Listings
@onready var list_button = $VBoxContainer/ListingButton
@onready var player_inv = $InventoryPanel

var current_listings: Array = []

func _ready():
    refresh_listings()
    listings.item_selected.connect(_on_listing_clicked)
    list_button.pressed.connect(show_listing_panel)

func refresh_listings():
    listings.clear()
    var dm = get_node("/root/DataManager")
    current_listings = dm.auction_data["listings"]

    for listing in current_listings:
        var item_name = listing["item_id"]
        var price = listing["price"]
        var seller = listing["seller"]
        listings.add_item(item_name + " - " + str(price) + " 银子 [" + seller + "]")

func _on_listing_clicked(index: int):
    if index >= current_listings.size():
        return
    var listing = current_listings[index]
    var dm = get_node("/root/DataManager")

    if listing["seller"] == dm.player_data["name"]:
        listings.add_item("不能购买自己的物品！")
        return

    if dm.player_data["silver"] >= listing["price"]:
        dm.remove_silver(listing["price"])
        dm.add_item(listing["item_id"], 1)
        current_listings.remove_at(index)
        dm.auction_data["listings"] = current_listings
        refresh_listings()
        listings.add_item("购买成功！")
    else:
        listings.add_item("银子不足！")

func show_listing_panel():
    player_inv.visible = true

func _on_list_item_selected(item_id: String, price: int):
    var dm = get_node("/root/DataManager")
    var new_listing = {
        "item_id": item_id,
        "price": price,
        "seller": dm.player_data["name"]
    }
    current_listings.append(new_listing)
    dm.auction_data["listings"] = current_listings
    refresh_listings()
    player_inv.visible = false