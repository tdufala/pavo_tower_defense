/* Pavo Tower Defense (name tbd). Made with Phaser http://phaser.io */
// ======== Imports ========
'use strict';
import 'phaser';
import css from './stylesheets/main.css'
/* const waveFuncs = require('./waves.js')
const enemyFuncs = require('./enemy.js') */


// ======== Globals ========
var game;
var player;
var scenes = [];
var config = {
    type: Phaser.AUTO,
    parent: 'phaser-app',
    backgroundColor: '#0F0F0F',
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
    player = new Player();
    game = new Phaser.Game(config);
}

// ======== Towers ========

class Tower extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, name) {
        super(scene, x, y, name);
		this.scene = scene;
		this.name = name;
		this.isDraggable = false;
        // Read data from config file.
        var config = this.scene.cache.json.get(this.name);
        // Default cost of 0
        this.cost = config.cost || 0;
		this.startPos = {'x': x, 'y': y};
    }

	update() {
		if (!this.isDraggable){
			this.setInteractive();
			this.scene.input.setDraggable(this);
			this.isDraggable = true;
			this.scene.input.on('dragstart', function (pointer, gameObject) {
            	gameObject.setAlpha(0.5);
			});
			this.scene.input.on('drag', function (pointer, gameObject, dragX, dragY) {
				gameObject.setPosition(dragX, dragY);
			});
			this.scene.input.on('dragend', function(pointer, gameObject) {
				gameObject.setAlpha(1);
				// Snap to tile coordinates, but in world space
				var pointerTileX = this.scene.map.worldToTileX(pointer.x);
				var pointerTileY = this.scene.map.worldToTileY(pointer.y);
				var canPlace = false;
				this.scene.towerPlaceable.findTile(function(tile){
					if (tile.x == pointerTileX && tile.y == pointerTileY){
						if (tile.index == 1){
							canPlace = true;
						}
						return true;
					}
				});
				if (canPlace){
					gameObject.setPosition(pointerTileX * this.scene.tileSize + this.scene.tileSize/2, pointerTileY * this.scene.tileSize + this.scene.tileSize/2);
				} else {
					gameObject.setPosition(gameObject.startPos.x, gameObject.startPos.y);
				}
			});
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
        this.spawnDelay = spawnDelay;
        this.hp = 10;
        this.bounty = 10;
        this.setActive(false);
        this.setVisible(false);
        //this.setVisible(false);
        // We should not store the entire JSON in memory.
        // Instead, we should process it here, then discard of it.
        // This lets us do error checking on the JSON, rather than assume our JSON is always correct.
		var config = this.scene.cache.json.get(this.name);

        // Add animation
		var speed = config.speed || 1;
        var duration = Math.floor(this.scene.mapWidth/speed * 1000);
        this.pathConfig = {
            ease: 'Linear',
            duration: duration,
            from: 0,
            to: 1,
            rotateToPath: true,
            delay: 0
        };
    }

    // Sets up timers to spawn the unit
    spawn() {
        this.spawnTimer = this.scene.time.addEvent({
            delay: this.spawnDelay,
            callback: this.getOutThere,
            callbackScope: this
        });
    }

    // Internal - Gets the unit out there to start doing stuff!
    getOutThere() {
        // Starts updating
        this.setActive(true);
        this.setVisible(true);
        // Starts animating -- note that it still waits for its spawnDelay before moving.
        this.startFollow(this.pathConfig);
    }

    // Starts being called after this.active == true (from setActive)
    update(time, delta) {
        // Check if we've been killed.
        // If so, give player gold and get destroyed.
        if(this.hp <= 0) {
            player.gold += this.bounty;
            this.destroy();
        }

		//if the enemy is past the end of the map
		if (this.active && !this.isFollowing()) {
			player.lives--;
			this.destroy();
		}
    }
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
        var startMenuText = this.add.text(75, 75, 'Start Menu', { fontFamily: 'Helvetica, Arial', fontSize: '100px', color:'#0000FF'});
        var level1Text = this.add.text(75, 200, 'Level 1', { fontFamily: 'Helvetica, Arial', fontSize: '50px', color:'#00FF00' });
        var level2Text = this.add.text(75, 300, 'Level 2', { fontFamily: 'Helvetica, Arial', fontSize: '50px', color:'#00FF00' });
        var level3Text = this.add.text(75, 400, 'Level 3', { fontFamily: 'Helvetica, Arial', fontSize: '50px', color:'#00FF00' });
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
        var menuButton = this.add.sprite(this.sys.canvas.width - 100, this.sys.canvas.height - 100, 'blueButton').setInteractive();
        menuButton.setDisplaySize(100,100);
        menuButton.on('pointerdown', function(event) {
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
        this.tileSize = 64;
        this.waveFile = 'src/waves/' + this.levelName + '.json';
        this.enemyWaves = null;

		this.enemySpawn = { 'x': 0, 'y': 0 };
		this.enemyGoal  = { 'x': 0, 'y': 0 };
    }

    preload() {
        // Load common assets
        this.load.image('blueButton', 'assets/images/blue_button09.png');
        this.load.image('gameTiles', 'assets/spritesheets/minimalTilesTowers.png', { frameWidth: 64, frameHeight: 64});
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
		// ---- Tilemap ----
        this.map = this.add.tilemap(this.levelName);
        var tiles = this.map.addTilesetImage('tileset', 'gameTiles');
		// Set map layers
		this.towerPlaceable = this.map.createStaticLayer('towerPlace', tiles);
        this.backgroundLayer = this.map.createStaticLayer('background', tiles);

        // ---- Player loading ----
        // TODO: Test purposes only. If we implement save states, this should be refactored.
        // Calling Player(name, gold, lives, waveNum, towers, levelName) - taking defaults for most
        player = new Player(null, null, null, null, this.levelName);

        // ---- UI elements ----
        var startMenuText = this.add.text(this.sys.canvas.width - 300, this.sys.canvas.height - 100, 'Return to Menu', { fontSize: '50px', color:'#00FF00', rtl: true});

        // ++ Buttons ++
        // Back to start menu button
        var menuButton = this.add.sprite(this.sys.canvas.width - 100, this.sys.canvas.height - 100, 'blueButton').setInteractive();
        menuButton.setDisplaySize(100,100);
        menuButton.on('pointerdown', function(event) {
            this.scene.start('startMenu');
        }, this); // Return to the start menu.

        // Button to start next wave.
        var startWaveButton = this.add.sprite(100, this.sys.canvas.height - 100, 'blueButton').setInteractive();
        startWaveButton.setDisplaySize(100,100);
        startWaveButton.on('pointerdown', function(event) {
            this.enemyWaves.startNextWave();
        }, this);
		
        // ++ Non-interactible indicators ++
        // Life counter
		this.liveText = this.add.text(16,16, 'Lives: ' + player.lives, { fontSize: '24px', fill: '#FFF' })

		// Gold counter
		this.goldText = this.add.text(16,40, 'Gold: ' + player.gold, { fontSize: '24px', fill: '#FFF' });


		// ----- Towers -----
		player.towers = this.add.group({
            runChildUpdate: true,
        });

		//bottom right 5 tiles used for tower placement
		var tower = new Tower(this, this.tileSize / 2, this.mapHeight - this.tileSize/2, 'basicTower' );
		player.towers.add(tower, true);

	    // Add path for enemies on this level.
	    this.path = new Phaser.Curves.Path();


		//create path for ground objects and initialize starting points
		var pathObjects = this.map.getObjectLayer('GameObjects').objects;
		for (var i = 0; i < pathObjects.length; i++){
			if (pathObjects[i].name == 'StartPoint'){
				this.enemySpawn.x = pathObjects[i].x;
				this.enemySpawn.y = pathObjects[i].y;
				this.path.add(new Phaser.Curves.Line([ this.enemySpawn.x, this.enemySpawn.y, this.enemySpawn.x, this.enemySpawn.y ]));
			} else if (pathObjects[i].name == 'FinishPoint'){
				this.enemyGoal.x = pathObjects[i].x;
				this.enemyGoal.y = pathObjects[i].y;
			} else {
				for (var j = 0; j < pathObjects[i].polyline.length; j++){
					this.path.lineTo(pathObjects[i].polyline[j].x + this.enemySpawn.x, pathObjects[i].polyline[j].y + this.enemySpawn.y);
				}
			}
		}

	    // ---- Enemies ----
        this.enemyWaves = new EnemyWaves(this);
    }

	update(time, delta) {
		// Check for game over, man.
		if (player.lives <= 0){
			player.lives = 0;
            this.scene.start('gameOver');
		}

		this.liveText.setText('Lives: ' + player.lives);
		this.goldText.setText('Gold: ' + player.gold);

		//if (this.waveCount > 0){
		//	this.timeText.setText('Next Wave in ' + Math.round(this.waveDelay * (1-this.timer.getProgress())) + 's')
		//} else {
		//	this.timeText.setText('');
		//}

		//reset timer if necessary
 		//if (this.timer.getProgress() == 1 && this.waveCount > 1){
		//	this.timer.destroy();
		//	this.timer = this.time.addEvent({delay: this.waveDelay * 1000, repeat: 0});
		//	this.waveCount -=1;
		//} else if (this.timer.getProgress() == 1){
		//	this.timer.destroy();
		//	this.timeText.setText('');
		//}
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
        this.waveComplete = false; // Can only start new waves when this is false.
        this.currentWave = 0;
        this.waveCount = 0;
        this.activeEnemies = null;
        this.allWavesStarted = false;
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
        this.waveCount = waveFileJSON.waves.length;
        var enemyTypes = waveFileJSON.enemies;
        for (let i = 0; i < this.waveCount; i++) {
            // Object to track all data about the wave - Could be turned into its own class maybe?
			var wave = {
                enemies: this.scene.add.group(),
                enemyCount: 0, // Keeps track of the total number of enemies spawned by this wave.
                delay: 0 // Accumulates as enemies are spawned. After this many ms, all enemies in this wave should be spawned.
            };
            this.waves.push(wave);
            var enemyGroups = waveFileJSON.waves[i];
            // Loop through each enemy type.
            for (let j = 0; j < enemyGroups.length; j++) {
                var enemyCount = enemyGroups[j].enemyCount || 1;

                // Enemies of this type spawn 1000 ms (1s) apart by default
                var spawnSpread = enemyGroups[j].spawnSpread || 1000;

                // These enemies spawns 1000 ms (1s) after the previous group, by default.
                var spawnDelay = enemyGroups[j].spawnDelay || 0;

                // Must provide an enemyType so we know what type of enemy to spawn.
                var enemyType = enemyGroups[j].enemyType || console.log("Error in JSON, must supply enemyType");

                // TODO: Implement this override functionality. Potential design:
                // Add stuff to Enemy class to handle this 'enemyProps' object.
                // If it's set, then check that for values before checking the config file.
                // - OR -
                // Somehow agglomerate the objects into one. Could be useful to write a function that takes
                // two objects representing an enemy config and combines them into one (first arg preceding the second).
                var enemyProps = null;
                if(enemyTypes[enemyType]) {
                    enemyProps = enemyTypes[enemyType].enemyProps || null;
                    // Now that we've consume the original type, we set it to an alternate one for use
                    enemyType = enemyTypes[enemyType].altType || enemyType;
                }

                wave.delay += spawnDelay;
				for (let n = 0; n < enemyCount; n++){
					let enemy = new Enemy(this.scene, this.scene.path, enemyType, wave.delay);
					wave.enemies.add(enemy, true);
                    wave.enemyCount++;
                    wave.delay += spawnSpread;
				}
            }
        }
    }

    // Starts the next wave, if the current wave is not in progress
    startNextWave() {
        // Check if the current wave is in progress.
        if(this.isWaveActive()) {
            console.log("Cannot start next wave, current wave is in progress");
            return;
        }
        // To be extra safe
        if(this.currentWave >= this.waveCount || this.allWavesStarted) {
            console.log("No more waves to start!");
            this.allWavesStarted = true;
            return;
        } else {
            console.log("Starting wave " + this.currentWave);
            this.startWave(this.currentWave);
            this.currentWave++;
            if(this.currentWave >= this.waveCount) {
                this.allWavesStarted = true;
            }
            return this.currentWave;
        }
    }

    // Simply starts a wave, assigning it as the active wave.
    startWave(waveNum) {
        this.activeEnemies = this.waves[waveNum].enemies.getChildren();
        // Starts calling update() for enemies.
        this.waves[waveNum].enemies.runChildUpdate = true;
        for(var i = 0; i < this.activeEnemies.length; ++i) {
            this.activeEnemies[i].spawn();
        }
    }

    isWaveActive() {
        if(!this.activeEnemies) {
            return 0;
        }
        if(this.activeEnemies.length <= 0) {
            return 0;
        }
        console.log("Active Enemy count: " + this.activeEnemies.length);
        return this.activeEnemies.length;
    }
};

// ========= Player class ========
// Contains information regarding the player, possibly cross-session
// This class should be used to encapsulate any data we would want to use to generate save states.
// This could come in handy for save states:
// http://www.thebotanistgame.com/blog/2015/08/12/saving-loading-game-state-phaserjs.html
class Player {
    constructor(name, gold, lives, waveNum, towers, levelName) {
        // Lets us pass in a player name later if we wanted to create a leaderboard for instance
        this.playerName = name || "Player 1";
		this.gold = gold || 500;
		this.lives = lives || 10;

		// Wave number - can be used for save states?
        this.waveNum = waveNum || 0;
        // Tower arrangement - could just reference
        this.towers = towers || null;
        // String representing the level the player is on - can be used for save states?
        this.levelName = levelName || null;

    }

    // TODO: Implement this function to load save states
    //       May want to also add a function to save player data?
    loadSaveData() {
        // Could add parameters, or use globals
        // We should be able to use localStorage for save states, but have to be careful of
        // running the game in multiple tabs causing race conditions (leading to corruption) when we write to storage.
    }
    saveGame(saveFileName) {
        // If no saveFileName provided, use player name?
        // Use caution since these save files also track which level we're on.
        // Might need different save files for each level, with different file names for each?
        var saveFileName = saveFileName || this.playerName;
        return saveFileName;
    }
};

// ======== Global Event Listeners ========
window.addEventListener('load', windowOnLoad(), false);
