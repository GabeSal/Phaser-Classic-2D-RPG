// main.js

// Main.js initializes the firebase config properties, instantiates a new Phaser.Game 
// object and adds all of the necessary states needed for the game

// RPG is the namespace for the main program
var RPG = RPG || {};

// Initialize Firebase
// property object for firebase
var config = {
    apiKey: "AIzaSyBiEHfOZ9lQD1-5JAKEE7mxptivYd-ShhM",
    authDomain: "phaser-rpg-c195f.firebaseapp.com",
    databaseURL: "https://phaser-rpg-c195f.firebaseio.com",
    projectId: "phaser-rpg-c195f",
    storageBucket: "",
    messagingSenderId: "22043470671"
};

// calls the firebase method and passes the config properties
firebase.initializeApp(config);

// game creates and stores an instance of the Phaser.Game object
var game = new Phaser.Game(640, 480, Phaser.CANVAS);

// game.inventory instantiates a new Inventory object from Inventory.js
game.inventory = new RPG.Inventory();

// game.state.add Phaser API adds new states to the game object with a string key
game.state.add("BootState", new RPG.BootState());
game.state.add("LoadingState", new RPG.LoadingState());
game.state.add("TitleState", new RPG.TitleState());
game.state.add("WorldState", new RPG.WorldState());
game.state.add("BattleState", new RPG.BattleState());
game.state.add("PauseState", new RPG.PauseState());

// starts the Bootstate

//  Phaser.Start(Key, clearWorld method, clearCache method, level_asset_data, next_state/extra_parameters)
/*
    clearWorld clears the World display (i.e. title screen, backgrounds, etc.) 
    but keeps the assets and data in the cache, clearCache would permanently 
    delete any game assets and data for the remainder of the play session*/

game.state.start("BootState", true, false, "assets/asset_data/title_screen.json", "TitleState");
