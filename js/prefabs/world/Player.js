// Player.js

// Player is where the animations, collision detection, 
// and controls for the player is saved.
var RPG = RPG || {};

RPG.Player = function (game_state, name, position, properties) {
    "use strict";
    RPG.Prefab.call(this, game_state, name, position, properties);
    
    this.anchor.setTo(0.5, 0.5);
    
    // gets the walking_speed property from the Tiled object
    this.walking_speed = +properties.walking_speed;
    
    // enables physics
    this.game_state.game.physics.arcade.enable(this);
    // enables collision to world bounds to 
    // avoid having the player 'exit' the world
    this.body.collideWorldBounds = true;
    
    // saves all the animations for the player walking cycle in all directions
    this.animations.add("walking_down", [0, 4, 8, 12], 8, true);
    this.animations.add("walking_up", [1, 5, 9, 13], 8, true);
    this.animations.add("walking_left", [2, 6, 10, 14], 8, true);
    this.animations.add("walking_right", [3, 7, 11, 15], 8, true);
    
    // stores the frames in which the player is idle
    this.stopped_frames = [0, 2, 3, 1];
    
    // conditional that defaults to false so that the player animations 
    // don't continue to play after inputs have stopped
    this.moving = {left: false, right: false, up: false, down: false};
};

RPG.Player.prototype = Object.create(RPG.Prefab.prototype);
RPG.Player.prototype.constructor = RPG.Player;

// update is a built-in Phaser function that is called constantly throughout the game session
RPG.Player.prototype.update = function () {
    "use strict";
    // checks collision with 'buildings' layer
    this.game_state.game.physics.arcade.collide(this, this.game_state.layers.buildings);
    
    // checks collision with 'props' layer
    this.game_state.game.physics.arcade.collide(this, this.game_state.layers.props); 
    
    // checks collision with 'rocks' layer in the cave
    this.game_state.game.physics.arcade.collide(this, this.game_state.layers.rocks1);
    
    // move left
    if (this.moving.left && this.body.velocity.x <= 0) {
        // velocity decreases to move player to the left
        this.body.velocity.x = -this.walking_speed;
        if (this.body.velocity.y === 0) {
            // play the walking animation
            this.animations.play("walking_left");
        }
    // move right
    } else if (this.moving.right && this.body.velocity.x >= 0) {
        // velocity increases to move player to the right
        this.body.velocity.x = this.walking_speed;
        if (this.body.velocity.y === 0) {
            // play the walking animation
            this.animations.play("walking_right");
        }
    } else {
        this.body.velocity.x = 0;
    }
    
    // move up
    if (this.moving.up && this.body.velocity.y <= 0) {
        // velocity decreases to move player to the up
        this.body.velocity.y = -this.walking_speed;
        if (this.body.velocity.x === 0) {
            // play the walking animation
            this.animations.play("walking_up");
        }
    // move down
    } else if (this.moving.down && this.body.velocity.y >= 0) {
        // velocity increases to move player to the down
        this.body.velocity.y = this.walking_speed;
        if (this.body.velocity.x === 0) {
            // play the walking animation
            this.animations.play("walking_down");
        }
    } else {
        // set body y velocity 0 when both the 
        // up and down keys aren't being pressed
        this.body.velocity.y = 0;
    }
    
    // checks to see if the player velocity is 
    if (this.body.velocity.x === 0 && this.body.velocity.y === 0) {
        // stop current animation
        this.animations.stop();
        // sets frame to the idle frame in the direction they faced
        this.frame = this.stopped_frames[this.body.facing];
    }
};

// callback method that's called in the world_map_user_inputs data passing 
// in the direction and setting move to true
RPG.Player.prototype.change_movement = function (direction, move) {
    "use strict";
    this.moving[direction] = move;
};

// stop forces the moving flag to default to false in the event of NPC dialogue or otherwise
RPG.Player.prototype.stop = function () {
    "use strict";
    this.moving = {left: false, right: false, up: false, down: false};
};