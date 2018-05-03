// BattleState.js

// Battle state is responsible for the handling of the 
// player_units and AI controlled enemy_units as well as
// showing the player action menu and items
var RPG = RPG || {};

RPG.BattleState = function () {
    "use strict";
    RPG.JSONLevelState.call(this);
    
    // list of all the prefab classes used in this state
    this.prefab_classes = {
        background: RPG.Prefab.prototype.constructor,
        player_unit: RPG.PlayerUnit.prototype.constructor,
        enemy_unit: RPG.EnemyUnit.prototype.constructor,
        magical_enemy_unit: RPG.MagicalEnemyUnit.prototype.constructor,
        tough_enemy_unit: RPG.ToughEnemyUnit.prototype.constructor,
        boss_unit: RPG.BossUnit.prototype.constructor,
        menu: RPG.Menu.prototype.constructor,
        menu_item: RPG.MenuItem.prototype.constructor,
        physical_attack_menu_item: RPG.PhysicalAttackMenuItem.prototype.constructor,
        magical_attack_menu_item: RPG.MagicalAttackMenuItem.prototype.constructor,
        enemy_menu_item: RPG.EnemyMenuItem.prototype.constructor,
        run_menu_item: RPG.RunMenuItem.prototype.constructor,
        inventory_menu_item: RPG.InventoryMenuItem.prototype.constructor,
        show_player_status: RPG.ShowPlayerStatus.prototype.constructor
    }
};

RPG.BattleState.prototype = Object.create(RPG.JSONLevelState.prototype);
RPG.BattleState.prototype.constructor = RPG.BattleState;

RPG.BattleState.prototype.init = function (level_asset_data, extra_parameters) {
    "use strict";
    RPG.JSONLevelState.prototype.init.call(this, level_asset_data);
    
    this.previous_level = extra_parameters.previous_level;
    // this.encounter is the data that defines the type and 
    // stats of the enemy_units that will be shown
    this.encounter = extra_parameters.encounter;
    // this.enemy_name is passed from the enemy_spawner and is used to 
    // kill the spawner object after the player succeeds the encounter
    this.enemy_name = extra_parameters.enemy_name;
    // contains the state name of the previous level before entering the BattleState
    this.returning_state = extra_parameters.returning_state;
    
    // flag for the hit and swing sounds
    this.is_attacking = false;
    this.is_magic_attack = false;
    
    // flag that determines if the player is in control
    this.is_players_turn = false;
    
    // audio flag for the battle music
    this.is_boss_battle = false;
    
    // flag to change the magic_tween attack animation for the mage
    this.mage_has_grimoire = extra_parameters.acquired_grimoire;
};

RPG.BattleState.prototype.preload = function () {
    "use strict";
    // loads the experience table defining the XP needed for leveling up
    this.load.text("experience_table", "assets/asset_data/experience_table.json");
    
    // loads the experience table defining the XP needed for leveling up
    this.load.text("original_party_data", "assets/asset_data/default_party_data.json");
    
    // stores the battle tracks in the BattleState
    if (this.battle_music == undefined) {
        this.battle_music = this.game.add.audio("battle_music");    
    }
    
    if (this.boss_battle_music == undefined) {
        this.boss_battle_music = this.game.add.audio("boss_music");    
    }
    
    // stores the sound effects tracks in the BattleState
    if (this.hit_sound == undefined) {
        this.hit_sound = this.game.add.audio("hit_sfx");    
    }
    
    if (this.warrior_sound == undefined) {
        this.warrior_sound = this.game.add.audio("warrior_sfx");    
    }
    
    if (this.fireball_sound == undefined) {
        this.fireball_sound = this.game.add.audio("fireball_sfx");    
    }
    
    if (this.fireball_hit == undefined) {
        this.fireball_hit = this.game.add.audio("fireball_hit");    
    }
    
    if (this.lightning_sound == undefined) {
        this.lightning_sound = this.game.add.audio("lightning_sfx");    
    }
    
    if (this.lightning_hit == undefined) {
        this.lightning_hit = this.game.add.audio("lightning_hit");    
    }
    
    if (this.enemy_sound == undefined) {
        this.enemy_sound = this.game.add.audio("enemy_sfx");    
    }
};

RPG.BattleState.prototype.create = function () {
    "use strict";
    RPG.JSONLevelState.prototype.create.call(this);
    
    // creates the item menu from the inventory object
    this.game.inventory.create_menu(this, this.prefabs.items_menu);
    
    // creates a JSON object from the experience table text loaded from the preload method
    this.experience_table = JSON.parse(this.game.cache.getText("experience_table"));
    
    // creates a JSON object from the original default_party_data text loaded from the preload method
    this.original_data = JSON.parse(this.game.cache.getText("original_party_data"));
    
    // instantiates party stats in battle
    for (var player_unit_name in this.game.party_data) {
        var unit_data = this.game.party_data[player_unit_name];
        // var stats_bonus = this.game.party_data[player_unit_name].stats_bonus;
        this.prefabs[player_unit_name].stats = {};
        // calculates player stats using the base and bonus stats
        for (var stat_name in unit_data.stats) {
            // this.prefabs[player_unit_name].stats[stat_name] = unit_data.stats[stat_name] + stats_bonus[stat_name];
            this.prefabs[player_unit_name].stats[stat_name] = unit_data.stats[stat_name];
        }
        // updates and stores the players' experience and level
        this.prefabs[player_unit_name].experience = unit_data.experience;
        this.prefabs[player_unit_name].current_level = unit_data.current_level;
        
    }
    
    // creates a prefab of the enemy found in the encounter object
    for (var prefab_name in this.encounter.enemy_data) {
        this.create_prefab(prefab_name, this.encounter.enemy_data[prefab_name]);
        // check the encounter to see if there are any boss units in the enemy_data object
        if (this.encounter.enemy_data[prefab_name].type == "boss_unit") {
            // set the flag to true for the battle music
            this.is_boss_battle = true;
        }
        console.log("Is there an enemy boss?", this.is_boss_battle);
    }
    
    // PriorityQueue is used from a github example that calculates 
    // the turns of each unit in battle depending on their speed stat
    this.units = new PriorityQueue({comparator: function (unit_a, unit_b) {
        // comparator function that returns the value of 
        // unit_a's act_turn and unit_b's act_turn
        return unit_a.act_turn - unit_b.act_turn;
    }});
    
    // forEach function that iterates through all of the 
    // player units displayed in the battle state
    this.groups.player_units.forEach(function (unit) {
        // calculates the act_turn for the current unit in control
        unit.calculate_act_turn(0);
        // queues the unit
        this.units.queue(unit);
    }, this);
    
    // forEach function that iterates through all of the 
    // enemy units displayed in the battle state
    this.groups.enemy_units.forEach(function (unit) {
        // calculates the act_turn for the current unit in control
        unit.calculate_act_turn(0);
        // queues the unit
        this.units.queue(unit);
    }, this);
    
    // hides the show_player_status menu from the Battlestate to show the players' turn has ended.
    this.prefabs.show_player_status.show(false);
    // calls this.next_turn
    this.next_turn();
    
    // play the battle music according to the boss flag
    if(!this.battle_music.isPlaying && !this.is_boss_battle) {
        this.battle_music.play('', 0, 0.05, true);
    }
    
    // play the battle music according to the boss flag
    if(!this.boss_battle_music.isPlaying && this.is_boss_battle) {
        this.boss_battle_music.play('', 0, 0.1, true);
    }
    
    // method is called to create the flash and lightning bitmap data
    this.create_effects();
};

// the this.next_turn method counts all living units and decides 
// which unit will act according to their act_turn value
RPG.BattleState.prototype.next_turn = function () {
    "use strict";
    // checks all enemy_units to see if they have been cleared
    if(this.groups.enemy_units.countLiving() === 0) {
        // calls the clear_enemy_encounter method
        this.clear_enemy_encounter();
        // then calls swap_cache_data from JSONLevelState to update the maps enemy_spawner count
        RPG.JSONLevelState.prototype.swap_cache_data.call(this, this.returning_state);
        // then the battle ends and boots up WorldState
        this.end_battle();
        return;
    }
    // checks to see if all player_units have died
    if(this.groups.player_units.countLiving() === 0) {
        // if so, player is sent back to the TitleState
        this.game_over();
        return;
    }
    // after the turn has finished and none of the requirements above have been met,
    // the current unit in play will dequeue their turn
    this.current_unit = this.units.dequeue();
    if (this.current_unit.alive) {
        
        // temp variable to randomize how long a unit waits for their turn
        var act_length = this.rnd.realInRange(0.5, 0.7);
        // creates a timer so as to not allow for instantaneous acts
        var act_timer = this.time.create();
        // defines the timer length and calls the current unit to act
        act_timer.add(act_length * Phaser.Timer.SECOND, this.current_unit.act, this.current_unit);
        // start the act_timer
        act_timer.start();
        
        this.current_unit.calculate_act_turn(this.current_unit.act_turn);
        this.units.queue(this.current_unit);
    } else {
        this.next_turn();
    }
};

// back_to_world continues the players' session and brings 
// them back to the world stage they last occupied
RPG.BattleState.prototype.back_to_world = function () {
    "use strict";
    // set the flag to false
    this.is_boss_battle = false;
    
    // stop the battle music
    if(this.battle_music.isPlaying) {
        this.battle_music.stop();
    }
    if(this.boss_battle_music.isPlaying) {
        this.boss_battle_music.stop();
    }
    
    // boots up the world state
    this.game.state.start("BootState", true, false, this.previous_level, "WorldState");
    
};

// game_over deletes player progress up to this point 
// to show the players' session has ended
RPG.BattleState.prototype.game_over = function () {
    "use strict";
    
    // deletes all of the map data from cache after player loses game
    for (var JSONKey in this.game.cache._cache.json) {
        this.game.cache.removeJSON(JSONKey);
    }
    
    // forEach function that iterates through each player unit and resets the XP and level
    this.groups.player_units.forEach(function (player_unit) {
        // iterates through all of the parties stats and resets them to their original values
        for (var stat in this.game.party_data[player_unit.name].stats) {
            // gets the current parties stats and replaces them with the original party datas
            this.game.party_data[player_unit.name].stats[stat] = this.original_data.party_data[player_unit.name].stats[stat];
            this.game.party_data[player_unit.name].stats_bonus[stat] = this.original_data.party_data[player_unit.name].stats_bonus[stat];
        }
        // resets the experience and level of the unit to the default value
        this.game.party_data[player_unit.name].experience = 0;
        this.game.party_data[player_unit.name].current_level = 0;
    }, this);
    
    // calls the empty inventory function in the Inventory class
    this.game.inventory.empty_inventory();
    
    // update the firebase party data
    firebase.database().ref("/users/" + firebase.auth().currentUser.uid + "/party_data").set(this.game.party_data);
    
    // stop the battle music
    if(this.battle_music.isPlaying) {
        this.battle_music.stop();
    }
    if(this.boss_battle_music.isPlaying) {
        this.boss_battle_music.stop();
    }
    
    // boots up Title state
    this.game.state.start("BootState", true, false, "assets/asset_data/title_screen.json", "TitleState");
};

// end_battle is responsible for calculating the XP the player 
// receives as well as handling the rewards defined in the encounter data
RPG.BattleState.prototype.end_battle = function () {
    "use strict";
    // temp variable that references the experience points in the encounter data
    var received_experience = this.encounter.reward.experience;
    // forEach function that iterates through each player unit and divides the XP among them
    this.groups.player_units.forEach(function (player_unit) {
        // divides the XP among the two units (mage and warrior)
        player_unit.receive_experience(received_experience / this.groups.player_units.children.length);
        
        // update party data after battle
        this.game.party_data[player_unit.name].stats = player_unit.stats;
        this.game.party_data[player_unit.name].experience = player_unit.experience;
        this.game.party_data[player_unit.name].current_level = player_unit.current_level;
    }, this);
    
    // receive item rewards
    this.encounter.reward.items.forEach(function (item_object) {
        this.game.inventory.collect_item(this, item_object);
    }, this);
    
    // update the firebase party data then calls the back_to_world method
    firebase.database().ref("/users/" + firebase.auth().currentUser.uid + "/party_data").set(this.game.party_data).then(this.back_to_world.bind(this));
};

// clear_enemy_encounter is responsible from removing the enemy 
// spawner from the world stage in the cache
RPG.BattleState.prototype.clear_enemy_encounter = function () {
    // enemy name includes the instance of the 
    // enemy spawn the player had collided with
    var enemyName = this.enemy_name;
    // mapName is a concatenation of the returning_state passed 
    // by the enemy_spawner object to get the current map state 
    // (town or cave etc)
    var mapName = this.returning_state + "Map";
    // mapData that points to the map data in the cache
    var mapData = this.game.cache.getJSON(mapName);
    
    // stores the layers length of the layers array
    var layers_length = mapData.layers.length - 1;
    
    // for loop that iterates through all of the enemy_spawn objects and
    // tries to match their name/key with the enemyName string
    for(var i = 0; i < mapData.layers[layers_length].objects.length; i++) {
        if(mapData.layers[layers_length].objects[i].name == enemyName) {
            mapData.layers[layers_length].objects.splice(i, 1);
            break;
        }
    }
};

// method that creates all of the effects and sprites used for each effect
RPG.BattleState.prototype.create_effects = function () {
    "use strict";
    
    // sets the world bounds a little larger for the camera shake effect
    this.game.world.setBounds(-10, -10, this.game.width + 20, this.game.height + 20);
    
    // Create a bitmap for the lightning bolt texture
    this.lightningBitmap = this.game.add.bitmapData(480, 360);
    
    // Create a sprite to hold the lightning bolt texture
    this.lightning = this.game.add.image(this.game.width/2, -80, this.lightningBitmap);

    // This adds what is called a "fragment shader" to the lightning sprite.
    // See the fragment shader code below for more information.
    // This is an WebGL feature. Because it runs in your web browser, you need
    // a browser that support WebGL for this to work.
    this.lightning.filters = [ this.game.add.filter('Glow') ];

    // Set the anchor point of the sprite to center of the top edge
    // This allows us to position the lightning by simply specifiying the
    // x and y coordinate of where we want the lightning to appear from.
    this.lightning.anchor.setTo(0.5, 0);

    // Create a white rectangle that we'll use to represent the flash
    this.flash = this.game.add.graphics(0, 0);
    this.flash.beginFill(0xffffff, 1);
    this.flash.drawRect(0, 0, this.game.width, this.game.height);
    this.flash.endFill();
    this.flash.alpha = 0;
    
       // creates the blood effect sprite
    this.blood_effect = this.game.add.sprite(0, 0, 'blood_spritesheet', 0);
    this.blood_effect.scale.set(0.35);
    this.blood_effect.anchor.setTo(0.5);
    this.blood_effect.alpha = 0;
    
    // adds the animation to the blood_effect sprite
    this.blood_effect_anim = this.blood_effect.animations.add('splatter', [0, 0, 1, 1, 2, 2, 3, 4], 24, false);
    this.blood_effect_anim.onComplete.add(this.reset_blood_effect, this);
    
    // creates the burning effect sprite
    this.burning_effect = this.game.add.sprite(0, 0, 'fire_spritesheet', 0);
    this.burning_effect.scale.set(0.75);
    this.burning_effect.anchor.setTo(0.5);
    this.burning_effect.alpha = 0;
    
    // adds the animation to the burning_effect2 sprite
    this.burning_effect_anim = this.burning_effect.animations.add('burning', [0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14], 24, false);
    this.burning_effect_anim.onComplete.add(this.reset_burning_effect, this);
    
    // creates the burning_effect2 sprite (for the dragon boss)
    this.burning_effect2 = this.game.add.sprite(0, 0, 'fire_spritesheet', 0);
    this.burning_effect2.scale.set(0.75);
    this.burning_effect2.anchor.setTo(0.5);
    this.burning_effect2.alpha = 0;
    
    // adds the animation to the burning_effect sprite
    this.burning_effect2_anim = this.burning_effect2.animations.add('charred', [0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14], 24, false);
    this.burning_effect2_anim.onComplete.add(this.reset_burning_effect2, this);
    
    // creates the lingering_lightning effect sprite
    this.lingering_lightning = this.game.add.sprite(0, 0, 'lightning_spritesheet', 0);
    this.lingering_lightning.scale.set(2.25, 1.5);
    this.lingering_lightning.anchor.setTo(0.5);
    this.lingering_lightning.alpha = 0;
    
    // adds the animation to the lingering_lightning sprite
    this.lingering_lightning_anim = this.lingering_lightning.animations.add('crackle', [0, 0, 1, 1, 2, 2, 3, 2, 3, 3, 4, 5, 5, 4, 4, 5, 6], 20, false);
    this.lingering_lightning_anim.onComplete.add(this.reset_lightning_effect, this);
    
    // creates the lingering_lightning effect sprite
    this.lightning_splash = this.game.add.sprite(0, 0, 'lightning_splash_spritesheet', 0);
    this.lightning_splash.scale.set(1.75, 1.5);
    this.lightning_splash.anchor.setTo(0.5);
    this.lightning_splash.alpha = 0;
    
    // adds the animation to the lingering_lightning sprite
    this.lightning_splash_anim = this.lightning_splash.animations.add('impact', [0, 0, 1, 1, 2, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], 24, false);
    this.lightning_splash_anim.onComplete.add(this.reset_lightning_splash, this);
};

// callback method responsible for hiding the blood effect sprite
RPG.BattleState.prototype.reset_blood_effect = function () {
    "use strict";
    this.blood_effect.alpha = 0;
};

// callback method responsible for hiding the burning effect sprite
RPG.BattleState.prototype.reset_burning_effect = function () {
    "use strict";
    this.burning_effect.alpha = 0;
};

// callback method responsible for hiding the burning effect sprite
RPG.BattleState.prototype.reset_burning_effect2 = function () {
    "use strict";
    this.burning_effect2.alpha = 0;
};

// callback method responsible for hiding the blood effect sprite
RPG.BattleState.prototype.reset_lightning_effect = function () {
    "use strict";
    this.lingering_lightning.alpha = 0;
};

// callback method responsible for hiding the lightning splash sprite
RPG.BattleState.prototype.reset_lightning_splash = function () {
    "use strict";
    this.lightning_splash.alpha = 0;
};