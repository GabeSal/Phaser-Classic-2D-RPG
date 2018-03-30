// ShowPartyDataInPauseScreen.js

// Show party data in pause screen works similar to the menu items shown in 
// the Battle state but have been rearranged for the pause state
var RPG = RPG || {};

RPG.ShowPartyDataInPauseScreen = function (game_state, name, position, properties) {
    "use strict";
    RPG.ShowPlayerStatus.call(this, game_state, name, position, properties);
    
    // store the prefab data from the party data
    var prefab_data = this.game_state.game.party_data[properties.prefab];
    
    // creates an instance of the units' current health
    var health = prefab_data.stats.health;
    // store the health as a text object
    this.show_unit_health = this.game_state.game.add.text(this.x, this.y + 75, "Health: " + health, properties.text_style);
    
    // creates an instance of the units' current mana
    var mana = prefab_data.stats.mana;
    // store the mana as a text object
    this.show_unit_mana = this.game_state.game.add.text(this.x, this.y + 100, "Mana: " + mana, properties.text_style);
    
    // stores the attack power of the unit
    var attack = prefab_data.stats.attack;
    // creates a text object for the attack power
    this.show_unit_attack = this.game_state.game.add.text(this.x + 250, this.y - 15, "Attack: " + attack, properties.text_style);
    
    // stores the magic power of the unit
    var magic_attack = prefab_data.stats.magic_attack;
    // creates a text object for the magic power
    this.show_unit_magic_attack = this.game_state.game.add.text(this.x + 250, this.y + 10, "Magic: " + magic_attack, properties.text_style);
    
    // stores the physical defense of the unit
    var phys_defense = prefab_data.stats.phys_defense;
    // creates a text object for the physical defense
    this.show_unit_phys_defense = this.game_state.game.add.text(this.x + 250, this.y + 35, "Phys Def: " + phys_defense, properties.text_style);
    
    // stores the magical defense of the unit
    var magic_defense = prefab_data.stats.magic_defense;
    // creates a text object for the magical defense
    this.show_unit_magic_defense = this.game_state.game.add.text(this.x + 250, this.y + 65, "Magic Def: " + magic_defense, properties.text_style);
    
    // stores the speed of the unit
    var speed = prefab_data.stats.speed;
    // creates a text object for the speed
    this.show_unit_speed = this.game_state.game.add.text(this.x + 250, this.y + 90, "Speed: " + speed, properties.text_style);
    
    // stores the level of the unit
    var level = prefab_data.current_level + 1;
    // creates a text object for the level of the unit
    this.level_text = this.game_state.game.add.text(this.x + 130, this.y + 100, "Level: " + level, properties.text_style);
};

RPG.ShowPartyDataInPauseScreen.prototype = Object.create(RPG.ShowPlayerStatus.prototype);
RPG.ShowPartyDataInPauseScreen.prototype.constructor = RPG.ShowPartyDataInPauseScreen;

// show method toggles the visibility of the sprites dependent 
// on when the PauseState is activated
RPG.ShowPartyDataInPauseScreen.prototype.show = function (show) {
    "use strict";
    RPG.ShowPlayerStatus.prototype.show.call(this, show);
    
    this.show_unit_health.visible = show;
    this.show_unit_mana.visible = show;
    this.show_unit_attack.visible = show;
    this.show_unit_defense.visible = show;
    this.show_unit_magic_attack.visible = show;
    this.show_unit_speed.visible = show;
    this.level_text.visible = show;
};