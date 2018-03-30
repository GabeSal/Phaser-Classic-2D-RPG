// BossUnit.js

// Boss Unit handles the attack states the boss 
// unit has and handles the enraged acts
var RPG = RPG || {};

RPG.BossUnit = function (game_state, name, position, properties) {
    "use strict";
    // Calls the physical attack method for the 'default' state
    RPG.EnemyUnit.call(this, game_state, name, position, properties);
    
    // Special attack ratio
    this.MAGICAL_ATTACK_THRESHOLD = 0.6;
    // creates a magical attack using instantiating the MagicalAttack class
    this.magical_attack = new RPG.MagicalAttack(this.game_state, this.name + "_magical_attack", {x: 0, y: 0}, {group: "attacks", owner: this});
    
    // stores the max_health for use in calculating when to 
    // allow the 'enraged' state to become active
    this.max_health = this.stats.health;
    
    // enraged state defaults to false
    this.enraged = false;
    
    // current state defaults to 'default'
    this.current_state = "default";
};

RPG.BossUnit.prototype = Object.create(RPG.EnemyUnit.prototype);
RPG.BossUnit.prototype.constructor = RPG.BossUnit;

// act handles the cycle of states the boss unit has throughout the battle
RPG.BossUnit.prototype.act = function () {
    "use strict";
    // switch statement that looks at the value of this.current_state
    switch (this.current_state) {
        // plays the default attack for the boss
        case "default":
            this.default_act();
            break;
        // plays the magical attack for the boss
        case "magical":
            this.magical_act();
            break;
        // plays the enraged attack for the boss
        case "enraged":
            this.enraged_act();
            break;
    }
    // calls the next_state method
    this.next_state();
};

// next_state checks the value of the current_state variable 
// and changes the state accordingly
RPG.BossUnit.prototype.next_state = function () {
    "use strict";
    switch (this.current_state) {
        case "default":
            // checks to see if the boss' health is less than 55% and is not enraged
            if(this.stats.health < 0.55 * this.max_health && !this.enraged) {
                // sets enraged state to true
                this.enraged = true;
                // sets state to enraged as well
                this.current_state = "enraged";
            } else {
                // otherwise grabs a random number
                var random_number = this.game_state.rnd.frac();
                // and compares it to the MAGICAL_ATTACK_THRESHOLD
                // in order to change the state to magical
                if (random_number < this.MAGICAL_ATTACK_THRESHOLD) {
                    this.current_state = "magical";
                }
            }
            break;
        case "magical":
            // changes state to default
            this.current_state = "default";
            break;
        case "enraged":
            // changes state to default
            this.current_state = "default";
            break;
    }
    // shows the next state that will be active on the boss units turn
    /*console.log("Next State: " + this.current_state);*/
};

// default_act calls the hit method and chooses a target from the player units
RPG.BossUnit.prototype.default_act = function () {
    "use strict";
    // hides player action menu
    this.game_state.prefabs.show_player_status.show(false);
    
    // calls choose_target method in order to pick a random player unit
    var target = this.choose_target();
    
    // calls the hit method from the Physical attack class
    this.attack.hit(target);
};

// magical_act calls the hit method and chooses a target from the player units
RPG.BossUnit.prototype.magical_act = function () {
    "use strict";
    // hides player action menu
    this.game_state.prefabs.show_player_status.show(false);
    
    // calls choose_target method in order to pick a random player unit
    var target = this.choose_target();
    
    // calls the hit method from the Magical attack class
    this.magical_attack.hit(target);
};

// enraged_act calls the hit method and targets all player units in play
RPG.BossUnit.prototype.enraged_act = function () {
    "use strict";
    // hides player action menu
    this.game_state.prefabs.show_player_status.show(false);
    
    // grabs all alive units on field to target
    this.game_state.groups[this.target_units].forEachAlive(function (target) {
        // calls the hit method from the Magical attack class
        this.magical_attack.hit(target);
    }, this);
};