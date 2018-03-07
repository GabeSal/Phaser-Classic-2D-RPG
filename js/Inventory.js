var RPG = RPG || {};

RPG.Inventory = function () {
    "use strict";
    
    this.item_classes = {
        "health_potion": RPG.HealthPotion.prototype.constructor,
        "mana_potion": RPG.ManaPotion.prototype.constructor,
        "powerful_health_potion": RPG.PowerfulHealthPotion.prototype.constructor,
        "powerful_mana_potion": RPG.PowerfulManaPotion.prototype.constructor
    };
    
    this.items = {};
};

RPG.Inventory.prototype.collect_item = function (game_state, item_object) {
  "use strict";
    if (this.items[item_object.type]){
        this.items[item_object.type].amount++;
    } else {
        var item = new this.item_classes[item_object.type](game_state, item_object.type, {x: 0, y: 0}, item_object.properties);
        this.items[item_object.type] = {prefab: item, amount: 1};
    }
};

RPG.Inventory.prototype.create_menu = function (game_state, items_menu) {
    "use strict";
    var item_position = new Phaser.Point(items_menu.x, items_menu.y);
    for (var item_type in this.items) {
        var item_prefab = this.items[item_type].prefab;
        var item_amount = this.items[item_type].amount;
        var menu_item = new RPG.ItemMenuItem(game_state, item_type + "_menu_item", {x: item_position.x, y: item_position.y}, {group: "hud", texture: item_prefab.item_texture, item_name: item_type, amount: item_amount});
        items_menu.menu_items.push(menu_item);
        if (item_position.x < 375) {
            item_position.x += 50;
        } else {
            item_position.x = 175;
            item_position.y += 75;
        }
    }
    
    items_menu.enable(false);
};

RPG.Inventory.prototype.has_items = function () {
    "use strict";
    for (var item_type in this.items) {
        if (this.items[item_type].amount > 0) {
            return true;
        }
    }
    return false;
};

RPG.Inventory.prototype.has_item = function (item_type) {
    "use strict";
    return this.items[item_type].amount > 0;
};

RPG.Inventory.prototype.use_item = function (item_type, target) {
    "use strict";
    this.items[item_type].prefab.use(target);
    this.items[item_type].amount--;
};