const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const restartBtn = document.getElementById("restartBtn");
const scoreLabel = document.getElementById("score");

const box = 20;
let snake = [];
let direction = "RIGHT";
let food = { x: 0, y: 0 };
let score = 0;
let gameLoop;

function resetFood() {
  let newFood;

  do {
    newFood = {
      x: Math.floor(Math.random() * 20) * box,
      y: Math.floor(Math.random() * 20) * box
    };
  } while (snake.some((part) => part.x === newFood.x && part.y === newFood.y));

  food = newFood;
}

function resetGame() {
  snake = [{ x: 200, y: 200 }];
  direction = "RIGHT";
  score = 0;
  scoreLabel.textContent = score;
  resetFood();

  clearInterval(gameLoop);
  gameLoop = setInterval(draw, 150);
}

function changeDirection(event) {
  if (event.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
  if (event.key === "ArrowDown" && direction !== "UP") direction = "DOWN";
  if (event.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
  if (event.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
}

function drawRoundedRect(x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function drawSnake() {
  snake.forEach((part, index) => {
    const isHead = index === 0;
    const x = part.x + 2;
    const y = part.y + 2;
    const w = box - 4;
    const h = box - 4;

    drawRoundedRect(x, y, w, h, 6);

    if (isHead) {
      ctx.fillStyle = "#0f8a46";
      ctx.shadowColor = "rgba(0,255,140,0.35)";
      ctx.shadowBlur = 12;
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(part.x + 6, part.y + 6, 2.2, 0, Math.PI * 2);
      ctx.arc(part.x + 14, part.y + 6, 2.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#111";
      ctx.beginPath();
      ctx.arc(part.x + 6, part.y + 6, 1, 0, Math.PI * 2);
      ctx.arc(part.x + 14, part.y + 6, 1, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = index % 2 === 0 ? "#18cf68" : "#11aa5c";
      ctx.fill();
    }
  });
}

function draw() {
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#ff4d6d";
  drawRoundedRect(food.x + 2, food.y + 2, box - 4, box - 4, 5);
  ctx.fill();

  drawSnake();

  let headX = snake[0].x;
  let headY = snake[0].y;

  if (direction === "UP") headY -= box;
  if (direction === "DOWN") headY += box;
  if (direction === "LEFT") headX -= box;
  if (direction === "RIGHT") headX += box;

  if (headX === food.x && headY === food.y) {
    score++;
    scoreLabel.textContent = score;
    resetFood();
  } else {
    snake.pop();
  }

  if (
    headX < 0 ||
    headY < 0 ||
    headX >= canvas.width ||
    headY >= canvas.height
  ) {
    clearInterval(gameLoop);
    alert("Oyun Bitti! Skor: " + score);
    resetGame();
    return;
  }

  const hitSelf = snake.some((part, index) => index !== 0 && part.x === headX && part.y === headY);
  if (hitSelf) {
    clearInterval(gameLoop);
    alert("Oyun Bitti! Skor: " + score);
    resetGame();
    return;
  }

  snake.unshift({ x: headX, y: headY });
}

document.addEventListener("keydown", changeDirection);
restartBtn.addEventListener("click", resetGame);

resetGame();
