// Prefab.js

// Prefab is class that defines all of the sprites 
// loaded into the game using the level assets JSON data
var RPG = RPG || {};

RPG.Prefab = function (game_state, name, position, properties) {
    "use strict";
    // Phaser.Sprite(game, x, y, frame/properties)
    // calls the Phaser.Sprite method to copy all of the properties and methods to this class
    Phaser.Sprite.call(this, game_state.game, position.x, position.y, properties.texture);
    
    // grabs the current game_state in order 
    // to share this data with all of the other prefabs
    this.game_state = game_state;
    // grabs the name of the prefab
    this.name = name;
    // adds the prefab in the appropriate group defined 
    // in the level assets JSON data
    this.game_state.groups[properties.group].add(this);
    
    // grabs the frame data defined in the properties of this.level_assets_data
    this.frame = +properties.frame;
    
    // other possible property tweaks
    if (properties.scale) {
        this.scale.setTo(properties.scale.x, properties.scale.y);
    }
    
    if (properties.anchor) {
        this.anchor.setTo(properties.anchor.x, properties.anchor.y);
    }
    
    // changes color of the sprite to help player 
    // differentiate enemies of the same type and for variety
    if(properties.tint) {
        this.tint = properties.tint;
    }
    
    // assigns the prefab to the prefabs group using the name as an index
    this.game_state.prefabs[name] = this;
};

RPG.Prefab.prototype = Object.create(Phaser.Sprite.prototype);
RPG.Prefab.prototype.constructor = RPG.Prefab;