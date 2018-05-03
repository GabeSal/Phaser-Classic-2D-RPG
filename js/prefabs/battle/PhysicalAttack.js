// PhysicalAttack.js

// Physical attack handles the attack of a unit 
// that exclusively have physical damage
var RPG = RPG || {};

RPG.PhysicalAttack = function (game_state, name, position, properties) {
    "use strict";    
    RPG.Prefab.call(this, game_state, name, position, properties);
    
    // this.owner saves the type of unit performing the attack
    this.owner = properties.owner;
};

RPG.PhysicalAttack.prototype = Object.create(RPG.Prefab.prototype);
RPG.PhysicalAttack.prototype.constructor = RPG.PhysicalAttack;

// the hit method calculates the damage and the plays the attack animation for the unit
RPG.PhysicalAttack.prototype.hit = function (target) {
    "use strict";
    // save the original position of the current unit in play
    var original_position = {x: this.owner.position.x, y: this.owner.position.y};
    // save the targets position
    var targets_position = {x: target.position.x, y: target.position.y};
    
    if (this.owner.is_attacking == false) {
        this.owner.combat_tween(targets_position, original_position);
        this.owner.is_attacking = true;
    }
    
    if (this.game_state.is_players_turn == true) {
        this.game_state.is_players_turn = false;
    }
    
    // creates a timer for the target to play the damaged animation
    var hit_timer = this.game_state.time.create();
    hit_timer.add(425, this.display_damage, this, target);
    hit_timer.start();
    
    // allow target to be clickable again
    target.selected_enemy_unit = false;
};

RPG.PhysicalAttack.prototype.display_damage = function(target) {
    "use strict";
    var damage, physical_attack_multiplier, physical_defense_multiplier, action_message_position, action_message_text, physical_attack_message;
    
    // attack multiplier is randomized for dynamic combat
    physical_attack_multiplier = this.game_state.rnd.realInRange(0.9, 1.8);
    // defense multiplier is randomized to have dynamic defense
    physical_defense_multiplier = this.game_state.rnd.realInRange(0.8, 1.5);
    
    // checks to see if the target has any stat bonuses
    if (target.stats_bonus) {
        // if so the damage is calculated with the targets' phys_defense * the phys_defense multiplier + the stat bonus
        damage = Math.max(0, Math.ceil((physical_attack_multiplier * this.owner.stats.attack) - (physical_defense_multiplier * target.stats.phys_defense + target.stats_bonus.phys_defense)));
    } else {
        // otherwise, the damage just uses the targets' phys_defense and the phys_defense multiplier
        damage = Math.max(0, Math.ceil((physical_attack_multiplier * this.owner.stats.attack) - (physical_defense_multiplier * target.stats.phys_defense)));
    }
    
    // change the damage to text for the damage_text object
    if(damage === 0) {
        damage = "miss";
    }
    
    // calls the receove_damage method from the target unit
    target.receive_damage(damage);
    
    // change the bool value for the units attacking flag
    if (this.owner.is_attacking) {
        this.owner.is_attacking = false;
    }
};