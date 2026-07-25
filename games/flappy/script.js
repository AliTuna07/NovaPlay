const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scoreText = document.getElementById("score");


let bird = {
    x:80,
    y:300,
    size:20,
    gravity:0.5,
    velocity:0,
    jump:-8
};


let pipes = [];

let score = 0;

let gameOver = false;

let countedPipes = [];



document.addEventListener("keydown", jump);

canvas.addEventListener("click", jump);



function jump(){

    if(gameOver) return;

    bird.velocity = bird.jump;

}



function createPipe(){

    let gap = 160;

    let height = Math.floor(Math.random()*250)+50;


    pipes.push({

        x: canvas.width,

        top: height,

        bottom: canvas.height-height-gap,

        width:50

    });

}



setInterval(()=>{

    if(!gameOver){

        createPipe();

    }

},2000);





function draw(){


    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );



    // kuş

    ctx.fillStyle="yellow";

    ctx.fillRect(
        bird.x,
        bird.y,
        bird.size,
        bird.size
    );



    // borular

    ctx.fillStyle="green";


    pipes.forEach(pipe=>{


        ctx.fillRect(
            pipe.x,
            0,
            pipe.width,
            pipe.top
        );


        ctx.fillRect(
            pipe.x,
            canvas.height-pipe.bottom,
            pipe.width,
            pipe.bottom
        );


    });



    if(!gameOver){


        bird.velocity += bird.gravity;

        bird.y += bird.velocity;



        pipes.forEach(pipe=>{


            pipe.x -= 3;



            // skor

            if(
                pipe.x + pipe.width < bird.x &&
                !countedPipes.includes(pipe)
            ){

                score++;

                scoreText.innerHTML=score;

                countedPipes.push(pipe);

            }



            // çarpışma

            if(

            bird.x < pipe.x + pipe.width &&

            bird.x + bird.size > pipe.x &&

            (
            bird.y < pipe.top ||
            bird.y + bird.size > canvas.height-pipe.bottom
            )

            ){

                endGame();

            }


        });



        if(
            bird.y < 0 ||
            bird.y > canvas.height
        ){

            endGame();

        }


    }



    requestAnimationFrame(draw);

}





function endGame(){

    gameOver=true;

    setTimeout(()=>{

        alert("Oyun Bitti! Skor: "+score);

    },100);

}





function restartGame(){

    location.reload();

}



draw();