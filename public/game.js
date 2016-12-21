let gameSettings = {
  width: 800,
  height: 600,
  numPlayers: 2, //not used yet, but potentially for the future?
};

let game = new Phaser.Game(gameSettings.width, gameSettings.height, Phaser.AUTO, '', { preload: preload, create: create, update: update, render: render });
let tracking = false;
let players;
let activePlayer;
let gameStarted = false;
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
let immuneTime = 0;
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
  game.load.image("eZigzag", "assets/sprites/purplecircle.png");
  game.load.image("eTraverser", "assets/sprites/blackcircle.png")
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
  
  enemyTypes.eBasic = game.add.group();
  enemyTypes.eBasic.enableBody = true;
  enemyTypes.eBasic.spawn = spawnBasic;
  game.physics.arcade.enable(enemyTypes.eBasic);

  enemyTypes.eZigzag = game.add.group();
  enemyTypes.eZigzag.enableBody = true;
  enemyTypes.eZigzag.spawn = spawnZigzag;
  game.physics.arcade.enable(enemyTypes.eZigzag);
  
  enemyTypes.eTraverser = game.add.group();
  enemyTypes.eTraverser.enableBody = true;
  enemyTypes.eTraverser.spawn = spawnTraverser;
  game.physics.arcade.enable(enemyTypes.eTraverser);

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
}


function update() {

  if (gameStarted) {
    if (alive) {
      immunity = immuneTime.ms < 4000;
      let magicness = Math.random() * 100;
      if(magicness>99.9){
        let newMagicPotion = magicTypes.basic.create(Math.random() * gameSettings.width,Math.random() * gameSettings.height, "mBasic")
      }
      // Roll for enemies
      let coin = Math.random() * 100;
      if(coin < score) {
        enemyTypes[getRandom(Object.keys(enemyTypes))].spawn();
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
      // if(!immunity){
        for(let i in magicTypes){
          game.physics.arcade.overlap(players, magicTypes[i], immune, null, this);
        }
      // } 
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
}
function immune(player, magicPotion){
  immuneTime = game.time.create();
  immuneTime.start();
  immunity = true;
  magicPotion.kill();
  // game.time.events.add(Phaser.Timer.SECOND * 4, setBack, this).autoDestroy = true;
}

// function setBack(){
//   console.log("Setting back");
//   console.log("immuneTime.ms: ", immuneTime.ms);
//   immunity = immuneTime.ms === undefined || immuneTime.ms < 4000;
//   // Kill timer
//   if (!immunity) immuneTime = undefined;
// }

function setActivePlayer(player) {
  if(!gameStarted) {
    gameStarted = true;
    //set time for score
    //create time
    timer = game.time.create(false);
    //set a timerevent to occur after 3 seconds
    timer.loop(1000, updateScore, this);
    timer.start();
  }
  activePlayer = player;
}

function die(player, enemy) {
  timer.destroy(); // stop timer
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
  gameStarted = false;

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

function getSpawnPosition() {
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
  return {
    u: u,
    v: v,
    x: x,
    y: y
  };
}

function spawnEnemy(type) {
  
  let position = getSpawnPosition();
  let newEnemy = enemyTypes[type].create(position.x, position.y, type); 
  newEnemy.outOfBoundsKill = true;
  let tangent = (Math.random() * 2 - 1) * 500;
  let rad = Math.sqrt(500 * 500 - tangent * tangent); 
  newEnemy.body.velocity.x = tangent * position.v - rad * position.u;
  newEnemy.body.velocity.y = - tangent * position.u - rad * position.v;
}

function spawnBasic() {
  const speed = 500;
  let position = getSpawnPosition();
  let newEnemy = enemyTypes["eBasic"].create(position.x, position.y, "eBasic"); 
  newEnemy.outOfBoundsKill = true;
  let tangent = (Math.random() * 2 - 1) * speed;
  let rad = Math.sqrt(speed * speed - tangent * tangent); 
  newEnemy.body.velocity.x = tangent * position.v - rad * position.u;
  newEnemy.body.velocity.y = - tangent * position.u - rad * position.v;
}

function spawnZigzag() {
  const speed = 300;
  let position = getSpawnPosition();
  let newEnemy = enemyTypes["eZigzag"].create(position.x, position.y, "eZigzag"); 
  newEnemy.outOfBoundsKill = true;
  let tangent = (Math.random() * 2 - 1) * speed;
  let rad = Math.sqrt(speed * speed - tangent * tangent); 
  newEnemy.body.velocity.x = tangent * position.v - rad * position.u;
  newEnemy.body.velocity.y = - tangent * position.u - rad * position.v;
  let zigzag = setInterval(() => {
    if(!newEnemy.alive) { //  has left the world
      clearInterval(zigzag);
    } else if (Math.abs(newEnemy.body.velocity.y) > Math.abs(newEnemy.body.velocity.x)) {
      newEnemy.body.velocity.x = - newEnemy.body.velocity.x;
    } else {
      newEnemy.body.velocity.y = - newEnemy.body.velocity.y;
    }
  }, 250)
}

function spawnTraverser() {
  const speed = 200;
  let position = getSpawnPosition();
  let newEnemy = enemyTypes["eTraverser"].create(position.x, position.y, "eTraverser");
  newEnemy.outOfBoundsKill = true;
  if (position.x === 0) {
    newEnemy.body.velocity.x = speed;
  } else if (position.x === gameSettings.length) {
    newEnemy.body.velocity.x = - speed;
  } else if (position.y === 0) {
    newEnemy.body.velocity.y = speed;
  } else if (position.x === gameSettings.length) {
    newEnemy.body.velocity.y = - speed;
  }
  let traverseInterval = setInterval(() => {
    if(!newEnemy.alive) clearInterval(traverseInterval);
    else {
      let tmp = newEnemy.body.velocity.x;
      newEnemy.body.velocity.x = newEnemy.body.velocity.y;
      newEnemy.body.velocity.y = tmp;
    }
  }, 300
  );
}

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function render(){
  game.debug.text("Score: " + score, 16,32)
  if(!alive){
    game.debug.text("Press spacebar to restart", 300,250)
  }
  if(immunity){
    game.debug.text(`Immunity: ${Math.ceil((4000 - immuneTime.ms)/1000)} seconds`, 300, 590)
  }
}