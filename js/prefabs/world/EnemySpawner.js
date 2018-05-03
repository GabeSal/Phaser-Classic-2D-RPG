// EnemySpawner.js

// Enemy spawner is where the enemy spawner receives the world stage information and 
// new position for the player before sending them to the Battlestate
var RPG = RPG || {};

RPG.EnemySpawner = function (game_state, name, position, properties) {
    "use strict";
    // calls the Prefab class to create all of the instances of enemy spawner
    RPG.Prefab.call(this, game_state, name, position, properties);
    
    // sets the origin point for each object to the middle
    this.anchor.setTo(0.5, 0.5);
    
    // grabs the encounter data from the properties in the this.level_asset_data JSON object
    this.encounter = JSON.parse(this.game_state.game.cache.getText(properties.encounter));
    
    // enables physics
    this.game_state.game.physics.arcade.enable(this);
    // immobilizes the object
    this.body.immovable = true;
};

RPG.EnemySpawner.prototype = Object.create(RPG.Prefab.prototype);
RPG.EnemySpawner.prototype.constructor = RPG.EnemySpawner;

// update is a built-in Phaser function that is called constantly throughout the game session
RPG.EnemySpawner.prototype.update = function () {
    "use strict";
    // this function waits for the enemy_spawner to collide with the player to trigger the spawn method, 
    // which boots the player to the Battlestate
    this.game_state.game.physics.arcade.collide(this, this.game_state.groups.players, this.spawn, null, this);
};

// spawn brings the player to Battlestate and passes many parameters in order to update the cache accordingly
RPG.EnemySpawner.prototype.spawn = function () {
    "use strict";
    var player_direction;
    
    player_direction = this.game_state.prefabs.player.current_direction;
    // call Worldstate method to grab player object and pass the player_position object
    this.game_state.change_player_position(player_direction, this.name);
    
    // stop town music
    if (this.game_state.town_music.isPlaying) {
        this.game_state.town_music.stop();
    }
    
    // Boots Battlestate and passes a hard-coded object that includes data on the current map being used, the name of the spawner, the encounter data, 
    // and the position of the spawner so as to update the players' position after they have successfully defeated the enemy
    this.game_state.game.state.start("BootState", true, false, "assets/asset_data/battle.json", "BattleState", {previous_level: this.game_state.level_asset_data.assets_path, returning_state: this.game_state.level_asset_data.state.name, encounter: this.encounter, enemy_name: this.name, acquired_grimoire: this.game_state.mage_acquired_grimoire});
};