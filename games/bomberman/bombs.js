// =========================
// NovaPlay Bomberman
// bombs.js
// =========================
const powerUps = [];

const POWER_TYPES = [
    "bomb",
    "fire",
    "speed",
    "heart",
    "coin"
];
const bombs = [];
const explosions = [];

const BOMB_TIME = 180;       // 3 sn (60 FPS)
const EXPLOSION_TIME = 30;   // 0.5 sn

let spacePressed = false;

function updateBombs(keys){

    // Space ile bomba bırak
    if((keys[" "] || keys["Space"] || keys["Spacebar"]) && !spacePressed){

        placeBomb();

        spacePressed = true;
    }

    if(!(keys[" "] || keys["Space"] || keys["Spacebar"])){

        spacePressed = false;

    }

    // Bombalar

    for(let i=bombs.length-1;i>=0;i--){

        bombs[i].timer--;

        if(bombs[i].timer<=0){

            explodeBomb(i);

        }

    }

    // Patlamalar

    for(let i=explosions.length-1;i>=0;i--){

        explosions[i].timer--;

        if(explosions[i].timer<=0){

            explosions.splice(i,1);

        }

    }

}

function placeBomb(){

    if(player.bombs<=0) return;

    const tx=Math.floor(player.x/TILE);
    const ty=Math.floor(player.y/TILE);

    for(const b of bombs){

        if(b.x===tx && b.y===ty){

            return;

        }

    }

    bombs.push({
    x:tx,
    y:ty,
    timer:BOMB_TIME,
    power:player.power
});

playSound("bomb",0.6);

    

    player.bombs--;

    updateHUD();

}

function explodeBomb(index){

    const bomb=bombs[index];
     playSound("explosion",0.9);

    bombs.splice(index,1);

    player.bombs++;

    updateHUD();

    createExplosion(bomb.x,bomb.y);

    spreadExplosion(bomb.x,bomb.y,1,0,bomb.power);
    spreadExplosion(bomb.x,bomb.y,-1,0,bomb.power);
    spreadExplosion(bomb.x,bomb.y,0,1,bomb.power);
    spreadExplosion(bomb.x,bomb.y,0,-1,bomb.power);
   

}

function spreadExplosion(x,y,dx,dy,power){

    for(let i=1;i<=power;i++){

        const tx=x+dx*i;
        const ty=y+dy*i;

        if(tx<0||ty<0||tx>=COLS||ty>=ROWS){

            break;

        }

        if(world[ty][tx]===WALL){

            break;

        }

        createExplosion(tx,ty);

        if(world[ty][tx]===BOX){

            breakBox(tx,ty);
            break;
        }

    }

}

function createExplosion(x,y){

    explosions.push({

        x,
        y,
        timer:EXPLOSION_TIME

    });

    cameraShake = 10;

    // Oyuncu

    const playerTileX=Math.floor(player.x/TILE);
    const playerTileY=Math.floor(player.y/TILE);

    if(
        playerTileX===x &&
        playerTileY===y
    ){

        damagePlayer();

    }

    // Düşmanlar

    for(const enemy of enemies){

        if(enemy.dead)
            continue;

        const enemyTileX=Math.floor(enemy.x/TILE);
        const enemyTileY=Math.floor(enemy.y/TILE);

        if(
            enemyTileX===x &&
            enemyTileY===y
        ){

            killEnemy(enemy);

        }

    }

    // Zincirleme bomba

    for(const bomb of bombs){

        if(
            bomb.x===x &&
            bomb.y===y
        ){

            bomb.timer=1;

        }

    }

}

function drawBombs(){

    // Bombalar

    for(const bomb of bombs){

        const px=bomb.x*TILE+TILE/2;
        const py=bomb.y*TILE+TILE/2;

        const pulse = Math.sin(bomb.timer * 0.15) * 3;

ctx.fillStyle = "#1d1d1d";

ctx.beginPath();

ctx.arc(
    px,
    py,
    18 + pulse,
    0,
    Math.PI * 2
);

ctx.fill();

ctx.fillStyle = "white";

ctx.beginPath();

ctx.arc(
    px - 6,
    py - 6,
    5,
    0,
    Math.PI * 2
);

ctx.fill();

ctx.strokeStyle = "orange";
ctx.lineWidth = 4;

ctx.beginPath();

ctx.moveTo(
    px,
    py - 18 - pulse
);

ctx.lineTo(
    px + 8,
    py - 30 - pulse
);

ctx.stroke();
    }

    // Patlamalar

 for(const ex of explosions){

    const px = ex.x * TILE;
    const py = ex.y * TILE;

    const alpha = ex.timer / EXPLOSION_TIME;

    ctx.fillStyle = `rgba(255,170,0,${alpha})`;

    ctx.fillRect(
        px,
        py,
        TILE,
        TILE
    );

    ctx.fillStyle = `rgba(255,255,180,${alpha})`;

    ctx.beginPath();

    ctx.arc(
        px + TILE / 2,
        py + TILE / 2,
        16 + (1 - alpha) * 20,
        0,
        Math.PI * 2
    );

    ctx.fill();

}
}
function updatePowerUps(){

    const playerTileX = Math.floor(player.x / TILE);
    const playerTileY = Math.floor(player.y / TILE);

    for(let i=powerUps.length-1;i>=0;i--){

        const p = powerUps[i];

        if(
            p.x===playerTileX &&
            p.y===playerTileY
        ){

            switch(p.type){

                case "bomb":
                    player.bombs++;
                    break;

                case "fire":
                    player.power++;
                    break;

                case "speed":
                    player.speed += 0.4;
                    break;

                case "heart":
                    player.lives++;
                    break;

                case "coin":
                    addCoins(50);
                    break;

            }

            updateHUD();
            playSound("powerup", 0.7);

            powerUps.splice(i,1);

        }

    }

}
function drawPowerUps(){

    for(const p of powerUps){

        const px = p.x*TILE + TILE/2;
        const py = p.y*TILE + TILE/2;

        ctx.font="28px Arial";
        ctx.textAlign="center";
        ctx.textBaseline="middle";

        switch(p.type){

            case "bomb":
                ctx.fillText("💣",px,py);
                break;

            case "fire":
                ctx.fillText("🔥",px,py);
                break;

            case "speed":
                ctx.fillText("⚡",px,py);
                break;

            case "heart":
                ctx.fillText("❤️",px,py);
                break;

            case "coin":
                ctx.fillText("🪙",px,py);
                break;

        }

    }

}