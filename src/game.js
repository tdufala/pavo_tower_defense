/* Pavo Tower Defense (name tbd). Made with Phaser http://phaser.io */
// ======== Imports ========
'use strict';
import 'phaser';
import css from './stylesheets/main.css'
/* const waveFuncs = require('./waves.js')
const enemyFuncs = require('./enemy.js') */



// ======== Globals ========
var game;
var player = new Player();
var scenes = [];
var config = {
    type: Phaser.AUTO,
    parent: 'phaser-app',
    backgroundColor: '#F0F0F0',
    width: 1344,
    height: 1096,
    pixelArt: true, // antialias: false, roundPixels: true
	useTicker: true,
    scene: scenes
};


// Code to set up game on initial load
function windowOnLoad() {
    // Add Scenes
    scenes.push(StartMenuScene); // first scene pushed first
    scenes.push(Level1Scene);
    scenes.push(Level2Scene);
    scenes.push(Level3Scene);
	scenes.push(gameOver);
    // Run the game
    game = new Phaser.Game(config);
}

// ======== Towers ========

class Tower extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, name) {
        super(scene, x, y, name);
		this.scene = scene;
		this.name = name;
		this.isDraggable = false;
		this.setActive();

        // Read data from config file.
        var config = this.scene.cache.json.get(this.name);
        // Default cost of 0
        this.cost = config.cost || 0;
    }

	update() {
// TODO: Move this out of update function.
        if (player.gold >= this.cost){
			if (!this.isDraggable){
				this.setVisible(true);
				this.setDepth(1000);
				this.setInteractive();
				this.scene.input.setDraggable(this);
				this.isDraggable = true;
				this.scene.input.on('drag', function (pointer, gameObject, dragX, dragY) {

					gameObject.x = dragX;
					gameObject.y = dragY;
					console.log(dragX + ',' + dragY);
				});
			}
		} else {
			if (this.isDraggable){
				this.scene.input.setDraggable(this, false);
				this.scene.input.disableInteractive();
				this.isDraggable = true;
			}
		}
	}


};


// Based on http://www.html5gamedevs.com/topic/36169-rotate-bullets-position-in-rotation-of-gun/
// TODO: Implement this according to what makes sense for us.
class Projectile extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, name) {
        super(scene, x, y, name);
        this.speed = 0;
    }

    fire(x, y) {
        this.setPosition(x, y);
        this.setActive(true);
        this.setVisible(true);
    }

    update(time, delta) {
        this.y -= this.speed * delta;
        this.x -= this.speed * delta;

        if (this.y < -50) {
            this.setActive(false);
            this.setVisible(false);
        }
    }
};

// ======== Enemy Units ========
class Enemy extends Phaser.GameObjects.PathFollower {
	constructor(scene, path, name, spawnDelay){
		super(scene, path, 0, 0, name);
		this.scene = scene;
		this.name = name;
        // We should not store the entire JSON in memory.
        // Instead, we should process it here, then discard of it.
        // This lets us do error checking on the JSON, rather than assume our JSON is always correct.
		var config = this.scene.cache.json.get(this.name);

        // Add animation
        this.pathVector = new Phaser.Math.Vector2();
		var speed = config.speed || 1;
        this.startFollow({
            ease: 'Linear',
            duration: Math.floor(this.scene.mapWidth/speed * 800),
            repeat: 0,
            from: 0,
            to: 1,
            rotateToPath: true,
            delay: spawnDelay
        });
		//this.scene.tweens.add({
	    //    targets: this,
	    //    z: 1,
	    //    ease: 'Linear',
	    //    duration: (Math.floor(this.scene.mapWidth/speed * 800)),
	    //    repeat: 0,
	    //    delay: 200*num + (i+1) * this.scene.waveDelay * 1000
		//});
	}




   update() {
		//var t = this.z;
		//var vec = this.getData('vector');
		//this.scene.path.getPoint(t, vec);
		//this.setPosition(vec.x, vec.y);
		//this.setDepth(this.y);

		//if the enemy is past the end of the map TODO: add 'or' clause for air units
		if (this.pathVector.x >= this.scene.mapWidth){
			this.scene.lives -= 1;
			this.destroy();
		}
    }
    // TODO: Fill in the blanks...
};

// ======== Scene classes ========


// Start Menu (first scene)
var StartMenuScene = class extends Phaser.Scene {
    constructor() {
        super('startMenu');
    }

    preload() {
        this.load.image('blueButton', 'assets/images/blue_button09.png');
        this.load.image('blueCircle', 'assets/images/blue_circle.png');
        this.load.image('greenCircle', 'assets/images/green_circle.png');

    }

    create() {
        var startMenuText = this.add.text(75, 75, 'Start Menu', { fontFamily: 'Helvetica, Arial' ,fontSize: '100px', color:'#0000FF'});
        var level1Text = this.add.text(75, 200, 'Level 1', { fontFamily: 'Helvetica, Arial' ,fontSize: '50px', color:'#00FF00' });
        var level2Text = this.add.text(75, 300, 'Level 2', { fontFamily: 'Helvetica, Arial' ,fontSize: '50px', color:'#00FF00' });
        var level3Text = this.add.text(75, 400, 'Level 3', { fontFamily: 'Helvetica, Arial' ,fontSize: '50px', color:'#00FF00' });
        // Start Button
        var lvl1Start = this.add.sprite(this.sys.canvas.width - 125, 225, 'blueButton').setInteractive();

        var lvl2Start = this.add.sprite(this.sys.canvas.width - 125, 325, 'blueButton').setInteractive();

        var lvl3Start = this.add.sprite(this.sys.canvas.width - 125, 425, 'blueButton').setInteractive();
        // Use 'pointerover' for mouseover event. Use 'pointerout' for mouse-leave event. - can use setTexture to change texture, for instance.
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


class gameOver extends Phaser.Scene{
	constructor(str) {
		super('gameOver');
	}
	preload(){
		this.load.image('gameOver', 'assets/images/game_over.png');
		this.load.image('blueButton', 'assets/images/blue_button09.png');
	}

	create(){
		var background = this.add.image(672,448,'gameOver');
		background.setScale(0.7);

		 // ---- UI elements ----
        var startMenuText = this.add.text(this.sys.canvas.width - 300, this.sys.canvas.height - 100, 'Return to Menu', { fontSize: '50px', color:'#00FF00', rtl: true});

		// Back to start menu button
        var btnStart = this.add.sprite(this.sys.canvas.width - 100, this.sys.canvas.height - 100, 'blueButton').setInteractive();
        btnStart.setDisplaySize(100,100);
        btnStart.on('pointerdown', function(event) {
            this.scene.start('startMenu');
        }, this); // Return to the start menu.
	}

}


// Base class for levels
class LevelScene extends Phaser.Scene {
    constructor(str) {
        super(str);
        this.levelName = str;
		this.mapWidth = 1344;
        this.mapHeight = 896;
        this.tileSize = { 'x': 32, 'y': 32 };
        this.waveFile = 'src/waves/' + this.levelName + '.json';
        this.enemyWaves = null;

		this.enemySpawn = { 'x': 0, 'y': 0 };
		this.enemyGoal  = { 'x': 0, 'y': 0 };
    }

    preload() {
        // Load common assets
        this.load.image('blueButton', 'assets/images/blue_button09.png');
        this.load.image('gameTiles', 'assets/spritesheets/towerDefense_tilesheet.png');
		this.load.spritesheet('enemySprite', 'assets/spritesheets/towerDefense_tilesheet.png', { frameWidth: 64, frameHeight: 64} );
        this.load.tilemapTiledJSON(this.levelName, 'src/maps/' + this.levelName + '.json');
        this.load.json('waveFile' + this.levelName, this.waveFile);
		this.load.json('normalEnemy', 'src/enemies/normalEnemy.json');
		this.load.image('normalEnemy', 'assets/images/normalEnemy.png');
		this.load.json('scaryEnemy', 'src/enemies/scaryEnemy.json');
		this.load.image('scaryEnemy', 'assets/images/scaryEnemy.png');
		this.load.json('basicTower', 'src/towers/basicTower.json');
		this.load.image('basicTower', 'assets/images/basicTower.png');
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
        this.map.createStaticLayer('rocks', tiles);
		this.towerPlaceable = this.map.createStaticLayer('towerPlacement', tiles);
		this.map.createStaticLayer('towerBorder', tiles);
		this.map.createStaticLayer('towers', tiles);

		// ----- Tower -----
		player.towers = this.add.group();

		this.map.findObject('towerProps', function(obj){
		    var tower = new Tower(this, obj.x, obj.y, obj.name);
		    this.towers.add(tower);
		}, this);



        // ---- Graphics ----
        this.graphics = this.add.graphics();
	    this.path = new Phaser.Curves.Path();
 	    //this.line1 = new Phaser.Curves.Line([ this.enemySpawn.x, this.enemySpawn.y, 288, 576 ]);
 	    this.line1 = new Phaser.Curves.Line([ this.enemySpawn.x, this.enemySpawn.y, this.enemySpawn.x, this.enemySpawn.y ]);
	    this.path.add(this.line1);

	    // ---- Units ----
        this.enemyWaves = new EnemyWaves(this);

		//create text for lives
		this.liveText = this.add.text(16,16, 'Lives: ' + player.lives, { fontSize: '24px', fill: '#000' })

		//create text for gold
		this.goldText = this.add.text(16,40, 'Gold: ' + player.gold, { fontSize: '24px', fill: '#000' });

		//create timer
		this.timer = this.time.addEvent({delay: this.enemyWaves, repeat: 0});

		//create text for time until next wave
		this.timeText = this.add.text(this.mapWidth - 270, 16, 'Next Wave in ' + this.waveDelay + 's', { fontSize: '24px', fill: '#000' })
    }

	update() {

		var towers = this.towers.getChildren();
		for (var i = 0; i < towers.length; i++){
			towers[i].update();
		}


		this.enemyWaves.update();

		//game is lost - go to new scene
		if (player.lives <= 0){
			player.lives = 0;
		}


		this.goldText.setText('Gold: ' + player.gold);
		this.liveText.setText('Lives: ' + player.lives);

		if (this.waveCount > 0){
			this.timeText.setText('Next Wave in ' + Math.round(this.waveDelay * (1-this.timer.getProgress())) + 's')
		} else {
			this.timeText.setText('');
		}

		//reset timer if necessary
 		if (this.timer.getProgress() == 1 && this.waveCount > 1){
			this.timer.destroy();
			this.timer = this.time.addEvent({delay: this.waveDelay * 1000, repeat: 0});
			this.waveCount -=1;
		} else if (this.timer.getProgress() == 1){
			this.timer.destroy();
			this.timeText.setText('');
		}

		if (player.lives <= 0){
			this.scene.start('gameOver');
		}



	}

};
// Level 1
var Level1Scene = class extends LevelScene {
    constructor() {
        super('level1');
		// Constants specific to this level
		this.enemySpawn = {'x': -2 * this.tileSize.x,
                                   'y': 18 * this.tileSize.y};
		this.enemyGoal  = {'x': this.mapWidth + 2 * this.tileSize.x,
                                   'y': 10 * this.tileSize.y};




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
				//this.load.image('enemySprite', 32, 576, 'sprites', 245);
		//this.add.sprite(32, 576, 'enemySprite', 245);

	    this.path.lineTo(9 * this.tileSize.x, this.enemySpawn.y);
	    this.path.lineTo(9 * this.tileSize.x, 6 * this.tileSize.y);
	    this.path.lineTo(21 * this.tileSize.x, 6 * this.tileSize.y);
	    this.path.lineTo(21 * this.tileSize.x, 24 * this.tileSize.y);
	    this.path.lineTo(34 * this.tileSize.x, 24 * this.tileSize.y);
	    this.path.lineTo(34 * this.tileSize.x, 10 * this.tileSize.y);
	    this.path.lineTo(this.enemyGoal.x, this.enemyGoal.y);
	    //then add points to go to



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

// Keeps track of all Enemies, including when they're going to spawn.
class EnemyWaves {
    constructor(scene) {
        this.scene = scene;
        this.waves = []
        this.currentWave = 0; // We always start at wave index 0.
        // The scene provides a JSON waveFile we use to generate waves
        var waveFileJSON = this.scene.cache.json.get('waveFile' + this.scene.levelName);
        this.generateWaves(waveFileJSON);
    }

    generateWaves(waveFileJSON) { // TODO: IMPLEMENT
        // { waves: [ // Each element in waves is a single wave
        //     [ // Each element of a wave is a list containing an assortment of enemies to be spawned for that wave
        //          { // Enemies - spawns one or more enemies of the same type at a given delay
        //              enemyType: 'normalEnemy', // This loads another JSON file containing details for this enemy
        //              enemyProps: {
        //                  // include properties here that override those set in the JSON file for the enemy
        //                  // You could leave off 'enemyType' and just include the contents of that file here, and it should function the same.
        //              }
        //              enemyCount: // The number of the specified enemies to spawn. Defaults to 1
        //              spawnDelay: // A number (or perhaps an object? to be implemented) that gives the delay on when this enemy will spawn. Defaults to 0
        //              spawnSpread: // Used for enemyCount > 1: Spawns enemies every spawnSpread (unit of time), until all enemies are spawned
        //          }, {
        //              // ... more enemies, as above
        //          }
        //      ]
        //   ]
        //   numEnemies: Number }
        for (var i = 0; i < waveFileJSON.waves.length; i++) {
            // Create a group for our wave
			var wave = {
                enemies: this.scene.add.group(),

            }
            this.waves.push(wave.enemies);
            var currentWave = waveFileJSON.waves[i];

			//time between waves in seconds (low just for testing, should be incorporated into level scene)
			var timeBetweenWaves = 5;

            // Loop through each enemy type.
            for (var j = 0; j < currentWave.length; j++) {
                // TODO: handle enemyType property
                // TODO: handle enemyProps property
                // TODO: handle enemyCount property
                // TODO: handle spawnDelay property
                // TODO: handle spawnSpread property
                // TODO: generate enemies, put them into the wave

				for (var n = 0; n < currentWave[j].enemyCount; n++){
                    var delay = 200*i + (i+1) * this.scene.waveDelay * 1000;
					var enemy = new Enemy(this.scene, this.scene.path, currentWave[j].enemyType, delay);
					wave.add(enemy, true);
					//game object functions: https://photonstorm.github.io/phaser3-docs/Phaser.GameObjects.GameObject.html#setData__anchor
				}
            }
			this.scene.waveCount = this.waves.length;
        }
    }

    update() {
        // This currently calls update() on every single enemy. Could be changed to just update the current wave.
		this.scene.graphics.clear();

		this.scene.graphics.lineStyle(0, 0, 0);
		this.scene.path.draw(this.scene.graphics);
        for (var i = 0; i < this.waves.length; i++) {
            var enemies = this.waves[i].getChildren();
            for (var j = 0; j < enemies.length; j++) {
				enemies[j].update();

            }
        }
    }
};

// ========= Player class ========
// Contains information regarding the player, possibly cross-session
// This class should be used to encapsulate any data we would want to use to generate save states.
class Player {
    constructor(name, gold, lives, waveNum, towers, levelID) {
        // Lets us pass in a player name later if we wanted to create a leaderboard for instance
        this.playerName = name || "Player 1";
		this.gold = gold || 500;
		this.lives = lives || 10;

		// Wave number - can be used for save states?
        this.waveNum = waveNum || 0;
        // Tower arrangement - could just reference
        this.towers = towers || null;
        // String representing the level the player is on - can be used for save states?
        this.levelID = levelID || null;

    }

    // TODO: Implement save states, replacing placeholder function.
    loadSaveData() {
        // Could add parameters, or use globals
        // We should be able to use localStorage for save states, but have to be careful of
        // running the game in multiple tabs causing race conditions (leading to corruption) when we write to storage.
    }
};

// ======== Global Event Listeners ========
window.addEventListener('load', windowOnLoad(), false);
