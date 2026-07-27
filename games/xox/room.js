import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getFirestore,
    doc,
    getDoc,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
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

const roomTitle = document.getElementById("roomTitle");

const status = document.getElementById("status");

roomTitle.textContent =
"🏠 Oda : " + roomCode;
async function loadRoom(){

    const ref = doc(db, "rooms", roomCode);

    const snap = await getDoc(ref);

    if(!snap.exists()){

        status.textContent = "❌ Oda bulunamadı.";
        return;

    }

    status.textContent = "⌛ Rakip bekleniyor...";

}

loadRoom();
const roomRef = doc(db, "rooms", roomCode);

onSnapshot(roomRef, (snap) => {

    if (!snap.exists()) {
        return;
    }

    const room = snap.data();

    if (room.playerO !== "") {

        status.textContent = "🎉 Rakip bağlandı!";

    } else {

        status.textContent = "⌛ Rakip bekleniyor...";

    }

});
const roomRef = doc(db, "rooms", roomCode);

onSnapshot(roomRef, (snap)=>{

    if(!snap.exists()) return;

    const room = snap.data();

    if(room.playerO !== ""){

        status.textContent = "🎉 Rakip bağlandı!";

    }else{

        status.textContent = "⌛ Rakip bekleniyor...";

    }

});