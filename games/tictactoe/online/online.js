import { db } from "./firebase.js";


import {
    doc,
    setDoc,
    getDoc,
    updateDoc,
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

function getProfile() {
    return {
        name: username.value.trim() || "Misafir",
        avatar: localStorage.getItem("selectedAvatar") || "👾",
        frame: localStorage.getItem("selectedFrame") || "none",
        rank: localStorage.getItem("novaRank") || "Nova Oyuncusu",
        level: Number(localStorage.getItem("novaLevel")) || 1,
        xp: Number(localStorage.getItem("novaXP")) || 0,
        coins: Number(localStorage.getItem("novaCoins")) || 0,
        wins: Number(localStorage.getItem("novaWins")) || 0
    };
}
const randomMatch =
document.getElementById("randomMatch");


const waitingRef =
collection(db,"xoxWaiting");



randomMatch.onclick = async()=>{


status.textContent =
"🔍 Rakip aranıyor...";



const waiting =
await getDocs(waitingRef);



// Bekleyen yoksa

if(waiting.empty){


const me = await addDoc(waitingRef,{
    id: playerId,
    profile: getProfile(),
    createdAt: Date.now()
});



onSnapshot(me,(snap)=>{


const data=snap.data();



if(data.room){


localStorage.setItem(
"roomCode",
data.room
);



localStorage.setItem(
"side",
"X"
);



location.href="room.html";


}


});


return;

}







// Bekleyen oyuncu varsa


const opponent = waiting.docs.find(
    d => d.data().id !== playerId
);

if (!opponent) {

    status.textContent = "🔍 Rakip bekleniyor...";

    return;

}
const roomCode =
createCode();





await setDoc(
doc(db,"xoxRooms",roomCode),
{


players:{


X:{
    id: opponent.data().id,
    ...opponent.data().profile
},

O:{
    id: playerId,
    ...getProfile()
},


},



board:[

"","","",

"","","",

"","",""

],



turn:"X",



finished:false,
winner:""

}

);







await updateDoc(
doc(db,"xoxWaiting",opponent.id),
{

room:roomCode

}

);




await deleteDoc(
doc(db,"xoxWaiting",opponent.id)
);



localStorage.setItem(
"roomCode",
roomCode
);



localStorage.setItem(
"side",
"O"
);



location.href="room.html";

};
const createRoom =
document.getElementById("createRoom");


const username =
document.getElementById("username");


const status =
document.getElementById("status");



let playerId =
localStorage.getItem("playerId");



if(!playerId){

    playerId = crypto.randomUUID();

    localStorage.setItem(
        "playerId",
        playerId
    );

}




function createCode(){

    return Math.random()
    .toString(36)
    .substring(2,8)
    .toUpperCase();

}




createRoom.onclick = async()=>{


    const code = createCode();


    await setDoc(
        doc(db,"xoxRooms",code),
        {

            players:{

                X:{
    id: playerId,
    ...getProfile()
},

                O:null

            },


            board:[

                "","","",

                "","","",

                "","",""

            ],


            turn:"X",


            finished:false

        }
    );



    localStorage.setItem(
        "roomCode",
        code
    );


    localStorage.setItem(
        "side",
        "X"
    );



    status.innerHTML =
    `
    ✅ Oda oluşturuldu<br>
    Kodun: <b>${code}</b>
    `;
    setTimeout(()=>{

    location.href="room.html";

},1000);


};





const joinRoom =
document.getElementById("joinRoom");


const roomCode =
document.getElementById("roomCode");





joinRoom.onclick = async()=>{


    const code =
    roomCode.value.toUpperCase();



    if(!code){

        status.textContent =
        "❌ Oda kodu gir.";

        return;

    }




    const roomRef =
    doc(db,"xoxRooms",code);



    const snap =
    await getDoc(roomRef);




    if(!snap.exists()){


        status.textContent =
        "❌ Oda bulunamadı.";

        return;

    }




    const data =
    snap.data();




    if(data.players.O){


        status.textContent =
        "❌ Oda dolu.";

        return;

    }




    await updateDoc(roomRef,{

        "players.O":{
    id: playerId,
    ...getProfile()
}

    });




    localStorage.setItem(
        "roomCode",
        code
    );



    localStorage.setItem(
        "side",
        "O"
    );




    status.innerHTML =
    `
    ✅ Odaya katıldın!<br>
    Sen: O
    `;
    setTimeout(()=>{

    location.href="room.html";

},1000);


};