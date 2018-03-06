var RPG = RPG || {};

RPG.ShowPlayerStatus = function (game_state, name, position, properties) {
    "use strict";
    RPG.Prefab.call(this, game_state, name, position, properties);
    
    this.face_texture = properties.face_texture;
    
    // health
    this.player_unit_health = new RPG.ShowStatWithBar(this.game_state, this.name + "_health", {x: this.x, y: this.y}, {group: "hud", text: "HP", style: properties.text_style, prefab: properties.prefab, stat: "health", bar_texture: "healthbar_image"});
    // mana
    this.player_unit_mana = new RPG.ShowStatWithBar(this.game_state, this.name + "_mana", {x: this.x, y: this.y + 30}, {group: "hud", text: "MP", style: properties.text_style, prefab: properties.prefab, stat: "mana", bar_texture: "manabar_image"});
    
    this.face_sprite = this.game_state.add.sprite(this.x + 130, this.y, properties.face_texture);
    
    this.show(false);
};

RPG.ShowPlayerStatus.prototype = Object.create(RPG.Prefab.prototype);
RPG.ShowPlayerStatus.prototype.constructor = RPG.ShowPlayerStatus;

RPG.ShowPlayerStatus.prototype.change_current_unit = function (new_prefab, new_face_texture) {
    "use strict";
    this.unit_data = new_prefab;
    
    this.player_unit_health.units_data = this.unit_data;
    this.player_unit_mana.units_data = this.unit_data;
    this.face_sprite.loadTexture(new_face_texture);
};

RPG.ShowPlayerStatus.prototype.show = function (show) {
    "use strict";
    this.player_unit_health.show(show);
    this.player_unit_mana.show(show);
    this.face_sprite.visible = show;
};