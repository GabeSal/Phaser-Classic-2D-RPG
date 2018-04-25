// Inventory.js

// Inventory defines the type of items that can be stored and used
var RPG = RPG || {};

RPG.Inventory = function () {
    "use strict";
    
    // list of item classes that can be added into the item inventory
    this.item_classes = {
        health_potion: RPG.HealthPotion.prototype.constructor,
        mana_potion: RPG.ManaPotion.prototype.constructor,
        powerful_health_potion: RPG.PowerfulHealthPotion.prototype.constructor,
        powerful_mana_potion: RPG.PowerfulManaPotion.prototype.constructor
    };
    
    // create an empty object to 
    // contain the items in the inventory
    this.items = {};
};

// method that is responsible for emptying the inventory after the player loses the game
RPG.Inventory.prototype.empty_inventory = function () {
    "use strict";
    var item_type, item_database_key;
    // iterates through all of the items in the this.items object
    for (item_type in this.items) {        
        // for loop that iterates through the database keys and correctly gets the keys in order to remove them from firebase
        for (var index = 0; index < this.items[item_type].database_keys.length; index++) {
            // gets the key string from the database_key property in this.items
            item_database_key = this.items[item_type].database_keys[index];
            // removes the key from the firebase database
            firebase.database().ref("/users/" + firebase.auth().currentUser.uid + "/items/" + item_database_key).remove();
        }
        
        // sets the amount of the item type to 0
        this.items[item_type].amount = 0;
        // removes the item_type in the this.items object
        delete this.items[item_type];
    }
};

// collect_item adds the item object from the rewards properties in the enemy_encounter 
// data and also updates the firebase inventory
RPG.Inventory.prototype.collect_item = function (game_state, item_object, database_key) {
  "use strict";
    // checks if the item type is already in the inventory
    if (this.items[item_object.type]){
        // increases the amount carried
        this.items[item_object.type].amount++;
    } else {
        // creates an instance of the item and stores it in the this.items object
        var item = new this.item_classes[item_object.type](game_state, item_object.type, {x: 0, y: 0}, item_object.properties);
        this.items[item_object.type] = {prefab: item, amount: 1, database_keys: []};
    }
    
    // if database does not contain item, push it in
    if (database_key) {
        this.items[item_object.type].database_keys.push(database_key);
    } else {
        // otherwise reload them from the database
        var item_database_ref = firebase.database().ref("/users/" + firebase.auth().currentUser.uid + "/items").push(item_object);
        this.items[item_object.type].database_keys.push(item_database_ref.key);
    }
};

// create_menu positions the items from the inventory onto the player 
// menu when the item menu item is selected
RPG.Inventory.prototype.create_menu = function (game_state, items_menu) {
    "use strict";
    // create a new Phaser.Point position for the item
    var item_position = new Phaser.Point(items_menu.x, items_menu.y);
    // for loop that iterates through all of the item_types in this.items object
    for (var item_type in this.items) {
        
        // store the item prefab info defined in the rewards of the enemy_encounter
        var item_prefab = this.items[item_type].prefab;
        
        // get the amount from the this.items object
        var item_amount = this.items[item_type].amount;
        
        // create an item using RPG.ItemMenuItem class and assigning the texture using the item_texture property 
        var menu_item = new RPG.ItemMenuItem(game_state, item_type + "_menu_item", {x: item_position.x, y: item_position.y}, {group: "hud", texture: item_prefab.item_texture, item_name: item_type, amount: item_amount});
        
        // push the menu_item into the menu_items object
        items_menu.menu_items.push(menu_item);
        
        // positions items horizontally every 50px
        if (item_position.x < 275) {
            item_position.x += 50;
        } else {
            // if item position is past 275 then realign 
            // the item below the pre-existing items
            item_position.x = 175;
            item_position.y += 75;
        }
    }
    
    // disables the input and hides the items
    items_menu.enable(false);
};

// has_items is a method that checks the inventory and returns a 
// boolean for the select method in InventoryMenuItem.js 
RPG.Inventory.prototype.has_items = function () {
    "use strict";
    // for loop that checks each item 
    // type in the this.items object
    for (var item_type in this.items) {
        // return true if an item_type has been found
        if (this.items[item_type].amount > 0) {
            return true;
        }
    }
    // return false if that item_type is not found
    return false;
};

// has_item is a method that checks the inventory and returns a 
// boolean for the select method in ItemMenuItem.js
RPG.Inventory.prototype.has_item = function (item_type) {
    "use strict";
    return this.items[item_type].amount > 0;
};

// use_item is a method that checks the item type to make 
// the appropriate action on the target
RPG.Inventory.prototype.use_item = function (item_type, target) {
    "use strict";
    // calls the use method from the prefab and passes the target
    this.items[item_type].prefab.use(target);
    // decrease the amount in this.items object
    this.items[item_type].amount--;
    
    // removes item from database as well
    var item_database_key = this.items[item_type].database_keys.pop();
    firebase.database().ref("/users/" + firebase.auth().currentUser.uid + "/items/" + item_database_key).remove();
};