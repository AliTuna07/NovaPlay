import { db } from "./firebase.js";


import {

doc,

onSnapshot,

updateDoc

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";



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



    gameData.board.forEach((value,index)=>{

        cells[index].textContent=value;

    });



if(gameData.finished){

    if(gameData.winner==="draw"){

        status.textContent =
        "🤝 Berabere!";

    }else{

        status.textContent =
        "🏆 Kazanan: "
        + gameData.winner;

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


    if(gameData.turn!==side) return;


    const index =
    cell.dataset.id;



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