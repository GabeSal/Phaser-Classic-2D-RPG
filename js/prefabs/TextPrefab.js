// TextPrefab.js

// Text Prefab functions the same as the Prefab class 
// however, it deals with texts rather than sprites
var RPG = RPG || {};

RPG.TextPrefab = function (game_state, name, position, properties) {
    "use strict";
    // Phaser.Text(game, x, y, extra parameters)
    // calls the Phaser.Text method to copy all of the properties and methods to this class
    Phaser.Text.call(this, game_state.game, position.x, position.y, properties.text, properties.style);
    
    // grabs the current game_state in order 
    // to share this data with all of the other prefabs
    this.game_state = game_state;
    // grabs the name of the prefab
    this.name = name;
    // adds the prefab in the appropriate group defined 
    // in the level assets JSON data
    this.game_state.groups[properties.group].add(this);
    
    // grabs the frame data defined in the properties of this.level_assets_data
    this.frame = properties.frame;

    // other possible property tweaks
    if (properties.scale) {
        this.scale.setTo(properties.scale.x, properties.scale.y);
    }
    
    if (properties.anchor) {
        this.anchor.setTo(properties.anchor.x, properties.anchor.y);
    }
    
    // assigns the text prefab to the prefabs group using the name as an index
    this.game_state.prefabs[name] = this;
};

RPG.TextPrefab.prototype = Object.create(Phaser.Text.prototype);
RPG.TextPrefab.prototype.constructor = RPG.TextPrefab;