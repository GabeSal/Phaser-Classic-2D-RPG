// Equipment.js

// Equipment is responsible for assigning the properties 
// to the equipment displayed in the World state
var RPG = RPG || {};

RPG.Equipment = function (game_state, name, position, properties) {
    "use strict";
    // calls the Prefab class to copy the properties and methods
    RPG.Prefab.call(this, game_state, name, position, properties);
    
    // sets the scale of the object
    this.scale.setTo(0.3, 0.3);
    // sets the origin of the object to the middle
    this.anchor.setTo(0.5, 0.5);
    
    // stores the message box position to use for the message box object
    this.MESSAGE_BOX_POSITION = {x: 0, y: 0.75 * this.game_state.game.world.height};
    
    // grabs the message from the properties of the npc Tiled object
    this.message = this.game_state.game.cache.getText(properties.message);
    
    // gets the info from the properties of the Tiled JSON object
    this.unit_name = properties.unit_name;
    this.body_part = properties.body_part;
    this.stat = properties.stat;
    this.bonus = +properties.bonus;
    
    this.game_state.game.physics.arcade.enable(this);
    this.body.immovable = true;
};

RPG.Equipment.prototype = Object.create(RPG.Prefab.prototype);
RPG.Equipment.prototype.constructor = RPG.Equipment;

RPG.Equipment.prototype.update = function () {
    "use strict";
    this.game_state.game.physics.arcade.collide(this, this.game_state.groups.players, this.collect, null, this);
};

// collect occurs only once through the game session and the equipment is destroyed from the World state
RPG.Equipment.prototype.collect = function () {
    "use strict";
    // grabs the unit_data from the default_party_data object
    var unit_data = this.game_state.game.party_data[this.unit_name];
    
    // checks to see if the players' equipment name matches the prefab name
    if (unit_data.equipment[this.body_part].name !== this.name) {
        // if not, then the body part of the units' equipment is updated
        unit_data.equipment[this.body_part] = {name: this.name};
        unit_data.stats_bonus[this.stat] = this.bonus;
        // kills the equipment object
        this.kill();
        // removes the equipment prefab from the JSON map in the cache
        this.remove_equipment_from_map(this.name);
        
        // updates the firebase
        firebase.database().ref("/users/" + firebase.auth().currentUser.uid + "/party_data").set(this.game_state.game.party_data);
    }
    // stop player movement
    this.game_state.prefabs.player.stop();
    
    // calls the current_message_box method which creates a new message box object, 
    // creating a key using the name and holds the npc's unique message text 
    this.game_state.current_message_box = new RPG.MessageBox(this.game_state, this.name + "_message_box", this.MESSAGE_BOX_POSITION, {texture: "message_box_image", group: "hud", message: this.message});
    // sets the user input to the talking_user_input which only requires the player to press 
    // 'Enter' to close the message box and return to the previous state
    this.game_state.user_input.set_input(this.game_state.user_inputs.talking_user_input);
};

// remove_equipment_from_map destroys the equipment from the map cache data
RPG.Equipment.prototype.remove_equipment_from_map = function (equipment_name) {
    "use strict";
    // checks if a name has been passed into the function
    var equipment_name = equipment_name;
    
    // creates a string as a key using the game_states level_asset_data 
    // for the mapData below
    var mapName = this.game_state.level_asset_data.state.name + "Map";
    
    // mapData that points to the json map data in the cache
    var mapData = this.game.cache.getJSON(mapName);
    
    // for loop that iterates through all of the objects and
    // tries to match their name/key with the equipment_name
    for(var i = 0; i < mapData.layers[4].objects.length; i++) {
        if(mapData.layers[4].objects[i].name == equipment_name) {
            mapData.layers[4].objects.splice(i, 1);
            break;
        }
    }
};