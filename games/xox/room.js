import { initializeApp } from 
"https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getFirestore,
    doc,
    onSnapshot,
    updateDoc
} from 
"https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let gameFinished = false;
let rewardGiven = false;
const firebaseConfig = {

    apiKey: "AIzaSyAYFP6B_nK5wpsDes8h0bOcyOAcvRNpvfc",
    authDomain: "novaplay-5fc85.firebaseapp.com",
    projectId: "novaplay-5fc85",
    storageBucket: "novaplay-5fc85.firebasestorage.app",
    messagingSenderId: "144086098290",
    appId: "1:144086098290:web:d36c076f4cce2cc197fdeb"

};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


const roomCode = localStorage.getItem("roomCode");
const player = localStorage.getItem("player");


console.log("Oyuncu:", player);
console.log("Oda:", roomCode);



const roomRef = doc(db, "odalar", roomCode);
if (player === "X") {

    updateDoc(roomRef, {
        playerXOnline: true
    });

} else {

    updateDoc(roomRef, {
        playerOOnline: true
    });

}


const cells = document.querySelectorAll(".cell");
const status = document.getElementById("status");
const roomTitle = document.getElementById("roomTitle");
const rematchBtn = document.getElementById("rematchBtn");
const winCount = document.getElementById("winCount");
const playerXAvatar = document.getElementById("playerXAvatar");
const playerXName = document.getElementById("playerXName");
const playerXLevel = document.getElementById("playerXLevel");
const playerXCoins = document.getElementById("playerXCoins");
const playerXWins = document.getElementById("playerXWins");

const playerOAvatar = document.getElementById("playerOAvatar");
const playerOName = document.getElementById("playerOName");
const playerOLevel = document.getElementById("playerOLevel");
const playerOCoins = document.getElementById("playerOCoins");
const playerOWins = document.getElementById("playerOWins");
winCount.textContent =
"🏆 Galibiyet: " + (localStorage.getItem("novaWins") || 0);
rematchBtn.onclick = async ()=>{

    if(player === "X"){

        await updateDoc(roomRef,{
            rematchX:true
        });

    }else{

        await updateDoc(roomRef,{
            rematchO:true
        });

    }


    status.textContent =
    "⌛ Rakibin onayı bekleniyor...";

};
rematchBtn.style.display = "none";
roomTitle.textContent = "🏠 Oda: " + roomCode;


let gameData = null;



onSnapshot(roomRef, async (snapshot)=>{


    if(!snapshot.exists()){

        status.textContent = "❌ Oda bulunamadı";
        return;

    }

if (!gameData.playerO) {

    status.textContent = "⌛ Rakip bekleniyor...";
    return;

}
    gameData = snapshot.data();
    if(gameData.playerX){

    playerXAvatar.textContent = gameData.playerX.avatar;
    playerXName.textContent = gameData.playerX.username;
    playerXLevel.textContent = "⭐ Seviye " + gameData.playerX.level;
    playerXCoins.textContent = "🪙 " + gameData.playerX.coins;
    playerXWins.textContent = "🏆 " + gameData.playerX.wins + " Galibiyet";

}

if(gameData.playerO){

    playerOAvatar.textContent = gameData.playerO.avatar;
    playerOName.textContent = gameData.playerO.username;
    playerOLevel.textContent = "⭐ Seviye " + gameData.playerO.level;
    playerOCoins.textContent = "🪙 " + gameData.playerO.coins;
    playerOWins.textContent = "🏆 " + gameData.playerO.wins + " Galibiyet";

}
    // Rakip ayrıldı mı?

if (player === "X" && gameData.playerO && !gameData.playerOOnline) {

    status.textContent = "❌ Rakip oyundan ayrıldı.";
    gameFinished = true;
    rematchBtn.style.display = "none";
    return;

}

if (player === "O" && !gameData.playerXOnline) {

    status.textContent = "❌ Rakip oyundan ayrıldı.";
    gameFinished = true;
    rematchBtn.style.display = "none";
    return;

}
    if(gameData.rematchX && gameData.rematchO){

    await updateDoc(roomRef,{

        board:[
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            ""
        ],

        turn:"X",

        finished:false,

        winner:"",

        rematchX:false,

        rematchO:false

    });

    gameFinished = false;

}
    if(gameData.finished){

    gameFinished = true;

}


    console.log("Firebase verisi:", gameData);



    gameData.board.forEach((value,index)=>{

        cells[index].textContent = value;

    });
console.log("Güncel tahta:", gameData.board);
if(player === "X"){
    checkWinner();
}


if(!gameFinished){

    if(gameData.turn === player){

        status.textContent = "🎯 Sıra sende";

    }else{

        status.textContent = "⏳ Rakibin sırası";

    }

}


});





cells.forEach((cell,index)=>{


    cell.onclick = async ()=>{
        console.log("Hücre tıklandı:", index);


        console.log("Tıklandı:", index);
        if(gameFinished || gameData.finished){
    return;
}



        if(!gameData){

            return;

        }


        if(gameData.turn !== player){

            return;

        }


        if(gameData.board[index] !== ""){

            return;

        }



        let newBoard = [...gameData.board];


        newBoard[index] = player;
        cells[index].textContent = player;



        await updateDoc(roomRef,{

            board:newBoard,

            turn: player === "X" ? "O" : "X"

        });


    };


});
function checkWinner(){

    if(!gameData) return;


    const board = gameData.board;


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


    for(const line of wins){

        const a = line[0];
        const b = line[1];
        const c = line[2];


        if(
            board[a] &&
            board[a] === board[b] &&
            board[a] === board[c]
        ){

            gameFinished = true;


            status.textContent =
            "🏆 Kazanan: " + board[a];
            giveReward(board[a]);


            rematchBtn.style.display = "block";
            rematchBtn.onclick = async ()=>{

    if(player === "X"){

        await updateDoc(roomRef,{
            rematchX:true
        });

    }else{

        await updateDoc(roomRef,{
            rematchO:true
        });

    }

    status.textContent =
    "⌛ Rakibin onayı bekleniyor...";

};


            updateDoc(roomRef,{
                finished:true,
                winner:board[a]
            });


            return;

        }

    }


    if(!board.includes("")){

        gameFinished = true;

        status.textContent = "🤝 Berabere";

        rematchBtn.style.display = "block";


        updateDoc(roomRef,{
            finished:true,
            winner:"draw"
        });

    }

}
function giveReward(winner){

    if(rewardGiven) return;

    if(winner !== player) return;


    rewardGiven = true;


    let xp =
    Number(localStorage.getItem("novaXP")) || 0;


    let coins =
    Number(localStorage.getItem("novaCoins")) || 0;


    let wins =
    Number(localStorage.getItem("novaWins")) || 0;


    xp += 50;
    coins += 25;
    wins += 1;


    localStorage.setItem("novaXP", xp);
    localStorage.setItem("novaCoins", coins);
    localStorage.setItem("novaWins", wins);


    alert(
        "🎉 Kazandın!\n\n⭐ +50 XP\n🪙 +25 NovaCoin\n🏆 +1 Galibiyet"
    );

}
window.addEventListener("beforeunload", () => {

    if (player === "X") {

        updateDoc(roomRef, {
            playerXOnline: false
        });

    } else {

        updateDoc(roomRef, {
            playerOOnline: false
        });

    }

});