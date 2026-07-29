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


const me =
await addDoc(waitingRef,{

    id:playerId,

    name:
    username.value || "Misafir",

    createdAt:
    Date.now()

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


const opponent =
waiting.docs[0];


const roomCode =
createCode();





await setDoc(
doc(db,"xoxRooms",roomCode),
{


players:{


X:{

id:
opponent.data().id,


name:
opponent.data().name

},



O:{

id:playerId,


name:
username.value || "Misafir"

}


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

                    id:playerId,

                    name:
                    username.value || "Misafir"

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

            id:playerId,

            name:
            username.value || "Misafir"

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