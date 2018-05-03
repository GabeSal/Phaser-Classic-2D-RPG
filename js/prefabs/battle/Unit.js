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
    console.log(this);
    var damage_text, kill_timer;
    // checks to see if the damage is not a string
    if (damage !== "miss") {
        // decrease health
        this.stats.health -= damage;
    }
    
    // position the special effects towards the target receiving damage
    if (this.target_units == "player_units" && !this.game_state.is_magic_attack && !this.game_state.mage_has_grimoire) {
        // position for enemy_units
        this.game_state.blood_effect.position.x = this.position.x - 15;
        this.game_state.blood_effect.position.y = this.position.y;
        this.game_state.blood_effect.alpha = 0.85;
        this.game_state.blood_effect_anim.play('splatter');
        // burning effect
    } else if (this.target_units == "player_units" && this.game_state.is_magic_attack && !this.game_state.mage_has_grimoire) {
        // set the burning effect on the enemy unit
        this.game_state.burning_effect.position.x = this.position.x - 10;
        this.game_state.burning_effect.position.y = this.position.y - 35;
        this.game_state.burning_effect.alpha = 0.9;
        this.game_state.burning_effect.play('burning');
    } else if (this.target_units == "player_units" && this.game_state.is_magic_attack && this.game_state.mage_has_grimoire) {
        // set the lingering lightning on the enemy unit
        this.game_state.lingering_lightning.position.x = this.position.x - 25;
        this.game_state.lingering_lightning.position.y = this.position.y + 10;
        this.game_state.lingering_lightning.alpha = 1;
        this.game_state.lingering_lightning.play('crackle');
        // lightning splash effect for ground
        this.game_state.lightning_splash.position.x = this.position.x;
        this.game_state.lightning_splash.position.y = this.position.y + 5;
        this.game_state.lightning_splash.alpha = 1;
        this.game_state.lightning_splash.play('impact');
    } else if (this.game_state.is_magic_attack) {
        if (this.name == "mage") {
            // set the burning effect on the enemy unit
            this.game_state.burning_effect.position.x = this.position.x + 5;
            this.game_state.burning_effect.position.y = this.position.y - 35;
            this.game_state.burning_effect.alpha = 1;
            this.game_state.burning_effect.play('burning');
        }
        if (this.name == "warrior") {
            // set the burning effect on the enemy unit
            this.game_state.burning_effect2.position.x = this.position.x + 5;
            this.game_state.burning_effect2.position.y = this.position.y - 35;
            this.game_state.burning_effect2.alpha = 1;
            this.game_state.burning_effect2.play('charred');
        }
    } else {
        // play blood effect when players get attacked
        this.game_state.blood_effect.position.x = this.position.x + 5;
        this.game_state.blood_effect.position.y = this.position.y;
        this.game_state.blood_effect.alpha = 0.85;
        this.game_state.blood_effect_anim.play('splatter');
    }
    
    // plays the hit animation
    this.animations.play("hit");
    // play the hit sound
    if (!this.game_state.hit_sound.isPlaying && !this.game_state.is_magic_attack) {
        this.game_state.hit_sound.play('', 0, 1, false);
    }
    
    // play the sounds of the magical hit sfx
    if (!this.game_state.fireball_hit.isPlaying && this.game_state.is_magic_attack && !this.game_state.mage_has_grimoire) {
        this.game_state.fireball_hit.play('', 0, 1, false);
        this.game_state.is_magic_attack = false;
    } 
    if (!this.game_state.lightning_hit.isPlaying && this.game_state.is_magic_attack && this.game_state.mage_has_grimoire){
        this.game_state.lightning_hit.play('', 0, 1, false);
        this.game_state.is_magic_attack = false;
    }
    // checks to see if the units' health is above 0
    if (this.stats.health <= 0) {
        // sets the health to 0 if it reaches below 0
        this.stats.health = 0;
        // then destroys the unit from the battle state
        this.kill();
        this.game_state.blood_effect.position.x = this.position.x - 15;
        this.game_state.blood_effect.position.y = this.position.y;
        this.game_state.blood_effect.alpha = 0.85;
        this.game_state.blood_effect_anim.play();
    }
    
    // stores the damage_text
    damage_text = this.game_state.game.add.text(this.x, this.y - 50, "" + damage, {font: "bold 24px Georgia", fill: "#FF3333"}, this.game_state.groups.hud);
    
    // creates a timer for the damage_text
    kill_timer = this.game_state.time.create();
    // sets the timer to 1 second, displays the text, and destroys the text object
    kill_timer.add(1.45 * Phaser.Timer.SECOND, damage_text.kill, damage_text);
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
        if (this.name == "warrior") {
            this.game_state.warrior_sound.play('', 0, 1, false);
        }
        if (this.name == "mage" || this.target_units == "player_units") {
            this.game_state.enemy_sound.play('', 0, 1, false);
        }
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
    } else if (this.game_state.is_players_turn == false){
        // moves the enemy unit to the player unit
        magic_combat_tween = this.game_state.game.add.tween(this).to({x: targets_position.x - 60, y: targets_position.y}, 350, Phaser.Easing.Linear.In);
    }
    
    // moves the unit back to the original position
    return_tween = this.game_state.game.add.tween(this).to({x: return_position.x, y: return_position.y}, 350, Phaser.Easing.Linear.Out, false, 750);
    
    // checks to see if the mage has grimoire
    if (this.name == "mage" && this.game_state.mage_has_grimoire) {
        // plays the lightning attack animation and sound
        this.game_state.lightning_sound.play('', 0, 1, false);
        this.lightning_attack(targets_position);
        this.game_state.is_magic_attack = true;
        this.animations.play("attack2");
    } else {
        // starts the combat tween
        magic_combat_tween.start();
    }
    // calls an anon function that starts the return tween and plays the appropriate attack animation
    magic_combat_tween.onComplete.add(function () {
        if (this.name == "mage" && !this.game_state.mage_has_grimoire) {
            this.game_state.fireball_sound.play('', 0, 1, false);
            this.game_state.is_magic_attack = true;
        }
        if (this.name == "warrior") {
            this.game_state.enemy_sound.play('', 0, 1, false);
        }
        if (this.name == "dragon") {
            this.game_state.fireball_sound.play('', 0, 1, false);
            this.game_state.is_magic_attack = true;
        }
        this.animations.play("attack2");
        return_tween.start();
    }, this);
    
    // calls the next_turn method from BattleState when the animation is completed
    return_tween.onComplete.add(this.game_state.next_turn, this.game_state);
};

RPG.Unit.prototype.lightning_attack = function (enemy_position) {
    "use strict";
    // 120 is the offset for the battle menu while in the BattleState.
    // The y of the lightning bolt changes with the positioning of the enemy
    var lightningY = 120 - enemy_position.y;
    
    this.game_state.lightning.position.x = enemy_position.x;
    
    // Create the lightning texture
    this.createLightningTexture(enemy_position.x, lightningY, 20, 3, false);

    // Make the lightning sprite visible
    this.game_state.lightning.alpha = 1;
    
    // Fade out the lightning sprite using a tween on the alpha property
    // Check out the "Easing function" examples for more info.
    var lightning_tween = this.game_state.game.add.tween(this.game_state.lightning)
        .to({ alpha: 0.5 }, 150, Phaser.Easing.Bounce.Out)
        .to({ alpha: 1.0 }, 150, Phaser.Easing.Bounce.Out)
        .to({ alpha: 0.5 }, 150, Phaser.Easing.Bounce.Out)
        .to({ alpha: 1.0 }, 150, Phaser.Easing.Bounce.Out)
        .to({ alpha: 0 }, 400, Phaser.Easing.Cubic.In)
        .start();
    
    lightning_tween.onComplete.add(this.game_state.next_turn, this.game_state);
    
    // Create the flash
    this.game_state.flash.alpha = 1;
    this.game_state.game.add.tween(this.game_state.flash)
        .to({ alpha: 0 }, 100, Phaser.Easing.Cubic.In)
        .start();

    // Shake the camera by moving it up and down 5 times really fast
    this.game_state.game.camera.y = 0;
    this.game_state.game.add.tween(this.game_state.game.camera)
        .to({ y: -10 }, 40, Phaser.Easing.Sinusoidal.InOut, false, 0, 5, true)
        .start();
};

// This function creates a texture that looks like a lightning bolt
RPG.Unit.prototype.createLightningTexture = function(x, y, segments, boltWidth, branch) {
    // Get the canvas drawing context for the lightningBitmap
    var ctx = this.game_state.lightningBitmap.context;
    var width = 75;
    var height = this.game_state.lightningBitmap.height;

    // Our lightning will be made up of several line segments starting at
    // the center of the top edge of the bitmap and ending at the bottom edge
    // of the bitmap.

    // Clear the canvas
    if (!branch) ctx.clearRect(0, 0, width, height);

    // Draw each of the segments
    for(var i = 0; i < segments; i++) {
        // Set the lightning color and bolt width
        ctx.strokeStyle = 'rgb(255, 255, 255)';
        ctx.lineWidth = boltWidth;

        ctx.beginPath();
        ctx.moveTo(x, y);

        // Calculate an x offset from the end of the last line segment and
        // keep it within the bounds of the bitmap
        if (branch) {
            // For a branch
            x += this.game.rnd.integerInRange(-20, 20);
        } else {
            // For the main bolt
            x += this.game.rnd.integerInRange(-30, 30);
        }
        if (x <= 10) x = 10;
        if (x >= width-10) x = width-10;

        // Calculate a y offset from the end of the last line segment.
        // When we've reached the ground or there are no more segments left,
        // set the y position to the height of the bitmap. For branches, we
        // don't care if they reach the ground so don't set the last coordinate
        // to the ground if it's hanging in the air.
        if (branch) {
            // For a branch
            y += this.game.rnd.integerInRange(10, 20);
        } else {
            // For the main bolt
            y += this.game.rnd.integerInRange(20, height/segments);
        }
        if ((!branch && i == segments - 1) || y > height) {
            y = height;
        }

        // Draw the line segment
        ctx.lineTo(x, y);
        ctx.stroke();

        // Quit when we've reached the ground
        if (y >= height) break;

        // Draw a branch 35% of the time off the main bolt only
        if (!branch) {
            if (this.game.math.random(0, 1 * 100) <= 45) {
                // Draws another, thinner, bolt starting from this position
                this.createLightningTexture(x, y, 10, 1, true);
            }
        }
    }

    // This just tells the engine it should update the texture cache
    this.game_state.lightningBitmap.dirty = true;
};

// calculates the turn value of the unit using their speed stat
RPG.Unit.prototype.calculate_act_turn = function (current_turn) {
    "use strict";
    // stores a value from the current_turn value in addition to this.stats.speed
    this.act_turn = current_turn + Math.ceil(100 / this.stats.speed);
};