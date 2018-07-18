import 'phaser';
import css from './stylesheets/main.css'
var scenes = [];
var level1Scene = new Phaser.Scene('Level_1');
scenes.push(level1Scene);

var config = {
    type: Phaser.AUTO,
    parent: 'phaser-app',
    width: 1344,
    height: 896,
    pixelArt: true,
    scene: scenes
};

var game = new Phaser.Game(config);

//updated to facilitate separating different scenes corresponding to different levels/menu in different files

level1Scene.preload = function (){

    this.load.image('gameTiles', 'assets/spritesheets/towerDefense_tilesheet.png');
    this.load.tilemapTiledJSON('level1', 'assets/maps/level1.json');

}

level1Scene.create = function (){
 
    this.map = this.add.tilemap('level1');
    var tiles = this.map.addTilesetImage('tileset', 'gameTiles');
    
    this.backgroundLayer = this.map.createStaticLayer('background', tiles);
    this.rockLayer = this.map.createStaticLayer('rocks', tiles);
	
}



