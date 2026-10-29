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
let waitingUnsubscribe = null;
let waitingHeartbeat = null;



randomMatch.onclick = async () => {
    try {
        randomMatch.disabled = true;
        status.textContent = "🔍 Rakip aranıyor...";

        // Önceki bekleme dinleyicisini temizle
        if (waitingUnsubscribe) {
            waitingUnsubscribe();
            waitingUnsubscribe = null;
        }

        if (waitingHeartbeat) {
            clearInterval(waitingHeartbeat);
            waitingHeartbeat = null;
        }

        const now = Date.now();
        const waiting = await getDocs(waitingRef);

        // Eski bekleme kayıtlarını temizle
        for (const player of waiting.docs) {
            const data = player.data();

            if (
                !data.room &&
                (!data.lastSeen || now - data.lastSeen > 20000)
            ) {
                await deleteDoc(player.ref);
            }
        }

        // Güncel kayıtları yeniden oku
        const refreshed = await getDocs(waitingRef);

        const opponent = refreshed.docs.find((d) => {
            const data = d.data();

            return (
                data.id !== playerId &&
                !data.room &&
                data.lastSeen &&
                Date.now() - data.lastSeen <= 20000
            );
        });

        // Rakip yoksa sıraya gir
        if (!opponent) {
            const me = await addDoc(waitingRef, {
                id: playerId,
                profile: getProfile(),
                createdAt: Date.now(),
                lastSeen: Date.now(),
                room: null
            });

            waitingHeartbeat = setInterval(async () => {
                try {
                    await updateDoc(me, {
                        lastSeen: Date.now()
                    });
                } catch (error) {
                    console.error("Bekleme güncelleme hatası:", error);
                }
            }, 5000);

            waitingUnsubscribe = onSnapshot(me, async (snap) => {
                if (!snap.exists()) return;

                const data = snap.data();

                if (data.room) {
                    if (waitingHeartbeat) {
                        clearInterval(waitingHeartbeat);
                        waitingHeartbeat = null;
                    }

                    if (waitingUnsubscribe) {
                        waitingUnsubscribe();
                        waitingUnsubscribe = null;
                    }

                    localStorage.setItem("roomCode", data.room);
                    localStorage.setItem("side", "X");

                    try {
                        await deleteDoc(me);
                    } catch (error) {
                        console.warn("Bekleme kaydı temizlenemedi:", error);
                    }

                    location.href = "room.html";
                }
            });

            status.textContent = "🔍 Rakip bekleniyor...";
            randomMatch.disabled = false;
            return;
        }

        // Rakip bulundu, oda oluştur
        const roomCode = createCode();
        const opponentData = opponent.data();

        await setDoc(doc(db, "xoxRooms", roomCode), {
            players: {
                X: {
                    id: opponentData.id,
                    ...opponentData.profile
                },
                O: {
                    id: playerId,
                    ...getProfile()
                }
            },
            board: ["", "", "", "", "", "", "", "", ""],
            turn: "X",
            finished: false,
            winner: ""
        });

        // Rakibin bekleme kaydına oda kodunu yaz.
        // Kaydı hemen silme, rakibin dinleyicisi oda kodunu görmeli.
        await updateDoc(opponent.ref, {
            room: roomCode
        });

        localStorage.setItem("roomCode", roomCode);
        localStorage.setItem("side", "O");

        status.textContent = "✅ Rakip bulundu!";
        location.href = "room.html";

    } catch (error) {
        console.error("Rastgele eşleşme hatası:", error);
        status.textContent = "❌ Eşleşme başarısız: " + error.message;
        randomMatch.disabled = false;
    }
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