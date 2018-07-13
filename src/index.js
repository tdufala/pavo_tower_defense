import 'phaser';

var config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: 800,
    height: 600,
    scene: {
        preload: preload,
        create: create
    }
};

var game = new Phaser.Game(config);

function preload ()
{
    //this.load.image('logo', 'assets/logo.png');

  /*   this.load.image('tiles', 'assets/spritesheets/towerDefense_tilesheet.png');
    this.load.tilemapTiledJSON('map', 'assets/maps/maptest.json');
	 */
	this.load.image('gameTiles', 'assets/spritesheets/towerDefense_tilesheet.png');
	this.load.tilemapTiledJSON('level1', 'assets/maps/maptest.json');
}

function create ()
{
    /*var logo = this.add.image(400, 150, 'logo');
    this.tweens.add({
        targets: logo,
        y: 450,
        duration: 2000,
        ease: 'Power2',
        yoyo: true,
        loop: -1
    });*/
/* 
    var map = this.make.tilemap( { key: 'map' });

    // The first parameter is the name of the tileset in Tiled and the second parameter is the key
    // of the tileset image used when loading the file in preload.
    var tiles = map.addTilesetImage('tileset', 'tiles');

    // You can load a layer from the map using the layer name from Tiled, or by using the layer
    // index (0 in this case).
    var layer = map.createStaticLayer(background, tiles, 0, 0); */
	
	this.map = this.add.tilemap('level1');	
	var tileset = this.map.addTilesetImage('towerDefense_tilesheet','gameTiles');
	this.backgroundLayer = this.map.createStaticLayer('Tile Layer 1', tileset);	
   
}
