// Door.js

// Door is a prefab type that will be responsible for 
// transporting the player to a new stage in the Worldstate
var RPG = RPG || {};

RPG.Door = function (game_state, name, position, properties) {
    "use strict";
    RPG.Prefab.call(this, game_state, name, position, properties);
    
    // stores the player_direction to use for placing the player after they enter
    this.player_direction = properties.player_direction;
    
    // sets the objects origin to the middle
    this.anchor.setTo(0.5, 0.5);
    
    // next_level_assets stores the next_level property defined 
    // in the Tiled JSON data object of each door
    this.next_level_assets = properties.next_level;
    
    // enables physics
    this.game_state.game.physics.arcade.enable(this);
    // immobilizes the object
    this.body.immovable = true;
};

RPG.Door.prototype = Object.create(RPG.Prefab.prototype);
RPG.Door.prototype.constructor = RPG.Door;

// update is a built-in Phaser function that is called constantly throughout the game session
RPG.Door.prototype.update = function () {
    "use strict";
    // this function waits for the player to collide with the door prefab in order to execute the enter method
    this.game_state.game.physics.arcade.collide(this, this.game_state.groups.players, this.enter, null, this);
};

// enter transports the player to a specified position
// using the level assets path in this.next_level_assets
RPG.Door.prototype.enter = function () {
    "use strict";
    var player_direction;
    
    // store the player_direction they are facing
    player_direction = this.game_state.prefabs.player.current_direction;
    // calls the WorldState get_player_object method, passing in the player_position object
    this.game_state.change_player_position(player_direction, this.name);
    // starts the Bootstate to show the next map
    this.game_state.game.state.start("BootState", true, false, this.next_level_assets, "WorldState", {door_name: this.name, player_facing: player_direction});
};