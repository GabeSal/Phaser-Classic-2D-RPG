var RPG = RPG || {};

RPG.SpecialAttack = function (game_state, name, position, properties) {
    "use strict";    
    RPG.Prefab.call(this, game_state, name, position, properties);
    
    this.owner = properties.owner;
};

RPG.SpecialAttack.prototype = Object.create(RPG.Prefab.prototype);
RPG.SpecialAttack.prototype.constructor = RPG.SpecialAttack;

RPG.SpecialAttack.prototype.hit = function (target) {
    "use strict";
    var damage, special_attack_multiplier, defense_multiplier, action_message_position, action_message_text, special_attack_message;
    
    special_attack_multiplier = this.game_state.rnd.realInRange(1.4, 1.9);
    defense_multiplier = this.game_state.rnd.realInRange(0.8, 1.2);
    
    damage = Math.max(0, Math.ceil((special_attack_multiplier * this.owner.stats.special_attack) - (defense_multiplier * target.stats.defense)));
    
    if(damage === 0) {
        damage = "miss";
    }
    
    target.receive_damage(damage);
    
    this.owner.animations.play("attack2");
    this.owner.animations.currentAnim.onComplete.add(this.game_state.next_turn, this.game_state);
};