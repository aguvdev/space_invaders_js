class Player {
  constructor(game){
    this.game = game;
    this.width = 140;
    this.height = 120;
    this.x = this.game.width * 0.5 - this.width * 0.5;
    this.y = this.game.height - this.height;
    this.speed = 5;
    this.lives = 3;
    this.maxLives = 10;
    this.image = document.getElementById('player');
    this.jets_image = document.getElementById('player_jets');
    this.frameX = 0;
    this.jetFrame = 1;
  }
  draw(context){
    // handle sprite frames
    if (this.game.keys.indexOf('1') > -1){
      this.frameX = 1;
    } else {
      this.frameX = 0;
    }
    context.drawImage(this.jets_image,
                      this.jetFrame * this.width, 
                      0, 
                      this.width, 
                      this.height, 
                      this.x, 
                      this.y, 
                      this.width, 
                      this.height
                      );
    context.drawImage(this.image,
                      this.frameX * this.width, 
                      0, 
                      this.width, 
                      this.height, 
                      this.x, 
                      this.y, 
                      this.width, 
                      this.height
                      );
  }
  update(){
    // movimiento horizontal
    if (this.game.keys.indexOf('a') > -1){
      this.x -= this.speed;
      this.jetFrame = 0;
    } else if (this.game.keys.indexOf('d') > -1){
      this.x += this.speed;
      this.jetFrame = 2;
    } else {
      this.jetFrame = 1;
    };
    // limites horizontales
    if (this.x < 0 - this.width * 0.5) this.x = 0 - this.width * 0.5; // aca le decimos que si x(posicion hacia la izquierda) es menor a 0, la posicion siempre va a ser 0
    else if (this.x > this.game.width - this.width * 0.5) this.x = this.game.width - this.width * 0.5; // y aca si x(posicion hacia la derecha) es el ancho menos el ancho del personaje, o sea el final de la pantalla, siempre va a ser ese valor para que no lo traspase

    /* movimiento vertical (no es necesario usarlo, pero lo dejo hecho por las dudas si quiero implementarlo luego) */
    //if (this.game.keys.indexOf('w') > -1) this.y -= this.speed;
    //if (this.game.keys.indexOf('s') > -1) this.y += this.speed;
    //if (this.y < 0) this.y = 0;
    //else if (this.y > this.game.height - this.height) this.y = this.game.height - this.height;
  }
  shoot(){
    const projectile = this.game.getProjectile();
    if (projectile) projectile.start(this.x + this.width * 0.5, this.y);
  }
  restart(){
    this.x = this.game.width * 0.5 - this.width * 0.5;
    this.y = this.game.height - this.height;
    this.lives = 3;
  }
}
// Object pool desing pattern es el que usamos acá
/* "OBJECT POOL" es un patrón de diseño creativo (CREATIONAL DESIGN PATTERNS).
Nos permite evitar problemas de rendimiento relacionados con la asignación automática de memoria y los procesos de recolección de basura, que se activan cuando creamos y destruimos grandes cantidades de objetos Javascript.
Los CREATIONAL DESIGN PATTERNS proporcionan varios mecanismos de creación de objetos, lo que aumenta la flexibilidad y la reutilización del código existente. */
class Projectile {
  constructor(player){
    this.player = player;
    this.width = 3;
    this.height = 40;
    this.x = 0;
    this.y = 0;
    this.speed = 20;
    this.free = true;
  }
  draw(context){
    if (!this.free){
      context.save();
      context.fillStyle = 'gold';
      context.fillRect(this.x, this.y, this.width, this.height);
      context.restore()
    }
  }
  update(){
    if (!this.free){
      this.y -= this.speed;
      if (this.y < 0 - this.height) this.reset();
    }
  }
  start(x, y){
    this.x = x - this.width * 0.5;
    this.y = y;
    this.free = false;
  }
  reset(){
    this.free = true;
  }
}

class Enemy {
  constructor(game, positionX, positionY){
    this.game = game;
    this.width = this.game.enemySize;
    this.height = this.game.enemySize;
    this.x = 0;
    this.y = 0;
    this.positionX = positionX;
    this.positionY = positionY;
    this.markedForDeletion = false;
  }
  draw(context){
    //context.strokeRect(this.x, this.y, this.width, this.height);
    context.drawImage(this.image, 
                      this.frameX * this.width, 
                      this.frameY * this.height, 
                      this.width, 
                      this.height, 
                      this.x, 
                      this.y, 
                      this.width, 
                      this.height
                      );
  }
  update(x, y){
    this.x = x + this.positionX;
    this.y = y + this.positionY;
    // check collision enemies - projectiles
    this.game.projectilesPool.forEach(projectile => {
      if (!projectile.free && this.game.checkCollision(this, projectile) && this.lives > 0){
        this.hit(1);
        projectile.reset();
      }
    });
    if (this.lives < 1){
      if (this.game.spriteUpdate) this.frameX++;
      if (this.frameX > this.maxFrame){
        this.markedForDeletion = true;
        if (!this.game.gameOver) this.game.score += this.maxLives;
      }
    }
    // check collision enemies - player
    if (this.game.checkCollision(this, this.game.player) && this.lives > 0){
      this.lives = 0;
      this.game.player.lives--;
    }
    // lose condition
    if (this.y + this.height > this.game.height || this.game.player.lives < 1){
      this.game.gameOver = true;
    }
  }
  hit(damage){
    this.lives -= damage;
  }
}

// subclase de enemy o child class de enemy
class Beetlemorph extends Enemy {
  constructor(game, positionX, positionY){
    super(game, positionX, positionY);
    this.image = document.getElementById('beetlemorph');
    this.frameX = 0;
    this.maxFrame = 2;
    this.frameY = Math.floor(Math.random() * 4);
    this.lives = 1;
    this.maxLives = this.lives;
  }
}

class Rhinomorph extends Enemy {
  constructor(game, positionX, positionY){
    super(game, positionX, positionY);
    this.image = document.getElementById('rhinomorph');
    this.frameX = 0;
    this.maxFrame = 5;
    this.frameY = Math.floor(Math.random() * 4);
    this.lives = 4;
    this.maxLives = this.lives;
  }
  hit(damage){
    this.lives -= damage;
    this.frameX = this.maxLives - Math.floor(this.lives);
  }
}

class Wave {
  constructor(game){
    this.game = game;
    this.width = this.game.columns * this.game.enemySize;
    this.height = this.game.rows * this.game.enemySize;
    this.x = this.game.width * 0.5 - this.width * 0.5;
    this.y = 0 - this.height;
    this.speedX = Math.random() < 0.5 ? -1 : 1;
    this.speedY = 0;
    this.enemies = [];
    this.nextWaveTrigger = false;
    this.create();
  }
  render(context){
    if (this.y < 0) this.y += 5;
    this.speedY = 0;
    if (this.x < 0 || this.x > this.game.width - this.width){
      this.speedX *= -1;
      this.speedY = this.game.enemySize;
    }
    this.x += this.speedX;
    this.y += this.speedY;
    this.enemies.forEach(enemy => {
      enemy.update(this.x, this.y);
      enemy.draw(context);
    })
    // array.filter() creará una copia de un array dado y esa copia filtrada contendrá solo los elementos que pasaron una determinada condición
    this.enemies = this.enemies.filter(object => !object.markedForDeletion); // aca creamos un array nuevo solo con los objetos que tengan la propiedad markedForDeletion en false, asi borrando los que lo tengan en true
  }
  create(){
    for (let y = 0; y < this.game.rows; y++){
      for (let x = 0; x < this.game.columns; x++){
        let enemyX = x * this.game.enemySize;
        let enemyY = y * this.game.enemySize;
        if (Math.random() < 0.2) {
          this.enemies.push(new Rhinomorph(this.game, enemyX, enemyY));
        } else {
          this.enemies.push(new Beetlemorph(this.game, enemyX, enemyY));
        }
      }
    }
  }
}

class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.keys = [];
    this.player = new Player(this);

    this.projectilesPool = [];
    this.numberOfProjectiles = 15;
    this.createProjectiles();
    this.fired = false;
    
    this.columns = 2;
    this.rows = 2;
    this.enemySize = 80;

    this.waves = [];
    this.waves.push(new Wave(this));
    this.waveCount = 1;

    this.spriteUpdate = false;
    this.spriteTimer = 0;
    this.spriteInternal = 150;

    this.score = 0;
    this.gameOver = false;

    // Event listeners
    window.addEventListener('keydown', e => {
      if (e.key === '1' && !this.fired) this.player.shoot();
      this.fired = true;
      /* indexOf() devuelve el primer índice en el que se puede encontrar un elemento dado en la array.
      Retorna -1 si el elemento no esta presente */
      if (this.keys.indexOf(e.key) === -1) this.keys.push(e.key);
      if (e.key === 'r' && this.gameOver) this.restart();
    });
    window.addEventListener('keyup', e => {
      this.fired = false;
      const index = this.keys.indexOf(e.key);
      if (index > -1) this.keys.splice(index, 1); // splice() se puede usar para reemplazar o remover elementos existentes del array
    })
  }
  render(context, deltaTime) {
    // sprite timing
    if (this.spriteTimer > this.spriteInternal){
      this.spriteUpdate = true;
      this.spriteTimer = 0;
    } else {
      this.spriteUpdate = false;
      this.spriteTimer += deltaTime;
    }

    this.drawStatusText(context);
    this.projectilesPool.forEach(projectile => {
      projectile.update();
      projectile.draw(context);
    });
    this.player.draw(context);
    this.player.update();
    this.waves.forEach(wave => {
      wave.render(context);
      if (wave.enemies.length < 1 && !wave.nextWaveTrigger && !this.gameOver){
        this.newWave();
        this.waveCount++;
        wave.nextWaveTrigger = true;
        if (this.player.lives < this.player.maxLives) this.player.lives++;
      }
    })
  }
  // create projectiles object pool
  createProjectiles(){
    for (let i = 0; i < this.numberOfProjectiles; i++){
      this.projectilesPool.push(new Projectile());
    }
  }
  // get free projectile object from the pool
  getProjectile(){
    for (let i = 0; i < this.projectilesPool.length; i++){
      if (this.projectilesPool[i].free) return this.projectilesPool[i];
    }
  }
  // collision detection entre dos rectángulos (axis-aligned)
  checkCollision(a, b){
    return (
      a.x < b.x + b.width && // revisa si el extremo superior izquierdo es menor que el extremo superior derecho(extremo izq + ancho) del otro rectágulo
      a.x + a.width > b.x && // revisa si el extremo superior derecho(extremo izq + ancho) es mayor que el extremo izquierdo del otro rectángulo
      a.y < b.y + b.width && // revisa si el extremo superior izquierdo es menor(esta mas cerca de la parte superior del viewport) que el extremo inferior izq del otro rectángulo
      a.y + a.height > b.y // revisa si el extremo izq inferior es mayor (mas alejado de la parte superior del viewport) que el extremo superior izq del otro rectángulo
    )
    // RECORDATORIO: para que este checkCollision funcione, los rectángulos que se le pasen tienen que tener las propiedades x, y, width, height.
  }
  drawStatusText(context){
    context.save(); // guarda toda la informacion del canvas antes de que aparezca el cartel, asi no modifica nada mas que el nuevo texto
    context.shadowOffsetX = 2;
    context.shadowOffsetY = 2;
    context.shadowColor = 'black';
    context.fillText('Score: ' + this.score, 20, 40); // primero se le pasa el text, segundo cuando se despega horizontalmente de la pantalla, y cuanto se despega verticalmente
    context.fillText('Wave: ' + this.waveCount, 20, 80);
    for (let i = 0; i < this.player.maxLives; i++){
      context.strokeRect(20 + 20 * i, 100, 10, 15);
    }
    for (let i = 0; i < this.player.lives; i++){
      context.fillRect(20 + 20 * i, 100, 10, 15);
    }
    if (this.gameOver){
      context.textAlign = 'center';
      context.font = '100px Impact';
      context.fillText('GAME OVER', this.width * 0.5, this.height * 0.5);
      context.font = '20px Impact';
      context.fillText('Press R to restart', this.width * 0.5, this.height * 0.5 + 30);
    }
    context.restore();
  }
  newWave(){
    if (Math.random() < 0.5 && this.columns * this.enemySize < this.width * 0.8){
      this.columns++;
    } else if (this.rows * this.enemySize < this.height * 0.6) {
      this.rows++;
    }
    this.waves.push(new Wave(this));
  }
  restart(){
    this.player.restart();
    this.columns = 2;
    this.rows = 2;
    this.waves = [];
    this.waves.push(new Wave(this));
    this.waveCount = 1;
    this.score = 0;
    this.gameOver = false;
  }
}

// Agrega un evento 'load' que se activa cuando se carga completamente la página
window.addEventListener("load", function () {
  // Obtiene el elemento canvas1
  const canvas = document.getElementById("canvas1");
  const ctx = canvas.getContext("2d");
  canvas.width = 600;
  canvas.height = 800;
  ctx.fillStyle = 'white';
  ctx.strokeStyle = 'white';
  ctx.font = '30px Impact';

  const game = new Game(canvas);

  let lastTime = 0;
  function animate(timeStamp){
    const deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    game.render(ctx, deltaTime);
    requestAnimationFrame(animate);
  }
  animate(0);
});
