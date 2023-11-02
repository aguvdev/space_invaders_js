class Player {
  constructor(game){
    this.game = game;
    this.width = 100;
    this.height = 100;
    this.x = this.game.width * 0.5 - this.width * 0.5;
    this.y = this.game.height - this.height;
    this.speed = 10;
  }
  draw(context){
    context.fillRect(this.x, this.y, this.width, this.height);
  }
  update(){
    // movimiento horizontal
    if (this.game.keys.indexOf('a') > -1) this.x -= this.speed;
    if (this.game.keys.indexOf('d') > -1) this.x += this.speed;
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
}
// Object pool desing pattern es el que usamos acá
/* "OBJECT POOL" es un patrón de diseño creativo (CREATIONAL DESIGN PATTERNS).
Nos permite evitar problemas de rendimiento relacionados con la asignación automática de memoria y los procesos de recolección de basura, que se activan cuando creamos y destruimos grandes cantidades de objetos Javascript.
Los CREATIONAL DESIGN PATTERNS proporcionan varios mecanismos de creación de objetos, lo que aumenta la flexibilidad y la reutilización del código existente. */
class Projectile {
  constructor(player){
    this.player = player;
    this.width = 8;
    this.height = 40;
    this.x = 0;
    this.y = 0;
    this.speed = 20;
    this.free = true;
  }
  draw(context){
    if (!this.free){
      context.fillRect(this.x, this.y, this.width, this.height);
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
  }
  draw(context){
    context.strokeRect(this.x, this.y, this.width, this.height);
  }
  update(x, y){
    this.x = x + this.positionX;
    this.y = y + this.positionY;
  }
}

class Wave {
  constructor(game){
    this.game = game;
    this.width = this.game.columns * this.game.enemySize;
    this.height = this.game.rows * this.game.enemySize;
    this.x = 0;
    this.y = 0 - this.height;
    this.speedX = 3;
    this.speedY = 0;
    this.enemies = [];
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
  }
  create(){
    for (let y = 0; y < this.game.rows; y++){
      for (let x = 0; x < this.game.columns; x++){
        let enemyX = x * this.game.enemySize;
        let enemyY = y * this.game.enemySize;
        this.enemies.push(new Enemy(this.game, enemyX, enemyY));
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
    this.numberOfProjectiles = 10;
    this.createProjectiles();
    
    this.columns = 3;
    this.rows = 3;
    this.enemySize = 60;

    this.waves = [];
    this.waves.push(new Wave(this));

    // Event listeners
    window.addEventListener('keydown', e => {
      /* indexOf() devuelve el primer índice en el que se puede encontrar un elemento dado en la array.
      Retorna -1 si el elemento no esta presente */
      if (this.keys.indexOf(e.key) === -1) this.keys.push(e.key);
      if (e.key === '1') this.player.shoot();
    });
    window.addEventListener('keyup', e => {
      const index = this.keys.indexOf(e.key);
      if (index > -1) this.keys.splice(index, 1); // splice() se puede usar para reemplazar o remover elementos existentes del array
    })
  }
  render(context) {
    this.player.draw(context);
    this.player.update();
    this.projectilesPool.forEach(projectile => {
      projectile.update();
      projectile.draw(context);
    });
    this.waves.forEach(wave => {
      wave.render(context);
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
  }
  // RECORDATORIO: para que este checkCollision funcione, los rectángulos que se le pasen tienen que tener las propiedades x, y, width, height.
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
  ctx.lineWidth = 5;

  const game = new Game(canvas);

  function animate(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    game.render(ctx);
    requestAnimationFrame(animate);
  }
  animate();
});
