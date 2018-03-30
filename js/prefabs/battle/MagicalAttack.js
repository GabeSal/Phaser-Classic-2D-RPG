var RPG = RPG || {};

RPG.MagicalAttack = function (game_state, name, position, properties) {
    "use strict";    
    RPG.Prefab.call(this, game_state, name, position, properties);
    
    this.owner = properties.owner;
    this.mana_cost = properties.mana_cost;
};

RPG.MagicalAttack.prototype = Object.create(RPG.Prefab.prototype);
RPG.MagicalAttack.prototype.constructor = RPG.MagicalAttack;

RPG.MagicalAttack.prototype.hit = function (target) {
    "use strict";
    var damage, magic_attack_multiplier, magic_defense_multiplier, action_message_position, action_message_text, magic_attack_message;
    
    magic_attack_multiplier = this.game_state.rnd.realInRange(0.9, 2.0);
    magic_defense_multiplier = this.game_state.rnd.realInRange(0.5, 1.0);
    
    if (target.stats_bonus) {
        damage = Math.max(0, Math.ceil((magic_attack_multiplier * this.owner.stats.magic_attack) - (magic_defense_multiplier * target.stats.magic_defense + target.stats_bonus.magic_defense)));
    } else {
        damage = Math.max(0, Math.ceil((magic_attack_multiplier * this.owner.stats.magic_attack) - (magic_defense_multiplier * target.stats.magic_defense)));
    }
    
    if(damage === 0) {
        damage = "miss";
    }
    
    target.receive_damage(damage);
    
    this.owner.stats.mana -= this.mana_cost;
    
    this.owner.animations.play("attack2");
    this.owner.animations.currentAnim.onComplete.add(this.game_state.next_turn, this.game_state);
};