// Bootstate.js

// Bootstate passes the parameters from main.js to Loadingstate
// as well as scaling the game screen
var RPG = RPG || {};

// calls the Phaser.State methods for Bootstate
RPG.BootState = function () {
    "use strict";
    Phaser.State.call(this);
};

// Bootstate object constructor
RPG.BootState.prototype = Object.create(Phaser.State.prototype);
RPG.BootState.prototype.constructor = RPG.BootState;

// The init method is a built in function from Phaser that is called when Bootstate is first instantiated
RPG.BootState.prototype.init = function (assets, next_state, extra_parameters) {
    "use strict";
    // scales the game to full screen and centered
    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.scale.pageAlignHorizontally = true;
    this.scale.pageAlignVertically = true;
    
    // saves the level assets and other parameters passed through the main.js file
    this.level_assets = assets;
    this.next_state = next_state;
    this.extra_parameters = extra_parameters;
};

// The preload method is a built in function from Phaser that is called after init
RPG.BootState.prototype.preload = function () {
    "use strict";
    // loads the level assets path from main.js
    this.load.text("level_assets", this.level_assets);
};

// The create method is a built in function from Phaser that is called after preload
RPG.BootState.prototype.create = function () {
    "use strict";
    // temporary variable that stores a JSON object from the text file with the key "level_assets"
    var level_asset_data = JSON.parse(this.game.cache.getText("level_assets"));
    
    // starts Loadingstate and passes the following parameters
    this.game.state.start("LoadingState", true, false, level_asset_data, this.next_state, this.extra_parameters);
};