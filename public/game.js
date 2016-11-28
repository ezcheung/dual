let gameSettings = {
  width: 800,
  height: 600,
};

let game = new Phaser.Game(gameSettings.width, gameSettings.height, Phaser.AUTO, '', { preload: preload, create: create, update: update });

function preload() {
  game.load.image("background", "assets/background.png");
  game.load.image("player", "assets/sprites/blackcircle.png");
}

function create() {

}

function update() {

}