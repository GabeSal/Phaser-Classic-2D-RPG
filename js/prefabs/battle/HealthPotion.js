var RPG = RPG || {};

RPG.HealthPotion = function (game_state, name, position, properties) {
    "use strict";
    RPG.Item.call(this, game_state, name, position, properties);
    
    // saves the amount of health gained from the potion
    this.health_gain = properties.health_gain;
};

RPG.HealthPotion.prototype = Object.create(RPG.Item.prototype);
RPG.HealthPotion.prototype.constructor = RPG.HealthPotion;

RPG.HealthPotion.prototype.use = function (target) {
    "use strict";
    target.stats.health = Math.min(target.stats.max_health, target.stats.health + this.health_gain);
};