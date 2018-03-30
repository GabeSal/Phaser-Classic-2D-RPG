// Menu.js

// Menu displays all of the items/actions the player can interact with
var RPG = RPG || {};

RPG.Menu = function(game_state, name, position, properties) {
    "use strict";    
    RPG.Prefab.call(this, game_state, name, position, properties);
    
    // empty array used to contain the menu items
    this.menu_items = [];
    // for loop that iterates through all of the menu items in properties in the battle json data
    for (var menu_item_name in properties.menu_items) {
        // new_item creates a prefab of the menu_item and stores it in a temp variable
        var new_item = this.game_state.create_prefab(menu_item_name, properties.menu_items[menu_item_name]);
        // pushes the new_item in the menu_items array
        this.menu_items.push(new_item);
    }
    
    // hide the menu_item
    this.enable(false);
};

RPG.Menu.prototype = Object.create(RPG.Prefab.prototype);
RPG.Menu.prototype.constructor = RPG.Menu;

// enable displays and positions the menu_items array
RPG.Menu.prototype.enable = function(enable) {
    "use strict";
    // forEach function that iterates through the menu_items 
    // and enables their player input and visibility
    this.menu_items.forEach(function(menu_item) {
        if(menu_item.alive) {
            menu_item.inputEnabled = enable;
            menu_item.visible = enable;
        }
    }, this);
};
