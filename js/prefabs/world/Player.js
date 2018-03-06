var RPG = RPG || {};

RPG.Player = function (game_state, name, position, properties) {
    "use strict";
    RPG.Prefab.call(this, game_state, name, position, properties);
    
    this.anchor.setTo(0.5, 0.5);
    
    this.walking_speed = +properties.walking_speed;
    
    this.game_state.game.physics.arcade.enable(this);
    this.body.collideWorldBounds = true;
    
    this.animations.add("walking_down", [0, 4, 8, 12], 8, true);
    this.animations.add("walking_up", [1, 5, 9, 13], 8, true);
    this.animations.add("walking_left", [2, 6, 10, 14], 8, true);
    this.animations.add("walking_right", [3, 7, 11, 15], 8, true);
    
    this.stopped_frames = [0, 2, 3, 1];
    
    this.moving = {left: false, right: false, up: false, down: false};
    
};

RPG.Player.prototype = Object.create(RPG.Prefab.prototype);
RPG.Player.prototype.constructor = RPG.Player;

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
        this.body.velocity.x = -this.walking_speed;
        if (this.body.velocity.y === 0) {
            this.animations.play("walking_left");
        }
    // move right
    } else if (this.moving.right && this.body.velocity.x >= 0) {
        this.body.velocity.x = this.walking_speed;
        if (this.body.velocity.y === 0) {
            this.animations.play("walking_right");
        }
    } else {
        this.body.velocity.x = 0;
    }
    
    // move up
    if (this.moving.up && this.body.velocity.y <= 0) {
        this.body.velocity.y = -this.walking_speed;
        if (this.body.velocity.x === 0) {
            this.animations.play("walking_up");
        }
    // move down
    } else if (this.moving.down && this.body.velocity.y >= 0) {
        this.body.velocity.y = this.walking_speed;
        if (this.body.velocity.x === 0) {
            this.animations.play("walking_down");
        }
    } else {
        this.body.velocity.y = 0;
    }
    
    if (this.body.velocity.x === 0 && this.body.velocity.y === 0) {
        // stop current animation
        this.animations.stop();
        this.frame = this.stopped_frames[this.body.facing];
    }
};

RPG.Player.prototype.change_movement = function (direction, move) {
    "use strict";
    this.moving[direction] = move;
};

RPG.Player.prototype.stop = function () {
    "use strict";
    this.moving = {left: false, right: false, up: false, down: false};
};