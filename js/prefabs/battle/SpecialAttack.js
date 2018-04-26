// SpecialAttack.js

// Special Attack handles the attack of a unit that have
// mulitple attacks (boss units, captain/tougher enemy units, etc)
var RPG = RPG || {};

RPG.SpecialAttack = function (game_state, name, position, properties) {
    "use strict";    
    RPG.Prefab.call(this, game_state, name, position, properties);
    
    // saves the type of unit using the special attack
    this.owner = properties.owner;
};

RPG.SpecialAttack.prototype = Object.create(RPG.Prefab.prototype);
RPG.SpecialAttack.prototype.constructor = RPG.SpecialAttack;

// the hit method calculates the damage and the plays the attack animation for the unit
RPG.SpecialAttack.prototype.hit = function (target) {
    "use strict";
    // save the original position of the current unit in play
    var original_position = {x: this.owner.position.x, y: this.owner.position.y};
    // save the targets position
    var targets_position = {x: target.position.x, y: target.position.y};
    
    if (this.owner.is_attacking == false) {
        this.owner.magic_combat_tween(targets_position, original_position);
        this.owner.is_attacking = true;
    }
    
    if (this.game_state.is_players_turn == true) {
        this.game_state.is_players_turn = false;
    }
    
    // creates a timer for the target to play the damaged animation
    var hit_timer = this.game_state.time.create();
    hit_timer.add(350, this.display_damage, this, target);
    hit_timer.start();
};

RPG.SpecialAttack.prototype.display_damage = function(target) {
    "use strict";
    var damage, special_attack_multiplier, special_defense_multiplier, action_message_position, action_message_text, special_attack_message;
    
    // attack multiplier is randomized for dynamic combat
    special_attack_multiplier = this.game_state.rnd.realInRange(1.4, 1.9);
    // defense multiplier is randomized to have dynamic defense
    special_defense_multiplier = this.game_state.rnd.realInRange(0.5, 1.2);
    
    // checks to see if the target has stat bonuses
    if (target.stats_bonus) {
        // calculates damage using the multipliers above and the targets resistance to physical attacks including the stat bonus
        damage = Math.max(0, Math.ceil((special_attack_multiplier * this.owner.stats.special_attack) - (special_defense_multiplier * target.stats.phys_defense + target.stats_bonus.phys_defense)));
    } else {
        // otherwise calculates damage using the multipliers above and the targets resistance to physical attacks
        damage = Math.max(0, Math.ceil((special_attack_multiplier * this.owner.stats.special_attack) - (special_defense_multiplier * target.stats.phys_defense)));
    }
    
    // change the damage to text for the damage_text object
    if(damage === 0) {
        damage = "miss";
    }
    
    // calls the receive_damage method in the units' prefab object
    target.receive_damage(damage);
    
    // change the bool value for the units attacking flag
    if (this.owner.is_attacking) {
        this.owner.is_attacking = false;
    }
};