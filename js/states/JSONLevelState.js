// JSONLevelState.js

// JSON Level state is responsible for creating the groups, 
// prefabs, prefab_classes, and mapping the user inputs
var RPG = RPG || {};

RPG.JSONLevelState = function () {
    "use strict";
    Phaser.State.call(this);
};

RPG.JSONLevelState.prototype = Object.create(Phaser.State.prototype);
RPG.JSONLevelState.prototype.constructor = RPG.JSONLevelState;

// The init method is a built in function from Phaser that is called when Bootstate is first instantiated
RPG.JSONLevelState.prototype.init = function (level_asset_data) {
    "use strict";
    this.level_asset_data = level_asset_data;
};

// The create method is a built in function from Phaser that is called after init
RPG.JSONLevelState.prototype.create = function () {
    "use strict";
    var prefab_name, prefab_data;
    
    // this.groups is a Phaser group object created to hold  
    // all of the groups defined in the level asset file
    this.groups = {};
    
    // a forEach function iterates through the entirety of the 
    // groups property in the level asset file
    this.level_asset_data.groups.forEach(function (group_name) {
        // this.groups object then adds the group using the group_name as the index
        this.groups[group_name] = this.game.add.group();
    }, this);
    
    // this.prefabs is created as an empty object
    this.prefabs = {};
    // a for loop iterates through the prefabs property found in the level asset file
    for (prefab_name in this.level_asset_data.prefabs) {
        prefab_data = this.level_asset_data.prefabs[prefab_name];
        // calls the create_prefab method, passing the prefab name and data
        this.create_prefab(prefab_name, prefab_data);
    }
    
    // checks to see if level data has defined user inputs
    if (this.level_asset_data.user_input) {
        // creates a plugins object that adds the user input data from 
        // the user_inputs property from this.level_asset_data
        this.user_input = this.game.plugins.add(RPG.UserInput, this);
        
        // creates an empty object for the user_inputs property
        this.user_inputs = {};
        // for loop that iterates through the this.level_asset_data to find and add 
        // all user inputs to the this.user_inputs object
        for (var user_input_name in this.level_asset_data.user_input) {
            // parses the this.level_asset_data.user_input json into a JSON object 
            // using the user_input_name as the key
            this.user_inputs[user_input_name] = JSON.parse(this.game.cache.getText(user_input_name));
        }
        // grabs the key from the initial_user_input defined in the level asset file and parses it into a JSON object
        this.user_input_data = JSON.parse(this.game.cache.getText(this.level_asset_data.initial_user_input));
        
        // calls the set_input method defined in RPG.UserInput, passing the this.user_input_data object
        this.user_input.set_input(this.user_input_data);
    }
};

// create_prefab is responsible for producing and placing the prefabs in the game world 
// and adding them to the prefab_classes object in each state
RPG.JSONLevelState.prototype.create_prefab = function (prefab_name, prefab_data) {
    "use strict";
    // checks the this.prefab_classes object to see if they match the prefab_data.type
    // i.e. if this.prefab_classes 'background' matches 'background' defined in the title screen level assets json
    if (this.prefab_classes.hasOwnProperty(prefab_data.type)) {
        var prefab = new this.prefab_classes[prefab_data.type](this, prefab_name, prefab_data.position, prefab_data.properties);
    }
    
    return prefab;
};

// change_player_position uses the player prefab or another object to roughly place the  
// player prefab in the world stage where the user had last left it
RPG.JSONLevelState.prototype.change_player_position = function (player_object, new_position) {
    "use strict";
    // grab player object data (player spawner), not prefab
    var player_object = player_object;
    // new_position is the position of an enemy_spawner or the player prefab 
    // when the user changes to the pause state
    var new_position = new_position;
    
    // grabs the name of the current state from this.level_asset_data
    var current_state = this.level_asset_data.state.name
    
    // grab cache data in order to change the JSON cache later
    var cache_data = this.game.cache.getJSON(current_state + "Map");
    
    // stores the layers length from this.map into a temp variable
    var layers_length = cache_data.layers.length - 1;
    
    // change player objects' (player spawner) x position
    if(cache_data.layers[layers_length].objects[0].x == player_object.x) {
        cache_data.layers[layers_length].objects[0].x = new_position.x;
    }
    // change player objects' (player spawner) y position
    if(cache_data.layers[layers_length].objects[0].y == player_object.y) {
        cache_data.layers[layers_length].objects[0].y = new_position.y;
    }
    
    // swap the current JSON cache with the new cache data
    this.swap_cache_data(current_state, cache_data);
};

// swap_cache_data is the method responsible for updating the cache in the 
// Phaser.Game object to ensure the JSON map data is consistent throughout the game session
RPG.JSONLevelState.prototype.swap_cache_data = function (state, new_data) {
    "use strict";
    
    // mapKey is a string that is modifiable so as to avoid 
    // hardcoding the keys used for the mapData object below
    var mapKey = state + "Map";
    // grabs the JSON object from the cache using the mapKey string
    var mapData = this.game.cache.getJSON(mapKey);
    
    // removes the current JSON object from the cache
    this.game.cache.removeJSON(mapKey);
    // checks to see if there is no data in the new_data object
    if (!new_data) {
        // creates and adds a JSON object from the mapData object to the cache
        this.game.cache.addJSON(mapKey, null, mapData);
    } else {
        // creates and adds a JSON object using the new_data object to the cache
        this.game.cache.addJSON(mapKey, null, new_data);
    }
}