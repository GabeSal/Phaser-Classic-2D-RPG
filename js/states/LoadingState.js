// Loadingstate.js

// The loading state is responsible for loading and creating 
// the assets such as images, spritesheets, tilemaps etc.
var RPG = RPG || {};

// calls the Phaser.State methods for Loadingstate
RPG.LoadingState = function () {
    "use strict";
    Phaser.State.call(this);
};

// Loadingstate object constructor
RPG.LoadingState.prototype = Object.create(Phaser.State.prototype);
RPG.LoadingState.prototype.constructor = RPG.LoadingState;

// The init method is a built in function from Phaser that is called when Loadingstate is first instantiated
RPG.LoadingState.prototype.init = function (level_asset_data, next_state, extra_parameters) {
    "use strict";
    // level asset data that includes information on what 
    // asset types will be present in the next_state
    this.level_asset_data = level_asset_data;
    this.next_state = next_state;
    this.extra_parameters = extra_parameters;
    
    // temporary variable that stores a text object for the loading screen displayed for this state.
    var loading_message = this.game.add.text(this.game.world.centerX, this.game.world.centerY, "Loading", {font: "48px Kells", fill: "#ffffff"});
    loading_message.anchor.setTo(0.5, 0.5);
};

// The preload method is a built in function from Phaser that is called after init
RPG.LoadingState.prototype.preload = function () {
    "use strict";
    var assets, asset_loader, asset_key, asset;
    
    // grabs the assets object from the JSON level assets data
    assets = this.level_asset_data.assets;
    
    // loads assets according to asset key
    for (asset_key in assets) { 
        asset = assets[asset_key];
        // switch statement checks for any of the appropriate 
        // asset types to load them into the level correctly
        switch (asset.type) {
        case "image":
            this.load.image(asset_key, asset.source);
            break;
        case "spritesheet":
            this.load.spritesheet(asset_key, asset.source, asset.frame_width, asset.frame_height, asset.frames, asset.margin, asset.spacing);
            break;
        case "tilemap":
            // checks the Phaser.Cache object to see if 
            // the following JSON key is stored depending on the state name
            var name = this.level_asset_data.state.name;
            if (this.game.cache.checkJSONKey(name + "Map")){
                // temporary object that will load as a tilemap object into the level
                var mapData = this.game.cache.getJSON(name + "Map");
                // loads a tilemap with a key using the 'name' variable
                this.load.tilemap(name + "_level_tilemap", null, mapData, Phaser.Tilemap.TILED_JSON);
            } else {
                // if no JSON objects are found in the cache, Loadingstate will create a 
                // tilemap based from the source given in the json file
                this.load.tilemap(asset_key, asset.source, null, Phaser.Tilemap.TILED_JSON);
            }
            break;
        }
    }
    
    // loads all possible user inputs for the current level
    for(var user_input_name in this.level_asset_data.user_input) {
        this.load.text(user_input_name, this.level_asset_data.user_input[user_input_name]);
    }
};

// The create method is a built in function from Phaser that is called after preload
RPG.LoadingState.prototype.create = function () {
    "use strict";
    // starts the next state that is passed, depending on the parameters from Titlestate, Battlestate, Enemy Spawner prefab, or Door prefab
    this.game.state.start(this.next_state, true, false, this.level_asset_data, this.extra_parameters);
};
