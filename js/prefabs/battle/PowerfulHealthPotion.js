var RPG = RPG || {};

RPG.PowerfulHealthPotion = function (game_state, name, position, properties) {
    "use strict";
    RPG.Item.call(this, game_state, name, position, properties);
    
    // saves the amount of health gained from the potion
    this.health_gain = properties.health_gain;
};

RPG.PowerfulHealthPotion.prototype = Object.create(RPG.Item.prototype);
RPG.PowerfulHealthPotion.prototype.constructor = RPG.PowerfulHealthPotion;

RPG.PowerfulHealthPotion.prototype.use = function (target) {
    "use strict";
    target.stats.health = Math.min(target.stats.max_health, target.stats.health + this.health_gain);
};