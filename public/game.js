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
let enemies;
let enemyTypes = {};
let alive = true;
let spacebar;
let p1;
let p2;

// Declare enemy subtypes
let eBasic;


function preload() {
  game.load.image("background", "assets/background.png");
  game.load.image("player", "assets/sprites/blackcircle.png");
  game.load.image("midline", "assets/grayline.png");
  game.load.image("eBasic", "assets/sprites/redcircle.png");
}

function create() {

  // Set up game environment (engine, keys, etc.)
  game.physics.startSystem(Phaser.Physics.ARCADE);
  spacebar = game.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR);

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
  p1 = players.create(game.world.centerX, game.world.centerY + gameSettings.height / 4, "player");
  p1.maxY = gameSettings.height;
  p1.minY = midline.y;
  p2 = players.create(game.world.centerX, game.world.centerY - gameSettings.height / 4, "player");
  p2.maxY = midline.y;
  p2.minY = 0;
  players.forEach(p => {    
    p.inputEnabled = true;
    game.physics.arcade.enable(p);
    p.body.collideWorldBounds = true;
    p.events.onInputDown.add(setActivePlayer, this);
  })

  /*
  * Make big enemies group, which will be a group of groups
  */
  enemies = game.add.group();
  game.physics.arcade.enable(enemies);
  enemies.enableBody = true;

  /*
  * Create enemy subgroups
  */
  
  enemyTypes.basic = game.add.group();
  enemyTypes.basic.enableBody = true;
  game.physics.arcade.enable(enemyTypes.basic);
  
  for(let i in enemyTypes) {
    enemies.add(enemyTypes[i]);
  }
}

function update() {

  if (alive) {

    // Roll for enemies
    let coin = Math.random() * 100;
    if (coin > 85) {
      // let spawnWall = [Math.floor(Math.random() * 2), Math.floor(Math.random() * 2)];    
      let newEnemy = enemyTypes.basic.create(Math.random() * gameSettings.width, 0, "eBasic"); 
      newEnemy.outOfBoundsKill = true;
      let xVel = (Math.random() * 2 - 1) * 500;
      newEnemy.body.velocity.x = xVel;
      newEnemy.body.velocity.y = Math.sqrt(500 * 500 - xVel * xVel);
    }
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

    for(let i in enemyTypes) {
      game.physics.arcade.overlap(players, enemyTypes[i], die, null, this);
    }
  } else {
    if(spacebar.isDown) {
      restartGame();
    }
  }
}

function setActivePlayer(player) {
  activePlayer = player;
}

function die(player, enemy) {
  alive = false;
  activePlayer = undefined;
  for (let i in enemyTypes) {
    enemyTypes[i].forEach(e => {
      e.body.velocity.x = 0;
      e.body.velocity.y = 0;
    })
  }
}

function restartGame() {
  p1.x = game.world.centerX;
  p1.y = game.world.centerY + gameSettings.height / 4;
  p2.x = game.world.centerX;
  p2.y = game.world.centerY - gameSettings.height / 4;
  for (let i in enemyTypes) {
    enemyTypes[i].forEach(e => {e.kill()});
  }
  alive = true;
}