const cells = document.querySelectorAll(".cell");
const status = document.getElementById("status");
const restartBtn = document.getElementById("restartBtn");

const gameOverScreen = document.getElementById("gameOverScreen");
const gameOverTitle = document.getElementById("gameOverTitle");
const playAgainBtn = document.getElementById("playAgainBtn");

let board = ["","","","","","","","",""];
let currentPlayer = "X";
let gameFinished = false;

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

cells.forEach((cell,index)=>{

    cell.addEventListener("click",()=>{

        if(gameFinished) return;

        if(board[index] !== "") return;

        board[index] = currentPlayer;

        cell.textContent = currentPlayer;

        // Hamle animasyonu
        cell.classList.remove("play");
        void cell.offsetWidth;
        cell.classList.add("play");

        if(checkWinner()) return;

        currentPlayer = currentPlayer === "X" ? "O" : "X";

        status.textContent = "🎯 Sıra: " + currentPlayer;

    });

});

function checkWinner(){

    for(const line of wins){

        const [a,b,c] = line;

        if(
            board[a] &&
            board[a] === board[b] &&
            board[a] === board[c]
        ){

            gameFinished = true;

            cells[a].classList.add("winner");
            cells[b].classList.add("winner");
            cells[c].classList.add("winner");

            status.textContent = "🏆 Kazanan: " + board[a];

            gameOverTitle.textContent =
            "🏆 " + board[a] + " Kazandı!";

            gameOverScreen.style.display = "flex";

            return true;

        }

    }

    if(!board.includes("")){

        gameFinished = true;

        status.textContent = "🤝 Berabere";

        gameOverTitle.textContent =
        "🤝 Berabere!";

        gameOverScreen.style.display = "flex";

        return true;

    }

    return false;

}

function restartGame(){

    board = ["","","","","","","","",""];

    currentPlayer = "X";

    gameFinished = false;

    status.textContent = "🎯 Sıra: X";

    cells.forEach(cell=>{

        cell.textContent = "";
        cell.classList.remove("winner");
        cell.classList.remove("play");

    });

    gameOverScreen.style.display = "none";

}

restartBtn.addEventListener("click", restartGame);
playAgainBtn.addEventListener("click", restartGame);