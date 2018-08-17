/* Pavo Tower Defense (name tbd). Made with Phaser http://phaser.io */
// ======== Imports ========
'use strict';
import 'phaser';
import css from './stylesheets/main.css'


// ======== Globals ========
var game;
var player;
var uniqueID = 0; // Used to uniquely identify game objects - if it overflows, shouldn't be a problem
//--------- CHANGE TO 1 AFTER TESTING ----------------
var levelUnlocked = 3;


var scenes = [];
var config = {
    type: Phaser.AUTO,
    parent: 'phaser-app',
    backgroundColor: '#0F0F0F',
    width: 1344,
    height: 1096,
    pixelArt: true, // antialias: false, roundPixels: true
	useTicker: true,
    scene: scenes,
    preload: gamePreload
};

// just a little shortcut...
var normalFont = {
    fontSize: "49pt"
};

// Global reference points, can be used for positioning
// Note these are static. May be useful to update them
var menuBarSize = {
    x: config.width,
    y: 200
};

var menuAnchors = {
    topLeft: {
        x: 0,
        y: config.height - menuBarSize.y
    },
    topRight: {
        x: menuBarSize.x,
        y: config.height - menuBarSize.y
    },
    bottomLeft: {
        x: 0,
        y: config.height
    },
    bottomRight: {
        x: config.width,
        y: config.height
    }
}

var canvasAnchors = {
    topLeft: {
        x: 0,
        y: 0
    },
    topRight: {
        x: config.width,
        y: 0
    },
    bottomLeft: {
        x: 0,
        y: config.height
    },
    bottomRight: {
        x: config.width,
        y: config.height
    }
};
calcOtherPoints.bind(canvasAnchors).call();
calcOtherPoints.bind(menuAnchors).call();

// Works for rectangular shapes
function calcOtherPoints() {
    var middleX = (this.topRight.x - this.topLeft.x) / 2;
    var middleY = (this.bottomLeft.y - this.topLeft.y) / 2;
    this.topMiddle = {
        x: this.topLeft.x + middleX,
        y: this.topLeft.y
    };
    this.bottomMiddle = {
        x: this.bottomLeft.x + middleX,
        y: this.bottomLeft.y
    };
    this.leftMiddle = {
        x: this.topLeft.x,
        y: middleY
    };
    this.rightMiddle = {
        x: this.topRight.x,
        y: middleY
    };
    this.middle = {
        x: middleX,
        y: middleY
    };
}



// Code to set up game on initial load
function windowOnLoad() {
    // Add Scenes
    scenes.push(StartMenuScene); // first scene pushed first
    scenes.push(Level1Scene);
    scenes.push(Level2Scene);
    scenes.push(Level3Scene);
	scenes.push(gameOver);
    scenes.push(victoryScene);
    // Run the game
    player = new Player();
    game = new Phaser.Game(config);
}

function gamePreload() {
    game.stage.disableVisibilityChange = true;
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

		//used to return tower to starting position if placed in invalid location
		this.startPos = {'x': x, 'y': y};

		//projectile to use for this tower
		this.projectile = config.projectile;
		
		this.type = config.name;

		//marker used for tower
		this.marker = this.scene.add.graphics();

		//active represents whether or not the tower is searching for enemies
		this.isOn = false;

		//radius to look for enemies
		this.radius = config.radius;

		//time to wait between shots
		this.bullet_delay = config.bullet_delay;

		//this.time = this.time.addEvent({delay: 0, repeat: 0});
		this.timer = this.scene.time.addEvent({delay: 1, repeat: 0});
		this.purch = 0;
		
		this.damage = config.damage;
		
		this.radiusGraphics = this.scene.add.graphics();
		
		this.towerText = new Text(scene,this.x - this.scene.tileSize/2 + 5, this.y - this.scene.tileSize - 55, "", {fontSize: '20px', color:'#FFFFFF'});
    }


	update() {
		

		if (!this.isOn){
			if (this.cost <= player.gold){
				this.setAlpha(1);
				this.marker.lineStyle(1, 0x7CFC00, 1);
				this.marker.strokeRect(0, 0, this.scene.tileSize, this.scene.tileSize);
				this.marker.setAlpha(0);
				this.setInteractive();
				this.scene.input.setDraggable(this);
				this.isDraggable = true;
				this.scene.input.on('dragstart', function (pointer, gameObject) {
					gameObject.setAlpha(0.5);
					gameObject.radiusGraphics.clear();
					gameObject.towerText.setText("");
				});
				this.scene.input.on('drag', function (pointer, gameObject, dragX, dragY) {
					gameObject.setPosition(dragX, dragY);
					var pointerTileX = this.scene.map.worldToTileX(pointer.x);
					var pointerTileY = this.scene.map.worldToTileY(pointer.y);
					var canPlace = false;
 					this.scene.towerPlaceable.findTile(function(tile){
						if (tile.x == pointerTileX && tile.y == pointerTileY && !gameObject.scene.towerGrid[pointerTileX][pointerTileY]){
							if (tile.index == 1){
								canPlace = true;
							}
							return true;
						}
					});
					if (canPlace){
						gameObject.marker.setAlpha(1);
						gameObject.marker.x = this.scene.map.tileToWorldX(pointerTileX);
						gameObject.marker.y = this.scene.map.tileToWorldY(pointerTileY);
					}
					gameObject.radiusGraphics.clear();
					gameObject.radiusGraphics.lineStyle(1, "0xFFFFFF", 1);
					gameObject.radiusGraphics.strokeCircle(dragX, dragY, gameObject.radius);
				});
				this.scene.input.on('dragend', function(pointer, gameObject) {
					gameObject.radiusGraphics.clear();
					gameObject.setAlpha(1);
					// Snap to tile coordinates, but in world space
					var pointerTileX = this.scene.map.worldToTileX(pointer.x);
					var pointerTileY = this.scene.map.worldToTileY(pointer.y);
					var canPlace = false;

					this.scene.towerPlaceable.findTile(function(tile){
						if (tile.x == pointerTileX && tile.y == pointerTileY && !gameObject.scene.towerGrid[pointerTileX][pointerTileY]){
							if (tile.index == 1){
								canPlace = true;
								return true;
							}

						}
					});
					gameObject.marker.setAlpha(0);
					if (canPlace){
						gameObject.purch++;
						gameObject.setPosition(pointerTileX * gameObject.scene.tileSize + gameObject.scene.tileSize/2, pointerTileY * gameObject.scene.tileSize + gameObject.scene.tileSize/2);
						gameObject.isOn = true;
						gameObject.radiusGraphics.clear();
						if (gameObject.purch == 1){
							player.gold -= gameObject.cost;
							var newTower = new Tower(gameObject.scene, gameObject.startPos.x, gameObject.startPos.y, gameObject.name);
							player.towers.add(newTower,true);
							gameObject.towerText.destroy();
							gameObject.removeAllListeners();
							gameObject.on('pointerover', function(pointer){
								gameObject.radiusGraphics.lineStyle(1, 0xFFFFFF, 1);
								gameObject.radiusGraphics.strokeCircle(gameObject.x, gameObject.y, gameObject.radius);
							});
							gameObject.on('pointerout', function(pointer){
								gameObject.radiusGraphics.clear();
							});
						}
						gameObject.pointer = {'x': pointerTileX, 'y': pointerTileY};

				} else {
						gameObject.setPosition(gameObject.startPos.x, gameObject.startPos.y);

					}
				});
				
				

			}	else {
				var pointerTileX = this.scene.map.worldToTileX(this.x);
				var pointerTileY = this.scene.map.worldToTileY(this.y);
				this.marker.x = this.scene.map.tileToWorldX(pointerTileX);
				this.marker.y = this.scene.map.tileToWorldY(pointerTileY);
				this.marker.lineStyle(1, 0xFF0000, 1);
				this.marker.strokeRect(0, 0, this.scene.tileSize, this.scene.tileSize);
				this.marker.setAlpha(1);
				this.setAlpha(0.5);
				this.disableInteractive();

			}
			
			this.on('pointerover', function(pointer){
				var specText = "Cost: " + this.cost + "\nDamage: " + this.damage + "\nFire-rate: " + 1/(this.bullet_delay / 1000) + " shots/s\n";
				if (this.type == 'basicTower'){
					specText += 'Basic tower: single target homing projectiles';
				} else if (this.type == 'piercingTower'){
					specText += 'Piercing tower: shoots a bullet that travels through \nfirst detected enemy and damages all enemies it passes through';
				} else {
					specText += 'Splash tower: shoots a bullet that explodes upon \nreaching its target (first detected enemy)';
				}
				this.towerText.setText(specText);
				this.radiusGraphics.lineStyle(1, 0xFFFFFF, 1);
				this.radiusGraphics.strokeCircle(this.x, this.y, this.radius);
			});
			this.on('pointerout', function(pointer){
				this.towerText.setText("");
				this.radiusGraphics.clear();
			});
		} else {
			//projectile logic here
			if (!this.scene.towerGrid[this.pointer.x][this.pointer.y]){
				this.scene.towerGrid[this.pointer.x][this.pointer.y] = true;
			}


			//get nearest enemy (if there are any)
			var enemies = this.scene.enemyWaves.activeEnemies;

			if (enemies){
				var nearestEnemy = {'index' : null, 'dist' : 1000};
				for (var i = 0; i < enemies.length; i++){
					var dist = Math.hypot(enemies[i].x - this.x, enemies[i].y - this.y);
					if (nearestEnemy.index === null || nearestEnemy.dist > dist){
						nearestEnemy.index = i;
						nearestEnemy.dist = dist;
					}
				}
				//if nearest enemy is within detection radius, shoot
				if (nearestEnemy.dist <= this.radius  && this.timer.getProgress() == 1 ){
					var projectile = new Projectile(this.scene, this.x, this.y, this.projectile, this.damage, enemies[nearestEnemy.index]);
					this.scene.projectiles.add(projectile, true);
 					this.timer.destroy();
					this.timer = this.scene.time.addEvent({delay: this.bullet_delay, repeat: 0});
				}

			}
		}

	}

};


// Based on http://www.html5gamedevs.com/topic/36169-rotate-bullets-position-in-rotation-of-gun/
// TODO: Implement this according to what makes sense for us.
class Projectile extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, name, damage, target) {
        super(scene, x, y, name);
		var config = scene.cache.json.get(name);
        this.speed = config.speed;
		this.scene = scene;
		this.damage = damage;
		this.target = target;
		this.type = config.type;
        this.enemiesDamaged = new Set();
		if (this.type == 'piercing'){
			this.targetAngle = Math.atan((this.y - this.target.y) / (this.x - this.target.x));
			this.directionFactor = (this.x < this.target.x) ? -1 : 1;
            this.updateFn = this.updatePiercing;
		}
		
		if (this.type == 'splash'){
			//set the splash radius
			this.splashRadius = 200;
			this.detonated = false;
			this.splashFactor = 0.6;
            this.updateFn = this.updateSplash;
		}

    }

    //preload(){
    //	this.load.audio('laser1', 'assets/audio/laser1.mp3');
    //}

    //create(){
    //	var laser1 = this.sound.add('laser1');
    //}

    updatePiercing(time, delta) {
		var angle = this.targetAngle;

		this.y -= this.speed * Math.sin(angle) * this.directionFactor;
		this.x -= this.speed * Math.cos(angle) * this.directionFactor;

		var enemies = this.scene.enemyWaves.activeEnemies;
		for (let i = 0; i < enemies.length; i++){
            // Skip if we've damaged this enemy already
            if(this.enemiesDamaged.has(enemies[i].uniqueID))
                continue;
			var dist = Math.hypot(this.y - enemies[i].y, this.x - enemies[i].x);
			if(dist <= this.scene.tileSize/2) {
				enemies[i].hp -= this.damage;
                this.enemiesDamaged.add(enemies[i].uniqueID);
			}
		}
    }

    updateSplash(time, delta) {
       if(!this.detonated) {
			if (this.target.active){
				var angle = Math.atan((this.y - this.target.y) / (this.x - this.target.x));
				var factor = 1;

				if (this.x < this.target.x) factor = -1;
				this.y -= this.speed * Math.sin(angle)* factor;
				this.x -= this.speed * Math.cos(angle) * factor;

				var dist = Math.hypot(this.y - this.target.y, this.x - this.target.x);
				if(dist <= this.scene.tileSize/2){
					this.detonated = true;
					this.target.hp -= this.damage;
					this.splashGraphics = this.scene.add.graphics();
					this.splashGraphics.fillStyle(0xFFF200, 0.3);
					this.splashGraphics.fillCircle(this.x, this.y, this.splashRadius);
					this.scene.time.delayedCall(50, function(){
						this.splashGraphics.destroy();
						}, [], this);
					var enemies = this.scene.enemyWaves.activeEnemies;
					for (let i = 0; i < enemies.length; i++){
						var dist = Math.hypot(this.y - enemies[i].y, this.x - enemies[i].x);
						if(dist <= this.splashRadius && enemies[i] != this.target){
							enemies[i].hp -= this.damage * this.splashFactor;
						}
					}
					this.destroy();
				}
			} else {
				this.destroy();
			}
        }
    }

    update(time, delta) {
        // Check if out of screen
		if (this.y < -this.width || this.y > this.scene.mapHeight + this.width || this.x < -this.width || this.x > this.scene.mapWidth + this.width) {
			this.setActive(false);
			this.setVisible(false);
			this.destroy();
            return;
        }
        if(this.updateFn) {
            // Check if we use a custom update function, and do that instead
            return this.updateFn.call(this,time, delta);
        }
        // Default to basic projectile logic
		if (this.target.active){
			var angle = Math.atan((this.y - this.target.y) / (this.x - this.target.x));
			var factor = 1;

			if (this.x < this.target.x) factor = -1;
			this.y -= this.speed * Math.sin(angle)* factor;
			this.x -= this.speed * Math.cos(angle) * factor;

			var dist = Math.hypot(this.y - this.target.y, this.x - this.target.x);
			if(dist <= this.scene.tileSize/2){
				this.target.hp -= this.damage;
				this.destroy();
			}
		} else {
			this.destroy();
		}
    }
};

// ======== Enemy Units ========
let greenColor = new Phaser.Display.Color(0,255,0);
let yellowColor = new Phaser.Display.Color(255,255,0);
let redColor = new Phaser.Display.Color(255,0,0);
class Enemy extends Phaser.GameObjects.PathFollower {
	constructor(scene, path, name, spawnDelay, props){
		super(scene, path, -Infinity, -Infinity, name);
		this.scene = scene;
		this.name = name;
        // We want a unique ID to identify enemies
        this.uniqueID = uniqueID++;

        // Read config vars
        // We do this to do a shallow clone.
        let config = Object.assign({}, this.scene.cache.json.get(this.name));
        Object.assign(config, props);
        this.spawnDelay = spawnDelay;
		this.totalHP = config.hp || 1;
        this.hp = this.totalHP;
        this.lastHP = this.hp; /* HP since last update */
        this.percentHP = 1;
        this.bounty = config.bounty || 0;
        this.setActive(false);
        this.setVisible(false);
		this.hpBar = this.scene.add.graphics();
        this.fullHPColor = greenColor;
        this.halfHPColor = yellowColor;
        this.noHPColor = redColor;
        this.currentHPColor = this.fullHPColor;
        this.currentHPColorString = Phaser.Display.Color.RGBToString(Math.floor(this.currentHPColor.r), Math.floor(this.currentHPColor.g), Math.floor(this.currentHPColor.b), 1, "0x");

        // Add animation
		this.speed = config.speed || 1;
        var duration = Math.floor(this.scene.mapWidth/this.speed * 1000);
        this.pathConfig = {
            ease: 'Linear',
            duration: duration,
            from: 0,
            to: 1,
            rotateToPath: true,
            positionOnPath: true
        };
        this.setActive(false);
        this.setVisible(false);
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
        // Starts animating
        this.startFollow(this.pathConfig);
        // Starts updating
        this.setActive(true);
        this.setVisible(true);
        // Start in the correct position - must be done after startFollow()
        this.setPosition(this.path.getStartPoint());
		this.hpText = new Text(this.scene, this.width/2, this.y + this.height/2 - 17, this.hp, { fontSize: '14pt' });
        this.hpText.setColor(Phaser.Display.Color.RGBToString(Math.floor(this.currentHPColor.r), Math.floor(this.currentHPColor.g), Math.floor(this.currentHPColor.b), 1, "#"));
    }

    // Starts being called after this.active == true (from setActive)

    update(time, delta) {
        // Check if we've been killed.
        // If so, give player gold and get destroyed.
        if(this.hp <= 0) {
            player.gold += this.bounty;
			this.hpBar.destroy();
			this.hpText.destroy();
            this.destroy();
            return; // Must return here.
        }

		//if the enemy is past the end of the map
		if (this.active && !this.isFollowing()) {
			player.lives--;
			this.hpBar.destroy();
			this.hpText.destroy();
			this.destroy();
            return; // Must return here.
		}

        // Avoid needless computation by tracking HP since last update

        if(this.lastHP != this.hp) {
            this.lastHP = this.hp;
		    this.hpText.setText(this.hp);
            this.percentHP = this.hp / this.totalHP;
            // Interpolate colors based on hp percentage. We interpolate to a middle color (yellow), since yellow is 255 red and 255 green
            if(this.percentHP >= 0.5) {
                this.currentHPColor = Phaser.Display.Color.Interpolate.ColorWithColor(this.halfHPColor, this.fullHPColor, 500, Math.floor((this.percentHP - 0.5) * 1000));
            } else {
                this.currentHPColor = Phaser.Display.Color.Interpolate.ColorWithColor(this.noHPColor, this.halfHPColor, 500, Math.floor(this.percentHP * 1000));
            }
            this.currentHPColorString = Phaser.Display.Color.RGBToString(Math.floor(this.currentHPColor.r), Math.floor(this.currentHPColor.g), Math.floor(this.currentHPColor.b), 1, "0x");
            this.hpText.setColor(Phaser.Display.Color.RGBToString(Math.floor(this.currentHPColor.r), Math.floor(this.currentHPColor.g), Math.floor(this.currentHPColor.b), 1, "#"));
        }
		this.hpBar.clear();
		this.hpBar.lineStyle(1, 0x000000, 0); /* Borderless */
		this.hpBar.fillStyle(this.currentHPColorString);
		this.hpBar.fillRect(this.x - this.width/2, this.y + this.height/2 - 4, this.width * this.percentHP, 1);
		this.hpBar.strokeRect(this.x - this.width/2, this.y + this.height/2 - 4, this.width, 1);
		this.hpText.setPosition(this.x - this.width/2, this.y + this.height/2 - 6 - this.hpText.displayHeight);

    }
};

// ======== Scene classes ========


// Start Menu (first scene)
var StartMenuScene = class extends Phaser.Scene {
    constructor() {
        super('startMenu');
    }

    preload() {
        this.load.image('defaultButton', 'assets/images/blue_button09.png');
		this.load.image('defaultButtondown', 'assets/images/blue_button08.png')
        this.load.image('blueCircle', 'assets/images/blue_circle.png');
        this.load.image('greenCircle', 'assets/images/green_circle.png');
        this.load.audio('theme', 'assets/audio/battle.mp3');
        // Hack to load the Visitor font
        this.add.text(-Infinity, -Infinity, "Loading Visitor Font...", {font:"1px Visitor", fill: "#FFFFFF"}).destroy();

    }

    create() {
        var startMenuText = new Text(this, 75, 75, 'Start Menu', { fontSize: '49pt', color:'#0000FF'});
        this.level1Text = new Text(this, 75, 200, 'Level 1', { fontSize: '50px', color:'#00FF00' });
        this.level2Text = new Text(this, 75, 300, 'Level 2', { fontSize: '50px', color:'#00FF00' });
        this.level3Text = new Text(this, 75, 400, 'Level 3', { fontSize: '50px', color:'#00FF00' });
        // Start Button
        this.lvl1Start = new Button(this, this.sys.canvas.width - 125, 225);

        this.lvl2Start = new Button(this, this.sys.canvas.width - 125, 325);

        this.lvl3Start = new Button(this, this.sys.canvas.width - 125, 425);
        // Use 'pointerover' for mouseover event. Use 'pointerout' for mouse-leave event. - can use setTexture to change texture, for instance.
        this.lvl1Start.setFunc(function(context) {
            context.scene.start('level1');
            themeSong.stop();
        }); // Start the main game.

        this.lvl2Start.setFunc(function(context) {
            context.scene.start('level2');
            themeSong.stop();
        }); // Start the main game.

        this.lvl3Start.setFunc(function(context) {
            context.scene.start('level3');
            themeSong.stop();
        }); // Start the main game.

        var themeSong = this.sound.add('theme');
    	themeSong.play();
    	
    }
	
	update(){
		if (levelUnlocked == 1){
			this.lvl2Start.setActive(false);
			this.lvl2Start.setVisible(false);
			this.lvl3Start.setActive(false);
			this.lvl3Start.setVisible(false);
		} else if (levelUnlocked == 2){
			this.lvl2Start.setActive(true);
			this.lvl2Start.setVisible(true);
			this.lvl3Start.setActive(false);
			this.lvl3Start.setVisible(false);
		} else {
			this.lvl3Start.setActive(true);
			this.lvl3Start.setVisible(true);
		}
		
	}
};


var gameOver = class extends Phaser.Scene {
	constructor(str) {
		super('gameOver');
	}
	preload(){
		this.load.image('gameOver', 'assets/images/game_over.png');
		this.load.image('defaultButton', 'assets/images/blue_button09.png');
		this.load.audio('GameOver', 'assets/audio/GameOver.mp3')
	}

	create(){
		var background = this.add.image(672,448,'gameOver');
		background.setScale(0.7);

		var gameOverSound = this.sound.add('GameOver');
		gameOverSound.play();

		 // ---- UI elements ----
        var startMenuText = new Text(this, menuAnchors.topRight.x, menuAnchors.topRight.y, 'Return to Menu', { fontSize: '49pt', color:'#00FF00', rtl: true}).setInteractive();
        startMenuText.on('pointerdown', function(event) {
            this.scene.start('startMenu');
        }, this); // Return to the start menu.
	}

};

var victoryScene = class extends Phaser.Scene {
    constructor(str) {
        super('victory');
		this.redirectTime = 5000; //time before redirecting in milliseconds
		
    }
    preload() {
        this.load.image('defaultButton', 'assets/images/blue_button09.png');
        this.load.audio('GameWin', 'assets/audio/GameWon.mp3');
    }
    create() {
    	var gameWonJingle = this.sound.add('GameWin');
    	gameWonJingle.play();

        var youWinText = new Text(this, canvasAnchors.middle.x, canvasAnchors.middle.y - 200, "You win", normalFont);
        youWinText.setPosition(youWinText.x - youWinText.displayWidth, youWinText.y - youWinText.displayHeight);
        var finalGoldText = new Text(this, youWinText.x, youWinText.y + 100, "Final Gold: " + player.gold, normalFont);
        var finalLifeText = new Text(this, youWinText.x, youWinText.y + 200, "Final Lives: " + player.lives, normalFont);
		this.timer = this.time.addEvent({delay: this.redirectTime, repeat: 0});
		this.redirText = new Text(this, youWinText.x, youWinText.y + 300, "Redirecting in " + Math.round((1-this.timer.getProgress()) * this.redirectTime), normalFont);
    }
	update(){
		this.redirText.setText("Redirecting in " + Math.round((1-this.timer.getProgress()) * this.redirectTime / 1000));
		if (this.timer.getProgress() == 1){
			this.scene.start('startMenu');
		}
	}
};


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
        this.projectiles = null;
        // List of towers you can buy on this level.
        // Can override to change which towers would be buyable.
        // Creates 3x3 grid, filled left to right, top to bottom, starting from top-left.
        this.towerTypes = ['piercingTower', 'basicTower'];

		this.enemySpawn = { 'x': 0, 'y': 0 };
		this.enemyGoal  = { 'x': 0, 'y': 0 };
    }

    preload() {
        // Load common assets
        this.load.image('defaultButton', 'assets/images/blue_button09.png');
		this.load.image('defaultButtondown', 'assets/images/blue_button09.png');
		this.load.image('longButton', 'assets/images/green_button00.png');
		this.load.image('longButtondown', 'assets/images/green_button02.png');
        this.load.image('gameTiles', 'assets/spritesheets/minimalTilesTowers.png', { frameWidth: 64, frameHeight: 64});
        this.load.tilemapTiledJSON(this.levelName, 'src/maps/' + this.levelName + '.json');
        this.load.json('waveFile' + this.levelName, this.waveFile);
		this.load.json('normalEnemy', 'src/enemies/normalEnemy.json');
		this.load.image('normalEnemy', 'assets/images/normalEnemy.png');
		this.load.json('scaryEnemy', 'src/enemies/scaryEnemy.json');
		this.load.image('scaryEnemy', 'assets/images/scaryEnemy.png');
		this.load.json('basicTower', 'src/towers/basicTower.json');
		this.load.image('basicTower', 'assets/images/basicTower.png');
		this.load.json('basicProjectile', 'src/projectiles/basicProjectile.json');
		this.load.image('basicProjectile', 'assets/images/basicProjectile.png');
		this.load.json('piercingTower', 'src/towers/piercingTower.json');
		this.load.image('piercingTower', 'assets/images/piercingTower.png');
		this.load.json('piercingProjectile', 'src/projectiles/piercingProjectile.json');
		this.load.image('piercingProjectile', 'assets/images/piercingProjectile.png');
		this.load.json('splashTower', 'src/towers/splashTower.json');
		this.load.image('splashTower', 'assets/images/splashTower.png');
		this.load.json('splashProjectile', 'src/projectiles/splashProjectile.json');
		this.load.image('splashProjectile', 'assets/images/splashProjectile.png');
		
	
    }

    create() {
		// ---- Tilemap ----
        this.map = this.add.tilemap(this.levelName);
        var tiles = this.map.addTilesetImage('tileset', 'gameTiles');
		// Set map layers
		this.towerPlaceable = this.map.createDynamicLayer('towerPlace', tiles);
        this.backgroundLayer = this.map.createStaticLayer('background', tiles);


        // ---- Player loading ----
        // TODO: Test purposes only. If we implement save states, this should be refactored.
        // Calling Player(name, gold, lives, waveNum, towers, levelName) - taking defaults for most
        player = new Player(null, null, null, null, this.levelName);


		// ----- Towers -----
		player.towers = this.add.group({
			runChildUpdate : true
		});

		
		//bottom right 5 tiles used for tower placement
		var basicTower = new Tower(this, this.tileSize / 2, this.mapHeight - this.tileSize/2, 'basicTower' );
		player.towers.add(basicTower, true);
		

		var piercingTower = new Tower(this, this.tileSize /2 + this.tileSize, this.mapHeight - this.tileSize/2, 'piercingTower');
		player.towers.add(piercingTower, true);
		
		var splashTower = new Tower(this, this.tileSize /2 + 2 * this.tileSize, this.mapHeight - this.tileSize/2, 'splashTower');
		player.towers.add(splashTower, true);
		
		
		

		// ----- Projectiles -----
 		this.projectiles = this.add.group();


	    // Add path for enemies on this level.
	    this.path = new Phaser.Curves.Path();
		
		
		this.towerGrid = new Array(this.mapWidth/this.tileSize);
		for (var i = 0; i < this.towerGrid.length; i++){
			this.towerGrid[i] = new Array(this.mapHeight/this.tileSize);
			for (var j = 0; j < this.towerGrid[i].length; j++){
				this.towerGrid[i][j] = false;
			}
		}


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
		this.wavesLeft = this.enemyWaves.waveCount;

        // Add UI Elements
        this.buildUI();
    }

    // Add UI elements.
    buildUI() {
        // ---- UI elements ----

        // ++ Buttons ++
        // Back to start menu button
        // TODO: Make this a button, and more visually appealing
        this.menuTextButton = new Text(this, menuAnchors.topRight.x, menuAnchors.topRight.y, 'Return to Menu', { fontSize: '50px', color:'#00FF00', rtl: true}).setInteractive();
        this.menuTextButton.on('pointerdown', function(event) {
            this.scene.start('startMenu');
        }, this);

        // Button to start next wave.
        // TODO: Make this more visually appealing
        this.startWaveButton = new Button(this, menuAnchors.bottomLeft.x, menuAnchors.bottomLeft.y, 'longButton');
        this.startWaveButton.x += this.startWaveButton.displayWidth / 2;
        this.startWaveButton.y -= this.startWaveButton.displayHeight / 2;
        this.startWaveButton.setFunc(function(context) {
			if (!context.enemyWaves.isWaveActive()){
				context.wavesLeft -= 1;
				//create a save state to store after wave finishes	
				player.saveGame();
			}
            // Infinity signals game is won
            context.enemyWaves.startNextWave();
        });

        // TODO: Add tower purchase pane
        // TODO: Add selected tower info pane (with upgrade/sell buttons)

	    this.startWaveText = new Text(this, this.startWaveButton.x - 55, this.startWaveButton.y - 10, 'Start Wave', { fontSize: '20px', color:'#FFFFFF' });
		this.startWaveText.setOrigin(0,0);
		

		//waves left text
		this.wavesLeftText = new Text(this, menuAnchors.bottomLeft.x, menuAnchors.bottomLeft.y - 80, 'Waves left: ' + this.wavesLeft, { fontSize: '20px', color:'#FFFFFF' });

        // ++ Non-interactible indicators ++
        // Life counter
		this.liveText = new Text(this, menuAnchors.topLeft.x + 16, menuAnchors.topLeft.y + 16, 'Lives: ' + player.lives, { fontSize: '24px', fill: '#FFF' });

		// Gold counter
		this.goldText = new Text(this, menuAnchors.topLeft.x + 16, menuAnchors.topLeft.y + 40, 'Gold: ' + player.gold, { fontSize: '24px', fill: '#FFF' });
    }

	update() {
		// Check for game over, man.
		if(player.lives <= 0){
			player.lives = 0;
            this.scene.start('gameOver');
		}
        // Check for game won
        if(this.enemyWaves.gameWon()) {
            this.scene.start('victory');
			levelUnlocked = parseInt(this.levelName[this.levelName.length - 1], 10) + 1;
        }
		
		this.wavesLeftText.setText("Waves left: " + this.wavesLeft);
		this.liveText.setText('Lives: ' + player.lives);
		this.goldText.setText('Gold: ' + player.gold);

		var proj = this.projectiles.getChildren();
		proj.forEach(function (projectile){
			projectile.update();
		});
		

	}


};
// Level 1
var Level1Scene = class extends LevelScene {
    constructor() {
        super('level1');
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

    generateWaves(waveFileJSON) {
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
                let enemyCount = enemyGroups[j].enemyCount || 1;

                // Enemies of this type spawn 1000 ms (1s) apart by default
                let spawnSpread = enemyGroups[j].spawnSpread || 1000;

                // These enemies spawns 1000 ms (1s) after the previous group, by default.
                let spawnDelay = enemyGroups[j].spawnDelay || 0;

                // Must provide an enemyType so we know what type of enemy to spawn.
                let enemyType = enemyGroups[j].enemyType || console.log("Error in JSON, must supply enemyType");

                // TODO: Implement this override functionality. Potential design:
                // Add stuff to Enemy class to handle this 'enemyProps' object.
                // If it's set, then check that for values before checking the config file.
                // - OR -
                // Somehow agglomerate the objects into one. Could be useful to write a function that takes
                // two objects representing an enemy config and combines them into one (first arg preceding the second).
                let enemyProps = {};
                if(enemyTypes[enemyType]) {
                    enemyProps = enemyTypes[enemyType].enemyProps || {};
                    // Now that we've consume the original type, we set it to an alternate one for use
                    enemyType = enemyTypes[enemyType].altType || enemyType;
                }

                wave.delay += spawnDelay;
				for (let n = 0; n < enemyCount; n++){
					let enemy = new Enemy(this.scene, this.scene.path, enemyType, wave.delay, enemyProps);
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
            return false;
        }
        if(this.activeEnemies.length <= 0) {
            return false;
        }
        return this.activeEnemies.length;
    }

    gameWon() {
        if(this.currentWave >= this.waveCount) {
            this.allWavesStarted = true;
        }
        if(this.allWavesStarted && !this.isWaveActive()) {
            return true;
        }
        return false;
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
        this.name = name || "Player 1";
		this.gold = gold || 100;
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

	if (saveFileName === undefined){
            saveFileName = 'default'
        }

        localStorage.getItem("save-" + saveFileName);

    }
    saveGame(saveFileName) {
        // If no saveFileName provided, use player name?
        // Use caution since these save files also track which level we're on.
        // Might need different save files for each level, with different file names for each?
      
    //Cant get to work currently
	//var saveObject ={
            //gold: 3,
            //lives: 5,
            //waveNum: this.waveNum,
            //towers: this.towers,
            //levelName: this.levelName
        //}

	if (saveFileName === undefined){
            saveFileName = 'default';
        }

    localStorage.setItem("gold", this.gold);
    localStorage.setItem("lives", this.lives);
    
    console.log(this.gold);
    console.log(this.lives);
    console.log(this.levelName);
    console.log("Saving game.");

	// var saveFileName = saveFileName || this.name;
       // return saveFileName;
    }


};

// ========= UI classes ========
// ========= Button class ========
// Used to add interactible button UI elements with some common defaults
// These are always added to the scene, and interactive by default.
class Button extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, frame) {
        texture = texture || 'defaultButton';
        super(scene, x, y, texture, frame);
        // Always add to Scene - don't use this class if you don't want to add to scene.
        scene.sys.displayList.add(this);
        if(this.preUpdate) {
            scene.sys.updateList.add(this);
        }
        this.setInteractive();
		this.onBtnDown = texture + 'down';
		this.scene = scene;
		this.key = texture;
		this.on('pointerdown', function(event){
			this.setTexture(this.onBtnDown);
		});
		
		this.on('pointerout', function(event){
			this.setTexture(this.key);
		});
		
		this.on('pointerover', function(pointer){
			if (pointer.isDown)
				this.setTexture(this.onBtnDown);
		});
    }
	
	setFunc(func){
		this.on('pointerup', function(event){
			this.setTexture(this.key);
			func(this.scene);
		});
	}
}

class TowerButton extends Button {
    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame)
    }
}
// ========= Text class ========
// Used to add game text with some common defaults
// These are always added to the scene, and non-interactive by default
class Text extends Phaser.GameObjects.Text {
    constructor(scene, x, y, text, style) {
        // Set style defaults prior to calling constructor
        style = style || {};
        style.fontFamily = style.fontFamily || "Visitor";
        style.fontSize = style.fontSize || "7pt"; // Pixel perfect at this font size.
        super(scene, x, y, text, style);

        // Always add to Scene - don't use this class if you don't want to add to scene.
        scene.sys.displayList.add(this);
        if(this.preUpdate) {
            scene.sys.updateList.add(this);
        }

    }
}

// ======== Global Event Listeners ========
window.addEventListener('load', windowOnLoad(), false);
