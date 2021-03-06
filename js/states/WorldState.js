// WorldState.js

// World State is the world stage for the game and displays the assets depending on the 
var RPG = RPG || {};

RPG.WorldState = function () {
    "use strict";
    RPG.JSONLevelState.call(this);
    
    // list of prefab_classes (object type) used in this state
    this.prefab_classes = {
        player: RPG.Player.prototype.constructor,
        door: RPG.Door.prototype.constructor,
        npc: RPG.NPC.prototype.constructor,
        treasure: RPG.Treasure.prototype.constructor,
        enemy_spawner: RPG.EnemySpawner.prototype.constructor,
        equipment: RPG.Equipment.prototype.constructor
    };
    
    // variable used to keep the style of text for the message box
    this.TEXT_STYLE = {font: "16px Georgia", fill: "#FFFFFF"};
};

RPG.WorldState.prototype = Object.create(RPG.JSONLevelState.prototype);
RPG.WorldState.prototype.constructor = RPG.WorldState;

RPG.WorldState.prototype.init = function (level_asset_data, extra_parameters) {
    "use strict";
    RPG.JSONLevelState.prototype.init.call(this, level_asset_data);
    
    // starts the physics engine from Phaser.Physics
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    // sets the gravity to none as there is no need for the player and other objects to fall
    this.game.physics.arcade.gravity.y = 0;
    
    // save the extra_parameters so as to correctly load the player 
    // during the place_player_to_correct door method
    this.extra_parameters = extra_parameters;
    
    // flag that checks to see if the arcane grimoire is in the mage's inventory
    this.mage_acquired_grimoire = false;
};

RPG.WorldState.prototype.preload = function() {
    "use strict";
    // loads NPC dialogue
    for (var npc_message_name in this.level_asset_data.npc_messages) {
        this.load.text(npc_message_name, this.level_asset_data.npc_messages[npc_message_name]);
    }
    // loads all enemy encounters from the level assets object
    for (var enemy_encounter_name in this.level_asset_data.enemy_encounters) {
        this.load.text(enemy_encounter_name, this.level_asset_data.enemy_encounters[enemy_encounter_name]);
    }
    
    // stores the town_music audio object in the WorldState
    if (this.town_music == undefined) {
        this.town_music = this.game.add.audio("town_music");
    }
    
    // TODO Find cave music
    /*// stores the cave_music audio object in the WorldState
    if (this.cave_music == undefined) {
        this.cave_music = this.game.add.audio("cave_music");*/
};

// create is responsible for setting up the map object, 
// tile layers, and object layers in the this.map group
RPG.WorldState.prototype.create = function () {
    "use strict";
    var tileset_index, group_name, object_layer, collision_tiles, user_input_name;
    
    // creates map object and sets the key to the this.level_asset_data.map.key
    this.map = this.game.add.tilemap(this.level_asset_data.map.key);
    tileset_index = 0;
    // forEach function that iterates through all of the tileset images included for this map
    this.map.tilesets.forEach(function (tileset) {
        this.map.addTilesetImage(tileset.name, this.level_asset_data.map.tilesets[tileset_index]);
        tileset_index++;
    }, this);
    
    // this.layers will hold all of the layers defined in the map levels data in an object
    this.layers = {};
    // forEach function iterates through all of the layers from the map levels data 
    // and creates a new layer in the map object above. 
    this.map.layers.forEach(function (layer) {
        this.layers[layer.name] = this.map.createLayer(layer.name);
        // checks for the collision property and if it's set to 'true'
        if(layer.properties.collision){ 
            // setCollisionByExclusion([indexes], collides, layer (string, number, or Phaser.TilemapLayer), recalculate)
            // Sets collision on all tiles in the given layer, except for the IDs of those in the given array. 
            // The collides parameter controls if collision will be enabled (true) or disabled (false).
            this.map.setCollisionByExclusion([-1], true, layer.name);
        }
    }, this);
    
    // resize the world to be the size of the current layer
    this.layers[this.map.layer.name].resizeWorld();
    
    // calls the create method from the JSON Level State to produce the groups and prefabs
    RPG.JSONLevelState.prototype.create.call(this);
    
    // for loop that iterates through all of the object layers in this.map.objects
    // and then calls the create_object method
    for(object_layer in this.map.objects) {
        if(this.map.objects.hasOwnProperty(object_layer)) {
            // creates the layer objects
            this.map.objects[object_layer].forEach(this.create_object, this);
        }
    }
    
    // play the town music as long as the player is in the "town areas"
    if (!this.town_music.isPlaying && this.level_asset_data.state.name.includes("town")) {
        this.town_music.play('', 0, 0.45, true);
    }
};

// create_object is the method that positions the objects from the object_layers in this.map
RPG.WorldState.prototype.create_object = function (object) {
    "use strict";
    var object_y, position, prefab;
    
    // checks to see if the object being created is part of the equipment class
    if(object.type == "equipment") {
        // calls the check_inventory method and passes the name of the equipment
        this.check_inventory(object.name);
    }
    
    // checks to see if the player has passed through a door
    if (this.extra_parameters != undefined) {
        if (object.name == this.extra_parameters.door_name) {
            // call the JSONLevelState method to change player position
            this.place_player_to_correct_door(this.extra_parameters.player_facing, this.extra_parameters.door_name);
        }
    }
    
    // tiled coordinates starts in the bottom left corner and is repositioned to the center of the tile
    object_y = (object.gid) ? object.y - (this.map.tileHeight / 2) : object.y + (object.height / 2);
    position = {"x": object.x + (this.map.tileHeight / 2), "y": object_y};
    
    // create object according to its type 
    if (this.prefab_classes.hasOwnProperty(object.type)) {
        prefab = new this.prefab_classes[object.type](this, object.name, position, object.properties);
    }
    
    // adds the prefab into the prefabs group using the object.name for the index
    this.prefabs[object.name] = prefab;
};

// check inventory will remove the equipment prefab from the map if 
// the prefab is found in the player inventory
RPG.WorldState.prototype.check_inventory = function (equipment_name) {
    "use strict";
    var body_part, mage_unit_data, mapData, mapLength, mapName, part, warrior_unit_data;
    
    // gets the unit_data from the party data in both firebase and 
    // default_party, depending if the player is returning or starting a new game.
    warrior_unit_data = this.game.party_data["warrior"];
    mage_unit_data = this.game.party_data["mage"];
    
    // list of possible armor/equipment placements
    body_part = ["head", "body", "legs", "feet", "weapon"];
    
    // creates a string as a key using the game_states level_asset_data 
    // for the mapData below
    mapName = this.level_asset_data.state.name + "Map";
    
    // mapData that points to the json map data in the cache
    mapData = this.game.cache.getJSON(mapName);
    
    // get the layers length in the current map
    mapLength = mapData.layers.length;
    
    // checks mage inventory to see if the mage has the arcane grimoire
    if (mage_unit_data.equipment.weapon.name == "arcane_grimoire") {
        // set the flag to true
        this.mage_acquired_grimoire = true;
        // see EnemySpawner
    }
    console.log(this.mage_acquired_grimoire);
    // iterates through all of the body parts in warrior_unit_data
    for (var i in body_part) {
        
        // stores the body_part string in a temp variable
        part = body_part[i];
        
        // calls the despawn_equipment method if any of the equipment isn't on default
        if (warrior_unit_data.equipment[part].name == equipment_name) {
            
            // for loop that iterates through all of the objects and
            // tries to match their name/key with the equipment_name
            for(var i = 0; i < mapData.layers[mapLength - 1].objects.length; i++) {
                if(mapData.layers[mapLength - 1].objects[i].name == equipment_name) {
                    // remove the object from the mapData in the cache object
                    mapData.layers[mapLength - 1].objects.splice(i, 1);
                    break;
                }
            }
            console.log("Despawning", warrior_unit_data.equipment[part].name + "...");
            RPG.JSONLevelState.prototype.swap_cache_data.call(this, this.level_asset_data.state.name, mapData);
            // reboot world state to show new mapData
            this.game.state.start("BootState", true, false, "assets/asset_data/" + this.level_asset_data.state.name + ".json", "WorldState");
        } 
    }
    
    // iterates through all of the body parts in mage_unit_data
    for (var i in body_part) {
        
        // stores the body_part string in a temp variable
        part = body_part[i];
        
        // calls the despawn_equipment method if any of the equipment isn't on default
        if (mage_unit_data.equipment[part].name == equipment_name) {
            
            // for loop that iterates through all of the objects and
            // tries to match their name/key with the equipment_name
            for(var i = 0; i < mapData.layers[mapLength - 1].objects.length; i++) {
                if(mapData.layers[mapLength - 1].objects[i].name == equipment_name) {
                    // remove the object from the mapData in the cache object
                    mapData.layers[mapLength - 1].objects.splice(i, 1);
                    break;
                }
            }
            console.log("Despawning", mage_unit_data.equipment[part].name + "...");
            RPG.JSONLevelState.prototype.swap_cache_data.call(this, this.level_asset_data.state.name, mapData);
            // reboot world state to show new mapData
            this.game.state.start("BootState", true, false, "assets/asset_data/" + this.level_asset_data.state.name + ".json", "WorldState");
        }
    }
};

// the close_message_box method removes the message box sprite from display
RPG.WorldState.prototype.close_message_box = function () {
    "use strict";
    // kills the message box object
    this.current_message_box.kill();
    // sets the user_input to the world_map_user_inputs
    this.user_input.set_input(this.user_inputs.world_map_user_input);
};

// pause_game stops the WorldState and displays the current status of the users party 
// TODO: and their inventory
RPG.WorldState.prototype.pause_game = function () {
    "use strict";
    // this variable grabs the player prefab position data and passes it to the get_player_object method
    var player_position = {x: this.prefabs.player.position.x, y: this.prefabs.player.position.y, facing: this.game_state.prefabs.player.current_direction};
    this.get_player_object(player_position);
    // starts the pause state which displays all of the information about the player so far
    this.game.state.start("BootState", true, false, "assets/asset_data/pause_screen.json", "PauseState", {previous_level: this.level_asset_data.assets_path});
};
