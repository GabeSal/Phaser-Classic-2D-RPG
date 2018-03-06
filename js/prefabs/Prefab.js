var RPG = RPG || {};

RPG.Prefab = function (game_state, name, position, properties) {
    "use strict";
    // Phaser.Sprite(game, x, y, frame/properties)
    Phaser.Sprite.call(this, game_state.game, position.x, position.y, properties.texture);
    
    this.game_state = game_state;
    this.name = name;
    this.game_state.groups[properties.group].add(this);
    
    this.frame = +properties.frame;
    
    // other possible property tweaks
    if (properties.scale) {
        this.scale.setTo(properties.scale.x, properties.scale.y);
    }
    
    if (properties.anchor) {
        this.anchor.setTo(properties.anchor.x, properties.anchor.y);
    }
    
    // to help player differentiate enemies of the same type
    if(properties.tint) {
        this.tint = properties.tint;
    }
    
    this.game_state.prefabs[name] = this;
};

RPG.Prefab.prototype = Object.create(Phaser.Sprite.prototype);
RPG.Prefab.prototype.constructor = RPG.Prefab;