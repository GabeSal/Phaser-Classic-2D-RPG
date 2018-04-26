// ToughEnemyUnit.js

// Tough Enemy Unit handles the attacks of the enemy unit
var RPG = RPG || {};

RPG.ToughEnemyUnit = function (game_state, name, position, properties) {
    "use strict";
    // Calls the physical attack for 'default' state
    RPG.EnemyUnit.call(this, game_state, name, position, properties);
    
    // Special attack ratio
    this.SPECIAL_ATTACK_THRESHOLD = 0.75;
    this.special_attack = new RPG.SpecialAttack(this.game_state, this.name + "_special_attack", {x: 0, y: 0}, {group: "attacks", owner: this});
    
    // current state defaults to 'default'
    this.current_state = "default";
};

RPG.ToughEnemyUnit.prototype = Object.create(RPG.EnemyUnit.prototype);
RPG.ToughEnemyUnit.prototype.constructor = RPG.ToughEnemyUnit;

RPG.ToughEnemyUnit.prototype.selected = function () {
    "use strict";
    // calls the attack method and passes the enemy name
    this.game_state.current_attack.hit(this);
    // hide the enemy menu items
    this.game_state.prefabs.enemy_units_menu.enable(false);
};

// act handles the cycle of states the tough enemy unit has throughout the battle
RPG.ToughEnemyUnit.prototype.act = function () {
    "use strict";
    // switch statement that looks at the value of this.current_state
    switch (this.current_state) {
        // plays the default attack for the unit
        case "default":
            this.default_act();
            break;
        // plays the special attack for the unit
        case "special":
            this.special_act();
            break;
    }
    // calls the next_state method
    this.next_state();
};

// next_state checks the value of the current_state variable 
// and changes the state accordingly
RPG.ToughEnemyUnit.prototype.next_state = function () {
    "use strict";
    switch (this.current_state) {
        // in case of default
        case "default":
            // grabs a random number from Phasers random number generator
            var random_number = this.game_state.rnd.frac();
            // checks to see if the random number is less than the SPECIAL_ATTACK_THRESHOLD
            if (random_number < this.SPECIAL_ATTACK_THRESHOLD) {
                // sets state to special
                this.current_state = "special";
            }
            break;
        case "special":
            // resets the state to default
            this.current_state = "default";
            break;
    }
};

// default_act calls the hit method and chooses a target from the player units
RPG.ToughEnemyUnit.prototype.default_act = function () {
    "use strict";
    // hides player action menu
    this.game_state.prefabs.show_player_status.show(false);
    
    // calls choose_target method in order to pick a random player unit
    var target = this.choose_target();
    
    // calls the hit method from the Physical attack class
    this.attack.hit(target);
};

// special_act calls the hit method and chooses a target from the player units
RPG.ToughEnemyUnit.prototype.special_act = function () {
    "use strict";
    // hides player action menu
    this.game_state.prefabs.show_player_status.show(false);
    
    // calls choose_target method in order to pick a random player unit
    var target = this.choose_target();
    
    // calls the hit method from the Special attack class
    this.special_attack.hit(target);
};
