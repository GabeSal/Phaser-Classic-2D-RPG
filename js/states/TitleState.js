var RPG = RPG || {};

RPG.TitleState = function () {
    "use strict";
    RPG.JSONLevelState.call(this);
        
    this.prefab_classes = {
        background: RPG.Prefab.prototype.constructor,
        text: RPG.TextPrefab.prototype.constructor
    }
};

RPG.TitleState.prototype = Object.create(RPG.JSONLevelState.prototype);
RPG.TitleState.prototype.constructor = RPG.TitleState;

RPG.TitleState.prototype.preload = function () {
    "use strict";
    this.game.load.text("default_data", "assets/levels/default_party_data.json");
};

RPG.TitleState.prototype.create = function () {
    "use strict";
    RPG.JSONLevelState.prototype.create.call(this);
    
    // resets party data
    this.game.party_data = JSON.parse(this.game.cache.getText("default_data")).party_data;
    //console.log(this.game.party_data);
};

RPG.TitleState.prototype.start_game = function () {
    "use strict";
    this.game.state.start("BootState", true, false, "../assets/levels/town.json", "WorldState");
};