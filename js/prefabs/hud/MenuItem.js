// MenuItem.js

// Menu item assigns the select method to the menu item prefab
var RPG = RPG || {};

RPG.MenuItem = function (game_state, name, position, properties) {
    "use strict";
    RPG.Prefab.call(this, game_state, name, position, properties);
    
    // adds an input event when the menu_item is clicked by the player
    this.events.onInputDown.add(this.select, this);
};

RPG.MenuItem.prototype = Object.create(RPG.Prefab.prototype);
RPG.MenuItem.prototype.constructor = RPG.MenuItem;

// console shows the name of the menu_item selected
RPG.MenuItem.prototype.select = function () {
    "use strict";
    console.log(this.name + " selected");
};