const board = document.getElementById("board");

const gameOverScreen = document.getElementById("gameOverScreen");
const gameOverTitle = document.getElementById("gameOverTitle");
const playAgainBtn = document.getElementById("playAgainBtn");


const SIZE = 8;

let currentPlayer = "white";
let selected = null;
let moves = [];

let game = [];


// Tahtayı oluştur
function createGame(){

    game = [];

    for(let r = 0; r < SIZE; r++){

        game[r] = [];

        for(let c = 0; c < SIZE; c++){

            let piece = null;


            if(r < 3 && (r+c)%2===1){
                piece = "black";
            }


            if(r > 4 && (r+c)%2===1){
                piece = "white";
            }


            game[r][c] = piece;

        }

    }

}


createGame();
drawBoard();


// Taş renk kontrolü

function isWhite(piece){

    return piece === "white" ||
           piece === "whiteKing";

}


function isBlack(piece){

    return piece === "black" ||
           piece === "blackKing";

}


// Hamle bul

function getMoves(r,c){

    moves=[];

    let piece = game[r][c];

    let directions=[];


    if(piece==="white"){

        directions=[
            [-1,-1],
            [-1,1]
        ];

    }


    else if(piece==="black"){

        directions=[
            [1,-1],
            [1,1]
        ];

    }


    else{

        directions=[
            [-1,-1],
            [-1,1],
            [1,-1],
            [1,1]
        ];

    }



    for(let d of directions){

        let r1=r+d[0];
        let c1=c+d[1];


        let r2=r+d[0]*2;
        let c2=c+d[1]*2;



        // boş kareye gitme

        if(
            r1>=0 && r1<8 &&
            c1>=0 && c1<8 &&
            game[r1][c1]===null
        ){

            moves.push({

                row:r1,
                col:c1,
                capture:false

            });

        }



        // taş yeme

        if(
            r2>=0 && r2<8 &&
            c2>=0 && c2<8
        ){

            let enemy = game[r1][c1];


            if(

                enemy &&
                (
                 isWhite(piece) ? isBlack(enemy)
                                : isWhite(enemy)
                )
                &&
                game[r2][c2]===null

            ){

                moves.push({

                    row:r2,
                    col:c2,
                    capture:true,

                    capturedRow:r1,
                    capturedCol:c1

                });

            }

        }

    }


}



// Tahta çiz

function drawBoard(){

    board.innerHTML="";


    for(let r=0;r<8;r++){

        for(let c=0;c<8;c++){


            let square=document.createElement("div");

            square.className="square";
            
            square.dataset.row = r;
square.dataset.col = c;


            if((r+c)%2===0)
                square.classList.add("light");
            else
                square.classList.add("dark");



            let piece=game[r][c];


            if(piece){


                let p=document.createElement("div");

                p.classList.add("piece");
                p.classList.add(piece);


                if(piece.includes("King")){

                    p.classList.add("king");

                }



                p.onclick=(e)=>{

                    e.stopPropagation();


                    if(
                        (currentPlayer==="white" && isWhite(piece)) ||
                        (currentPlayer==="black" && isBlack(piece))
                    ){

                        selected={
                            row:r,
                            col:c
                        };


                        getMoves(r,c);

                        drawBoard();

                    }


                };


                square.appendChild(p);
                p.classList.add("pop");

setTimeout(()=>{

    p.classList.remove("pop");

},250);


            }



            let move=moves.find(x=>

                x.row===r &&
                x.col===c

            );


            if(move){


                square.classList.add("move");


                square.onclick=()=>{

                    makeMove(move);

                };


            }


            board.appendChild(square);


        }

    }


}


let fromSquare =
document.querySelector(
`.square[data-row="${selected.row}"][data-col="${selected.col}"]`
);
// Hamle yap

function makeMove(move){


    let piece =
    game[selected.row][selected.col];


    game[move.row][move.col]=piece;
    let movedPiece =
game[move.row][move.col];

setTimeout(()=>{

    if(movedPiece){

        movedPiece.classList.add("moving");

    }

},10);


    game[selected.row][selected.col]=null;



    if(move.capture){

    let capturedSquare =
    document.querySelector(
    `.square[data-row="${move.capturedRow}"][data-col="${move.capturedCol}"]`
    );


    if(capturedSquare){

        let capturedPiece =
        capturedSquare.querySelector(".piece");


        if(capturedPiece){

            capturedPiece.classList.add("captureEffect");


            setTimeout(()=>{

                game[move.capturedRow][move.capturedCol]=null;

                drawBoard();

            },350);


            return;

        }

    }


    game[move.capturedRow][move.capturedCol]=null;

}


    // şah yapma

    if(
        game[move.row][move.col]==="white" &&
        move.row===0
    ){

        game[move.row][move.col]="whiteKing";

    }



    if(
        game[move.row][move.col]==="black" &&
        move.row===7
    ){

        game[move.row][move.col]="blackKing";

    }



    // tekrar yeme kontrolü

    if(move.capture){


        selected={
            row:move.row,
            col:move.col
        };


        getMoves(move.row,move.col);


        moves=moves.filter(m=>m.capture);



        if(moves.length>0){

            drawBoard();
            return;

        }


    }



    selected=null;
    moves=[];



    currentPlayer =
    currentPlayer==="white"
    ? "black"
    : "white";


    document.getElementById("status").textContent =
    currentPlayer==="white"
    ? "⚪ Sıra: Beyaz"
    : "⚫ Sıra: Siyah";



    checkGameOver();

    drawBoard();


}




function checkGameOver(){


    let white=0;
    let black=0;


    for(let r of game){

        for(let p of r){


            if(isWhite(p))
                white++;


            if(isBlack(p))
                black++;


        }

    }



    if(white===0){

        gameOverTitle.textContent="⚫ Siyah Kazandı!";
        gameOverScreen.style.display="flex";

    }


    if(black===0){

        gameOverTitle.textContent="⚪ Beyaz Kazandı!";
        gameOverScreen.style.display="flex";

    }


}



playAgainBtn.onclick=()=>{

    location.reload();

};