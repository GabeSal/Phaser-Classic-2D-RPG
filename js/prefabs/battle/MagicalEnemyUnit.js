var RPG = RPG || {};

RPG.MagicalEnemyUnit = function (game_state, name, position, properties) {
    "use strict";    
    RPG.Unit.call(this, game_state, name, position, properties);
    
    // declares the type of attack
    this.magic_attack = new RPG.MagicalAttack(this.game_state, this.name + "_attack", {x: 0, y: 0}, {group: "attacks", owner: this});
};

RPG.MagicalEnemyUnit.prototype = Object.create(RPG.Unit.prototype);
RPG.MagicalEnemyUnit.prototype.constructor = RPG.MagicalEnemyUnit;

RPG.MagicalEnemyUnit.prototype.kill = function () {
    "use strict";
    Phaser.Sprite.prototype.kill.call(this);
    var menu_item = this.game_state.prefabs[this.name + "_item"];
    menu_item.kill();
};

RPG.MagicalEnemyUnit.prototype.act = function () {
    "use strict";
    var target;
    
    this.game_state.prefabs.show_player_status.show(false);
    
    target = this.choose_target();
    this.attack.hit(target);
};

RPG.MagicalEnemyUnit.prototype.choose_target = function () {
    "use strict";
    var target_index, target, player_unit_index, alive_player_unit_index;
    
    target_index = this.game_state.rnd.between(0, this.game_state.groups[this.target_units].countLiving() - 1);
    
    alive_player_unit_index = 0;
    this.game_state.groups[this.target_units].forEachAlive(function (alive_unit) {
        if (alive_player_unit_index === target_index) {
            target = alive_unit;
        }
        alive_player_unit_index++;
    }, this);
    return target;
};