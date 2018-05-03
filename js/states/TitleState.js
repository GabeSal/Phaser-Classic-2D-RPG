// Titlestate.js

// The title state displays the main menu 
// and instructions on how to play the game
var RPG = RPG || {};

RPG.TitleState = function () {
    "use strict";
    // calls the JSONLevelState to create the prefabs and prefab_classes
    RPG.JSONLevelState.call(this);
    
    // list of the prefab_classes displayed in this state
    this.prefab_classes = {
        // Calls the RPG.Prefab constructor for this prefab_classes type
        background: RPG.Prefab.prototype.constructor,
        // Calls the RPG.TextPrefab constructor for this prefab_classes type
        text: RPG.TextPrefab.prototype.constructor
    }
};

RPG.TitleState.prototype = Object.create(RPG.JSONLevelState.prototype);
RPG.TitleState.prototype.constructor = RPG.TitleState;

// The preload method is a built in function from Phaser that is called when Titlestate is first instantiated
RPG.TitleState.prototype.preload = function () {
    "use strict";
    // loads in text files with a string key for the map data created using the Tiled program
    this.game.load.text("townMapFilePath", "assets/maps/town.json");
    this.game.load.text("westTownMapFilePath", "assets/maps/town_west.json");
    this.game.load.text("eastTownMapFilePath", "assets/maps/town_east.json");
    this.game.load.text("southTownMapFilePath", "assets/maps/town_south.json");
    this.game.load.text("houseMapFilePath", "assets/maps/house.json");
    this.game.load.text("barracksMapFilePath", "assets/maps/barracks.json");
    this.game.load.text("guardTower1MapFilePath", "assets/maps/guard_tower1.json");
    this.game.load.text("guardTower2MapFilePath", "assets/maps/guard_tower2.json");
    this.game.load.text("armoryMapFilePath", "assets/maps/armory.json");
    this.game.load.text("millTowerMapFilePath", "assets/maps/mill_tower.json");
    
    this.game.load.text("caveMapFilePath", "assets/maps/cave.json");
    
    this.game.load.text("castleMapFilePath", "assets/maps/castle.json");
    
    this.game.load.text("ancientTreeMapFilePath", "assets/maps/ancient_tree.json");
    this.game.load.text("dragonsLairMapFilePath", "assets/maps/dragons_lair.json");
    
    // checks to see if this audio object doesn't exist yet
    if (this.background_music == undefined) {
        // stores the background_music audio object in the TitleState
        this.background_music = this.game.add.audio("background_music");
    }
    
    // json data that includes the default party stats and equipment
    this.game.load.text("default_data", "assets/asset_data/default_party_data.json");
};

// The create method is a built in function from Phaser that is called after preload
RPG.TitleState.prototype.create = function () {
    "use strict";
    // Calls the create method from JSONLevelState to loop through the 
    // specified prefabs found in the assets json data
    RPG.JSONLevelState.prototype.create.call(this);
    
    // retrieves the party data
    this.default_data = JSON.parse(this.game.cache.getText("default_data"));
    
    // plays the background music according the state name
    if(!this.background_music.isPlaying && this.level_asset_data.state.name == "title") {
        // arguments provide the marker, position, volume, and loop boolean value
        this.background_music.play('', 0, 0.05, true);
    }
};

// this method uses firebase to enable a google user to login to the game before start-up
RPG.TitleState.prototype.login = function () {
  "use strict";
    // checks to see if there is no current user
    if (!firebase.auth().currentUser) {
        // firebase will produce a new provider, append this user to the database,
        var provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope('https://www.googleapis.com/auth/userinfo.email');
        
        // and then calls on_login or throw error
        firebase.auth().signInWithPopup(provider).then(this.on_login.bind(this)).catch(this.handle_error.bind(this));
    } else {
        // otherwise firebase will find a reference to previously logged in user
        firebase.database().ref("/users/" + firebase.auth().currentUser.uid).once("value").then(this.retrieve_data.bind(this));
    }
};

// the on_login method is responsible for calling retrieve_data 
RPG.TitleState.prototype.on_login = function () {
    "use strict";
    firebase.database().ref("/users/" + firebase.auth().currentUser.uid).once("value").then(this.retrieve_data.bind(this));
};

// retrieve_data is responsible for loading the saved data from firebase (party data and equipment) in the game
RPG.TitleState.prototype.retrieve_data = function (snapshot) {
    "use strict";
    // user_data is a snapshot of the current state of the party and inventory
    var user_data = snapshot.val();
    // checks if no user_data has been created
    if (!user_data) {
        // creates an instance of the default party data and passes it into the database
        this.game.party_data = this.default_data.party_data;
        firebase.database().ref("/users/" + firebase.auth().currentUser.uid + "/party_data").set(this.game.party_data).then(this.start_game.bind(this));
    } else {
        // if there is user_data, it will either find the reference from the 
        // database if possible or default to the default party data
        this.game.party_data = user_data.party_data || this.default_data.party_data;
        var items = user_data.items || this.default_data.items;
        for (var item_key in items) {
            this.game.inventory.collect_item(this, items[item_key], item_key);
        }
        this.start_game();
    }
};

// start_game starts up the Bootstate again but passes the Worldstate as the next_state parameter instead
RPG.TitleState.prototype.start_game = function () {
    "use strict";
    
    // grab town map JSON data and store in cache
    var townMapData = JSON.parse(this.game.cache.getText("townMapFilePath"));
    this.game.cache.addJSON("townMap", null, townMapData);
    
    // grab west town map JSON data and store in cache
    var westTownMapData = JSON.parse(this.game.cache.getText("westTownMapFilePath"));
    this.game.cache.addJSON("town_westMap", null, westTownMapData);
    
    // grab east town map JSON data and store in cache
    var eastTownMapData = JSON.parse(this.game.cache.getText("eastTownMapFilePath"));
    this.game.cache.addJSON("town_eastMap", null, eastTownMapData);
    
    // grab south town map JSON data and store in cache
    var southTownMapData = JSON.parse(this.game.cache.getText("southTownMapFilePath"));
    this.game.cache.addJSON("town_southMap", null, southTownMapData);
    
    // grab house map JSON data and store in cache
    var houseMapData = JSON.parse(this.game.cache.getText("houseMapFilePath"));
    this.game.cache.addJSON("houseMap", null, houseMapData);
    
    // grab barracks map data and store in cache
    var barracksMapData = JSON.parse(this.game.cache.getText("barracksMapFilePath"));
    this.game.cache.addJSON("barracksMap", null, barracksMapData);
    
    // grab guard tower 1 map data and store in cache
    var guardTower1MapData = JSON.parse(this.game.cache.getText("guardTower1MapFilePath"));
    this.game.cache.addJSON("guard_tower1Map", null, guardTower1MapData);
    
    // grab guard tower 2 map data and store in cache
    var guardTower2MapData = JSON.parse(this.game.cache.getText("guardTower2MapFilePath"));
    this.game.cache.addJSON("guard_tower2Map", null, guardTower2MapData);
    
    // grab armory map data and store in cache
    var armoryMapData = JSON.parse(this.game.cache.getText("armoryMapFilePath"));
    this.game.cache.addJSON("armoryMap", null, armoryMapData);
    
    // grab mill tower map data and store in cache
    var millTowerMapData = JSON.parse(this.game.cache.getText("millTowerMapFilePath"));
    this.game.cache.addJSON("mill_towerMap", null, millTowerMapData);
    
    // grab cave map JSON data and store in cache
    var caveMapData = JSON.parse(this.game.cache.getText("caveMapFilePath"));
    this.game.cache.addJSON("caveMap", null, caveMapData);
    
    // grab castle map JSON data and store in cache
    var castleMapData = JSON.parse(this.game.cache.getText("castleMapFilePath"));
    this.game.cache.addJSON("castleMap", null, castleMapData);
    
    // grab castle map JSON data and store in cache
    var dragonsLairMapData = JSON.parse(this.game.cache.getText("dragonsLairMapFilePath"));
    this.game.cache.addJSON("dragons_lairMap", null, dragonsLairMapData);
    
    // grab castle map JSON data and store in cache
    var ancientTreeMapData = JSON.parse(this.game.cache.getText("ancientTreeMapFilePath"));
    this.game.cache.addJSON("ancient_treeMap", null, ancientTreeMapData);
    
    this.game.state.start("BootState", true, false, "assets/asset_data/town.json", "WorldState");
    
    // stop the background music
    this.background_music.stop();
};

// handle_error displays an error to the console if there is complications with authentication
RPG.TitleState.prototype.handle_error = function (error) {
    "use strict";
    console.log(error);
};
