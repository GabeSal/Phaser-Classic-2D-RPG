var RPG = RPG || {};

RPG.ToughEnemyUnit = function (game_state, name, position, properties) {
    "use strict";
    // Calls the physical attack for 'default' state
    RPG.EnemyUnit.call(this, game_state, name, position, properties);
    
    // Special attack ratio
    this.SPECIAL_ATTACK_THRESHOLD = 0.75;
    this.special_attack = new RPG.SpecialAttack(this.game_state, this.name + "_special_attack", {x: 0, y: 0}, {group: "attacks", owner: this});
    
    this.current_state = "default";
};

RPG.ToughEnemyUnit.prototype = Object.create(RPG.EnemyUnit.prototype);
RPG.ToughEnemyUnit.prototype.constructor = RPG.ToughEnemyUnit;

RPG.ToughEnemyUnit.prototype.act = function () {
    "use strict";
    switch (this.current_state) {
        case "default":
            this.default_act();
            break;
        case "special":
            this.special_act();
            break;
    }
    this.next_state();
};

RPG.ToughEnemyUnit.prototype.next_state = function () {
    "use strict";
    switch (this.current_state) {
        case "default":
            var random_number = this.game_state.rnd.frac();
            if (random_number < this.SPECIAL_ATTACK_THRESHOLD) {
                this.current_state = "special";
            }
            break;
        case "special":
            this.current_state = "default";
            break;
    }
};

RPG.ToughEnemyUnit.prototype.default_act = function () {
    "use strict";
    this.game_state.prefabs.show_player_status.show(false);
    
    var target = this.choose_target();
    
    this.attack.hit(target);
};

RPG.ToughEnemyUnit.prototype.special_act = function () {
    "use strict";
    this.game_state.prefabs.show_player_status.show(false);
    
    var target = this.choose_target();
    
    this.special_attack.hit(target);
};
