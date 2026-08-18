import * as THREE from "https://unpkg.com/three@0.179.1/build/three.module.js";

import { db } from "./firebase.js";

import {
    ref,
    set,
    get,
    onValue,
    onDisconnect,
    remove,
    update
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";


// ======================================
// OYUNCU
// ======================================

const playerId = crypto.randomUUID();

let roomId = null;

let players = {};

const otherPlayers = {};


// ======================================
// OYUN DURUMU
// ======================================

let gameStarted = false;

let roomListener = null;
let countdownTimer = null;
let countdownStartTime = null;
// ======================================
// OYUNCU ID
// ======================================

export function getPlayerId() {
    return playerId;
}


// ======================================
// ODA ID
// ======================================

export function getRoomId() {
    return roomId;
}


// ======================================
// OYUN BAŞLADI MI?
// ======================================

export function isGameStarted() {
    return gameStarted;
}


// ======================================
// RASTGELE ODA ID
// ======================================

function generateRoomId() {

    return "room-" +
        Math.random()
            .toString(36)
            .substring(2, 8);

}


// ======================================
// RASTGELE ODAYA GİR
// ======================================

export async function joinRandomRoom() {

    console.log("🔎 Açık oda aranıyor...");

    try {

        const roomsRef = ref(db, "rooms");

        const snapshot = await get(roomsRef);

        let selectedRoom = null;


        // ==================================
        // AÇIK ODA ARA
        // ==================================

        if (snapshot.exists()) {

            const rooms = snapshot.val();

            for (const id in rooms) {

                const room =
                    rooms[id];

                // Oyun başlamışsa geç
                if (room.started === true) {
                    continue;
                }


                const roomPlayers =
                    room.players || {};

                const playerCount =
                    Object.keys(
                        roomPlayers
                    ).length;


                if (playerCount < 50) {

                    selectedRoom = id;

                    break;

                }

            }

        }


        // ==================================
        // YENİ ODA
        // ==================================

        if (!selectedRoom) {

            selectedRoom =
                generateRoomId();

            console.log(
                "🆕 Yeni oda oluşturuluyor:",
                selectedRoom
            );

        }
        else {

            console.log(
                "🎮 Açık oda bulundu:",
                selectedRoom
            );

        }


        roomId =
            selectedRoom;


        // ==================================
        // OYUNCU
        // ==================================

        const playerRef =
            ref(
                db,
                `rooms/${roomId}/players/${playerId}`
            );


        await set(
            playerRef,
            {
                x: 0,
                y: 1,
                z: 3,
                rotationY: 0
            }
        );
        


        onDisconnect(
            playerRef
        ).remove();


        // ==================================
        // ODA BAŞLANGIÇ ZAMANI
        // ==================================

        const roomRef =
            ref(
                db,
                `rooms/${roomId}`
            );


        const roomSnapshot =
            await get(roomRef);


        if (!roomSnapshot.exists()) {

            return;

        }


        const roomData =
            roomSnapshot.val();


        // İlk oyuncuysa sayaç oluştur
        if (!roomData.startTime) {

            const startTime =
                Date.now() + 30000;


            await set(
                ref(
                    db,
                    `rooms/${roomId}/startTime`
                ),
                startTime
            );


            await set(
                ref(
                    db,
                    `rooms/${roomId}/started`
                ),
                false
            );


            console.log(
                "⏱️ 30 saniyelik bekleme başladı"
            );

        }


        // ==================================
        // OYUNCULARI DİNLE
        // ==================================

        listenPlayers();

        listenRoom();


        console.log(
            "✅ Odaya girildi:",
            roomId
        );

    }
    catch (error) {

        console.error(
            "❌ Odaya giriş hatası:",
            error
        );

    }

}


// ======================================
// OYUNCU ADINI AL
// ======================================

function getPlayerName() {

    const input =
        document.getElementById(
            "playerName"
        );


    return (
        input?.value.trim() ||
        "Oyuncu"
    );

}


// ======================================
// ODAYI DİNLE
// ======================================

function listenRoom() {

    if (!roomId) return;

    const roomRef =
        ref(
            db,
            `rooms/${roomId}`
        );

    roomListener =
        onValue(
            roomRef,
            snapshot => {

                if (!snapshot.exists()) {
                    return;
                }

                const room =
                    snapshot.val();


                // ==================================
                // OYUN BAŞLADI
                // ==================================

                if (room.started === true) {

                    if (!gameStarted) {

                        gameStarted = true;

                        stopCountdown();

                        countdownStartTime = null;

                        hideWaitingRoom();

                        window.dispatchEvent(
                            new CustomEvent(
                                "novabridge-game-start"
                            )
                        );

                        console.log(
                            "🎮 OYUN BAŞLADI!"
                        );

                    }

                    return;

                }


                // ==================================
                // BEKLEME ODASI
                // ==================================

                if (
                    room.startTime &&
                    !gameStarted
                ) {

                    // Bekleme ekranını göster
                    showWaitingRoom();


                    // Aynı sayaç zaten çalışıyorsa
                    // tekrar başlatma
                    if (
                        countdownStartTime !==
                        room.startTime
                    ) {

                        countdownStartTime =
                            room.startTime;

                        startCountdown(
                            room.startTime
                        );

                    }

                }

            }
        );

}
function startCountdown(startTime) {

    stopCountdown();


    updateWaitingRoom(
        startTime
    );


    countdownTimer =
        setInterval(
            () => {

                updateWaitingRoom(
                    startTime
                );

            },
            1000
        );

}
function stopCountdown() {

    if (countdownTimer) {

        clearInterval(
            countdownTimer
        );

        countdownTimer = null;

    }

}

// ======================================
// BEKLEME ODASI
// ======================================

function showWaitingRoom() {

    let screen =
        document.getElementById(
            "waiting-room"
        );


    if (screen) {

        screen.style.display =
            "flex";

        return;

    }


    screen =
        document.createElement(
            "div"
        );

    screen.id =
        "waiting-room";


    screen.innerHTML = `

        <div id="waiting-box">

            <h1>NovaBridge</h1>

            <h2>Bekleme Odası</h2>

            <p>
                Oyuncular bekleniyor...
            </p>

            <div id="waiting-countdown">
                30
            </div>

            <p>
                Oyuncu:
                <span id="waiting-player-count">
                    1
                </span>
                / 50
            </p>

        </div>

    `;


    document.body.appendChild(
        screen
    );

}



// ======================================
// GERİ SAYIM
// ======================================

function updateWaitingRoom(
    startTime
) {

    const countdown =
        document.getElementById(
            "waiting-countdown"
        );


    if (!countdown) {
        return;
    }


    const remaining =
        Math.max(
            0,
            Math.ceil(
                (
                    startTime -
                    Date.now()
                ) / 1000
            )
        );


    countdown.textContent =
        remaining;


    const playerCount =
        document.getElementById(
            "waiting-player-count"
        );


    if (playerCount) {

        playerCount.textContent =
            Object.keys(
                players
            ).length;

    }


    // ==============================
    // SÜRE BİTTİ
    // ==============================

    if (
        remaining <= 0 &&
        !gameStarted
    ) {

        startRoomGame();

    }

}

// ======================================
// ODAYI BAŞLAT
// ======================================

async function startRoomGame() {

    if (!roomId) return;

    if (gameStarted) return;


    const startedRef =
        ref(
            db,
            `rooms/${roomId}/started`
        );


    const snapshot =
        await get(startedRef);


    if (
        snapshot.exists() &&
        snapshot.val() === true
    ) {

        return;

    }


    await set(
        startedRef,
        true
    );


    console.log(
        "🎮 Oyun başlatıldı!"
    );

}

// ======================================
// BEKLEME ODASINI KAPAT
// ======================================

function hideWaitingRoom() {

    const waiting =
        document.getElementById(
            "waiting-room"
        );


    if (waiting) {

        waiting.remove();

    }

}


// ======================================
// KENDİ KONUMUMUZU GÖNDER
// ======================================

export function updatePlayerPosition(
    x,
    y,
    z,
    rotationY
) {

    if (
        !roomId ||
        !gameStarted
    ) {

        return;

    }


    const playerRef =
        ref(
            db,
            `rooms/${roomId}/players/${playerId}`
        );


    update(
        playerRef,
        {
            x,
            y,
            z,
            rotationY
        }
    );

}


// ======================================
// OYUNCULARI DİNLE
// ======================================

function listenPlayers() {

    const playersRef =
        ref(
            db,
            `rooms/${roomId}/players`
        );


    onValue(
        playersRef,
        snapshot => {

            if (
                !snapshot.exists()
            ) {

                players = {};

                updateGameInfoUI();

                return;

            }


            players =
                snapshot.val();


            updateGameInfoUI();

            updateOtherPlayers();

        }
    );

}


// ======================================
// DİĞER OYUNCULAR
// ======================================

function updateOtherPlayers() {

    if (!gameStarted) return;


    import("./script.js")
        .then(({ scene }) => {

            for (
                const id in players
            ) {

                if (
                    id === playerId
                ) {

                    continue;

                }


                const data =
                    players[id];


                if (
                    !otherPlayers[id]
                ) {

                    const geometry =
                        new THREE.BoxGeometry(
                            1,
                            2,
                            1
                        );


                    const material =
                        new THREE.MeshStandardMaterial({
                            color: 0xff3333
                        });


                    const mesh =
                        new THREE.Mesh(
                            geometry,
                            material
                        );


                    mesh.position.set(
                        data.x ?? -1.5,
                        data.y ?? 1.1,
                        data.z ?? 0
                    );


                    mesh.rotation.y =
                        data.rotationY ?? 0;


                    scene.add(mesh);


                    otherPlayers[id] =
                        mesh;

                }


                const mesh =
                    otherPlayers[id];


                mesh.position.set(
                    data.x ?? -1.5,
                    data.y ?? 1.1,
                    data.z ?? 0
                );


                mesh.rotation.y =
                    data.rotationY ?? 0;

            }


            // ==================================
            // AYRILAN OYUNCULAR
            // ==================================

            for (
                const id in otherPlayers
            ) {

                if (
                    !players[id]
                ) {

                    scene.remove(
                        otherPlayers[id]
                    );


                    otherPlayers[id]
                        .geometry.dispose();


                    otherPlayers[id]
                        .material.dispose();


                    delete otherPlayers[id];

                }

            }

        });

}


// ======================================
// OYUNCULARI AL
// ======================================

export function getPlayers() {

    return players;

}


// ======================================
// ODADAN ÇIK
// ======================================

export async function leaveRoom() {

    if (!roomId) return;


    stopCountdown();


    const playerRef =
        ref(
            db,
            `rooms/${roomId}/players/${playerId}`
        );


    await remove(playerRef);


    roomId = null;

    gameStarted = false;

    countdownStartTime = null;


    hideWaitingRoom();


    console.log(
        "🚪 Odadan çıkıldı"
    );

}


// ======================================
// İZLEYİCİ OYUNCULARINI AL
// ======================================

export function getOtherPlayerMeshes() {

    return otherPlayers;

}


// ======================================
// SAĞ ÜST UI
// ======================================

export function updateGameInfoUI() {

    const playerCountElement =
        document.getElementById(
            "playerCount"
        );


    const roomElement =
        document.getElementById(
            "roomId"
        );


    if (playerCountElement) {

        playerCountElement.textContent =
            Object.keys(players).length;

    }


    if (roomElement) {

        roomElement.textContent =
            roomId || "-";

    }

}