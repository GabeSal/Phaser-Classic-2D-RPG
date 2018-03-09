var RPG = RPG || {};

RPG.PlayerUnit = function (game_state, name, position, properties) {
    "use strict";    
    RPG.Unit.call(this, game_state, name, position, properties);
    
    this.face_texture = properties.face_texture;
    
    this.current_level = 0;
    this.experience = 0;
};

RPG.PlayerUnit.prototype = Object.create(RPG.Unit.prototype);
RPG.PlayerUnit.prototype.constructor = RPG.PlayerUnit;

RPG.PlayerUnit.prototype.act = function () {
    "use strict";
    this.game_state.prefabs.actions_menu.enable(true);
    
    this.game_state.prefabs.show_player_status.show(true);
    this.game_state.prefabs.show_player_status.change_current_unit(this, this.face_texture);
};

RPG.PlayerUnit.prototype.receive_experience = function (experience) {
    "use strict";
    this.experience += experience;
    console.log("Total EXP received: " + experience);
    console.log(this.stats.health);
    
    var next_level_data = this.game_state.experience_table[this.current_level];
    if (this.experience >= next_level_data.required_exp) {
        this.current_level += 1;
        this.experience = 0;
        for (var stat in next_level_data.stats_increase) {
            this.stats[stat] += next_level_data.stats_increase[stat];
            
            if (this.stats.health < this.stats.max_health){
                this.stats.health = this.stats.max_health;
            }
            if (this.stats.mana < this.stats.max_mana){
                this.stats.mana = this.stats.max_mana;
            }
        }
    }
};