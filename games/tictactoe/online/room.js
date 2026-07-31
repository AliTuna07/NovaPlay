import { db } from "./firebase.js";



import {

doc,

onSnapshot,

updateDoc

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let rewardGiven = false;

const roomCode =
localStorage.getItem("roomCode");
if(!roomCode){

    alert("Oda bulunamadı.");
    location.href="index.html";

}


const side =
localStorage.getItem("side");



const roomRef =
doc(db,"xoxRooms",roomCode);



const cells =
document.querySelectorAll(".cell");


const status =
document.getElementById("status");


const roomInfo =
document.getElementById("roomInfo");



let gameData=null;



roomInfo.textContent =
"🏠 Oda: " + roomCode;






onSnapshot(roomRef,(snap)=>{


    if(!snap.exists()){

        status.textContent =
        "Oda bulunamadı";

        return;

    }



    gameData=snap.data();
    
   const playerX = gameData.players?.X;
const playerO = gameData.players?.O;

updatePlayerCard("X", playerX);
updatePlayerCard("O", playerO);

if(playerX){

    document.getElementById("playerXName").textContent =
        playerX.name;

    document.getElementById("playerXLevel").textContent =
        "⭐ " + playerX.level;

    document.getElementById("playerXCoins").textContent =
        "🪙 " + playerX.coins;

    document.getElementById("playerXAvatar").textContent =
        playerX.avatar;

}

if(playerO){

    document.getElementById("playerOName").textContent =
        playerO.name;

    document.getElementById("playerOLevel").textContent =
        "⭐ " + playerO.level;

    document.getElementById("playerOCoins").textContent =
        "🪙 " + playerO.coins;

    document.getElementById("playerOAvatar").textContent =
        playerO.avatar;

}



    gameData.board.forEach((value,index)=>{

        cells[index].textContent=value;

    });



if(gameData.finished){


    if(gameData.winner==="draw"){

        status.textContent =
        "🤝 Berabere!";


        giveDrawReward();


    }else{


        status.textContent =
        "🏆 Kazanan: "
        + gameData.winner;


        giveWinReward(gameData.winner);


    }


    return;

}


    if(gameData.turn===side){

        status.textContent =
        "🎯 Sıra sende";

    }else{

        status.textContent =
        "⏳ Rakibin sırası";

    }


});







cells.forEach(cell=>{


cell.onclick=async()=>{


    if(!gameData) return;


    // Oyun bittiyse hamle yapma
    if(gameData.finished) return;


    // Sıra sende değilse
    if(gameData.turn!==side) return;


    const index =
    cell.dataset.id;



    // Dolu kareye basma
    if(gameData.board[index] !== "") return;



    const newBoard =
    [...gameData.board];



    newBoard[index]=side;



    await updateDoc(roomRef,{

    board:newBoard,

    turn:
    side==="X" ? "O":"X"

});


checkWinner(newBoard);



};



});
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



async function checkWinner(board){


    for(const line of wins){

        const [a,b,c] = line;


        if(

            board[a] &&
            board[a] === board[b] &&
            board[a] === board[c]

        ){

            await updateDoc(roomRef,{

                finished:true,

                winner:board[a]

            });


            return;

        }

    }



    if(!board.includes("")){


        await updateDoc(roomRef,{

            finished:true,

            winner:"draw"

        });


    }

}
function giveWinReward(winner){


    if(rewardGiven) return;


    if(side !== winner) return;


    rewardGiven = true;



    let xp =
    Number(localStorage.getItem("novaXP")) || 0;


    let coins =
    Number(localStorage.getItem("novaCoins")) || 0;


    let wins =
    Number(localStorage.getItem("novaWins")) || 0;


addXP(50);

    coins += 25;

    wins++;



    localStorage.setItem(
        "novaXP",
        xp
    );


    localStorage.setItem(
        "novaCoins",
        coins
    );


    localStorage.setItem(
        "novaWins",
        wins
    );



    alert(
`🏆 Kazandın!

⭐ +50 XP
🪙 +25 NovaCoin
🏅 +1 Galibiyet`
    );

}




function giveDrawReward(){


    if(rewardGiven) return;


    rewardGiven=true;



    addXP(10);



}
function updatePlayerCard(side, player) {

    if (!player) return;

    document.getElementById(`player${side}Name`).textContent =
        player.name || "Misafir";

    document.getElementById(`player${side}Avatar`).textContent =
        player.avatar || "👾";

    document.getElementById(`player${side}Rank`).textContent =
        player.rank || "Nova Oyuncusu";

    document.getElementById(`player${side}Level`).textContent =
        "⭐ Seviye " + (player.level || 1);

    document.getElementById(`player${side}Coins`).textContent =
        "🪙 " + (player.coins || 0);

    document.getElementById(`player${side}Wins`).textContent =
        "🏆 " + (player.wins || 0);

    // XP Çubuğu
    const requiredXP = (player.level || 1) * 100;
    const percent = Math.min(
        ((player.xp || 0) / requiredXP) * 100,
        100
    );

    document.getElementById(`player${side}XP`).style.width =
        percent + "%";

    // Profil Çerçevesi
    const avatarFrame =
        document.getElementById(`player${side}AvatarFrame`);

    avatarFrame.className = "avatar";

    switch (player.frame) {

        case "bronze":
            avatarFrame.classList.add("frame-bronze");
            break;

        case "silver":
            avatarFrame.classList.add("frame-silver");
            break;

        case "gold":
            avatarFrame.classList.add("frame-gold");
            break;

        case "diamond":
            avatarFrame.classList.add("frame-diamond");
            break;

        default:
            avatarFrame.classList.add("frame-none");
            break;
    }

}