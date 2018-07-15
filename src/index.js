import 'phaser';

var config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: 1344,
    height: 896,
    pixelArt: true,
    scene: {
        preload: preload,
        create: create
    }
};

var game = new Phaser.Game(config);

function preload ()
{

    this.load.image('gameTiles', 'assets/spritesheets/towerDefense_tilesheet.png');
    this.load.tilemapTiledJSON('level1', 'assets/maps/level1.json');
}

function create ()
{
 
    this.map = this.add.tilemap('level1');
    var tiles = this.map.addTilesetImage('tileset', 'gameTiles');
    
    this.backgroundLayer = this.map.createStaticLayer('background', tiles);
    this.rockLayer = this.map.createStaticLayer('rocks', tiles);
 
}
