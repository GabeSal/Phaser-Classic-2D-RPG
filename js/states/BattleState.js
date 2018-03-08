var RPG = RPG || {};

RPG.BattleState = function () {
    "use strict";
    RPG.JSONLevelState.call(this);
        
    this.prefab_classes = {
        background: RPG.Prefab.prototype.constructor,
        player_unit: RPG.PlayerUnit.prototype.constructor,
        enemy_unit: RPG.EnemyUnit.prototype.constructor,
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

RPG.BattleState.prototype.init = function (level_data, extra_parameters) {
    "use strict";
    RPG.JSONLevelState.prototype.init.call(this, level_data);
    
    this.previous_level = extra_parameters.previous_level;
    this.encounter = extra_parameters.encounter;
};

RPG.BattleState.prototype.preload = function () {
    "use strict";
    // loads the experience table for leveling up
    this.load.text("experience_table", "assets/levels/experience_table.json");
};

RPG.BattleState.prototype.create = function () {
    "use strict";
    RPG.JSONLevelState.prototype.create.call(this);
    
    this.game.inventory.collect_item(this, {"type": "health_potion", "properties": {"group": "items", "item_texture": "health_potion_image", "health_gain": 25}});
    
    this.game.inventory.create_menu(this, this.prefabs.items_menu);
    
    this.experience_table = JSON.parse(this.game.cache.getText("experience_table"));
    
    // instantiates party stats in battle
    for (var player_unit_name in this.game.party_data) {
        var unit_data = this.game.party_data[player_unit_name];
        var stats_bonus = this.game.party_data[player_unit_name].stats_bonus;
        this.prefabs[player_unit_name].stats = {};
        for (var stat_name in unit_data.stats) {
            this.prefabs[player_unit_name].stats[stat_name] = unit_data.stats[stat_name] + stats_bonus[stat_name];
        }
        
        this.prefabs[player_unit_name].experience = unit_data.experience;
        this.prefabs[player_unit_name].current_level = unit_data.current_level;
        
    }
    
    for (var prefab_name in this.encounter.enemy_data) {
        this.create_prefab(prefab_name, this.encounter.enemy_data[prefab_name]);
    }
    
    this.units = new PriorityQueue({comparator: function (unit_a, unit_b) {
        return unit_a.act_turn - unit_b.act_turn;
    }});
    
    this.groups.player_units.forEach(function (unit) {
        unit.calculate_act_turn(0);
        this.units.queue(unit);
    }, this);
    
    this.groups.enemy_units.forEach(function (unit) {
        unit.calculate_act_turn(0);
        this.units.queue(unit);
    }, this);
    
    this.next_turn();
};

RPG.BattleState.prototype.next_turn = function () {
    "use strict";
    if(this.groups.enemy_units.countLiving() === 0) {
        this.end_battle();
        return;
    }
    
    if(this.groups.player_units.countLiving() === 0) {
        this.game_over();
        return;
    }
    
    this.current_unit = this.units.dequeue();
    if (this.current_unit.alive) {
        this.current_unit.act();
        this.current_unit.calculate_act_turn(this.current_unit.act_turn);
        this.units.queue(this.current_unit);
    } else {
        this.next_turn();
    }
};

RPG.BattleState.prototype.back_to_world = function () {
    "use strict";
    this.game.state.start("BootState", true, false, this.previous_level, "WorldState");
};

RPG.BattleState.prototype.game_over = function () {
    "use strict";
    this.game.state.start("BootState", true, false, "assets/levels/title_screen.json", "TitleState");
};

RPG.BattleState.prototype.end_battle = function () {
    "use strict";
    var received_experience = this.encounter.reward.experience;
    this.groups.player_units.forEach(function (player_unit) {
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
    
    this.back_to_world();
};