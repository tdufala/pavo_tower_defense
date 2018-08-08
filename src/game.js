/* Pavo Tower Defense (name tbd). Made with Phaser http://phaser.io */
// ======== Imports ========
'use strict';
import 'phaser';
import css from './stylesheets/main.css'
/* const waveFuncs = require('./waves.js')
const enemyFuncs = require('./enemy.js') */



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
    constructor(scene, x, y, key) {
        super(scene, x, y, key);
		this.scene = scene;
		this.type = key;
		this.isDraggable = false;
		this.setActive();
    }
	loadTower(){
		//load from preloaded json file (must be loaded in scene previously due to async nature of call)
		//loads BASE specs of tower, does not depend on upgrade
		this.specs = this.scene.cache.json.get(this.type);

	}
	
	update(){
		
 		if (this.scene.gold >= this.specs.cost){
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

// ======== Enemy Units ========
class Enemy extends Phaser.GameObjects.Sprite {
	constructor(scene, x, y, key){
		super(scene, x, y, key);
		this.scene = scene;
		this.type = key;
	}
	
	loadEnemy(){
		this.specs = this.scene.cache.json.get(this.type);
	}
	
	
	
   update() {
		if (this.specs.type == 'ground'){
			var t = this.z;
			var vec = this.getData('vector');
			this.scene.path.getPoint(t, vec);
			this.setPosition(vec.x, vec.y);
			this.setDepth(this.y);
		}

		//if the enemy is past the end of the map TODO: add 'or' clause for air units
		if (this.specs.type == 'ground' && (vec.x == this.scene.enemy_stop.x && vec.y == this.scene.enemy_stop.y)){
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


class gameOver extends Phaser.Scene{
	constructor(str) {
		super('gameOver');
	}
	preload(){
		this.load.image('game_over', 'assets/images/game_over.png');
		this.load.image('blueButton', 'assets/images/blue_button09.png');
	}
	
	create(){
		var background = this.add.image(672,448,'game_over');	
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
		this.map_width = 1344;
        this.map_height = 896;
        this.tileSize = { 'x': 32, 'y': 32 };
        this.waveFile = 'src/waves/' + this.levelName + '.json';
        this.enemyWaves = null;

		this.enemy_start = { 'x': 0, 'y': 0 };
		this.enemy_stop  = { 'x': 0, 'y': 0 };

		// Wave number - can be used for save states?
        this.waveNum = 0;
		// Game resources for the player
        this.lives = -1;
        this.gold = -1;
        // Tower arrangement - could just reference
        this.towers = null;
		
		
		//delay before next wave in seconds (default time set for first wave)
		//TODO: CHANGE TO MORE PRACTICAL DELAY, delay is low for testing purposes
		this.waveDelay = 5;
		
    }

    preload() {
        // Load common assets
        this.load.image('blueButton', 'assets/images/blue_button09.png');
        this.load.image('gameTiles', 'assets/spritesheets/minimalTilesTowers.png');
		//this.load.spritesheet('enemy_sprite', 'assets/spritesheets/towerDefense_tilesheet.png', { frameWidth: 64, frameHeight: 64} );
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
		//this.towerPlaceable = this.map.createStaticLayer('towerPlace', tiles);
        this.backgroundLayer = this.map.createStaticLayer('background', tiles);

		
		// ----- Tower -----
		this.towers = this.add.group();
		
/* 		this.map.findObject('towerProps', function(obj){
			     var tower = new Tower(this, obj.x, obj.y, obj.name);
				 tower.loadTower();
				 this.towers.add(tower);
			}, this); 
		 */
		
	    
        // ---- Graphics ----
        this.graphics = this.add.graphics();
	    this.path = new Phaser.Curves.Path();
		
		
		//create path for ground objects and initialize starting points
		var pathObjects = this.map.getObjectLayer('GameObjects').objects;
		console.log(pathObjects);
		for (var i = 0; i < pathObjects.length; i++){
			if (pathObjects[i].name == 'StartPoint'){
				this.enemy_start.x = pathObjects[i].x;
				this.enemy_start.y = pathObjects[i].y;
				this.path.add(new Phaser.Curves.Line([ this.enemy_start.x, this.enemy_start.y, this.enemy_start.x, this.enemy_start.y ]));
			} else if (pathObjects[i].name == 'FinishPoint'){
				this.enemy_stop.x = pathObjects[i].x;
				this.enemy_stop.y = pathObjects[i].y;
			} else {
				for (var j = 0; j < pathObjects[i].polyline.length; j++){
					this.path.lineTo(pathObjects[i].polyline[j].x + this.enemy_start.x, pathObjects[i].polyline[j].y + this.enemy_start.y);
				}
			} 
		}
		this.path.lineTo(this.enemy_stop.x, this.enemy_stop.y);


	    // ---- Units ----
        this.enemyWaves = new EnemyWaves(this);
		
		//create text for lives
		this.liveText = this.add.text(16,16, 'Lives: ' + this.lives, { fontSize: '24px', fill: '#FFF' })
		
		//create text for gold
		this.goldText = this.add.text(16,40, 'Gold: ' + this.gold, { fontSize: '24px', fill: '#FFF' });
		
		//create timer
		this.timer = this.time.addEvent({delay: this.waveDelay * 1000, repeat: 0});
		
		//create text for time until next wave
		this.timeText = this.add.text(this.map_width - 270, 16, 'Next Wave in ' + this.waveDelay + 's', { fontSize: '24px', fill: '#FFF' })
		

			
		
    }

	update() {
		
		var towers = this.towers.getChildren();
		for (var i = 0; i < towers.length; i++){
			towers[i].update();
		}
		
		
		this.enemyWaves.update();
		
		//game is lost - go to new scene
		if (this.lives <= 0){
			this.lives = 0;
		}
		
		
		this.goldText.setText('Gold: ' + this.gold);
		this.liveText.setText('Lives: ' + this.lives);

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
		
		if (this.lives == 0){
			this.scene.start('gameOver');
		}
		


	} 

};
// Level 1
var Level1Scene = class extends LevelScene {
    constructor() {
        super('level1');
		// Constants specific to this level
		

		

    }

    preload() {
        super.preload();
		//initiate player gold.
		this.gold = 500;
		
		//initiate player lives
		this.lives = 10;
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
		this.lives = 10;
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
		this.lives = 10;
    }

    create() {
        super.create();
    }
};


class EnemyWaves {
    constructor(scene) {
        this.scene = scene;
        this.waves = []
        // The scene provides a JSON waveFile we use to generate waves
        var waveFileJSON = this.scene.cache.json.get('waveFile' + this.scene.levelName);
        // TODO: Uncomment once this is working
        this.generateWaves(waveFileJSON);
		//this.testGenerateWaves(1, 10);
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
		var num=0;
        for (var i = 0; i < waveFileJSON.waves.length; i++) {
            // Create a group for our wave
			var wave = this.scene.add.group();
            this.waves.push(wave);
            var currentWave = waveFileJSON.waves[i];
			
			//time between waves in seconds (low just for testing, should be incorporated into level scene)
			var timeBetweenWaves = 5;
			
            for (var j = 0; j < currentWave.length; j++) {
                // TODO: handle enemyType property
                // TODO: handle enemyProps property
                // TODO: handle enemyCount property
                // TODO: handle spawnDelay property
                // TODO: handle spawnSpread property
                // TODO: generate enemies, put them into the wave
				
					for (var n = 0; n < currentWave[j].enemyCount; n++){
						var enemy = new Enemy(this.scene, this.scene.enemy_start.x, this.scene.enemy_start.y, currentWave[j].enemyType);
						enemy.loadEnemy();
						wave.add(enemy, true);
						//game object functions: https://photonstorm.github.io/phaser3-docs/Phaser.GameObjects.GameObject.html#setData__anchor
						enemy.setData('vector', new Phaser.Math.Vector2());
						var speed = enemy.specs.speed;
						//define animation
						
						if (enemy.specs.type == 'ground'){
							this.scene.tweens.add({
							//can use conditional in update to change path if unit is flying
								targets: enemy,
								z: 1,
								ease: 'Linear',
								duration: (Math.floor(this.scene.map_width/speed * 800)),
								repeat: 0,
								delay: 200*num + (i+1) * this.scene.waveDelay * 1000
								
							});
						} else {
							console.log('add air enemy');
						}
					num++;
				}

            }
			this.scene.waveCount = this.waves.length;
        }
    }
    // Copied from previous iteration of code.
    // Can be used to test generating waves of enemies for basic purposes.
    // Should use generateWaves with a .json file for more control over what enemies spawn, when, etc.
/*     testGenerateWaves(numWaves, enemiesPerWave) { 
        for (var i = 0; i < numWaves; i++) {
            // Each wave is a group
            this.waves.push(this.scene.add.group());
            for (var j = 0; j < enemiesPerWave; j++) {
	        	//creates a game object - read documentation for how to create object attributes : https://photonstorm.github.io/phaser3-docs/Phaser.GameObjects.Group.html#create__anchor
	        	//Once array of enemies containing wave data is created above, use this to iterate through for loop setting sprite data and starting position
	        	//if certain type create of type i.e. enemy-sprite
	        	
                var enemy = new Enemy(this.scene, this.scene.ground_enemy_start.x, this.scene.ground_enemy_start.y, 'greenCircle');
                
	        	//else do something with air units
	        	
	        	
	        	//game object functions: https://photonstorm.github.io/phaser3-docs/Phaser.GameObjects.GameObject.html#setData__anchor
                enemy.setData('vector', new Phaser.Math.Vector2());//, 'hp': 100, 'type': 'someobject defining motion', 'setmoredatahere': 0});
	        	var velocity = 100; //pixels/sec
	        	
	        	//define animation
                this.scene.tweens.add({
	        	//can use conditional in update to change path if unit is flying
                    targets: enemy,
                    z: 1,
                    ease: 'Linear',
	        		//duration is in ms, determine based on velocity in pixels/sec over mapsize
                   // duration: Math.floor(MAP_WIDTH/enemy.getData('velocity')) * 1000,
                    duration: (Math.floor(this.scene.map_width/velocity) * 500 * Math.random()),
                    repeat: 0,
                    delay: 200*j
                });
            }
        }
        
    } */

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
class Player {
    constructor(name) {
        // Lets us pass in a player name later if we wanted to create a leaderboard for instance
        if(name)
            this.playerName = name;
        else
            this.playerName = "Player 1";

        // String representing the level the player is on - can be used for save states?
        this.levelID = null;

    }
    
};

// ======== Global Event Listeners ========
window.addEventListener('load', windowOnLoad(), false);
