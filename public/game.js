let gameSettings = {
  width: 800,
  height: 600,
  numPlayers: 2, //not used yet, but potentially for the future?
};

let game = new Phaser.Game(gameSettings.width, gameSettings.height, Phaser.AUTO, '', { preload: preload, create: create, update: update });
let tracking = false;
let players;
let activePlayer;

function preload() {
  game.load.image("background", "assets/background.png");
  game.load.image("player", "assets/sprites/blackcircle.png");
}

function create() {
  game.physics.startSystem(Phaser.Physics.ARCADE);
  game.add.sprite(0, 0, "background");

  players = game.add.group();
  players.enableBody = true;
  let p1 = players.create(game.world.centerX, game.world.centerY + gameSettings.height / 4, "player");
  p1.inputEnabled = true;
  game.physics.arcade.enable(p1);
  p1.body.collideWorldBounds = true;
  p1.events.onInputDown.add(setActivePlayer, this);

}

function update() {
  if(game.input.mousePointer.isUp) {
    activePlayer = undefined;
  }
  if(activePlayer) {
    activePlayer.x = game.input.x;
    activePlayer.y = game.input.y;
  }
}

function setActivePlayer(player) {
  activePlayer = player;
}