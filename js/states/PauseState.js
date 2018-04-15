// PauseState.js

// Pause state removes the player from the world state and displays  
// all of the stats and TODO: equipment the player had picked up
var RPG = RPG || {};

RPG.PauseState = function () {
    "use strict";
    RPG.JSONLevelState.call(this);
    
    // list of all the prefab_classes used in this state
    this.prefab_classes = {
        background: RPG.Prefab.prototype.constructor,
        unit_stats: RPG.UnitStats.prototype.constructor,
        show_player_status: RPG.ShowPartyDataInPauseScreen.prototype.constructor
    }
};

RPG.PauseState.prototype = Object.create(RPG.JSONLevelState.prototype);
RPG.PauseState.prototype.constructor = RPG.PauseState;

RPG.PauseState.prototype.init = function (level_asset_data, extra_parameters) {
    "use strict";
    RPG.JSONLevelState.prototype.init.call(this, level_asset_data);
    // grabs the previous level path from this.level_asset_data.assets_path
    this.previous_level = extra_parameters.previous_level;
};

RPG.PauseState.prototype.preload = function () {
    "use strict";
    // loads in the experience table for the experience text
    this.load.text("experience_table", "assets/asset_data/experience_table.json");
};

// the create method will iterate through the party data to position the text and sprites
RPG.PauseState.prototype.create = function () {
    "use strict";
    RPG.JSONLevelState.prototype.create.call(this);
    
    // for loop that grabs the index of this.game.party_data using player_unit_name
    for (var player_unit_name in this.game.party_data) {
        // temporarily stores the unit_data
        var unit_data = this.game.party_data[player_unit_name];
        // instantiates the stats in the this.prefabs group for Pause state
        this.prefabs[player_unit_name].stats = {};
        // for loop that adds the stats_bonus to the original stats in the player_unit object
        // as well as storing this info into the this.prefabs.stats group
        for (var stat_name in unit_data.stats) {
            this.prefabs[player_unit_name].stats[stat_name] = unit_data.stats[stat_name];
        }
        
        // stores the experience and level into the this.prefabs 
        // group to their associated player_unit
        this.prefabs[player_unit_name].experience = unit_data.experience;
        this.prefabs[player_unit_name].current_level = unit_data.current_level;
    }
};

// back_to_world brings the user back to WorldState
RPG.PauseState.prototype.back_to_world = function () {
    "use strict";
    this.game.state.start("BootState", true, false, this.previous_level, "WorldState");
};