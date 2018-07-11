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

    this.load.image('mapTiles', 'assets/spritesheets/toweDefense_tilesheet@2.png');
    this.load.tilemap('level1', 'assets/maps/level1.json', null, Phaser.Tilemap.TILED_JSON);
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


    this.level1 = this.game.add.tilemap('level1'); // step 1
    this.level1.addTilesetImage('tiles', 'mapTiles'); // step 2
  
    // step 3
    this.bgLayer = this.level1.createLayer('background');
    this.wallsLayer = this.level1.createLayer('rocks');

}
