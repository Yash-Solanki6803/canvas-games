// import { ctx, friction } from "../index.js";

export default class Particle {
  x: number;
  y: number;
  radius: number;
  color: string;
  velocity: { x: number; y: number };
  alpha: number;
  constructor(
    x: number,
    y: number,
    radius: number,
    color: string,
    velocity: {
      x: number;
      y: number;
    }
  ) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
    this.alpha = 1;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();
  }
  update(ctx: CanvasRenderingContext2D, friction: number) {
    this.draw(ctx);
    this.velocity.x *= friction;
    this.velocity.y *= friction;
    this.alpha -= 0.02;
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  }
}
