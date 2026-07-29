const cells = document.querySelectorAll(".cell");

const turnText = document.getElementById("turn");
const resultText = document.getElementById("result");
const restartBtn = document.getElementById("restart");


let board = [
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    ""
];


let currentPlayer = "X";

let gameOver = false;



const wins = [

    [0,1,2],
    [3,4,5],
    [6,7,8],

    [0,3,6],
    [1,4,7],
    [2,5,8],

    [0,4,8],
    [2,4,6]

];




// Hücre tıklama

cells.forEach((cell,index)=>{


    cell.onclick = ()=>{


        if(gameOver) return;


        if(board[index] !== "") return;



        board[index] = currentPlayer;


        cell.textContent = currentPlayer;
        cell.classList.add(
    currentPlayer.toLowerCase()
);



        checkWinner();



        if(!gameOver){

            currentPlayer =
            currentPlayer === "X"
            ? "O"
            : "X";


            turnText.textContent =
            "Sıra: " + currentPlayer;

        }


    };


});






function checkWinner(){


    for(let combo of wins){


        let a = combo[0];
        let b = combo[1];
        let c = combo[2];



        if(

            board[a] &&
            board[a] === board[b] &&
            board[a] === board[c]

        ){


            gameOver = true;


            resultText.textContent =
"🏆 Kazanan: " + board[a] + "!";


            turnText.textContent =
            "Oyun Bitti";


            return;

        }


    }




    if(!board.includes("")){


        gameOver = true;


        resultText.textContent =
        "🤝 Berabere";


        turnText.textContent =
        "Oyun Bitti";


    }



}







restartBtn.onclick = ()=>{


    board = [

        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""

    ];



    cells.forEach(cell=>{

        cell.textContent="";

    });



    currentPlayer="X";


    gameOver=false;


    turnText.textContent=
    "Sıra: X";


    resultText.textContent="";


};