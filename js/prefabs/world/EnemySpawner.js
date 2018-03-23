var RPG = RPG || {};

RPG.EnemySpawner = function (game_state, name, position, properties) {
    "use strict";
    RPG.Prefab.call(this, game_state, name, position, properties);
    
    this.anchor.setTo(0.5, 0.5);
    
    this.encounter = JSON.parse(this.game_state.game.cache.getText(properties.encounter));
    this.enemy_spawn_position = this.position;
    
    this.game_state.game.physics.arcade.enable(this);
    this.body.immovable = true;
};

RPG.EnemySpawner.prototype = Object.create(RPG.Prefab.prototype);
RPG.EnemySpawner.prototype.constructor = RPG.EnemySpawner;

RPG.EnemySpawner.prototype.update = function () {
    "use strict";
    this.game_state.game.physics.arcade.collide(this, this.game_state.groups.players, this.spawn, null, this);
};

RPG.EnemySpawner.prototype.spawn = function () {
    "use strict";
    // call Worldstate method to grab player object
    RPG.WorldState.prototype.get_player_object.call(this.game_state, this.enemy_spawn_position);
    
    this.game_state.game.state.start("BootState", true, false, "assets/levels/battle.json", "BattleState", {previous_level: this.game_state.level_data.level_file, returning_state: this.game_state.level_data.state.name, encounter: this.encounter, enemy_name: this.name, new_position: this.enemy_spawn_position});
};