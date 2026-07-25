const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const playerScoreText = document.getElementById("playerScore");
const computerScoreText = document.getElementById("computerScore");

let playerScore = 0;
let computerScore = 0;

let player = {
    x: 20,
    y: 160,
    width: 15,
    height: 80,
    speed: 6
};

let computer = {
    x: 765,
    y: 160,
    width: 15,
    height: 80,
    speed: 4
};

let ball = {
    x: 400,
    y: 200,
    size: 12,
    speedX: 5,
    speedY: 5
};

let keys = {};

document.addEventListener("keydown", e => {
    keys[e.key] = true;
});

document.addEventListener("keyup", e => {
    keys[e.key] = false;
});


function draw(){

    ctx.clearRect(0,0,canvas.width,canvas.height);


    // orta çizgi
    ctx.setLineDash([10,10]);
    ctx.beginPath();
    ctx.moveTo(400,0);
    ctx.lineTo(400,400);
    ctx.strokeStyle="white";
    ctx.stroke();
    ctx.setLineDash([]);


    // oyuncu raketi
    ctx.fillStyle="#00eaff";
    ctx.fillRect(
        player.x,
        player.y,
        player.width,
        player.height
    );


    // bilgisayar raketi
    ctx.fillStyle="#ff66ff";
    ctx.fillRect(
        computer.x,
        computer.y,
        computer.width,
        computer.height
    );


    // top
    ctx.beginPath();
    ctx.arc(
        ball.x,
        ball.y,
        ball.size,
        0,
        Math.PI*2
    );
    ctx.fillStyle="white";
    ctx.fill();
}


function update(){

    // oyuncu hareketi

    if(keys["ArrowUp"]){
        player.y -= player.speed;
    }

    if(keys["ArrowDown"]){
        player.y += player.speed;
    }


    // sınırlar

    if(player.y < 0)
        player.y = 0;

    if(player.y + player.height > canvas.height)
        player.y = canvas.height-player.height;



    // bilgisayar yapay zekası

    if(computer.y + computer.height/2 < ball.y){
        computer.y += computer.speed;
    }

    else {
        computer.y -= computer.speed;
    }



    // top hareketi

    ball.x += ball.speedX;
    ball.y += ball.speedY;


    // duvar çarpması

    if(ball.y < 0 || ball.y > canvas.height){
        ball.speedY *= -1;
    }


    // oyuncu çarpışma

    if(
        ball.x < player.x + player.width &&
        ball.x > player.x &&
        ball.y > player.y &&
        ball.y < player.y + player.height
    ){
        ball.speedX *= -1;
    }


    // bilgisayar çarpışma

    if(
        ball.x + ball.size > computer.x &&
        ball.x < computer.x + computer.width &&
        ball.y > computer.y &&
        ball.y < computer.y + computer.height
    ){
        ball.speedX *= -1;
    }



    // skor

    if(ball.x < 0){

        computerScore++;
        computerScoreText.textContent = computerScore;
        resetBall();

    }


    if(ball.x > canvas.width){

        playerScore++;
        playerScoreText.textContent = playerScore;
        resetBall();

    }

}


function resetBall(){

    ball.x = 400;
    ball.y = 200;

    ball.speedX *= -1;

}



function restartGame(){

    playerScore = 0;
    computerScore = 0;

    playerScoreText.textContent = 0;
    computerScoreText.textContent = 0;

    resetBall();

}



function gameLoop(){

    update();
    draw();

    requestAnimationFrame(gameLoop);

}


gameLoop();