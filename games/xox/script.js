import { initializeApp } from 
"https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";


import {
getFirestore,
doc,
setDoc,
getDoc
}
from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


const firebaseConfig = {

apiKey: "AIzaSyAYFP6B_nK5wpsDes8h0bOcyOAcvRNpvfc",
authDomain: "novaplay-5fc85.firebaseapp.com",
projectId: "novaplay-5fc85",
storageBucket: "novaplay-5fc85.firebasestorage.app",
messagingSenderId:"144086098290",
appId:"1:144086098290:web:d36c076f4cce2cc197fdeb"

};


const app = initializeApp(firebaseConfig);

const db = getFirestore(app);


const roomInput=document.getElementById("roomCode");


document.getElementById("createBtn").onclick=async()=>{


let code=Math.random()
.toString(36)
.substring(2,7)
.toUpperCase();


await setDoc(
doc(db,"odalar",code),
{

playerX:"",
playerO:"",
board:[
"","","",
"","","",
"","",""
],

turn:"X"

});


localStorage.setItem("roomCode",code);
localStorage.setItem("player","X");


location.href="room.html";


};



document.getElementById("joinBtn").onclick=async()=>{


let code=roomInput.value;


let ref=doc(db,"odalar",code);

let snap=await getDoc(ref);



if(!snap.exists()){

alert("Oda bulunamadı");
return;

}



let data=snap.data();



if(data.playerO!==""){

alert("Oda dolu");
return;

}


await setDoc(
ref,
{
playerO:""
},
{merge:true}
);



localStorage.setItem("roomCode",code);
localStorage.setItem("player","O");


location.href="room.html";


};