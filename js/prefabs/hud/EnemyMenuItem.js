// EnemyMenuItem.js

// Enemy menu item shows all of the enemy targets
// the player can choose in the battlestate
var RPG = RPG || {};

RPG.EnemyMenuItem = function (game_state, name, position, properties) {
    "use strict";
    RPG.MenuItem.call(this, game_state, name, position, properties);
    
    // stores the enemy name
    this.enemy = this.game_state.prefabs[properties.enemy_name];
};

RPG.EnemyMenuItem.prototype = Object.create(RPG.MenuItem.prototype);
RPG.EnemyMenuItem.prototype.constructor = RPG.EnemyMenuItem;

// select method that passes the enemy name as 
// the target for the attack method
RPG.EnemyMenuItem.prototype.select = function () {
    "use strict";
    // calls the attack method and passes the enemy name
    this.game_state.current_attack.hit(this.enemy);
    // hide the enemy menu items
    this.game_state.prefabs.enemy_units_menu.enable(false);
};