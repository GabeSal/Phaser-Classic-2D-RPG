// Treasure.js

// Treasure is a prefab object that handles the loot  
// and shows the message box in the world state
var RPG = RPG || {};

RPG.Treasure = function (game_state, name, position, properties) {
    "use strict";
    RPG.Prefab.call(this, game_state, name, position, properties);
    
    this.anchor.setTo(0.5, 0.5);
    
    // stores the message box position to use for the message box object
    this.MESSAGE_BOX_POSITION = {x: 0, y: 0.75 * this.game_state.game.world.height};
    
    // grabs the message from the properties of the npc Tiled object
    this.message = this.game_state.game.cache.getText(properties.message);
    
    // frames with the chest images
    this.chest_images = [1, 4, 7, 10];
    
    // frames with the opened chest images
    this.opened_images = [0, 3, 6, 9];
    
    // gets the info from the properties of the Tiled JSON object
    this.contents = properties.contents;
    this.unit_name = properties.unit_name;
    this.body_part = properties.body_part;
    this.stat = properties.stat;
    this.bonus = +properties.bonus;
    
    // enable physics
    this.game_state.game.physics.arcade.enable(this);
    // immobilize the object
    this.body.immovable = true;
    
    // sets the frame for the prefab object
    this.frame = this.chest_images[1];
};

RPG.Treasure.prototype = Object.create(RPG.Prefab.prototype);
RPG.Treasure.prototype.constructor = RPG.Treasure;

// update is a built-in Phaser function that is called constantly throughout the game session
RPG.Treasure.prototype.update = function () {
    "use strict";
    // waits for the player to collide with the Treasure object to call the talk method
    this.game_state.game.physics.arcade.collide(this, this.game_state.groups.players, this.opened_chest, null, this);
};

// opened_chest is responsible for displaying the message box and sending the contents of the chest to the player inventory
RPG.Treasure.prototype.opened_chest = function (treasure, player) {
    "use strict";
    // grabs the unit_data from the default_party_data object
    var unit_data = this.game_state.game.party_data[this.unit_name];
    
    // checks to see if the players' equipment name matches the prefab name
    if (unit_data.equipment[this.body_part].name !== this.contents) {
        // if not, then the body part of the units' equipment is updated
        unit_data.equipment[this.body_part] = {name: this.contents};
        unit_data.stats_bonus[this.stat] = this.bonus;
        
        // updates the firebase
        firebase.database().ref("/users/" + firebase.auth().currentUser.uid + "/party_data").set(this.game_state.game.party_data);
    }
    
    // stops player movement
    player.stop();
    // calls the current_message_box method which creates a new message box object, 
    // creating a key using the name and holds the npc's unique message text 
    this.game_state.current_message_box = new RPG.MessageBox(this.game_state, this.name + "_message_box", this.MESSAGE_BOX_POSITION, {texture: "message_box_image", group: "hud", message: this.message});
    // sets the user input to the talking_user_input which only requires the player to press 
    // 'Enter' to close the message box and return to the previous state
    this.game_state.user_input.set_input(this.game_state.user_inputs.talking_user_input);
    
    // changes the frame to the opened chest image
    this.frame = this.opened_images[1];
    
    // disables collision with the player
    this.body.enable = false;
};