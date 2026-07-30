// =========================
// NovaPlay Bomberman
// player.js
// =========================

const player = {

    x: TILE + TILE / 2,
    y: TILE + TILE / 2,

    width: 42,
    height: 42,

    speed: 3.2,

    bombs: 1,
    power: 1,

    lives: 3,

    coins: 0,
    xp: 0,

    invincible: false,
    invincibleTime: 0,

    direction: "down",

    animation: 0

};

function updatePlayer(keys){

    let moveX = 0;
    let moveY = 0;

    if(keys["ArrowLeft"] || keys["a"] || keys["A"]){

        moveX = -player.speed;
        player.direction="left";

    }

    if(keys["ArrowRight"] || keys["d"] || keys["D"]){

        moveX = player.speed;
        player.direction="right";

    }

    if(keys["ArrowUp"] || keys["w"] || keys["W"]){

        moveY = -player.speed;
        player.direction="up";

    }

    if(keys["ArrowDown"] || keys["s"] || keys["S"]){

        moveY = player.speed;
        player.direction="down";

    }

    movePlayer(moveX,moveY);

    player.animation += 0.18;

    if(player.invincible){

        player.invincibleTime--;

        if(player.invincibleTime<=0){

            player.invincible=false;

        }

    }

}

function movePlayer(dx,dy){

    if(dx===0 && dy===0) return;

    let nextX = player.x + dx;
    let nextY = player.y;

    if(canMove(nextX,nextY)){

        player.x = nextX;

    }

    nextX = player.x;
    nextY = player.y + dy;

    if(canMove(nextX,nextY)){

        player.y = nextY;

    }

}

function canMove(px,py){

    const left =
    Math.floor((px-player.width/2)/TILE);

    const right =
    Math.floor((px+player.width/2-1)/TILE);

    const top =
    Math.floor((py-player.height/2)/TILE);

    const bottom =
    Math.floor((py+player.height/2-1)/TILE);

    return (

        isWalkable(left,top) &&
        isWalkable(right,top) &&
        isWalkable(left,bottom) &&
        isWalkable(right,bottom)

    );

}

function drawPlayer(){

    if(player.invincible){

        if(Math.floor(Date.now()/80)%2===0){

            return;

        }

    }

    ctx.save();

    ctx.translate(player.x,player.y);

    const bounce =
    Math.sin(player.animation)*2;

    ctx.translate(0,bounce);

    // Gölge

    ctx.fillStyle="rgba(0,0,0,.25)";

    ctx.beginPath();

    ctx.ellipse(
        0,
        22,
        18,
        7,
        0,
        0,
        Math.PI*2
    );

    ctx.fill();

    // Gövde

    ctx.fillStyle="#4aa3ff";

    ctx.beginPath();

    ctx.arc(
        0,
        0,
        18,
        0,
        Math.PI*2
    );

    ctx.fill();

    // Yüz

    ctx.fillStyle="white";

    ctx.beginPath();

    ctx.arc(-6,-5,3,0,Math.PI*2);

    ctx.arc(6,-5,3,0,Math.PI*2);

    ctx.fill();

    // Göz

    ctx.fillStyle="black";

    ctx.beginPath();

    ctx.arc(-6,-5,1.5,0,Math.PI*2);

    ctx.arc(6,-5,1.5,0,Math.PI*2);

    ctx.fill();

    // Ayak

    ctx.fillStyle="#2b2b2b";

    const step =
    Math.sin(player.animation)*3;

    ctx.fillRect(-12,16+step,8,8);

    ctx.fillRect(4,16-step,8,8);

    ctx.restore();

}

function damagePlayer(){
    

    if(player.invincible) return;

    player.lives--;
    playSound("hurt", 0.8);

    player.invincible=true;

    player.invincibleTime=120;

    updateHUD();

    if(player.lives<=0){

    game.running = false;

    showGameOver("💀 Canların Bitti!");

}

}

function addCoins(amount){
    player.coins+=amount;
playSound("coin",0.7);
    updateHUD();

}

function addXP(amount){

    player.xp+=amount;

    updateHUD();

}