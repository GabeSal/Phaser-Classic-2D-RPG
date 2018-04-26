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
    
    // flag that determines if the player is in control
    this.is_players_turn = false;
};

RPG.BattleState.prototype.preload = function () {
    "use strict";
    // loads the experience table defining the XP needed for leveling up
    this.load.text("experience_table", "assets/asset_data/experience_table.json");
    
    // loads the experience table defining the XP needed for leveling up
    this.load.text("original_party_data", "assets/asset_data/default_party_data.json");
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
}