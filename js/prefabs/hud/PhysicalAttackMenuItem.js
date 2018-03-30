// PhysicalAttackMenuItem.js

// Physical attack menu item is a menu item prefab 
// that calls the player units attack method
var RPG = RPG || {};

RPG.PhysicalAttackMenuItem = function (game_state, name, position, properties) {
    "use strict";
    RPG.MenuItem.call(this, game_state, name, position, properties);
};

RPG.PhysicalAttackMenuItem.prototype = Object.create(RPG.MenuItem.prototype);
RPG.PhysicalAttackMenuItem.prototype.constructor = RPG.PhysicalAttackMenuItem;

// select method that calls the player physical attack method
RPG.PhysicalAttackMenuItem.prototype.select = function () {
    "use strict";
    // hide the actions menu
    this.game_state.prefabs.actions_menu.enable(false);
    // show the enemy_units menu to choose a target
    this.game_state.prefabs.enemy_units_menu.enable(true);
    
    // create a current_attack object from the PhysicalAttack class
    this.game_state.current_attack = new RPG.PhysicalAttack(this.game_state, this.game_state.current_unit.name + "_attack", {x: 0, y: 0}, {group: "attacks", owner: this.game_state.current_unit});
};