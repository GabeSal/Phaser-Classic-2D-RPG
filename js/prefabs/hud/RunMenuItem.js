// RunMenuItem.js

// Run Menu Item is the menu item that allows the player 
// to have a chance of running away
var RPG = RPG || {};

RPG.RunMenuItem = function (game_state, name, position, properties) {
    "use strict";
    RPG.MenuItem.call(this, game_state, name, position, properties);
    
    // stores the run chance from the properties from battle.json
    this.run_chance = properties.run_chance;
};

RPG.RunMenuItem.prototype = Object.create(RPG.MenuItem.prototype);
RPG.RunMenuItem.prototype.constructor = RPG.RunMenuItem;

// select method calculates whether or not the player can 
// successfully run from the enemy encounter
RPG.RunMenuItem.prototype.select = function () {
    "use strict";
    // stores a random number
    var random_number = this.game_state.rnd.frac();
    // checks to see if the number is less than the run chance
    if (random_number < this.run_chance) {
        // sends player back to the world state
        this.game_state.back_to_world();
    } else {
        // otherwise they've wasted a turn
        this.game_state.next_turn();
    }
};