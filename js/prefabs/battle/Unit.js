// Unit.js

// Unit is the main class used for all of the other unit prefabs
var RPG = RPG || {};

RPG.Unit = function (game_state, name, position, properties) {
    "use strict";
    var idle_animation, attack1_animation, attack2_animation, hit_animation;
    RPG.Prefab.call(this, game_state, name, position, properties);
    
    // stores the idle animation
    this.animations.add("idle", properties.animations.idle.frames, properties.animations.idle.fps, true);
    
    // stores the attack1 animation
    attack1_animation = this.animations.add("attack1", properties.animations.attack1.frames, properties.animations.attack1.fps);
    
    // returns to the idle animation after the attack has been finished
    attack1_animation.onComplete.add(this.back_to_idle, this);
    
    // stores the attack2 animation
    attack2_animation = this.animations.add("attack2", properties.animations.attack2.frames, properties.animations.attack2.fps);
    
    // returns to the idle animation after the attack has been finished
    attack2_animation.onComplete.add(this.back_to_idle, this);
    
    // stores the idle animation
    hit_animation = this.animations.add("hit", properties.animations.hit.frames, properties.animations.hit.fps);
    
    // returns to the idle animation after the hit
    hit_animation.onComplete.add(this.back_to_idle, this);
    
    // plays the idle animation
    this.animations.play("idle");
    
    // stores the unit stats
    this.stats = properties.stats;
    // stores the target_units group for the enemy units
    this.target_units = properties.target_units;
    
    // flag to see if a unit is currently attacking
    this.is_attacking = false;
};

RPG.Unit.prototype = Object.create(RPG.Prefab.prototype);
RPG.Unit.prototype.constructor = RPG.Unit;

// back_to_idle has the unit return to the idle 'state'
RPG.Unit.prototype.back_to_idle = function () {
    "use strict";
    // plays the idle animation
    this.animations.play("idle");
};

// receive_damage decreases the health of the other player, 
// sets the damage text from the units' hit method, and displays the text
RPG.Unit.prototype.receive_damage = function (damage) {
    "use strict";
    var damage_text, kill_timer;
    // checks to see if the damage is not a string
    if (damage !== "miss") {
        // decrease health
        this.stats.health -= damage;
    }
    
    // plays the hit animation
    this.animations.play("hit");
    // checks to see if the units' health is above 0
    if (this.stats.health <= 0) {
        // sets the health to 0 if it reaches below 0
        this.stats.health = 0;
        // then destroys the unit from the battle state
        this.kill();
    }
    
    // stores the damage_text
    damage_text = this.game_state.game.add.text(this.x, this.y - 50, "" + damage, {font: "bold 24px Georgia", fill: "#FF3333"}, this.game_state.groups.hud);
    
    // creates a timer for the damage_text
    kill_timer = this.game_state.time.create();
    // sets the timer to 1 second, displays the text, and destroys the text object
    kill_timer.add(1 * Phaser.Timer.SECOND, damage_text.kill, damage_text);
    // starts the timed event
    kill_timer.start();
};

// healed displays the amount of health the unit has recovered
RPG.Unit.prototype.healed = function (amount) {
    "use strict";
    var healing_text, heal_timer;
    
    // stores the healing_text
    healing_text = this.game_state.game.add.text(this.x, this.y - 50, "" + amount, {font: "bold 24px Georgia", fill: "#44FF66"}, this.game_state.groups.hud);
    
    // creates a timer for the healing_text
    heal_timer = this.game_state.time.create();
    // sets the timer to 1 second, displays the text, and destroys the text object
    heal_timer.add(1 * Phaser.Timer.SECOND, healing_text.kill, healing_text);
    // starts the timed event
    heal_timer.start();
};

// mana_gain displays the amount of mana the unit has recovered
RPG.Unit.prototype.mana_gained = function (amount) {
    "use strict";
    var mana_text, mana_timer;
    
    // stores the mana_text
    mana_text = this.game_state.game.add.text(this.x, this.y - 50, "" + amount, {font: "bold 24px Georgia", fill: "#5577FF"}, this.game_state.groups.hud);
    
    // creates a timer for the mana_text
    mana_timer = this.game_state.time.create();
    // sets the timer to 1 second, displays the text, and destroys the text object
    mana_timer.add(1 * Phaser.Timer.SECOND, mana_text.kill, mana_text);
    // starts the timed event
    mana_timer.start();
};

// tween responsible for the unit positioning themselves to their target
RPG.Unit.prototype.combat_tween = function (targets_position, return_position) {
    "use strict";
    var combat_tween, return_tween;
    // checks to see if the player is in control
    if (this.game_state.is_players_turn == true) {
        // moves the player unit to the targets position
        combat_tween = this.game_state.game.add.tween(this).to({x: targets_position.x + 80, y: targets_position.y}, 350, Phaser.Easing.Linear.In);
    } else {
        // moves the enemy unit to the player unit
        combat_tween = this.game_state.game.add.tween(this).to({x: targets_position.x - 80, y: targets_position.y}, 350, Phaser.Easing.Linear.In);
    }
    
    // moves the unit back to the original position
    return_tween = this.game_state.game.add.tween(this).to({x: return_position.x, y: return_position.y}, 350, Phaser.Easing.Linear.Out, false, 750);
    
    // starts the combat tween
    combat_tween.start();
    // calls an anon function that starts the return tween and plays the appropriate attack animation
    combat_tween.onComplete.add(function () {
        this.animations.play("attack1");
        return_tween.start();
    }, this);
    
    // calls the next_turn method from BattleState when the animation is completed
    return_tween.onComplete.add(this.game_state.next_turn, this.game_state);
};

// tween responsible for the unit positioning themselves to their target
RPG.Unit.prototype.magic_combat_tween = function (targets_position, return_position) {
    "use strict";
    var magic_combat_tween, return_tween;
    // checks to see if the player is in control
    if (this.game_state.is_players_turn == true) {
        // moves the player unit to the targets position
        magic_combat_tween = this.game_state.game.add.tween(this).to({x: targets_position.x + 100, y: targets_position.y}, 350, Phaser.Easing.Linear.In);
    } else {
        // moves the enemy unit to the player unit
        magic_combat_tween = this.game_state.game.add.tween(this).to({x: targets_position.x - 60, y: targets_position.y}, 350, Phaser.Easing.Linear.In);
    }
    
    // moves the unit back to the original position
    return_tween = this.game_state.game.add.tween(this).to({x: return_position.x, y: return_position.y}, 350, Phaser.Easing.Linear.Out, false, 750);
    
    // starts the combat tween
    magic_combat_tween.start();
    // calls an anon function that starts the return tween and plays the appropriate attack animation
    magic_combat_tween.onComplete.add(function () {
        this.animations.play("attack2");
        return_tween.start();
    }, this);
    
    // calls the next_turn method from BattleState when the animation is completed
    return_tween.onComplete.add(this.game_state.next_turn, this.game_state);
};

// calculates the turn value of the unit using their speed stat
RPG.Unit.prototype.calculate_act_turn = function (current_turn) {
    "use strict";
    // stores a value from the current_turn value in addition to this.stats.speed
    this.act_turn = current_turn + Math.ceil(100 / this.stats.speed);
};