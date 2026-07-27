import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
const firebaseConfig = {
    apiKey: "AIzaSyAYFP6B_nK5wpsDes8h0bOcyOAcvRNpvfc",
    authDomain: "novaplay-5fc85.firebaseapp.com",
    projectId: "novaplay-5fc85",
    storageBucket: "novaplay-5fc85.firebasestorage.app",
    messagingSenderId: "144086098290",
    appId: "1:144086098290:web:d36c076f4cce2cc197fdeb",
    measurementId: "G-059QZBBV6Y"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const createBtn = document.getElementById("createRoom");
const joinBtn = document.getElementById("joinRoom");

const roomInput = document.getElementById("roomCode");
const playerInput = document.getElementById("playerName");
const status = document.getElementById("status");

createBtn.onclick = async () => {

    const code = Math.random().toString(36).substring(2,8).toUpperCase();

    await setDoc(doc(db,"rooms",code),{

        board:["","","","","","","","",""],

        turn:"X",

        playerX:playerInput.value,

        playerO:""

    });

    status.innerHTML =
        "✅ Oda oluşturuldu.<br>Kod: <b>"+code+"</b>";
localStorage.setItem("roomCode", code);
setTimeout(() => {

    location.href = "room.html";

}, 800);
};

joinBtn.onclick = async ()=>{

    const code = roomInput.value.toUpperCase();

    const ref = doc(db,"rooms",code);

    const snap = await getDoc(ref);

    if(!snap.exists()){

    alert("Oda bulunamadı.");
    return;

}

await updateDoc(ref, {

    playerO: playerInput.value

});

localStorage.setItem("roomCode", code);

location.href = "room.html";
};