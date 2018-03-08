var RPG = RPG || {};

RPG.ShowPartyDataInPauseScreen = function (game_state, name, position, properties) {
    "use strict";
    RPG.ShowPlayerStatus.call(this, game_state, name, position, properties);
    
    var prefab_data = this.game_state.game.party_data[properties.prefab];
    
    var health = prefab_data.stats.health;
    this.show_unit_health = this.game_state.game.add.text(this.x, this.y + 75, "Health: " + health, properties.text_style);
    
    var mana = prefab_data.stats.mana;
    this.show_unit_mana = this.game_state.game.add.text(this.x, this.y + 100, "Mana: " + mana, properties.text_style);
    
    var attack = prefab_data.stats.attack;
    this.show_unit_attack = this.game_state.game.add.text(this.x + 250, this.y, "Attack: \n" + attack, properties.text_style);
    
    var defense = prefab_data.stats.defense;
    this.show_unit_defense = this.game_state.game.add.text(this.x + 250, this.y + 50, "Defense: \n" + defense, properties.text_style);
    
    var magic_attack = prefab_data.stats.magic_attack;
    this.show_unit_magic_attack = this.game_state.game.add.text(this.x + 400, this.y, "Magic: \n" + magic_attack, properties.text_style);
    
    var speed = prefab_data.stats.speed;
    this.show_unit_speed = this.game_state.game.add.text(this.x + 400, this.y + 50, "Speed: \n" + speed, properties.text_style);
    
    var level = prefab_data.current_level + 1;
    this.level_text = this.game_state.game.add.text(this.x + 130, this.y + 100, "Level: " + level, properties.text_style);
};

RPG.ShowPartyDataInPauseScreen.prototype = Object.create(RPG.ShowPlayerStatus.prototype);
RPG.ShowPartyDataInPauseScreen.prototype.constructor = RPG.ShowPartyDataInPauseScreen;

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