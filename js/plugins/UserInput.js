var RPG = RPG || {};

RPG.UserInput = function (game, parent) {
    "use strict";
    Phaser.Plugin.call(this, game, parent);
};

RPG.UserInput.prototype = Object.create(Phaser.Plugin.prototype);
RPG.UserInput.prototype.constructor = RPG.UserInput;

RPG.UserInput.prototype.init = function (game_state) {
    "use strict";
    this.game_state = game_state;
    
    this.game.input.keyboard.addCallbacks(this, this.process_input, this.process_input, null);
    
    this.enabled = false;
};

RPG.UserInput.prototype.set_input = function (user_input_data) {
    "use strict";
    var input_type, key, key_code;
    this.user_inputs = {"keydown": {}, "keyup": {}};
    
    for (input_type in user_input_data) {
        for (key in user_input_data[input_type]) {
            key_code = Phaser.Keyboard[key];
            this.user_inputs[input_type][key_code] = user_input_data[input_type][key];
        }
    }
    
    this.enabled = true;
};

RPG.UserInput.prototype.process_input = function (event) {
    "use strict";
    var user_input, callback_data, context, method;
    if (this.enabled){
        user_input = this.user_inputs[event.type][event.keyCode];
        if (user_input){
          callback_data = user_input.callback.split(".");
            if (callback_data[0] === "game_state"){
                context = this.game_state;
            } else {
                context = this.game_state.prefabs[callback_data[0]];
            }
            method = context[callback_data[1]];
            method.apply(context, user_input.args);
        }
    }
};