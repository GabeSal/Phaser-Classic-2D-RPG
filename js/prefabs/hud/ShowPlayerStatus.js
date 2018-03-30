// ShowPlayerStatus.js

// Show player status is the object that stores all of the properties 
// and sprites associated with the player units
var RPG = RPG || {};

RPG.ShowPlayerStatus = function (game_state, name, position, properties) {
    "use strict";
    RPG.Prefab.call(this, game_state, name, position, properties);
    
    // stores the face_texture
    this.face_texture = properties.face_texture;
    
    // healthbar prefab
    this.player_unit_health = new RPG.ShowStatWithBar(this.game_state, this.name + "_health", {x: this.x, y: this.y}, {group: "hud", text: "HP", style: properties.text_style, prefab: properties.prefab, stat: "health", bar_texture: "healthbar_image"});
    // manabar prefab
    this.player_unit_mana = new RPG.ShowStatWithBar(this.game_state, this.name + "_mana", {x: this.x, y: this.y + 30}, {group: "hud", text: "MP", style: properties.text_style, prefab: properties.prefab, stat: "mana", bar_texture: "manabar_image"});
    
    // stores the face_texture of the player unit as a sprite
    this.face_sprite = this.game_state.add.sprite(this.x + 130, this.y, properties.face_texture);
};

RPG.ShowPlayerStatus.prototype = Object.create(RPG.Prefab.prototype);
RPG.ShowPlayerStatus.prototype.constructor = RPG.ShowPlayerStatus;

// change_current_unit swaps the face_textures of the player units 
// when of the party members has ended their turn
RPG.ShowPlayerStatus.prototype.change_current_unit = function (new_prefab, new_face_texture) {
    "use strict";
    // gets the next unit prefab
    this.unit_data = new_prefab;
    
    // gets their health stat
    this.player_unit_health.units_data = this.unit_data;
    // gets their mana stat
    this.player_unit_mana.units_data = this.unit_data;
    // loads in their face_texture in place of the previous unit
    this.face_sprite.loadTexture(new_face_texture);
};

// show method toggles the visibility of the player units status
RPG.ShowPlayerStatus.prototype.show = function (show) {
    "use strict";
    this.player_unit_health.show(show);
    this.player_unit_mana.show(show);
    this.face_sprite.visible = show;
};