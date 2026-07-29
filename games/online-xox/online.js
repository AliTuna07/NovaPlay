import { db } from "./firebase.js";


import {
doc,
setDoc,
getDoc,
updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";



let playerId = localStorage.getItem("playerId");


if(!playerId){

    playerId = crypto.randomUUID();

    localStorage.setItem(
        "playerId",
        playerId
    );

}



const createBtn =
document.getElementById("create");


const joinBtn =
document.getElementById("join");


const username =
document.getElementById("username");


const roomCode =
document.getElementById("roomCode");


const status =
document.getElementById("status");





function createCode(){

return Math.random()
.toString(36)
.substring(2,8)
.toUpperCase();

}







// ODA OLUŞTUR


createBtn.onclick = async()=>{


let code=createCode();


await setDoc(
doc(db,"xoxRooms",code),{


players:{


X:{

id:playerId,

name:
username.value || "Misafir"

},


O:null


},



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


turn:"X"


});



localStorage.setItem(
"room",
code
);


localStorage.setItem(
"side",
"X"
);



status.textContent =
"X olarak oda oluşturuldu: "+code;


};









// ODAYA KATIL


joinBtn.onclick = async()=>{


let code =
roomCode.value.toUpperCase();



let ref =
doc(db,"xoxRooms",code);



let snap =
await getDoc(ref);



if(!snap.exists()){

status.textContent =
"Oda bulunamadı";

return;

}




let data=snap.data();



if(data.players.O){

status.textContent =
"Oda dolu";

return;

}




await updateDoc(ref,{

"players.O":{

id:playerId,

name:
username.value || "Misafir"

}

});




localStorage.setItem(
"room",
code
);



localStorage.setItem(
"side",
"O"
);



status.textContent =
"O olarak katıldın";



};