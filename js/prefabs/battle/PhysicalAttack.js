var RPG = RPG || {};

RPG.PhysicalAttack = function (game_state, name, position, properties) {
    "use strict";    
    RPG.Prefab.call(this, game_state, name, position, properties);
    
    this.owner = properties.owner;
};

RPG.PhysicalAttack.prototype = Object.create(RPG.Prefab.prototype);
RPG.PhysicalAttack.prototype.constructor = RPG.PhysicalAttack;

RPG.PhysicalAttack.prototype.hit = function (target) {
    "use strict";
    var damage, physical_attack_multiplier, defense_multiplier, action_message_position, action_message_text, physical_attack_message;
    
    physical_attack_multiplier = this.game_state.rnd.realInRange(1.0, 1.8);
    defense_multiplier = this.game_state.rnd.realInRange(0.8, 1.2);
    
    damage = Math.max(0, Math.ceil((physical_attack_multiplier * this.owner.stats.attack) - (defense_multiplier * target.stats.defense)));
    
    if(damage === 0) {
        damage = "miss";
    }
    
    target.receive_damage(damage);
    
    this.owner.animations.play("attack1");
    this.owner.animations.currentAnim.onComplete.add(this.game_state.next_turn, this.game_state);
};