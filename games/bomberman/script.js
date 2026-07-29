const canvas=document.getElementById("gameCanvas");
const ctx=canvas.getContext("2d");

const TILE=64;

function update(){

}

function draw(){

ctx.clearRect(0,0,canvas.width,canvas.height);

drawWorld();
drawPlayer();

}

function gameLoop(){

update();
draw();

requestAnimationFrame(gameLoop);

}

gameLoop();