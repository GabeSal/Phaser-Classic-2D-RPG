// PowerfulManaPotion.js

// Powerful mana potion defines the properties of  
// the item and increases the mana of the target
var RPG = RPG || {};

RPG.PowerfulManaPotion = function (game_state, name, position, properties) {
    "use strict";
    RPG.Item.call(this, game_state, name, position, properties);
    
    // saves the amount of mana gained from the potion
    this.mana_gain = properties.mana_gain;
};

RPG.PowerfulManaPotion.prototype = Object.create(RPG.Item.prototype);
RPG.PowerfulManaPotion.prototype.constructor = RPG.PowerfulManaPotion;

RPG.PowerfulManaPotion.prototype.use = function (target) {
    "use strict";
    // increases mana with a max range of the targets max_mana stat
    target.stats.mana = Math.min(target.stats.max_mana, target.stats.mana + this.mana_gain);
    // play the recovered mana event
     target.mana_gained(this.mana_gain);
};