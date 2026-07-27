const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");
const levelEl = document.getElementById("level");
const playButton = document.getElementById("playButton");

// --------------------
// OYUN DURUMU
// --------------------

let gameStarted = false;
let paused = false;
let gameOver = false;

let score = 0;
let lives = 3;
let level = 1;

let speed = 4;

// --------------------
// TOP
// --------------------

const ball = {

    x: canvas.width / 2,

    y: canvas.height - 60,

    r: 8,

    dx: speed,

    dy: -speed

};

// --------------------
// RAKET
// --------------------

const paddle = {

    width: 90,

    height: 12,

    x: canvas.width / 2 - 45,

    y: canvas.height - 25

};

// --------------------
// TUĞLALAR
// --------------------

const rows = 5;
const cols = 7;

const brickWidth = 55;
const brickHeight = 18;

const brickPadding = 10;
const brickOffsetTop = 50;
const brickOffsetLeft = 20;

let bricks = [];
let particles = [];
let powerUps = [];
function createBricks(){

    bricks=[];

    for(let r=0;r<rows;r++){

        bricks[r]=[];

        for(let c=0;c<cols;c++){

            bricks[r][c]={

                x:brickOffsetLeft+c*(brickWidth+brickPadding),

                y:brickOffsetTop+r*(brickHeight+brickPadding),

                hp:Math.floor(Math.random()*3)+1

            };

        }

    }

}

createBricks();
function createParticles(x,y,color){

    for(let i=0;i<12;i++){

        particles.push({

            x:x,
            y:y,

            size:Math.random()*5+2,

            dx:(Math.random()-0.5)*6,

            dy:(Math.random()-0.5)*6,

            life:30,

            color:color

        });

    }

}
// --------------------
// MOUSE
// --------------------

document.addEventListener("mousemove",(e)=>{

    const rect=canvas.getBoundingClientRect();

    paddle.x=e.clientX-rect.left-paddle.width/2;

    if(paddle.x<0)
        paddle.x=0;

    if(paddle.x+paddle.width>canvas.width)
        paddle.x=canvas.width-paddle.width;

});

// --------------------
// KLAVYE
// --------------------

document.addEventListener("keydown",(e)=>{

    if(e.code==="Space" && gameStarted){

        paused=!paused;

    }

});

// --------------------
// ÇİZİM
// --------------------
function createPowerUp(x,y){

    let types = [
        "bigPaddle",
        "extraLife",
        "slowBall",
        "coin"
    ];


    let type = types[
        Math.floor(Math.random()*types.length)
    ];


    powerUps.push({

        x:x,

        y:y,

        size:18,

        dy:2,

        type:type

    });

}
function drawPowerUps(){

    for(let i=powerUps.length-1;i>=0;i--){

        let p = powerUps[i];


        if(p.type==="bigPaddle")
            ctx.fillStyle="#00ff88";

        if(p.type==="extraLife")
            ctx.fillStyle="#ff3366";

        if(p.type==="slowBall")
            ctx.fillStyle="#9966ff";

        if(p.type==="coin")
            ctx.fillStyle="#ffd700";


        ctx.fillRect(
            p.x,
            p.y,
            p.size,
            p.size
        );


        p.y += p.dy;


        // Paddle yakaladı mı?

        if(
            p.y+p.size >= paddle.y &&
            p.x+p.size >= paddle.x &&
            p.x <= paddle.x+paddle.width
        ){

            collectPowerUp(p.type);

            powerUps.splice(i,1);

        }


        // Ekrandan çıktıysa sil

        if(p.y > canvas.height){

            powerUps.splice(i,1);

        }

    }

}
function drawBricks(){

    for(let r=0;r<rows;r++){

        for(let c=0;c<cols;c++){

            const b=bricks[r][c];

            if(b.hp<=0) continue;

            if(b.hp==3)
                ctx.fillStyle="#ff4444";

            else if(b.hp==2)
                ctx.fillStyle="#ff9800";

            else
                ctx.fillStyle="#00e5ff";

            ctx.fillRect(
                b.x,
                b.y,
                brickWidth,
                brickHeight
            );

        }

    }

}

function drawBall(){

    ctx.beginPath();

    ctx.arc(
        ball.x,
        ball.y,
        ball.r,
        0,
        Math.PI*2
    );

    ctx.fillStyle="yellow";

    ctx.fill();

}

function drawPaddle(){

    ctx.fillStyle="#00ffff";

    ctx.fillRect(

        paddle.x,

        paddle.y,

        paddle.width,

        paddle.height

    );

}
function drawParticles(){

    for(let i=particles.length-1;i>=0;i--){

        let p=particles[i];


        ctx.fillStyle=p.color;

        ctx.fillRect(
            p.x,
            p.y,
            p.size,
            p.size
        );


        p.x+=p.dx;
        p.y+=p.dy;

        p.life--;


        if(p.life<=0){

            particles.splice(i,1);

        }

    }

}
function updateHUD(){

    scoreEl.textContent=score;
    livesEl.textContent=lives;
    levelEl.textContent=level;

}
// --------------------
// OYUN MOTORU
// --------------------

function moveBall(){

    ball.x += ball.dx;
    ball.y += ball.dy;


    // Duvar çarpışmaları

    if(ball.x + ball.r >= canvas.width ||
       ball.x - ball.r <= 0){

        ball.dx = -ball.dx;

    }


    if(ball.y - ball.r <= 0){

        ball.dy = -ball.dy;

    }


    // Raket çarpışması

    if(
        ball.y + ball.r >= paddle.y &&
        ball.y - ball.r <= paddle.y + paddle.height &&
        ball.x >= paddle.x &&
        ball.x <= paddle.x + paddle.width
    ){

        ball.dy = -Math.abs(ball.dy);

    }


    // Tuğla çarpışması

    for(let r=0;r<rows;r++){

        for(let c=0;c<cols;c++){

            let b=bricks[r][c];

            if(b.hp<=0) continue;


            if(
                ball.x > b.x &&
                ball.x < b.x+brickWidth &&
                ball.y > b.y &&
                ball.y < b.y+brickHeight
            ){

                b.hp--;

                ball.dy=-ball.dy;


               if(b.hp===0){

    score+=10;


    createParticles(
        b.x + brickWidth/2,
        b.y + brickHeight/2,
        "#00e5ff"
    );


    if(Math.random()<0.25){

        createPowerUp(
            b.x,
            b.y
        );

    }

}

                updateHUD();

                break;

            }

        }

    }


    // Top düştü

    if(ball.y-ball.r > canvas.height){

        lives--;

        updateHUD();


        if(lives<=0){

            gameOver=true;

            alert(
                "🎮 Oyun Bitti!\nSkor: "+score
            );

        }
        else{

            resetBall();

        }

    }

}



// Topu yeniden başlat

function resetBall(){

    ball.x=canvas.width/2;
    ball.y=canvas.height-60;

    ball.dx=speed;
    ball.dy=-speed;

}



// Level kontrolü

function checkLevel(){

    let left=0;


    for(let r=0;r<rows;r++){

        for(let c=0;c<cols;c++){

            if(bricks[r][c].hp>0){

                left++;

            }

        }

    }


    if(left===0){

        level++;

        speed+=0.5;

        createBricks();

        resetBall();

        updateHUD();

    }

}



// Çizim döngüsü

function gameLoop(){

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    drawBricks();

    drawPaddle();

    drawBall();

drawParticles();
drawPowerUps();
    if(gameStarted && !paused && !gameOver){

        moveBall();

        checkLevel();

    }


    requestAnimationFrame(gameLoop);

}



// Başlat

function startGame(){

    if(gameStarted) return;


    gameStarted=true;

    paused=false;

    gameOver=false;

    playButton.textContent="🎮 Oynanıyor";

}



// Yeniden başlat

function restartGame(){

    score=0;

    lives=3;

    level=1;

    speed=4;


    createBricks();

    resetBall();

    updateHUD();


    gameStarted=false;

    gameOver=false;

    paused=false;


    playButton.textContent="▶ Oyna";

}



updateHUD();

gameLoop();
function collectPowerUp(type){

    if(type==="bigPaddle"){

        paddle.width = 140;

        setTimeout(()=>{

            paddle.width = 90;

        },8000);

    }


    if(type==="extraLife"){

        if(lives<5)
            lives++;

    }


    if(type==="slowBall"){

        ball.dx *= 0.7;
        ball.dy *= 0.7;

    }


    if(type==="coin"){

        score += 50;

    }


    updateHUD();

}