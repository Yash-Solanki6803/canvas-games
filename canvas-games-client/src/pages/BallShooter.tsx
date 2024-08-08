import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { Enemy, Player, Projectile, Particle } from "../classes/ball-shooter";

const BallShooter: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const scoreRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const finalScoreRef = useRef<HTMLDivElement>(null);

  let animationId: number;
  let enemySpawnIntervalID: number;

  // Canvas context and game state
  let ctx: CanvasRenderingContext2D;
  let score = 0;
  const friction = 1;

  // const mouse = {
  //   x: undefined,
  //   y: undefined,
  // };

  // Game objects
  let player: Player;

  let projectiles: Projectile[] = [];

  let particles: Particle[] = [];
  let enemies: Enemy[] = [];

  // Initialization function
  const init = () => {
    const canvas = canvasRef.current!;
    const x = canvas.width / 2;
    const y = canvas.height / 2;
    player = new Player(x, y, 10, "white");

    projectiles = [];
    particles = [];
    enemies = [];
    score = 0;

    if (scoreRef.current) scoreRef.current.innerHTML = score.toString();
    if (finalScoreRef.current)
      finalScoreRef.current.innerHTML = score.toString();

    if (enemySpawnIntervalID) clearInterval(enemySpawnIntervalID);
  };

  // Function to spawn enemies
  const spawnEnemies = () => {
    if (enemySpawnIntervalID) clearInterval(enemySpawnIntervalID);
    const canvas = canvasRef.current!;

    enemySpawnIntervalID = setInterval(() => {
      const radius = Math.random() * (30 - 10) + 10;
      let x: number;
      let y: number;
      if (Math.random() < 0.5) {
        x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
        y = Math.random() * canvas.height;
      } else {
        x = Math.random() * canvas.width;
        y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
      }

      const color = `hsl(${Math.random() * 360}, 50%, 50%)`;
      const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x);
      const velocity = {
        x: Math.cos(angle),
        y: Math.sin(angle),
      };
      enemies.push(new Enemy(x, y, radius, color, velocity));
    }, 800);
  };

  // Animation loop
  const animate = () => {
    animationId = requestAnimationFrame(animate);
    ctx = ctxRef.current!;
    if (!ctx) return;

    ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    player.update(ctx);

    // Update and draw projectiles
    projectiles.forEach((projectile, projectileIndex) => {
      projectile.update(ctx);

      // Remove projectiles that go off screen
      if (
        projectile.x + projectile.radius < 0 ||
        projectile.x - projectile.radius > ctx.canvas.width ||
        projectile.y + projectile.radius < 0 ||
        projectile.y - projectile.radius > ctx.canvas.height
      ) {
        setTimeout(() => {
          projectiles.splice(projectileIndex, 1);
        }, 0);
      }
    });

    // Update and draw particles
    particles.forEach((particle, particleIndex) => {
      particle.update(ctx, friction);
      if (particle.alpha <= 0) {
        setTimeout(() => {
          particles.splice(particleIndex, 1);
        }, 0);
      }
    });

    // Update and draw enemies
    enemies.forEach((enemy, enemyIndex) => {
      enemy.update(ctx);

      // Game over check
      const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
      if (dist - enemy.radius - player.radius < 1) {
        if (modalRef.current) modalRef.current.style.display = "flex";
        if (finalScoreRef.current)
          finalScoreRef.current.innerHTML = score.toString();
        cancelAnimationFrame(animationId);
      }

      // Check collision between projectiles and enemies
      projectiles.forEach((projectile, projectileIndex) => {
        const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);
        if (dist - enemy.radius - projectile.radius < 1) {
          // Spawn particles explosion
          for (let i = 0; i < enemy.radius * 2; i++) {
            particles.push(
              new Particle(
                projectile.x,
                projectile.y,
                Math.random() * 2,
                enemy.color,
                {
                  x: (Math.random() - 0.5) * (Math.random() * 8),
                  y: (Math.random() - 0.5) * (Math.random() * 8),
                }
              )
            );
          }

          if (enemy.radius - 10 > 10) {
            // Update score
            score += 10;
            if (scoreRef.current) scoreRef.current.innerHTML = score.toString();

            // Shrink enemy
            gsap.to(enemy, {
              radius: enemy.radius - 10,
            });
            setTimeout(() => {
              projectiles.splice(projectileIndex, 1);
            }, 0);
          } else {
            // Update score
            score += 25;
            if (scoreRef.current) scoreRef.current.innerHTML = score.toString();

            // Remove enemy
            setTimeout(() => {
              enemies.splice(enemyIndex, 1);
              projectiles.splice(projectileIndex, 1);
            }, 0);
          }
        }
      });
    });
  };

  // Handle click event to shoot projectile
  const handleCanvasClick = (e: MouseEvent) => {
    const canvas = canvasRef.current!;
    const angle = Math.atan2(
      e.clientY - canvas.height / 2,
      e.clientX - canvas.width / 2
    );

    const velocity = {
      x: Math.cos(angle) * 9,
      y: Math.sin(angle) * 9,
    };

    projectiles.push(
      new Projectile(canvas.width / 2, canvas.height / 2, 5, "white", velocity)
    );
  };

  // Set up the game on mount
  useEffect(() => {
    const canvas = canvasRef.current!;
    ctxRef.current = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    init();
    animate();
    spawnEnemies();

    // Handle window resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init();
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("click", handleCanvasClick);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("click", handleCanvasClick);
      if (enemySpawnIntervalID) clearInterval(enemySpawnIntervalID);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef}></canvas>
      <div id="score" ref={scoreRef}></div>
      <div id="modal" ref={modalRef}>
        <div id="final-score" ref={finalScoreRef}></div>
        <button
          id="play-btn"
          onClick={() => {
            init();
            animate();
            spawnEnemies();
            if (modalRef.current) modalRef.current.style.display = "none";
          }}
        >
          Play Again
        </button>
      </div>
    </>
  );
};

export default BallShooter;
