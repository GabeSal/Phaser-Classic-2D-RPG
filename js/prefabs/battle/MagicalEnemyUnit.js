// MagicalEnemyUnit.js

// Magical Enemy Unit handles the attacks of the magical enemy unit
var RPG = RPG || {};

RPG.MagicalEnemyUnit = function (game_state, name, position, properties) {
    "use strict";    
    RPG.Unit.call(this, game_state, name, position, properties);
    
    // declares the type of attack
    this.magic_attack = new RPG.MagicalAttack(this.game_state, this.name + "_attack", {x: 0, y: 0}, {group: "attacks", owner: this});
};

RPG.MagicalEnemyUnit.prototype = Object.create(RPG.Unit.prototype);
RPG.MagicalEnemyUnit.prototype.constructor = RPG.MagicalEnemyUnit;

// kill method that destroys the sprite and 
// enemy menu_item after the enemy health reaches 0
RPG.MagicalEnemyUnit.prototype.kill = function () {
    "use strict";
    // copies the kill method from Phaser.Sprite
    Phaser.Sprite.prototype.kill.call(this);
    // store the enemy menu item from the prefabs group
    var menu_item = this.game_state.prefabs[this.name + "_item"];
    // kill the menu item
    menu_item.kill();
};

// act calls the hit method and chooses a target from the player units
RPG.MagicalEnemyUnit.prototype.act = function () {
    "use strict";
    var target;
    
    // hide the player action menu
    this.game_state.prefabs.show_player_status.show(false);
    
    // chooses a target
    target = this.choose_target();
    // target takes damage from the hit method
    this.magic_attack.hit(target);
};

// choose_target randomly chooses a target from the player units group
RPG.MagicalEnemyUnit.prototype.choose_target = function () {
    "use strict";
    var target_index, target, player_unit_index, alive_player_unit_index;
    
    // store a random number between 0 and the length of the player_unit group
    target_index = this.game_state.rnd.between(0, this.game_state.groups[this.target_units].countLiving() - 1);
    
    // set current index to 0
    alive_player_unit_index = 0;
    // forEachAlive function iterates through the children in player units 
    // and finds all of the existing units in the group
    this.game_state.groups[this.target_units].forEachAlive(function (alive_unit) {
        // checks if alive_player_index matches the index of the target in player units group
        if (alive_player_unit_index === target_index) {
            // set target to the alive_unit
            target = alive_unit;
        }
        // increase index to get the next child
        alive_player_unit_index++;
    }, this);
    // return the target to pass to the hit method
    return target;
};