// NPC.js

// NPC is a prefab object that handles the npc_messages 
// and shows the message box in the world state
var RPG = RPG || {};

RPG.NPC = function (game_state, name, position, properties) {
    "use strict";
    RPG.Prefab.call(this, game_state, name, position, properties);
    
    this.anchor.setTo(0.5, 0.5);
    
    // stores the message box position to use for the message box object
    this.MESSAGE_BOX_POSITION = {x: 0, y: 0.75 * this.game_state.game.world.height};
    
    // grabs the message from the properties of the npc Tiled object
    this.message = this.game_state.game.cache.getText(properties.message);
    
    // grab the name of the NPC prefab
    this.name = name;
    // store the boolean value of the one_shot property
    this.one_shot = properties.one_shot;
    
    // enable physics
    this.game_state.game.physics.arcade.enable(this);
    // immobilize the object
    this.body.immovable = true;
};

RPG.NPC.prototype = Object.create(RPG.Prefab.prototype);
RPG.NPC.prototype.constructor = RPG.NPC;

// update is a built-in Phaser function that is called constantly throughout the game session
RPG.NPC.prototype.update = function () {
    "use strict";
    // waits for the player to collide with the NPC object to call the talk method
    this.game_state.game.physics.arcade.collide(this, this.game_state.groups.players, this.talk, null, this);
};

// talk is responsible for displaying the message box and the text from the assets/npc_messages file
RPG.NPC.prototype.talk = function (npc, player) {
    "use strict";
    // create a string key for the mapData object
    var mapName = this.game_state.level_asset_data.state.name + "Map";
    // generates a mapData object in order to swap the cache_data
    var mapData = this.game_state.game.cache.getJSON(mapName);
    // gets the length of the map layers
    var mapLength = mapData.layers.length;
    
    // stops player movement
    player.stop();
    // calls the current_message_box method which creates a new message box object, 
    // creating a key using the name and holds the npc's unique message text 
    this.game_state.current_message_box = new RPG.MessageBox(this.game_state, this.name + "_message_box", this.MESSAGE_BOX_POSITION, {texture: "message_box_image", group: "hud", message: this.message});
    // sets the user input to the talking_user_input which only requires the player to press 
    // 'Enter' to close the message box and return to the previous state
    this.game_state.user_input.set_input(this.game_state.user_inputs.talking_user_input);
    
    // for loop that iterates through the objects layer
    for (var i = 0; i < mapData.layers[mapLength - 1].objects.length; i++) {
        // checks to see if the one_shot property exists and is set to true
        if (mapData.layers[mapLength - 1].objects[i].properties.one_shot && this.one_shot) {
            // removes the object from the world state
            mapData.layers[mapLength - 1].objects.splice(i, 1);
            this.kill();
        }
    }
    
    // swap the cache data so the NPC is not respawned in the next generation of this map
    RPG.JSONLevelState.prototype.swap_cache_data.call(this.game_state, this.game_state.level_asset_data.state.name, mapData);
};