let gameSettings = {
  width: 800,
  height: 600,
  numPlayers: 2, //not used yet, but potentially for the future?
};

let game = new Phaser.Game(gameSettings.width, gameSettings.height, Phaser.AUTO, '', { preload: preload, create: create, update: update, render: render });
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
//make potions and subgroups
let magicPotion;
let magicTypes = {};
let mBasic;
let immunity= false;
let numberHit = 0
// declare score
let score=0;
let timer;

// Declare enemy subtypes
let eBasic;


function preload() {  
  game.load.image("background", "assets/background.png");
  game.load.image("player", "assets/sprites/blackcircle.png");
  game.load.image("midline", "assets/grayline.png");
  game.load.image("eBasic", "assets/sprites/redcircle.png");
  game.load.image("mBasic", "assets/sprites/blue-square.png")

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

  //add magic potions
  magicPotion = game.add.group();
  game.physics.arcade.enable(magicPotion);
  magicPotion.enableBody= true;

   magicTypes.basic = game.add.group();
  magicTypes.basic.enableBody = true;
  game.physics.arcade.enable(magicTypes.basic);
  
  for(let i in magicTypes) {
    magicPotion.add(magicTypes[i]);
  }

  //set time for score
  //create time
  timer = game.time.create(false);
  //set a timerevent to occur after 3 seconds
  timer.loop(1000, updateScore, this);
  timer.start();
}


function update() {

  if (alive) {
    let magicness = Math.random() * 100;
    if(magicness>99){
      let newMagicPotion = magicTypes.basic.create(Math.random() * gameSettings.width,Math.random() * gameSettings.height, "mBasic")
    }
    // Roll for enemies
    let coin = Math.random() * 100;
    if(score<10){
      if (coin > 98) {
        spawnEnemy("eBasic");
      }
    }
    if(score>=10 &&score<25){
      if (coin > 94) {
        spawnEnemy("eBasic");
      }
    }
    if(score>=25 && score<50){
      if (coin > 90) {
        spawnEnemy("eBasic");
      }
    }
      if(score>=50 && score<100){
      if (coin > 85) {
        spawnEnemy("eBasic");
      }
    }
      if(score>=100){
      if (coin > 80) {
        // let spawnWall = [Math.floor(Math.random() * 2), Math.floor(Math.random() * 2)];    
        let newEnemy = enemyTypes.basic.create(Math.random() * gameSettings.width, 0, "eBasic"); 
        newEnemy.outOfBoundsKill = true;
        let xVel = (Math.random() * 2 - 1) * 500;
        newEnemy.body.velocity.x = xVel;
        newEnemy.body.velocity.y = Math.sqrt(500 * 500 - xVel * xVel);
      }
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
    for(let i in magicTypes){
      game.physics.arcade.overlap(players, magicTypes[i], immune, null, this);
    }
    if(!immunity){
      for(let i in enemyTypes) {
        game.physics.arcade.overlap(players, enemyTypes[i], die, null, this);
      }
    }
  } else {
    if(spacebar.isDown) {
      restartGame();
    }
  }
}
function immune(player, magicPotion){
  immunity = true;
  let reoccur = true; // ?
  numberHit += 4;
  console.log('immune', immunity);
  magicPotion.kill();
  game.time.events.add(Phaser.Timer.SECOND * numberHit, setBack, this).autoDestroy = true;
}

function setBack(){
  immunity = false;
  numberHit = 0;
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
  score = 0;
  for (let i in enemyTypes) {
    enemyTypes[i].forEach(e => {e.kill()});
  }
  for( let i in magicTypes){
    magicTypes[i].forEach(e => {e.kill()});
  }
  alive = true;
  score = 0;
}

function updateScore(){
  if(alive){
    score++
  }
}

function spawnEnemy(type) {
  let angle = Math.random() * Math.PI * 2;
  let u = Math.cos(angle);
  let v = Math.sin(angle);
  let r = Math.sqrt(gameSettings.width * gameSettings.width + gameSettings.height * gameSettings.height) / 2;
  // x and y lie on a circle surrounding the grid
  let x = u * r + gameSettings.width/2;
  let y = v * r + gameSettings.height/2;
  // Set coordinates in bounds
  x = x > gameSettings.width ? gameSettings.width : x < 0 ? 0 : x;
  y = y > gameSettings.height ? gameSettings.height : y < 0 ? 0 : y;

  console.log("X: ", x);
  console.log("Y: ", y);
  let newEnemy = enemyTypes.basic.create(x, y, type); 
  newEnemy.outOfBoundsKill = true;
  let tangent = (Math.random() * 2 - 1) * 500;
  let rad = Math.sqrt(500 * 500 - tangent * tangent); 
  newEnemy.body.velocity.x = tangent * v - rad * u;
  newEnemy.body.velocity.y = - tangent * u - rad * v;
} 

function render(){
  game.debug.text("Score: " + score, 16,32)
  if(!alive){
    game.debug.text("Press spacebar to restart", 300,250)
  }
  if(immunity){
    game.debug.text("Immunity only last 4 seconds....", 300, 590)
  }
}