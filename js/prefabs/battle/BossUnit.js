var RPG = RPG || {};

RPG.BossUnit = function (game_state, name, position, properties) {
    "use strict";
    RPG.EnemyUnit.call(this, game_state, name, position, properties);
    
    this.SPECIAL_ATTACK_THRESHOLD = 0.6;
    this.special_attack = new RPG.MagicalAttack(this.game_state, this.name + "_special_attack", {x: 0, y: 0}, {group: "attacks", owner: this});
    
    this.max_health = this.stats.health;
    this.enraged = false;
    
    this.current_state = "default";
};

RPG.BossUnit.prototype = Object.create(RPG.EnemyUnit.prototype);
RPG.BossUnit.prototype.constructor = RPG.BossUnit;

RPG.BossUnit.prototype.act = function () {
    "use strict";
    switch (this.current_state) {
        case "default":
            this.default_act();
            break;
        case "special":
            this.special_act();
            break;
        case "enraged":
            this.enraged_act();
            break;
    }
    this.next_state();
};

RPG.BossUnit.prototype.next_state = function () {
    "use strict";
    switch (this.current_state) {
        case "default":
            if(this.stats.health < 0.55 * this.max_health && !this.enraged) {
                this.enraged = true;
                this.current_state = "enraged";
            } else {
                var random_number = this.game_state.rnd.frac();
                if (random_number < this.SPECIAL_ATTACK_THRESHOLD) {
                    this.current_state = "special";
                }
            }
            break;
        case "special":
            this.current_state = "default";
            break;
        case "enraged":
            this.current_state = "default";
            break;
    }
    
    console.log("Next State: " + this.current_state);
};

RPG.BossUnit.prototype.default_act = function () {
    "use strict";
    this.game_state.prefabs.show_player_status.show(false);
    
    var target = this.choose_target();
    
    this.attack.hit(target);
};

RPG.BossUnit.prototype.special_act = function () {
    "use strict";
    this.game_state.prefabs.show_player_status.show(false);
    
    var target = this.choose_target();
    
    this.special_attack.hit(target);
};

RPG.BossUnit.prototype.enraged_act = function () {
    "use strict";
    
    this.game_state.prefabs.show_player_status.show(false);
    
    // grabs all alive units on field to target
    this.game_state.groups[this.target_units].forEachAlive(function (target) {
        this.special_attack.hit(target);
    }, this);
};