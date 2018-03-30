// UnitStats.js

// Unit stats creates an object that holds the stats 
// info for the pause state and the face_texture of the unit
var RPG = RPG || {};

RPG.UnitStats = function (game_state, name, position, properties) {
    "use strict";    
    RPG.Prefab.call(this, game_state, name, position, properties);
    
    // stores the stats of the unit
    this.stats = Object.create(properties.stats);
    // stores the face_texture
    this.face_texture = properties.face_texture;
};

RPG.UnitStats.prototype = Object.create(RPG.Prefab.prototype);
RPG.UnitStats.prototype.constructor = RPG.UnitStats;
