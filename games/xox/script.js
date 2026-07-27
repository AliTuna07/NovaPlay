const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("status");

let currentPlayer = "X";

const wins = [
[0,1,2],[3,4,5],[6,7,8],
[0,3,6],[1,4,7],[2,5,8],
[0,4,8],[2,4,6]
];

cells.forEach(cell=>{
    cell.addEventListener("click",play);
});

function play(){

    if(this.textContent!="") return;

    this.textContent=currentPlayer;

    if(checkWin()){
        statusText.textContent=currentPlayer+" Kazandı!";
        cells.forEach(c=>c.removeEventListener("click",play));
        return;
    }
    addXP(10);
addCoins(15);

    if([...cells].every(c=>c.textContent!="")){
        statusText.textContent="Berabere!";
        return;
    }

    currentPlayer=currentPlayer=="X"?"O":"X";

    statusText.textContent="Sıra: "+currentPlayer;
}

function checkWin(){

    return wins.some(comb=>{
        return comb.every(i=>cells[i].textContent==currentPlayer);
    });

}
