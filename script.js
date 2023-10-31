class Player {
  constructor(game){
    this.game = game;
    this.width = 100;
    this.height = 100;
    this.x = this.game.width * 0.5 - this.width * 0.5;
    this.y = this.game.height - this.height;
  }
  draw(context){
    context.fillRect(this.x, this.y, this.width, this.height);
  }
  update(){
    this.x += this.speed;
  }
}

class Projectile {

}

class Enemy {

}

// Define una clase llamada Game
class Game {
  // El constructor toma un argumento llamado canvas
  constructor(canvas) {
    // Establece la propiedad canvas en el objeto canvas pasado como argumento
    this.canvas = canvas;
    // Establece la propiedad width en el ancho del objeto canvas
    this.width = this.canvas.width;
    // Establece la propiedad height en la altura del objeto canvas
    this.height = this.canvas.height;
    this.player = new Player(this);
  }
  // Define un método llamado render
  render(context) {
    this.player.draw(context);
  }
}

// Agrega un evento 'load' que se activa cuando se carga completamente la página
window.addEventListener("load", function () {
  // Obtiene el elemento canvas1
  const canvas = document.getElementById("canvas1");
  // Obtiene el contexto de dibujo del canvas
  const ctx = canvas.getContext("2d");
  // Establece la propiedad width del canvas en 600
  canvas.width = 600;
  // Establece la propiedad height del canvas en 800
  canvas.height = 800;

  const game = new Game(canvas);
  console.log(game);
  game.render(ctx);
});
