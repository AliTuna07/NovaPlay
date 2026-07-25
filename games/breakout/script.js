const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scoreText = document.getElementById("score");
const playButton = document.getElementById("playButton");


let gameStarted = false;
let paused = false;
let gameOver = false;


let score = 0;
let lives = 3;



let ballX = 240;
let ballY = 250;

let dx = 3;
let dy = -3;

let ballRadius = 8;



let paddleWidth = 90;
let paddleHeight = 10;
let paddleX = 195;



const rows = 4;
const cols = 7;

let bricks = [];



function createBricks(){

    bricks=[];

    for(let r=0;r<rows;r++){

        bricks[r]=[];

        for(let c=0;c<cols;c++){

            bricks[r][c]={

                x:c*65+25,
                y:r*25+30,

                width:55,
                height:15,

                alive:true

            };

        }

    }

}



createBricks();



document.addEventListener("mousemove", e=>{

    let rect = canvas.getBoundingClientRect();

    paddleX = e.clientX - rect.left - paddleWidth/2;

});



document.addEventListener("keydown", e=>{

    if(e.code==="Space" && gameStarted){

        paused=!paused;

    }

});





function draw(){


ctx.clearRect(0,0,canvas.width,canvas.height);



// top

ctx.beginPath();

ctx.arc(
ballX,
ballY,
ballRadius,
0,
Math.PI*2
);

ctx.fillStyle="yellow";
ctx.fill();




// paddle

ctx.fillStyle="cyan";

ctx.fillRect(
paddleX,
canvas.height-20,
paddleWidth,
paddleHeight
);




// bricks

for(let r=0;r<rows;r++){

    for(let c=0;c<cols;c++){

        let b=bricks[r][c];

        if(b.alive){

            ctx.fillStyle="orange";

            ctx.fillRect(
            b.x,
            b.y,
            b.width,
            b.height
            );

        }

    }

}




if(gameStarted && !paused && !gameOver){


ballX += dx;
ballY += dy;



// duvar

if(
ballX + ballRadius > canvas.width ||
ballX - ballRadius < 0
){

dx=-dx;

}



if(ballY-ballRadius<0){

dy=-dy;

}





// paddle

if(
ballY+ballRadius >= canvas.height-20 &&
ballX > paddleX &&
ballX < paddleX+paddleWidth
){

dy=-dy;

}





// tuğla

for(let r=0;r<rows;r++){

for(let c=0;c<cols;c++){


let b=bricks[r][c];


if(
b.alive &&
ballX>b.x &&
ballX<b.x+b.width &&
ballY>b.y &&
ballY<b.y+b.height
){


dy=-dy;

b.alive=false;

score++;

scoreText.innerHTML=score;


}

}

}





// düşme

if(ballY > canvas.height){


lives--;


if(lives<=0){

gameOver=true;

alert("Oyun Bitti! Skor: "+score);

}


else{


ballX=240;
ballY=250;

dx=3;
dy=-3;


}


}




}



requestAnimationFrame(draw);


}





function startGame(){

gameStarted=true;

playButton.disabled=true;

playButton.innerHTML="Oyun Başladı";

}





function restartGame(){


score=0;

lives=3;


scoreText.innerHTML=score;


ballX=240;
ballY=250;


dx=3;
dy=-3;


gameOver=false;

paused=false;

gameStarted=false;


createBricks();


playButton.disabled=false;

playButton.innerHTML="Başlat";


}





draw();