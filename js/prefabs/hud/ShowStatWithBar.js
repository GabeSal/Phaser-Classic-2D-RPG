// ShowStatWithBar.js

// Show stat with bar is the prefab that displays the 
// player units health and mana using a sprite
var RPG = RPG || {};

RPG.ShowStatWithBar = function (game_state, name, position, properties) {
    "use strict";
    RPG.TextPrefab.call(this, game_state, name, position, properties);
    
    // stores the prefab data from the level asset data
    this.units_data = this.game_state.prefabs[properties.prefab];
    // stores the stat property from the party data
    this.stat = properties.stat;
    // adds a new sprite using the bar_texture property from the object passed from ShowPlayerStatus.js
    this.bar_sprite = this.game_state.game.add.sprite(this.x, this.y + 20, properties.bar_texture);
};

RPG.ShowStatWithBar.prototype = Object.create(RPG.TextPrefab.prototype);
RPG.ShowStatWithBar.prototype.constructor = RPG.ShowStatWithBar;

RPG.ShowStatWithBar.prototype.update = function () {
    "use strict";
    // stores the current stat to be manipulated
    this.current_stat = this.units_data.stats[this.stat];
    // checks to see if the stat is greater than 125
    if(this.current_stat >= 125) {
        // sets the size of the bar to indicate the units health is full
        this.bar_sprite.scale.setTo(1.25, 1.0);
    } else {
        // otherwise the x scale will be calculated depending 
        // on the amount of the current_stat
        this.bar_sprite.scale.setTo(this.current_stat / 100, 1.0);
    }
};

// show method just shows the bars when needed
RPG.ShowStatWithBar.prototype.show = function (show) {
    "use strict";
    this.visible = (show);
    this.bar_sprite.visible = show;  
};