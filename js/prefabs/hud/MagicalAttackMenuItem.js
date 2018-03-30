// MagicalAttackMenuItem.js

// Magical attack menu item is a menu item prefab 
// that calls the player units attack method
var RPG = RPG || {};

RPG.MagicalAttackMenuItem = function (game_state, name, position, properties) {
    "use strict";
    RPG.MenuItem.call(this, game_state, name, position, properties);
    
    // defines the cost of mana everytime 
    // the player uses a magic attack
    this.MANA_COST = 5;
};

RPG.MagicalAttackMenuItem.prototype = Object.create(RPG.MenuItem.prototype);
RPG.MagicalAttackMenuItem.prototype.constructor = RPG.MagicalAttackMenuItem;

// select method that calls the player magical attack method
RPG.MagicalAttackMenuItem.prototype.select = function () {
    "use strict";
    // checks the player unit to see if they still have sufficient amounts of mana
    if (this.game_state.current_unit.stats.mana >= this.MANA_COST) {
        // hide the actions menu
        this.game_state.prefabs.actions_menu.enable(false);
        // show the enemy_units menu to choose a target
        this.game_state.prefabs.enemy_units_menu.enable(true);
        
        // create a current_attack object from the MagicalAttack class
        this.game_state.current_attack = new RPG.MagicalAttack(this.game_state, this.game_state.current_unit.name + "_attack", {x: 0, y: 0}, {group: "attacks", owner: this.game_state.current_unit, mana_cost: this.MANA_COST});
    }
};