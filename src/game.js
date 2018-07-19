// ======== Imports ========
import 'phaser';
import css from './stylesheets/main.css'


// ======== Globals ========

var scenes = [];
var config = {
    type: Phaser.AUTO,
    parent: 'phaser-app',
    width: 1344,
    height: 896,
    pixelArt: true, // antialias: false, roundPixels: true
    scene: scenes
};

// ======== Scenes ========

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
        this.add.text(75, 170, 'Start Menu', { fontSize: '100px', color:'#0000FF' });
        
        // Start Button
        var btnStart = this.add.sprite(790, 160, 'blueButton').setInteractive();
        btnStart.setDisplaySize(32,32);
        //btnStart.on('pointerover', function (event) { btnStart.setTexture('imgButtonStartHover');/* Do something when the mouse enters */ });
        //btnStart.on('pointerout', function (event) { btnStart.setTexture('imgButtonStartNormal');/* Do something when the mouse exits. */ });
        btnStart.on('pointerdown', function(event) {
            this.scene.start('level1');
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
        this.load.image('gameTiles', 'assets/spritesheets/towerDefense_tilesheet.png');
        this.load.tilemapTiledJSON('level1', 'assets/maps/level1.json');
    },

    create: function() {
        this.map = this.add.tilemap('level1');
        var tiles = this.map.addTilesetImage('tileset', 'gameTiles');
        
        this.backgroundLayer = this.map.createStaticLayer('background', tiles);
        this.rockLayer = this.map.createStaticLayer('rocks', tiles);

        // Back to start menu button
        var btnStart = this.add.sprite(790, 160, 'blueButton').setInteractive();
        btnStart.setDisplaySize(32,32);
        //btnStart.on('pointerover', function (event) { btnStart.setTexture('imgButtonStartHover');/* Do something when the mouse enters */ });
        //btnStart.on('pointerout', function (event) { btnStart.setTexture('imgButtonStartNormal');/* Do something when the mouse exits. */ });
        btnStart.on('pointerdown', function(event) {
            this.scene.start('startMenu');
        }, this); // Return to the start menu.
    }
});

// ======== Game start ========

// Add Scenes
scenes.push(StartMenuScene); // first scene pushed first
scenes.push(Level1Scene);
// Finally, start the game.
var game = new Phaser.Game(config);
