// MagicalAttack.js

// Magical attack handles the attack of a unit 
// that exclusively have magical damage
var RPG = RPG || {};

RPG.MagicalAttack = function (game_state, name, position, properties) {
    "use strict";    
    RPG.Prefab.call(this, game_state, name, position, properties);
    
    // saves the type of unit that will use the magical attack
    this.owner = properties.owner;
    // saves the mana cost from the properties 
    // from the enemy_encounter data or party data
    this.mana_cost = properties.mana_cost;
};

RPG.MagicalAttack.prototype = Object.create(RPG.Prefab.prototype);
RPG.MagicalAttack.prototype.constructor = RPG.MagicalAttack;

// the hit method calculates the damage and the plays the attack animation for the unit
RPG.MagicalAttack.prototype.hit = function (target) {
    "use strict";
    var damage, magic_attack_multiplier, magic_defense_multiplier, action_message_position, action_message_text, magic_attack_message;
    
    // temp variable to hold the attack multiplier
    magic_attack_multiplier = this.game_state.rnd.realInRange(0.9, 2.0);
    // temp variable to hold the defense multiplier
    magic_defense_multiplier = this.game_state.rnd.realInRange(0.5, 1.0);
    
    // checks to see if the target has stat bonuses
    if (target.stats_bonus) {
        // if so the damage is calculated with the targets' magic_defense * the magic_defense multiplier + the stat bonus
        damage = Math.max(0, Math.ceil((magic_attack_multiplier * this.owner.stats.magic_attack) - (magic_defense_multiplier * target.stats.magic_defense + target.stats_bonus.magic_defense)));
    } else {
        // otherwise, the damage just uses the targets' phys_defense and the phys_defense multiplier
        damage = Math.max(0, Math.ceil((magic_attack_multiplier * this.owner.stats.magic_attack) - (magic_defense_multiplier * target.stats.magic_defense)));
    }
    
    // change the damage to text for the damage_text object
    if(damage === 0) {
        damage = "miss";
    }
    
    // calls the receive_damage method in the units' prefab object
    target.receive_damage(damage);
    
    // subtract the mana_cost from the owner's mana pool
    this.owner.stats.mana -= this.mana_cost;
    
    // play the alternate attack animation
    this.owner.animations.play("attack2");
    // calls the next_turn method fro BattleState when the animation is completed
    this.owner.animations.currentAnim.onComplete.add(this.game_state.next_turn, this.game_state);
};