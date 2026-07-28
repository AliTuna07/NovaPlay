import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    collection,
    addDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Oyuncuya benzersiz kimlik oluştur
let playerId = localStorage.getItem("playerId");

if (!playerId) {
    playerId = crypto.randomUUID();
    localStorage.setItem("playerId", playerId);
}

// Firebase
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

// HTML
const createRoom = document.getElementById("createRoom");
const joinRoom = document.getElementById("joinRoom");
const randomMatch = document.getElementById("randomMatch");
const roomCodeInput = document.getElementById("roomCode");
const status = document.getElementById("status");

const waitingCollection = collection(db, "waitingPlayers");


// =========================
// ODA OLUŞTUR
// =========================

createRoom.onclick = async () => {

    const code = Math.random()
        .toString(36)
        .substring(2,8)
        .toUpperCase();

    await setDoc(doc(db,"odalar",code),{

        playerX:{
    id: playerId,
    username: localStorage.getItem("username") || "Misafir",
    avatar: localStorage.getItem("avatar") || "👤",
    level: Number(localStorage.getItem("novaLevel")) || 1,
    xp: Number(localStorage.getItem("novaXP")) || 0,
    coins: Number(localStorage.getItem("novaCoins")) || 0,
    wins: Number(localStorage.getItem("novaWins")) || 0,
    online: true
},

playerO:null,

        playerXId:playerId,
        playerOId:"",

        playerXOnline:true,
        playerOOnline:false,

        board:[
            "","","",
            "","","",
            "","",""
        ],

        turn:"X",

        finished:false,
        winner:"",

        rematchX:false,
        rematchO:false

    });

    localStorage.setItem("roomCode",code);
    localStorage.setItem("player","X");

    location.href="room.html";

};


// =========================
// ODAYA KATIL
// =========================

joinRoom.onclick = async ()=>{

    const code = roomCodeInput.value.toUpperCase();

    if(!code){

        alert("Oda kodu gir.");

        return;

    }

    const roomRef = doc(db,"odalar",code);

    const snap = await getDoc(roomRef);

    if(!snap.exists()){

        alert("Oda bulunamadı.");

        return;

    }

    const data = snap.data();

    if(data.playerO){

        alert("Oda dolu.");

        return;

    }

    await updateDoc(roomRef,{

        playerO:{
    id: playerId,
    username: localStorage.getItem("username") || "Misafir",
    avatar: localStorage.getItem("avatar") || "👤",
    level: Number(localStorage.getItem("novaLevel")) || 1,
    xp: Number(localStorage.getItem("novaXP")) || 0,
    coins: Number(localStorage.getItem("novaCoins")) || 0,
    wins: Number(localStorage.getItem("novaWins")) || 0,
    online: true
}

    });

    localStorage.setItem("roomCode",code);
    localStorage.setItem("player","O");

    location.href="room.html";

};


// =========================
// RASTGELE EŞLEŞME
// =========================

randomMatch.onclick = async ()=>{

    status.textContent="🔍 Rakip aranıyor...";

    const waiting = await getDocs(waitingCollection);

    // Bekleyen yok
    if(waiting.empty){

        const myRef = await addDoc(waitingCollection,{
    playerId: playerId,
    username: localStorage.getItem("username") || "Misafir",
    avatar: localStorage.getItem("avatar") || "👤",
    level: Number(localStorage.getItem("novaLevel")) || 1,
    xp: Number(localStorage.getItem("novaXP")) || 0,
    coins: Number(localStorage.getItem("novaCoins")) || 0,
    wins: Number(localStorage.getItem("novaWins")) || 0,
    room:"",
    createdAt: Date.now()
});

        onSnapshot(myRef,(snap)=>{

            const data = snap.data();

            if(data && data.room !== ""){

                localStorage.setItem("roomCode",data.room);
                localStorage.setItem("player","X");

                location.href="room.html";

            }

        });

    }

    // Bekleyen biri var
    else{

        const first = waiting.docs[0];

        const roomCode = Math.random()
            .toString(36)
            .substring(2,8)
            .toUpperCase();

        await setDoc(doc(db,"odalar",roomCode),{

            playerX:{
    id:first.data().playerId,
    username:first.data().username,
    avatar:first.data().avatar,
    level:first.data().level,
    xp:first.data().xp,
    coins:first.data().coins,
    wins:first.data().wins,
    online:true
},

playerO:{
    id:playerId,
    username:localStorage.getItem("username") || "Misafir",
    avatar:localStorage.getItem("avatar") || "👤",
    level:Number(localStorage.getItem("novaLevel")) || 1,
    xp:Number(localStorage.getItem("novaXP")) || 0,
    coins:Number(localStorage.getItem("novaCoins")) || 0,
    wins:Number(localStorage.getItem("novaWins")) || 0,
    online:true
},

            playerXId:first.data().playerId,
            playerOId:playerId,

            playerXOnline:true,
            playerOOnline:true,

            board:[
                "","","",
                "","","",
                "","",""
            ],

            turn:"X",

            finished:false,
            winner:"",

            rematchX:false,
            rematchO:false

        });

        await updateDoc(first.ref,{
            room:roomCode
        });

        localStorage.setItem("roomCode",roomCode);
        localStorage.setItem("player","O");

        await deleteDoc(first.ref);

        location.href="room.html";

    }

};