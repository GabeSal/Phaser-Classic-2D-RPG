var RPG = RPG || {};

RPG.ManaPotion = function (game_state, name, position, properties) {
    "use strict";
    RPG.Item.call(this, game_state, name, position, properties);
    
    // saves the amount of mana gained from the potion
    this.mana_gain = properties.mana_gain;
};

RPG.ManaPotion.prototype = Object.create(RPG.Item.prototype);
RPG.ManaPotion.prototype.constructor = RPG.ManaPotion;

RPG.ManaPotion.prototype.use = function (target) {
    "use strict";
    target.stats.mana = Math.min(target.stats.max_mana, target.stats.mana + this.mana_gain);
};