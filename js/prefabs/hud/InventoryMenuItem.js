// InventoryMenuItem.js

// Inventory menu item displays the item from 
// the this.items object in the Inventory.js
var RPG = RPG || {};

RPG.InventoryMenuItem = function (game_state, name, position, properties) {
    "use strict";
    RPG.MenuItem.call(this, game_state, name, position, properties);
};

RPG.InventoryMenuItem.prototype = Object.create(RPG.MenuItem.prototype);
RPG.InventoryMenuItem.prototype.constructor = RPG.InventoryMenuItem;

// select method that hides the player action menu 
// when the menu item is selected by the player cursor
RPG.InventoryMenuItem.prototype.select = function () {
    "use strict";
    // check if there are any items in the inventory object
    if (this.game_state.game.inventory.has_items()){
        // hide the action menu
        this.game_state.prefabs.actions_menu.enable(false);
        // show the items in the item inventory
        this.game_state.prefabs.items_menu.enable(true);
    }
};