var RPG = RPG || {};

// Initialize Firebase
var config = {
    apiKey: "AIzaSyBiEHfOZ9lQD1-5JAKEE7mxptivYd-ShhM",
    authDomain: "phaser-rpg-c195f.firebaseapp.com",
    databaseURL: "https://phaser-rpg-c195f.firebaseio.com",
    projectId: "phaser-rpg-c195f",
    storageBucket: "",
    messagingSenderId: "22043470671"
};

firebase.initializeApp(config);

var game = new Phaser.Game(640, 480, Phaser.CANVAS);

game.inventory = new RPG.Inventory();

game.state.add("BootState", new RPG.BootState());
game.state.add("LoadingState", new RPG.LoadingState());
game.state.add("TitleState", new RPG.TitleState());
game.state.add("WorldState", new RPG.WorldState());
game.state.add("BattleState", new RPG.BattleState());
game.state.add("PauseState", new RPG.PauseState());

game.state.start("BootState", true, false, "assets/levels/title_screen.json", "TitleState");

//  Phaser.Start(Key, clearWorld method, clearCache method, level_file, next_state, extra_parameters)
/*
    clearWorld clears the World display (i.e. title screen, backgrounds, etc.) 
    but keeps the assets and data in the cache, clearCache would permanently 
    delete any game assets and data for the remainder of the play session*/