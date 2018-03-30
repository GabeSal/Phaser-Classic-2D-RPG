// ItemMenuItem.js

// Item menu item defines the what stats will be 
// affected when an item menu item is chosen
var RPG = RPG || {};

RPG.ItemMenuItem = function (game_state, name, position, properties) {
    "use strict";
    RPG.MenuItem.call(this, game_state, name, position, properties);
    
    // stores the item_name from the properties from the 
    // inventory in the party data
    this.item_name = properties.item_name;
};

RPG.ItemMenuItem.prototype = Object.create(RPG.MenuItem.prototype);
RPG.ItemMenuItem.prototype.constructor = RPG.ItemMenuItem;

// select method will check the name of the item 
// and call the appropriate use method
RPG.ItemMenuItem.prototype.select = function () {
    "use strict";
    // checks the inventory if the item exists in the inventory
    if (this.game_state.game.inventory.has_item(this.item_name)) {
        // hide the player action menu
        this.game_state.prefabs.items_menu.enable(false);
        
        // calls the use_item methods from the inventory class
        this.game_state.game.inventory.use_item(this.item_name, this.game_state.current_unit);
        
        // checks to see if there are no more instances of this item
        if(!this.game_state.game.inventory.has_item(this.item_name)) {
            // removes the item from the item menu
            this.kill();
        }
        // item_timer is created
        var item_timer = this.game_state.time.create();
        // defines the item_timer and then calls the next_turn method after it ends
        item_timer.add(1.05 * Phaser.Timer.SECOND, this.game_state.next_turn, this.game_state);
        // starts the item_timer
        item_timer.start();
    }
};