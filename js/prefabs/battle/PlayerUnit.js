// PlayerUnit.js

// Player unit handles the level up and 
// displays the actions menu for the player
var RPG = RPG || {};

RPG.PlayerUnit = function (game_state, name, position, properties) {
    "use strict";    
    RPG.Unit.call(this, game_state, name, position, properties);
    
    // stores the face_texture from the party data 
    // depending on the party member (mage or warrior)
    this.face_texture = properties.face_texture;
    
    // level is set to 0
    this.current_level = 0;
    // XP is set to 0
    this.experience = 0;
};

RPG.PlayerUnit.prototype = Object.create(RPG.Unit.prototype);
RPG.PlayerUnit.prototype.constructor = RPG.PlayerUnit;

// act shows the player action menu and status such as the current health and mana
RPG.PlayerUnit.prototype.act = function () {
    "use strict";
    // show the action menu
    this.game_state.prefabs.actions_menu.enable(true);
    
    // show the health and mana bars
    this.game_state.prefabs.show_player_status.show(true);
    // change the face_texture to display the controlled unit
    this.game_state.prefabs.show_player_status.change_current_unit(this, this.face_texture);
};

// receive_experience activates the level up for loop once the required XP is met
RPG.PlayerUnit.prototype.receive_experience = function (experience) {
    "use strict";
    // increases the experience after a battle
    this.experience += experience;
    
    // stores the increases in stats into next_level_data
    var next_level_data = this.game_state.experience_table[this.current_level];
    // checks to see if the required XP has been met or surpassed
    if (this.experience >= next_level_data.required_exp) {
        // increase the level of the player
        this.current_level += 1;
        // reset the experience but keep the remainder
        this.experience = this.experience - next_level_data.required_exp;
        // for loop that iterates throught the stat increases
        for (var stat in next_level_data.stats_increase) {
            // increases the stats by the amount defined in the next_level_data object
            this.stats[stat] += next_level_data.stats_increase[stat];
            
            // checks to see if current health is less than max_health
            if (this.stats.health < this.stats.max_health){
                // resets the health to the maxmimum
                this.stats.health = this.stats.max_health;
            }
            // checks to see if current mana is less than max_mana
            if (this.stats.mana < this.stats.max_mana){
                // resets the mana to the maxmimum
                this.stats.mana = this.stats.max_mana;
            }
        }
    }
};