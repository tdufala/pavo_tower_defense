/* Pavo Tower Defense (name tbd). Made with Phaser http://phaser.io */
// ======== Imports ========
'use strict';
import 'phaser';
import css from './stylesheets/main.css'


// ======== Globals ========
var game;
var scenes = [];
var config = {
    type: Phaser.AUTO,
    parent: 'phaser-app',
    backgroundColor: '#F0F0F0',
    width: 1344,
    height: 1096,
    pixelArt: true, // antialias: false, roundPixels: true
    scene: scenes
};


// Code to set up game on initial load
function windowOnLoad() {
    // Add Scenes
    scenes.push(StartMenuScene); // first scene pushed first
    scenes.push(Level1Scene);
    scenes.push(Level2Scene);
    scenes.push(Level3Scene);
    // Run the game
    game = new Phaser.Game(config);
}

// ======== Scene classes ========


// Start Menu (first scene)
var StartMenuScene = class extends Phaser.Scene {
    constructor() {
        super('startMenu');
    }

    preload() {
        this.load.image('blueButton', 'assets/images/blue_button09.png');
    }

    create() {
        var startMenuText = this.add.text(75, 75, 'Start Menu', { fontSize: '100px', color:'#0000FF'});
        var level1Text = this.add.text(75, 200, 'Level 1', { fontSize: '50px', color:'#00FF00' });
        var level2Text = this.add.text(75, 300, 'Level 2', { fontSize: '50px', color:'#00FF00' });
        var level3Text = this.add.text(75, 400, 'Level 3', { fontSize: '50px', color:'#00FF00' });
        // Start Button
        var lvl1Start = this.add.sprite(this.sys.canvas.width - 125, 225, 'blueButton').setInteractive();

        var lvl2Start = this.add.sprite(this.sys.canvas.width - 125, 325, 'blueButton').setInteractive();

        var lvl3Start = this.add.sprite(this.sys.canvas.width - 125, 425, 'blueButton').setInteractive();
        // following could be useful later:
        //lvl1Start.on('pointerover', function (event) { lvl1Start.setTexture('imgButtonStartHover');/* Do something when the mouse enters */ });
        //lvl1Start.on('pointerout', function (event) { lvl1Start.setTexture('imgButtonStartNormal');/* Do something when the mouse exits. */ });
        lvl1Start.on('pointerdown', function(event) {
            this.scene.start('level1');
        }, this); // Start the main game.

        lvl2Start.on('pointerdown', function(event) {
            this.scene.start('level2');
        }, this); // Start the main game.

        lvl3Start.on('pointerdown', function(event) {
            this.scene.start('level3');
        }, this); // Start the main game.
        
    }
};


// Base class for levels
class LevelScene extends Phaser.Scene {
    constructor(str) {
        super(str);
        this.levelName = str;
		this.map_width = 1344;
        this.map_height = 896;
        this.tileSize = { 'x': 32, 'y': 32 };

		this.ground_enemy_start = { 'x': 0, 'y': 0 };
		this.ground_enemy_stop  = { 'x': 0, 'y': 0 };
		this.air_enemy_start    = this.ground_enemy_start;
		this.air_enemy_stop     = this.ground_enemy_stop;
    }

    preload() {
        // Load common assets
        this.load.image('blueButton', 'assets/images/blue_button09.png');
        this.load.image('gameTiles', 'assets/spritesheets/towerDefense_tilesheet.png');
		this.load.spritesheet('enemy_sprite', 'assets/spritesheets/towerDefense_tilesheet.png', { frameWidth: 64, frameHeight: 64} );
        this.load.tilemapTiledJSON(this.levelName, 'assets/maps/' + this.levelName + '.json');
    }

    create() {
        // ---- UI elements ----
        var startMenuText = this.add.text(this.sys.canvas.width - 300, this.sys.canvas.height - 100, 'Return to Menu', { fontSize: '50px', color:'#00FF00', rtl: true});

        // Back to start menu button
        var btnStart = this.add.sprite(this.sys.canvas.width - 100, this.sys.canvas.height - 100, 'blueButton').setInteractive();
        btnStart.setDisplaySize(100,100);
        btnStart.on('pointerdown', function(event) {
            this.scene.start('startMenu');
        }, this); // Return to the start menu.
 
		// ---- Tilemap ----
        this.map = this.add.tilemap(this.levelName);
        var tiles = this.map.addTilesetImage('tileset', 'gameTiles');
		// Set map layers
        this.backgroundLayer = this.map.createStaticLayer('background', tiles);
        this.rockLayer = this.map.createStaticLayer('rocks', tiles);
	    
        // ---- Graphics ----
        this.graphics = this.add.graphics();
	    this.path = new Phaser.Curves.Path();
 	    //this.line1 = new Phaser.Curves.Line([ this.ground_enemy_start.x, this.ground_enemy_start.y, 288, 576 ]);
 	    this.line1 = new Phaser.Curves.Line([ this.ground_enemy_start.x, this.ground_enemy_start.y, this.ground_enemy_start.x, this.ground_enemy_start.y ]);
	    this.path.add(this.line1);

	    // ---- Units ----
        this.followers = this.add.group();
    }

	update() {
		
		this.graphics.clear();

		this.graphics.lineStyle(0, 0, 0);

		this.path.draw(this.graphics);

		var enemies = this.followers.getChildren();

		for (var i = 0; i < enemies.length; i++) {
		    //depending on type of enemy follow path or go straight to ending position for air units
		    var t = enemies[i].z;
		    var vec = enemies[i].getData('vector');

		    //  The vector is updated in-place
		    this.path.getPoint(t, vec);
		    
		    enemies[i].setPosition(vec.x, vec.y);

		    enemies[i].setDepth(enemies[i].y);
		}
	} 

};
// Level 1
var Level1Scene = class extends LevelScene {
    constructor() {
        super('level1');
		// Constants specific to this level
		this.ground_enemy_start = {'x': -2 * this.tileSize.x,
                                   'y': 18 * this.tileSize.y};
		this.ground_enemy_stop  = {'x': this.map_width + 2 * this.tileSize.x,
                                   'y': 10 * this.tileSize.y};

		this.air_enemy_start    = this.ground_enemy_start;
		this.air_enemy_stop     = this.ground_enemy_stop;
    }

    preload() {
        super.preload();
    }

    create() {
        super.create();
	
		
		//create towers
		
		/*Create towers here - add preloading of tower sprites*/
		
		
		//Load and initiate wave information
		
		//Wave motionpath workflow
		//set path as lines
				//this.load.image('enemy_sprite', 32, 576, 'sprites', 245);
		//this.add.sprite(32, 576, 'enemy_sprite', 245);
	    	
	    this.path.lineTo(9 * this.tileSize.x, this.ground_enemy_start.y);
	    this.path.lineTo(9 * this.tileSize.x, 6 * this.tileSize.y);
	    this.path.lineTo(21 * this.tileSize.x, 6 * this.tileSize.y);
	    this.path.lineTo(21 * this.tileSize.x, 24 * this.tileSize.y);
	    this.path.lineTo(34 * this.tileSize.x, 24 * this.tileSize.y);
	    this.path.lineTo(34 * this.tileSize.x, 10 * this.tileSize.y);
	    this.path.lineTo(this.ground_enemy_stop.x, this.ground_enemy_stop.y);
	    //then add points to go to



        for (var i = 0; i < 10; i++) {
	    	//creates a game object - read documentation for how to create object attributes : https://photonstorm.github.io/phaser3-docs/Phaser.GameObjects.Group.html#create__anchor
	    	//Once array of enemies containing wave data is created above, use this to iterate through for loop setting sprite data and starting position
	    	//if certain type create of type i.e. enemy-sprite
            var enemy_sprite = this.followers.create(this.ground_enemy_start.x,this.ground_enemy_start.y, 'enemy_sprite', 245);
	    	//else do something with air units
	    	
	    	
	    	//game object functions: https://photonstorm.github.io/phaser3-docs/Phaser.GameObjects.GameObject.html#setData__anchor
            enemy_sprite.setData('vector', new Phaser.Math.Vector2());//, 'hp': 100, 'type': 'someobject defining motion', 'setmoredatahere': 0});
	    
	    	var velocity = 100 //pixels/sec
	    	
	    	//define animation
            this.tweens.add({
	    	//can use conditional in update to change path if unit is flying
                targets: enemy_sprite,
                z: 1,
                ease: 'Linear',
	    		//duration is in ms, determine based on velocity in pixels/sec over mapsize
               // duration: Math.floor(MAP_WIDTH/enemy_sprite.getData('velocity')) * 1000,
	    	   duration: (Math.floor(this.map_width/velocity) * 500 * Math.random()),
                repeat: 0,
                delay: 200*i
            });
	    }
    }
};


// Level 2
var Level2Scene = class extends LevelScene {
    constructor() {
        super('level2');
    }

    preload() {
        super.preload();
    }

    create() {
        super.create();
    }
};

// Level 3
var Level3Scene = class extends LevelScene {
    constructor() {
        super('level3');
    }

    preload() {
        super.preload();
    }

    create() {
        super.create();
    }
};

// ======== Towers ======== 

class Tower extends Phaser.GameObjects.Sprite {
    constructor() {super();}
    // TODO: Fill in the blanks...
};

// ======== Enemy Units ======== 
class Enemy extends Phaser.GameObjects.Sprite {
    constructor() {super();}
    // TODO: Fill in the blanks...
};

// ======== Global Event Listeners ========
window.addEventListener('load', windowOnLoad(), false);
