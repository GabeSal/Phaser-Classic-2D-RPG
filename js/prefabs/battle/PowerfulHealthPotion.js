// PowerfulHealthPotion.js

// Powerful health potion defines the properties of
// the item and increases the health of the target
var RPG = RPG || {};

RPG.PowerfulHealthPotion = function (game_state, name, position, properties) {
    "use strict";
    RPG.Item.call(this, game_state, name, position, properties);
    
    // saves the amount of health gained from the potion
    this.health_gain = properties.health_gain;
};

RPG.PowerfulHealthPotion.prototype = Object.create(RPG.Item.prototype);
RPG.PowerfulHealthPotion.prototype.constructor = RPG.PowerfulHealthPotion;

// use method increases the health of the target, usually the player unit
RPG.PowerfulHealthPotion.prototype.use = function (target) {
    "use strict";
    // increases health with a max range of the targets max_health stat
    target.stats.health = Math.min(target.stats.max_health, target.stats.health + this.health_gain);
    // play the healing event
     target.healed(this.health_gain);
};