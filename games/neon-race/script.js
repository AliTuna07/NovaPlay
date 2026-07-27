const hudScore =
document.getElementById("hudScore");

const hudCoin =
document.getElementById("hudCoin");

const hudXP =
document.getElementById("hudXP");
const playerCar = document.getElementById("playerCar");
const selectedCar =
localStorage.getItem("selectedCar") || "carStarter";
let carSettings = {

    carStarter:{
        emoji:"🚗",
        speed:7
    },


    carSpeed:{
        emoji:"🏎️",
        speed:9
    },


    carGT:{
        emoji:"🚘",
        speed:11
    }

};


let currentCar =
carSettings[selectedCar];
const enemyContainer = document.getElementById("enemyContainer");

const scoreText = document.getElementById("score");

const gameOver = document.getElementById("gameOver");

const finalScore = document.getElementById("finalScore");
const earnedCoin = document.getElementById("earnedCoin");
const earnedXP = document.getElementById("earnedXP");



let playerLane = 1;


// 4 şerit konumu

const lanes = [
    35,
    125,
    215,
    305
];


let enemies = [];

let score = 0;
let gameCoins = 0;
let gameXP = 0;
let coinsOnRoad = [];
let gameRunning = true;



// Oyuncu arabasını başlangıçta yerleştir

playerCar.style.left =
lanes[playerLane] + "px";
// NovaShop arabasını yükle

playerCar.textContent =
currentCar.emoji;

// Kontroller

document.addEventListener("keydown",(e)=>{


    if(!gameRunning) return;



    if(
        e.key === "ArrowLeft" ||
        e.key === "a"
    ){

        movePlayer(-1);

    }



    if(
        e.key === "ArrowRight" ||
        e.key === "d"
    ){

        movePlayer(1);

    }


});





function movePlayer(direction){


    playerLane += direction;
    if(direction === -1){

    playerCar.style.transform =
    "rotate(-10deg)";

}
else{

    playerCar.style.transform =
    "rotate(10deg)";

}


setTimeout(()=>{

    playerCar.style.transform =
    "rotate(0deg)";

},150);



    if(playerLane < 0)
        playerLane = 0;


    if(playerLane > 3)
        playerLane = 3;



    playerCar.style.left =
    lanes[playerLane]+"px";


}





// Düşman oluşturma

function createEnemy(){


    if(!gameRunning)
        return;



    let enemy =
    document.createElement("div");


    enemy.className="enemy";



    let lane =
    Math.floor(Math.random()*4);



    enemy.style.left =
    lanes[lane]+"px";


    enemy.style.top="-120px";



    enemyContainer.appendChild(enemy);



    enemies.push({

        element:enemy,

        lane:lane,

        y:-120

    });



}

function createCoin(){

    if(!gameRunning)
        return;


    let coin = document.createElement("div");

    coin.className = "coin";


    let lane =
    Math.floor(Math.random()*4);


    coin.style.left =
    lanes[lane]+"px";


    coin.style.top="-50px";


    enemyContainer.appendChild(coin);


    coinsOnRoad.push({

        element:coin,

        lane:lane,

        y:-50

    });

}




// Düşman hareketi

function updateEnemies(){



    enemies.forEach((enemy,index)=>{


       enemy.y += currentCar.speed;


        enemy.element.style.top =
        enemy.y+"px";



        // ekran dışına çıkınca sil

        if(enemy.y > 900){


            enemy.element.remove();


            enemies.splice(index,1);


            score += 10;


scoreText.textContent = score;


gameCoins = Math.floor(score / 20);

gameXP = Math.floor(score / 10);


hudScore.textContent = score;

hudCoin.textContent = gameCoins;

hudXP.textContent = gameXP;

        }



        checkCollision(enemy);



    });

// Coin hareketi ve toplama

coinsOnRoad.forEach((coin,index)=>{


    coin.y += currentCar.speed;


    coin.element.style.top =
    coin.y + "px";



    // Ekrandan çıkarsa sil

    if(coin.y > 900){


        coin.element.remove();


        coinsOnRoad.splice(index,1);


        return;

    }



    // Araba ile temas kontrolü

    if(coin.lane === playerLane){


        let playerRect =
        playerCar.getBoundingClientRect();


        let coinRect =
        coin.element.getBoundingClientRect();



        if(

            playerRect.left < coinRect.right &&

            playerRect.right > coinRect.left &&

            playerRect.top < coinRect.bottom &&

            playerRect.bottom > coinRect.top

        ){


            gameCoins++;


            hudCoin.textContent =
            gameCoins;



            coin.element.remove();


            coinsOnRoad.splice(index,1);


        }


    }


});

    if(gameRunning)

    requestAnimationFrame(updateEnemies);



}





// Çarpışma kontrolü

function checkCollision(enemy){



    if(enemy.lane !== playerLane)
        return;



    let playerRect =
    playerCar.getBoundingClientRect();


    let enemyRect =
    enemy.element.getBoundingClientRect();




    if(

        playerRect.left < enemyRect.right &&

        playerRect.right > enemyRect.left &&

        playerRect.top < enemyRect.bottom &&

        playerRect.bottom > enemyRect.top

    ){

        endGame();

    }


}





// Oyun bitiş

function endGame(){


    gameRunning=false;


    let coin = gameCoins;


    let xp =
    Math.floor(score/10);



    // NovaCoin ekle

    let totalCoins =
    Number(localStorage.getItem("novaCoins")) || 0;


    totalCoins += coin;


    localStorage.setItem(
        "novaCoins",
        totalCoins
    );



    // XP ekle

    let totalXP =
    Number(localStorage.getItem("xp")) || 0;


    totalXP += xp;


    localStorage.setItem(
        "xp",
        totalXP
    );



    finalScore.textContent = score;


    earnedCoin.textContent = coin;


    earnedXP.textContent = xp;



    gameOver.style.display = "flex";


}

// Yeni oyun

function restartGame(){


    location.reload();


}






// Ana menü

function goMenu(){


    window.location.href="../../index.html";


}





// düşman üretme

setInterval(()=>{


    createEnemy();


},1200);
setInterval(()=>{

    createCoin();

},2000);





// başlat

updateEnemies();
