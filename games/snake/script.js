const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scoreText = document.getElementById("score");
const restartBtn = document.getElementById("restart");

const box = 20;

let snake;
let food;
let direction;
let nextDirection;
let score;
let game;

function startGame() {
    snake = [
        { x: 200, y: 200 },
        { x: 180, y: 200 },
        { x: 160, y: 200 }
    ];

    food = createFood();

    direction = "RIGHT";
    nextDirection = "RIGHT";

    score = 0;
    scoreText.textContent = score;

    clearInterval(game);
    game = setInterval(draw, 100);
}

function createFood() {
    return {
        x: Math.floor(Math.random() * (canvas.width / box)) * box,
        y: Math.floor(Math.random() * (canvas.height / box)) * box
    };
}


function draw() {

    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, canvas.width, canvas.height);


    direction = nextDirection;


    let head = {
        x: snake[0].x,
        y: snake[0].y
    };


    if (direction === "UP") head.y -= box;
    if (direction === "DOWN") head.y += box;
    if (direction === "LEFT") head.x -= box;
    if (direction === "RIGHT") head.x += box;


    if (
        head.x < 0 ||
        head.y < 0 ||
        head.x >= canvas.width ||
        head.y >= canvas.height ||
        snake.some(part => part.x === head.x && part.y === head.y)
    ) {
        gameOver();
        return;
    }


    snake.unshift(head);


    if (head.x === food.x && head.y === food.y) {
        score++;
        scoreText.textContent = score;
        food = createFood();
    } 
    else {
        snake.pop();
    }


    // Yem
    ctx.fillStyle = "red";
    ctx.fillRect(food.x, food.y, box, box);


    // Yılan
    snake.forEach((part, index) => {
        ctx.fillStyle = index === 0 ? "#00ff88" : "#00aa55";
        ctx.fillRect(part.x, part.y, box, box);
    });

}


function gameOver() {
    clearInterval(game);

    setTimeout(() => {
        alert("Oyun bitti! Skor: " + score);
    }, 100);
}



document.addEventListener("keydown", e => {

    if (e.key === "ArrowUp" || e.key === "w") {
        if (direction !== "DOWN") nextDirection = "UP";
    }

    if (e.key === "ArrowDown" || e.key === "s") {
        if (direction !== "UP") nextDirection = "DOWN";
    }

    if (e.key === "ArrowLeft" || e.key === "a") {
        if (direction !== "RIGHT") nextDirection = "LEFT";
    }

    if (e.key === "ArrowRight" || e.key === "d") {
        if (direction !== "LEFT") nextDirection = "RIGHT";
    }

});


restartBtn.addEventListener("click", startGame);


startGame();