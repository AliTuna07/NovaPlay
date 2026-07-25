const gameOverScreen = document.getElementById("gameOverScreen");
const finalScore = document.getElementById("finalScore");
const finalHighscore = document.getElementById("finalHighscore");
const playAgainBtn = document.getElementById("playAgainBtn");

const highscoreText = document.getElementById("highscore");
const scoreText = document.getElementById("score");
const restartBtn = document.getElementById("restart");

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const box = 20;

let snake;
let food;
let direction;
let nextDirection;
let score;
let game;
let particles = [];
let speed = 150;
let highscore = Number(localStorage.getItem("snakeHighscore")) || 0;
highscoreText.textContent = highscore;



function startGame(){

    snake = [
        {x:200,y:200},
        {x:180,y:200},
        {x:160,y:200}
    ];

    food = createFood();

    direction="RIGHT";
    nextDirection="RIGHT";

    score=0;
    scoreText.textContent=score;

   clearInterval(game);

speed = 100;

game = setInterval(draw, speed);
    gameOverScreen.style.display="none";
}



function createFood(){

    let newFood;

    do{

        newFood={
            x:Math.floor(Math.random()*(canvas.width/box))*box,
            y:Math.floor(Math.random()*(canvas.height/box))*box
        };


    }while(
        snake.some(part =>
            part.x===newFood.x &&
            part.y===newFood.y
        )
    );


    return newFood;
}





function draw(){

    ctx.fillStyle="#111";
    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    direction=nextDirection;


    let head={
        x:snake[0].x,
        y:snake[0].y
    };


    if(direction==="UP") head.y-=box;
    if(direction==="DOWN") head.y+=box;
    if(direction==="LEFT") head.x-=box;
    if(direction==="RIGHT") head.x+=box;



    if(
        head.x<0 ||
        head.y<0 ||
        head.x>=canvas.width ||
        head.y>=canvas.height ||
        snake.some(part =>
            part.x===head.x &&
            part.y===head.y
        )
    ){

        gameOver();
        return;
    }



    snake.unshift(head);



   if(
    head.x===food.x &&
    head.y===food.y
){

    score++;

    scoreText.textContent=score;
createParticles(
    food.x + box/2,
    food.y + box/2
);

    if(score % 5 === 0){

        speed -= 5;

        clearInterval(game);

        game = setInterval(draw, speed);

    }


    food=createFood();

}
    else{

        snake.pop();

    }



    drawApple();

    drawParticles();
   
    drawSnake();

    

}





function drawApple(){

    let x = food.x + box / 2;
    let y = food.y + box / 2;


    ctx.save();


    // Elmanın dış parlaması
    ctx.shadowColor = "#ff1744";
    ctx.shadowBlur = 25;


    // Ana elma gövdesi
    let gradient = ctx.createRadialGradient(
        x - 4,
        y - 5,
        2,
        x,
        y,
        10
    );


    gradient.addColorStop(0,"#ff8080");
    gradient.addColorStop(0.4,"#ff1744");
    gradient.addColorStop(1,"#990015");


    ctx.fillStyle = gradient;


    ctx.beginPath();

    ctx.arc(
        x,
        y,
        9,
        0,
        Math.PI*2
    );

    ctx.fill();



    // Elmanın alt gölgesi
    ctx.shadowBlur = 0;

    ctx.fillStyle="rgba(80,0,0,0.4)";

    ctx.beginPath();

    ctx.arc(
        x,
        y+5,
        6,
        0,
        Math.PI
    );

    ctx.fill();



    // Üst çukur
    ctx.fillStyle="#8b0015";

    ctx.beginPath();

    ctx.arc(
        x,
        y-4,
        3,
        0,
        Math.PI*2
    );

    ctx.fill();



    // Sap
    ctx.strokeStyle="#5c3515";
    ctx.lineWidth=3;

    ctx.beginPath();

    ctx.moveTo(
        x,
        y-8
    );

    ctx.lineTo(
        x+3,
        y-14
    );

    ctx.stroke();



    // Yaprak
    ctx.fillStyle="#00ff55";

    ctx.beginPath();

    ctx.ellipse(
        x+6,
        y-13,
        6,
        3,
        -0.5,
        0,
        Math.PI*2
    );

    ctx.fill();



    // Işık yansıması
    ctx.fillStyle="rgba(255,255,255,0.7)";

    ctx.beginPath();

    ctx.arc(
        x-4,
        y-5,
        2,
        0,
        Math.PI*2
    );

    ctx.fill();


    ctx.restore();

}
function createParticles(x,y){

    for(let i=0;i<15;i++){

        particles.push({

            x:x,
            y:y,

            dx:(Math.random()-0.5)*5,
            dy:(Math.random()-0.5)*5,

            life:30

        });

    }

}
function drawParticles(){

    particles.forEach((p,index)=>{


        ctx.fillStyle="#00ff88";


        ctx.beginPath();

        ctx.arc(
            p.x,
            p.y,
            3,
            0,
            Math.PI*2
        );

        ctx.fill();



        p.x += p.dx;
        p.y += p.dy;

        p.life--;



        if(p.life<=0){

            particles.splice(index,1);

        }


    });

}


function drawSnake(){

    snake.forEach((part,index)=>{


        ctx.save();


        ctx.shadowColor="#00ff88";
        ctx.shadowBlur=18;


        ctx.fillStyle=
        index===0
        ? "#00ffff"
        : "#00ff88";



        ctx.beginPath();

        ctx.arc(
            part.x+box/2,
            part.y+box/2,
            box/2-2,
            0,
            Math.PI*2
        );


        ctx.fill();


        ctx.restore();



       if(index===0){

    let eye1X;
    let eye1Y;
    let eye2X;
    let eye2Y;


    if(direction==="RIGHT"){

        eye1X = part.x+14;
        eye1Y = part.y+6;

        eye2X = part.x+14;
        eye2Y = part.y+14;

    }


    if(direction==="LEFT"){

        eye1X = part.x+6;
        eye1Y = part.y+6;

        eye2X = part.x+6;
        eye2Y = part.y+14;

    }


    if(direction==="UP"){

        eye1X = part.x+6;
        eye1Y = part.y+6;

        eye2X = part.x+14;
        eye2Y = part.y+6;

    }


    if(direction==="DOWN"){

        eye1X = part.x+6;
        eye1Y = part.y+14;

        eye2X = part.x+14;
        eye2Y = part.y+14;

    }



    // beyaz gözler
    ctx.fillStyle="white";

    ctx.beginPath();

    ctx.arc(
        eye1X,
        eye1Y,
        3,
        0,
        Math.PI*2
    );

    ctx.arc(
        eye2X,
        eye2Y,
        3,
        0,
        Math.PI*2
    );

    ctx.fill();



    // siyah göz bebekleri
    ctx.fillStyle="black";

    ctx.beginPath();

    ctx.arc(
        eye1X,
        eye1Y,
        1.5,
        0,
        Math.PI*2
    );

    ctx.arc(
        eye2X,
        eye2Y,
        1.5,
        0,
        Math.PI*2
    );

    ctx.fill();

}
    });

}





function gameOver(){

    clearInterval(game);


    if(score>highscore){

        highscore=score;

        localStorage.setItem(
            "snakeHighscore",
            highscore
        );

        highscoreText.textContent=highscore;

    }


    finalScore.textContent=score;
    finalHighscore.textContent=highscore;


    gameOverScreen.style.display="flex";

}





document.addEventListener("keydown",e=>{


    if(
        e.key==="ArrowUp" ||
        e.key==="w"
    ){

        if(direction!=="DOWN")
        nextDirection="UP";

    }



    if(
        e.key==="ArrowDown" ||
        e.key==="s"
    ){

        if(direction!=="UP")
        nextDirection="DOWN";

    }



    if(
        e.key==="ArrowLeft" ||
        e.key==="a"
    ){

        if(direction!=="RIGHT")
        nextDirection="LEFT";

    }



    if(
        e.key==="ArrowRight" ||
        e.key==="d"
    ){

        if(direction!=="LEFT")
        nextDirection="RIGHT";

    }


});





restartBtn.addEventListener(
    "click",
    startGame
);



playAgainBtn.addEventListener(
    "click",
    startGame
);



startGame();