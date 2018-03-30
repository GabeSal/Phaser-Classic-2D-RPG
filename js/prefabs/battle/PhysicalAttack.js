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
    
    // calls the receive_damage method in the units' prefab object
    target.receive_damage(damage);
    
    // play the first attack animation
    this.owner.animations.play("attack1");
    // calls the next_turn method fro BattleState when the animation is completed 
    this.owner.animations.currentAnim.onComplete.add(this.game_state.next_turn, this.game_state);
};