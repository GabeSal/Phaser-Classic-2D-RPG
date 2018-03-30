// Item.js

// Item is a class that labels the prefab and sets the item texture
var RPG = RPG || {};

RPG.Item = function (game_state, name, position, properties) {
    "use strict";
    RPG.Prefab.call(this, game_state, name, position, properties);
    
    // stores the texture of the item
    this.item_texture = properties.item_texture;
};

RPG.Item.prototype = Object.create(RPG.Prefab.prototype);
RPG.Item.prototype.constructor = RPG.Item;

// use just confirms the use of the item in the console
RPG.Item.prototype.use = function (target) {
    "use strict";
    console.log("using item on target: " + target.name);
};