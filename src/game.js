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
//constants used in this game level and/or game
MAP_WIDTH = 1344;
GROUND_ENEMY_START = {'x': -50, 'y': 100};
GROUND_ENEMY_STOP = {'x': MAP_WIDTH + 50, 'y': 900/*ish*/};

AIR_ENEMY_START = {'x' : -50, 'y': -50};
AIR_ENEMY_STOP = {'x': 1390, 'y': 900/*ish*/};

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
var StartMenuScene = new Phaser.Class({
    Extends: Phaser.Scene,

    initialize: function StartMenuScene() {
        Phaser.Scene.call(this, { key: 'startMenu'});
    },

    preload: function() {
        this.load.image('blueButton', 'assets/images/blue_button09.png');
    },

    create: function() {
        var startMenuText = this.add.text(75, 75, 'Start Menu', { fontSize: '100px', color:'#0000FF'});
        var level1Text = this.add.text(75, 200, 'Level 1', { fontSize: '50px', color:'#00FF00' });
        var level2Text = this.add.text(75, 300, 'Level 2', { fontSize: '50px', color:'#00FF00' });
        var level3Text = this.add.text(75, 400, 'Level 3', { fontSize: '50px', color:'#00FF00' });
        // Start Button
        var btnStart = this.add.sprite(this.sys.canvas.width - 125, 225, 'blueButton').setInteractive();
        btnStart.setDisplaySize(100,100);

        var lvl2Start = this.add.sprite(this.sys.canvas.width - 125, 325, 'blueButton').setInteractive();
        btnStart.setDisplaySize(100,100);

        var lvl3Start = this.add.sprite(this.sys.canvas.width - 125, 425, 'blueButton').setInteractive();
        btnStart.setDisplaySize(100,100);
        // following could be useful later:
        //btnStart.on('pointerover', function (event) { btnStart.setTexture('imgButtonStartHover');/* Do something when the mouse enters */ });
        //btnStart.on('pointerout', function (event) { btnStart.setTexture('imgButtonStartNormal');/* Do something when the mouse exits. */ });
        btnStart.on('pointerdown', function(event) {
            this.scene.start('level1');
        }, this); // Start the main game.

        lvl2Start.on('pointerdown', function(event) {
            this.scene.start('level2');
        }, this); // Start the main game.

        lvl3Start.on('pointerdown', function(event) {
            this.scene.start('level3');
        }, this); // Start the main game.
        
    }
});


// Level 1
var Level1Scene = new Phaser.Class({
    Extends: Phaser.Scene,
    
    initialize: function Level1Scene() {
        Phaser.Scene.call(this, { key: 'level1'});
    },

    preload: function() {
		//load game map
        this.load.image('gameTiles', 'assets/spritesheets/towerDefense_tilesheet.png');
        this.load.tilemapTiledJSON('level1', 'assets/maps/level1.json');
		
		//load enemy sprites
		this.load.image('enemy_sprite', 'assets/sprites/enemy_sprite.png');
    },

    create: function() {
		//create tilemap and set tileset
        this.map = this.add.tilemap('level1');
        var tiles = this.map.addTilesetImage('tileset', 'gameTiles');
        
		//set map layers
        this.backgroundLayer = this.map.createStaticLayer('background', tiles);
        this.rockLayer = this.map.createStaticLayer('rocks', tiles);
	
		//add UI
        var startMenuText = this.add.text(this.sys.canvas.width - 300, this.sys.canvas.height - 100, 'Return to Menu', { fontSize: '50px', color:'#00FF00', rtl: true});

        // Back to start menu button
        var btnStart = this.add.sprite(this.sys.canvas.width - 100, this.sys.canvas.height - 100, 'blueButton').setInteractive();
        btnStart.setDisplaySize(100,100);
        btnStart.on('pointerdown', function(event) {
            this.scene.start('startMenu');
        }, this); // Return to the start menu.
		
		//create towers
		
		/*Create towers here - add preloading of tower sprites*/
		
		
		//Load and initiate wave information
		
		//Wave motionpath workflow
		//set path as lines
	var line1 = new Phaser.Curves.Line([ 100, 100, 500, 100 ]);
 
	path.add(line1);
	//then add points to go to
    path.lineTo(500, 400);

    //  Create the path followers

	//create a follower group
    followers = this.add.group();

    for (var i = 0; i < 32; i++)
    {
		//creates a game object - read documentation for how to create object attributes : https://photonstorm.github.io/phaser3-docs/Phaser.GameObjects.Group.html#create__anchor
		//Once array of enemies containing wave data is created above, use this to iterate through for loop setting sprite data and starting position
		//if certain type create of type i.e. enemy-sprite
        var enemy_sprite = followers.create(GROUND_ENEMY_START,GROUND_ENEMY_START, 'enemy_sprite');
		//else do something with air units
		
		
		//game object functions: https://photonstorm.github.io/phaser3-docs/Phaser.GameObjects.GameObject.html#setData__anchor
        enemy_sprite.setData({'vector', new Phaser.Math.Vector2(), 'hp': 100, 'type': 'someobject defining motion', 'setmoredatahere': 0});
	

		
		//define animation
        this.tweens.add({
		//can use conditional in update to change path if unit is flying
            targets: enemy_sprite,
            z: 1,
            ease: 'Linear',
			//duration is in ms, determine based on velocity in pixels/sec over mapsize
            duration: Math.floor(MAP_WIDTH/enemy_sprite.getData('type').velocity),
            repeat: 0,
            delay: 100*i,
        });
    }
},
	update: function(){
		
    graphics.clear();

    graphics.lineStyle(0, 0, 0);

    path.draw(graphics);

    var balls = followers.getChildren();

    for (var i = 0; i < balls.length; i++)
    {
		//depending on type of enemy follow path or go straight to ending position for air units
        var t = balls[i].z;
        var vec = balls[i].getData('vector');

        //  The vector is updated in-place
        path.getPoint(t, vec);
        
        balls[i].setPosition(vec.x, vec.y);

        balls[i].setDepth(balls[i].y);
    }
	}
);





// Level 2
var Level2Scene = new Phaser.Class({
    Extends: Phaser.Scene,
    
    initialize: function Level2Scene() {
        Phaser.Scene.call(this, { key: 'level2'});
    },

    preload: function() {
        this.load.image('gameTiles', 'assets/spritesheets/towerDefense_tilesheet.png');
        this.load.tilemapTiledJSON('level2', 'assets/maps/level2.json');
    },

    create: function() {
        this.map = this.add.tilemap('level2');
        var tiles = this.map.addTilesetImage('tileset', 'gameTiles');
        
        this.backgroundLayer = this.map.createStaticLayer('background', tiles);
        this.rockLayer = this.map.createStaticLayer('rocks', tiles);

        var startMenuText = this.add.text(this.sys.canvas.width - 300, this.sys.canvas.height - 100, 'Return to Menu', { fontSize: '50px', color:'#00FF00', rtl: true});
        
        // Back to start menu button
        var btnStart = this.add.sprite(this.sys.canvas.width - 100, this.sys.canvas.height - 100, 'blueButton').setInteractive();
        btnStart.setDisplaySize(100,100);
        btnStart.on('pointerdown', function(event) {
            this.scene.start('startMenu');
        }, this); // Return to the start menu.
    }
});

// Level 3
var Level3Scene = new Phaser.Class({
    Extends: Phaser.Scene,
    
    initialize: function Level3Scene() {
        Phaser.Scene.call(this, { key: 'level3'});
    },

    preload: function() {
        this.load.image('gameTiles', 'assets/spritesheets/towerDefense_tilesheet.png');
        this.load.tilemapTiledJSON('level3', 'assets/maps/level3.json');
    },

    create: function() {
        this.map = this.add.tilemap('level3');
        var tiles = this.map.addTilesetImage('tileset', 'gameTiles');
        
        this.backgroundLayer = this.map.createStaticLayer('background', tiles);
        this.rockLayer = this.map.createStaticLayer('rocks', tiles);

        var startMenuText = this.add.text(this.sys.canvas.width - 300, this.sys.canvas.height - 100, 'Return to Menu', { fontSize: '50px', color:'#00FF00', rtl: true});

        // Back to start menu button
        var btnStart = this.add.sprite(this.sys.canvas.width - 100, this.sys.canvas.height - 100, 'blueButton').setInteractive();
        btnStart.setDisplaySize(100,100);
        btnStart.on('pointerdown', function(event) {
            this.scene.start('startMenu');
        }, this); // Return to the start menu.
    }
});

// ======== Global Event Listeners ========
window.addEventListener('load', windowOnLoad(), false);
