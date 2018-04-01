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