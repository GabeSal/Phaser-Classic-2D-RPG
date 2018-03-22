var RPG = RPG || {};

RPG.LoadingState = function () {
    "use strict";
    Phaser.State.call(this);
};

RPG.LoadingState.prototype = Object.create(Phaser.State.prototype);
RPG.LoadingState.prototype.constructor = RPG.LoadingState;

RPG.LoadingState.prototype.init = function (level_data, next_state, extra_parameters) {
    "use strict";
    // level assets
    this.next_state = next_state;
    this.extra_parameters = extra_parameters;
    this.level_data = level_data;

    var loading_message = this.game.add.text(this.game.world.centerX, this.game.world.centerY, "Loading", {font: "48px Kells", fill: "#ffffff"});
    loading_message.anchor.setTo(0.5, 0.5);
};

RPG.LoadingState.prototype.preload = function () {
    "use strict";
    var assets, asset_loader, asset_key, asset;

    assets = this.level_data.assets;
    
    for (asset_key in assets) { // load assets according to asset key
        asset = assets[asset_key];
        switch (asset.type) {
        case "image":
            this.load.image(asset_key, asset.source);
            break;
        case "spritesheet":
            this.load.spritesheet(asset_key, asset.source, asset.frame_width, asset.frame_height, asset.frames, asset.margin, asset.spacing);
            break;
        case "tilemap":
            //TODO: Check if there is town assets data in JSON
            // then use extra data instead of the url
            
            console.log("Loading State: level_data of", this.level_data.state.name, "assets");
            console.log(this.level_data);
                
            if (this.game.cache.checkJSONKey("townMap")){
                var townMapData = this.game.cache.getJSON("townMap");
                console.log("Found town map data in cache.");
                console.log(townMapData);
                //test remove snake enemy
//                var name = "enemy_spawner1"
//                for(var i = 0; i < townMapData.layers[4].objects.length; i++) {
//                    if(townMapData.layers[4].objects[i].name == name) {
//                        townMapData.layers[4].objects.splice(i, 1);
//                        //swap cache data with modified data
//                        break;
//                    }
//                }
                
                this.load.tilemap("level_tilemap", null, townMapData, Phaser.Tilemap.TILED_JSON);
                console.log("created tilemap from cache");
            }else {
                this.load.tilemap(asset_key, asset.source, null, Phaser.Tilemap.TILED_JSON);
                console.log("created tilmap from json file");
            }
            
            
            console.log("Tilemap of", asset.source, "created in game cache.");
            console.log(this.game.cache._cache.tilemap);
            
            break;
        }
    }
    
    for(var user_input_name in this.level_data.user_input) {
        this.load.text(user_input_name, this.level_data.user_input[user_input_name]);
    }
};
    
RPG.LoadingState.prototype.create = function () {
    "use strict";
    this.game.state.start(this.next_state, true, false, this.level_data, this.extra_parameters);
};