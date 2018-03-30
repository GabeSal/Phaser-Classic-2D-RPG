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
    var damage, physical_attack_multiplier, physical_defense_multiplier, action_message_position, action_message_text, physical_attack_message;
    
    physical_attack_multiplier = this.game_state.rnd.realInRange(0.9, 1.8);
    physical_defense_multiplier = this.game_state.rnd.realInRange(0.8, 1.5);
    
    if (target.stats_bonus) {
        damage = Math.max(0, Math.ceil((physical_attack_multiplier * this.owner.stats.attack) - (physical_defense_multiplier * target.stats.phys_defense + target.stats_bonus.phys_defense)));
    } else {
        damage = Math.max(0, Math.ceil((physical_attack_multiplier * this.owner.stats.attack) - (physical_defense_multiplier * target.stats.phys_defense)));
    }
    
    if(damage === 0) {
        damage = "miss";
    }
    
    target.receive_damage(damage);
    
    this.owner.animations.play("attack1");
    this.owner.animations.currentAnim.onComplete.add(this.game_state.next_turn, this.game_state);
};