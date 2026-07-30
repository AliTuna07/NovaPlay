// =========================
// NovaPlay Bomberman
// enemy.js
// =========================

const enemies = [];

function getEnemyCount(){

    return getLevel().enemies;

}

spawnEnemies();

function spawnEnemies(){

    enemies.length = 0;

    while(enemies.length < getEnemyCount()){
        const x = Math.floor(Math.random()*COLS);
        const y = Math.floor(Math.random()*ROWS);

        if(!isWalkable(x,y))
            continue;

        // Oyuncuya çok yakın doğmasın
        if(x<=3 && y<=3)
            continue;

        enemies.push({

            x:x*TILE + TILE/2,
            y:y*TILE + TILE/2,

            width:40,
            height:40,

            speed:1.5,

            dir:Math.floor(Math.random()*4),

            dead:false

        });

    }

}

function updateEnemies(){

    for(const enemy of enemies){

        if(enemy.dead)
            continue;

        let dx=0;
        let dy=0;

        switch(enemy.dir){

            case 0: dx=enemy.speed; break;
            case 1: dx=-enemy.speed; break;
            case 2: dy=enemy.speed; break;
            case 3: dy=-enemy.speed; break;

        }

        if(canEnemyMove(enemy,dx,dy)){

            enemy.x+=dx;
            enemy.y+=dy;

        }else{

            enemy.dir=Math.floor(Math.random()*4);

        }

        // Bazen kendi isteğiyle yön değiştir
        if(Math.random()<0.01){

            enemy.dir=Math.floor(Math.random()*4);

        }

        // Oyuncuya çarpma

        const distX=Math.abs(enemy.x-player.x);
        const distY=Math.abs(enemy.y-player.y);

        if(
            distX<32 &&
            distY<32
        ){

            damagePlayer();

        }

    }

}

function canEnemyMove(enemy,dx,dy){

    const left=Math.floor((enemy.x+dx-enemy.width/2)/TILE);
    const right=Math.floor((enemy.x+dx+enemy.width/2-1)/TILE);

    const top=Math.floor((enemy.y+dy-enemy.height/2)/TILE);
    const bottom=Math.floor((enemy.y+dy+enemy.height/2-1)/TILE);

    return(

        isWalkable(left,top)&&
        isWalkable(right,top)&&
        isWalkable(left,bottom)&&
        isWalkable(right,bottom)

    );

}

function drawEnemies(){

    for(const enemy of enemies){

        if(enemy.dead)
            continue;

        ctx.save();

        ctx.translate(enemy.x,enemy.y);

        // Gölge
        ctx.fillStyle="rgba(0,0,0,.25)";

        ctx.beginPath();

        ctx.ellipse(
            0,
            18,
            16,
            6,
            0,
            0,
            Math.PI*2
        );

        ctx.fill();

        // Gövde
        ctx.fillStyle="#ff4b4b";

        ctx.beginPath();

        ctx.arc(
            0,
            0,
            16,
            0,
            Math.PI*2
        );

        ctx.fill();

        // Gözler
        ctx.fillStyle="white";

        ctx.beginPath();

        ctx.arc(-5,-4,3,0,Math.PI*2);
        ctx.arc(5,-4,3,0,Math.PI*2);

        ctx.fill();

        ctx.fillStyle="black";

        ctx.beginPath();

        ctx.arc(-5,-4,1.5,0,Math.PI*2);
        ctx.arc(5,-4,1.5,0,Math.PI*2);

        ctx.fill();

        ctx.restore();

    }

}

function killEnemy(enemy){

    if(enemy.dead)
        return;

    enemy.dead=true;

    addCoins(20);
    addXP(15);
checkLevelComplete();
}
function checkLevelComplete() {

    for (const enemy of enemies) {

        if (!enemy.dead) {
            return;
        }

    }

    exitDoor.revealed = true;

}