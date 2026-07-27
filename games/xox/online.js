import { initializeApp } from 
"https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";


import {
    getFirestore,
    doc,
    setDoc,
    getDoc
} from 
"https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";



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



const createRoom = document.getElementById("createRoom");
const joinRoom = document.getElementById("joinRoom");
const roomCodeInput = document.getElementById("roomCode");
const status = document.getElementById("status");



createRoom.onclick = async () => {


    let code = Math.random()
.toString(36)
.substring(2,8)
.toUpperCase()
.substring(0,6);

    await setDoc(
        doc(db,"odalar",code),
        {

            playerX:true,
            playerO:false,

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

        }
    );


    localStorage.setItem("roomCode",code);
    localStorage.setItem("player","X");


    location.href="room.html";


};



joinRoom.onclick = async () => {


    let code = roomCodeInput.value
    .toUpperCase();



    if(!code){

        alert("Oda kodu gir");

        return;

    }



    let roomRef = doc(db,"odalar",code);

    let snap = await getDoc(roomRef);



    if(!snap.exists()){

        alert("Oda bulunamadı");

        return;

    }



    let data = snap.data();



    if(data.playerO){

        alert("Oda dolu");

        return;

    }



    await setDoc(
        roomRef,
        {

            playerO:true

        },
        {
            merge:true
        }
    );



    localStorage.setItem("roomCode",code);
    localStorage.setItem("player","O");


    location.href="room.html";


};