let gameSettings = {
  width: 800,
  height: 600,
  numPlayers: 2, //not used yet, but potentially for the future?
};

let game = new Phaser.Game(gameSettings.width, gameSettings.height, Phaser.AUTO, '', { preload: preload, create: create, update: update });
let tracking = false;
let players;
let activePlayer;
let midline;

function preload() {
  game.load.image("background", "assets/background.png");
  game.load.image("player", "assets/sprites/blackcircle.png");
  game.load.image("midline", "assets/grayline.png");
}

function create() {
  game.physics.startSystem(Phaser.Physics.ARCADE);

  /*
  * Add background
  */
  game.add.sprite(0, 0, "background");
  midline = game.add.sprite(0, game.world.centerY - 2, "midline");
  midline.enableBody = true;

  /*
  * Set players as a new group, as there are multiple
  */

  players = game.add.group();
  players.enableBody = true;

  // Player objects creation
  let p1 = players.create(game.world.centerX, game.world.centerY + gameSettings.height / 4, "player");
  p1.maxY = gameSettings.height;
  p1.minY = midline.y;
  let p2 = players.create(game.world.centerX, game.world.centerY - gameSettings.height / 4, "player");
  p2.maxY = midline.y;
  p2.minY = 0;
  players.forEach(p => {    
    p.inputEnabled = true;
    game.physics.arcade.enable(p);
    p.body.collideWorldBounds = true;
    p.events.onInputDown.add(setActivePlayer, this);
  })

}

function update() {

  players.forEach(p => {
    game.physics.arcade.collide(p, midline);
  })
  // If mouse is released, stop tracking movement
  if(game.input.mousePointer.isUp) {
    activePlayer = undefined;
  }

  // Move players, following mouse movement
  if(activePlayer) {
    let xDiff = game.input.x - activePlayer.x;
    let yDiff = game.input.y - activePlayer.y;
    players.forEach(p => {
      let newX = p.x + xDiff;
      let newY = p.y + yDiff;
      p.x = newX;
      p.y = newY < p.minY ? p.minY : newY < p.maxY ? newY : p.maxY;
    })
  }
}

function setActivePlayer(player) {
  activePlayer = player;
}