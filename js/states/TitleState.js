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
    this.game.load.text("caveMapFilePath", "assets/maps/cave.json");
    
    // json data that includes the default party stats and equipment
    this.game.load.text("default_data", "assets/asset_data/default_party_data.json");
};

// The create method is a built in function from Phaser that is called after preload
RPG.TitleState.prototype.create = function () {
    "use strict";
    // Calls the create method from JSONLevelState to loop through the 
    // specified prefabs found in the assets json data
    RPG.JSONLevelState.prototype.create.call(this);
    
    // resets party data
    this.default_data = JSON.parse(this.game.cache.getText("default_data"));
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
    
    // grab cave map JSON data and store in cache
    var caveMapData = JSON.parse(this.game.cache.getText("caveMapFilePath"));
    this.game.cache.addJSON("caveMap", null, caveMapData);
    
    this.game.state.start("BootState", true, false, "assets/asset_data/town.json", "WorldState");
};

// handle_error displays an error to the console if there is complications with authentication
RPG.TitleState.prototype.handle_error = function (error) {
    "use strict";
    console.log(error);
};
