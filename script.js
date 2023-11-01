class Player {
  constructor(game){
    this.game = game;
    this.width = 100;
    this.height = 100;
    this.x = this.game.width * 0.5 - this.width * 0.5;
    this.y = this.game.height - this.height;
    this.speed = 5;
  }
  draw(context){
    context.fillRect(this.x, this.y, this.width, this.height);
  }
  update(){
    if (this.game.keys.indexOf('a') > -1) this.x -= this.speed;
    if (this.game.keys.indexOf('d') > -1) this.x += this.speed;
    if (this.game.keys.indexOf('w') > -1) this.y -= this.speed;
    if (this.game.keys.indexOf('s') > -1) this.y += this.speed;
  }
}

class Projectile {

}

class Enemy {

}

class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.keys = [];
    this.player = new Player(this);

    // Event listeners
    window.addEventListener('keydown', e => {
      /* indexOf() devuelve el primer índice en el que se puede encontrar un elemento dado en la array.
      Retorna -1 si el elemento no esta presente */
      if (this.keys.indexOf(e.key) === -1) this.keys.push(e.key);
    });
    window.addEventListener('keyup', e => {
      const index = this.keys.indexOf(e.key);
      if (index > -1) this.keys.splice(index, 1); // splice() se puede usar para reemplazar o remover elementos existentes del array
    })
  }
  render(context) {
    this.player.draw(context);
    this.player.update();
  }
}

// Agrega un evento 'load' que se activa cuando se carga completamente la página
window.addEventListener("load", function () {
  // Obtiene el elemento canvas1
  const canvas = document.getElementById("canvas1");
  const ctx = canvas.getContext("2d");
  canvas.width = 600;
  canvas.height = 800;

  const game = new Game(canvas);

  function animate(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    game.render(ctx);
    requestAnimationFrame(animate);
  }
  animate();
});
