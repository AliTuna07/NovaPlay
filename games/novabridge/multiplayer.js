import * as THREE from "https://unpkg.com/three@0.179.1/build/three.module.js";

import {
    createCharacter,
    updateCharacterAnimation
} from "./character.js";

import { db } from "./firebase.js";

import {
    ref,
    set,
    get,
    onValue,
    onDisconnect,
    remove,
    update,
    push,
    runTransaction
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";
// ======================================
// OYUNCU
// ======================================

const playerId = crypto.randomUUID();

let roomId = null;

let players = {};
let finishedPlayers = {};
let bridgePattern = null;
let restartingRoom = false;
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

        const roomsRef =
            ref(db, "rooms");


        // ==================================
        // ATOMİK ODA EŞLEŞTİRME
        // ==================================

        const result =
            await runTransaction(
                roomsRef,
                currentRooms => {

                    const rooms =
                        currentRooms || {};

                    const now =
                        Date.now();


                    // ==================================
                    // AÇIK ODA ARA
                    // ==================================

                    for (const id in rooms) {

                        const room =
                            rooms[id];


                        if (!room) {
                            continue;
                        }


                        // Oyun başlamışsa geç
                        if (
                            room.started === true
                        ) {
                            continue;
                        }


                        // Eski/süresi dolmuş oda
                        if (
                            room.startTime &&
                            room.startTime <= now
                        ) {
                            continue;
                        }


                        const roomPlayers =
                            room.players || {};


                        const playerCount =
                            Object.keys(
                                roomPlayers
                            ).length;


                        // ==================================
                        // ODA UYGUN
                        // ==================================

                        if (
                            playerCount < 50
                        ) {

                            console.log(
                                "🎮 Açık oda bulundu:",
                                id
                            );


                            // Oyuncuyu doğrudan
                            // transaction içinde ekle
                            roomPlayers[playerId] = {

                                x: 0,
                                y: 0.6,
                                z: 3,
                                rotationY: 0,
                                name: getPlayerName(),
                                finished: false

                            };


                            room.players =
                                roomPlayers;


                            return rooms;

                        }

                    }


                    // ==================================
                    // YENİ ODA OLUŞTUR
                    // ==================================

                    const newRoomId =
                        generateRoomId();


                    const startTime =
                        now + 30000;


                    // ==================================
                    // ORTAK KÖPRÜ DESENİ
                    // ==================================

                    const newPattern = [];


                    for (
                        let i = 0;
                        i < 20;
                        i++
                    ) {

                        newPattern.push(

                            Math.random() < 0.5
                                ? "left"
                                : "right"

                        );

                    }


                    // ==================================
                    // ODAYI OLUŞTUR
                    // ==================================

                    rooms[newRoomId] = {

                        started: false,

                        startTime:

                            startTime,

                        bridgePattern:

                            newPattern,

                        players: {

                            [playerId]: {

                                x: 0,
                                y: 1,
                                z: 3,
                                rotationY: 0,
                                name: getPlayerName(),
                                finished: false


                            }

                        }

                    };


                    console.log(
                        "🆕 Yeni oda oluşturuldu:",
                        newRoomId
                    );


                    return rooms;

                }
            );


        // ==================================
        // TRANSACTION BAŞARISIZ
        // ==================================

        if (
            !result.committed
        ) {

            console.error(
                "❌ Oda eşleştirme başarısız."
            );

            return;

        }


        // ==================================
        // OYUNCUNUN HANGİ ODADA
        // OLDUĞUNU BUL
        // ==================================

        const rooms =
            result.snapshot.val() || {};


        let foundRoomId = null;


        for (const id in rooms) {

            const room =
                rooms[id];


            if (
                room?.players?.[playerId]
            ) {

                foundRoomId = id;

                break;

            }

        }


        if (!foundRoomId) {

            console.error(
                "❌ Oyuncunun odası bulunamadı!"
            );

            return;

        }


        roomId =
            foundRoomId;


        console.log(
            "🏠 KULLANILAN ROOM ID:",
            roomId
        );


        // ==================================
        // PLAYER REF
        // ==================================

        const playerRef =
            ref(
                db,
                `rooms/${roomId}/players/${playerId}`
            );


        // ==================================
        // OYUNCU ÇIKINCA SİL
        // ==================================

        onDisconnect(
            playerRef
        ).remove();


        // ==================================
        // ODA VERİSİNİ AL
        // ==================================

        const roomRef =
            ref(
                db,
                `rooms/${roomId}`
            );


        const roomSnapshot =
            await get(roomRef);


        if (
            !roomSnapshot.exists()
        ) {

            console.error(
                "❌ Oda bulunamadı:",
                roomId
            );

            return;

        }


        const roomData =
            roomSnapshot.val();


        // ==================================
        // ORTAK KÖPRÜ DESENİ
        // ==================================

        bridgePattern =
            roomData.bridgePattern || null;


        console.log(
            "🌉 ORTAK KÖPRÜ:",
            bridgePattern
        );


        // ==================================
        // OYUNCULARI DİNLE
        // ==================================

       listenPlayers();

       listenBrokenTiles();

       listenRoom();

       listenFinishedPlayers();
      



        console.log(
            "✅ ODAYA GİRİLDİ:",
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

                if (
                    room.started === true &&
                    !gameStarted
                ) {

                    gameStarted = true;

                    stopCountdown();

                    countdownStartTime = null;

                    hideWaitingRoom();


                    setTimeout(() => {

                        updateOtherPlayers();

                    }, 100);


                    window.dispatchEvent(
                        new CustomEvent(
                            "novabridge-game-start"
                        )
                    );


                    console.log(
                        "🎮 OYUN BAŞLADI!"
                    );

                    return;

                }


                // ==================================
                // BEKLEME ODASI
                // ==================================

                if (
                    room.started === false &&
                    room.startTime
                ) {

                    // Yeni tur başladıysa
                    // oyun durumunu sıfırla
                    if (gameStarted) {

                        gameStarted = false;

                        console.log(
                            "🔄 Yeni tur için oyun sıfırlandı."
                        );

                        window.dispatchEvent(
                            new CustomEvent(
                                "novabridge-round-reset"
                            )
                        );

                    }


                    showWaitingRoom();


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

    try {

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
            "🎮 Oyun başlatma sinyali gönderildi!"
        );

    }
    catch (error) {

        console.error(
            "❌ Oyun başlatılamadı:",
            error
        );

    }

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
export function updatePlayerFinished(finished) {

    if (!roomId || !gameStarted) {
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
            finished
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

            // ==================================
            // OYUNCULARI GÜNCELLE
            // ==================================

            for (const id in players) {

                if (id === playerId) {
                    continue;
                }

                const data =
                    players[id];

                if (!data) {
                    continue;
                }


                // ==================================
                // KARAKTER YOKSA OLUŞTUR
                // ==================================

                if (!otherPlayers[id]) {

                    const character =
    createCharacter(
        id,
        data.name || "Oyuncu"
    );
                    if (!character) {
                        console.error(
                            "❌ Karakter oluşturulamadı:",
                            id
                        );
                        continue;
                    }


                    character.position.set(
                        data.x ?? -1.5,
                        (data.y ?? 0.6) - 0.3,
                        data.z ?? 0
                    );
                    character.userData.targetX =
    data.x ?? -1.5;

character.userData.targetY =
    (data.y ?? 0.6) - 0.3;

character.userData.targetZ =
    data.z ?? 0;

character.userData.targetRotationY =
    data.rotationY ?? 0;


                    character.rotation.y =
                        data.rotationY ?? 0;


                    character.userData.lastX =
                        data.x ?? -1.5;

                    character.userData.lastZ =
                        data.z ?? 0;

                    character.userData.isMoving =
                        false;
                        character.userData.lastMoveTime = 0;


                    scene.add(
                        character
                    );


                    otherPlayers[id] =
                        character;


                    console.log(
                        "👤 Oyuncu oluşturuldu:",
                        id
                    );

                }


                // ==================================
                // KARAKTERİ TEKRAR AL
                // ==================================

                const character =
                    otherPlayers[id];


                // Karakter herhangi bir nedenle
                // yoksa bu turu atla
                if (!character) {
                    continue;
                }


                // ==================================
                // YENİ KONUM
                // ==================================

                const currentX =
                    data.x ?? -1.5;

                const currentY =
                    data.y ?? 0.6;

                const currentZ =
                    data.z ?? 0;


                const lastX =
                    character.userData.lastX ??
                    currentX;

                const lastZ =
                    character.userData.lastZ ??
                    currentZ;


                // ==================================
                // HAREKET Mİ EDİYOR?
                // ==================================

                const distanceMoved =
    Math.hypot(
        currentX - lastX,
        currentZ - lastZ
    );

if (distanceMoved > 0.005) {

    character.userData.isMoving = true;

    character.userData.lastMoveTime =
        performance.now();

}
else {

    const timeSinceMove =
        performance.now() -
        (character.userData.lastMoveTime || 0);

    character.userData.isMoving =
        timeSinceMove < 150;

}


                // ==================================
                // KONUMU GÜNCELLE
                // ==================================

                character.userData.targetX = currentX;
                character.userData.targetY = currentY;
                character.userData.targetZ = currentZ;
                character.userData.targetRotationY =
                    data.rotationY ?? 0;


                // ==================================
                // SON KONUMU KAYDET
                // ==================================

                character.userData.lastX =
                    currentX;

                character.userData.lastZ =
                    currentZ;

            }


            // ==================================
            // AYRILAN OYUNCULAR
            // ==================================

            for (
                const id in otherPlayers
            ) {

                if (!players[id]) {

                    const character =
                        otherPlayers[id];


                    if (character) {

                        scene.remove(
                            character
                        );


                        character.traverse(
                            object => {

                                if (
                                    object.geometry
                                ) {

                                    object.geometry.dispose();

                                }

                                if (
                                    object.material
                                ) {

                                    if (
                                        Array.isArray(
                                            object.material
                                        )
                                    ) {

                                        object.material.forEach(
                                            material => {
                                                material.dispose();
                                            }
                                        );

                                    }
                                    else {

                                        object.material.dispose();

                                    }

                                }

                            }
                        );

                    }


                    delete otherPlayers[id];

                }

            }

        })
        .catch(error => {

            console.error(
                "❌ Oyuncu güncelleme hatası:",
                error
            );

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


    const oldRoomId = roomId;

await remove(
    ref(
        db,
        `rooms/${oldRoomId}/players/${playerId}`
    )
);

if (oldRoomId) {

    await remove(
        ref(
            db,
            `rooms/${oldRoomId}/brokenTiles`
        )
    );

}

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
// ======================================
// KIRILAN CAMI GÖNDER
// ======================================

export async function sendBrokenTile(
    side,
    index
) {

    if (!roomId) {
        return;
    }

    await set(

        ref(
            db,
            `rooms/${roomId}/brokenTiles/${side}-${index}`
        ),

        {
            side,
            index
        }

    );

}
// ======================================
// KIRILAN CAMLARI DİNLE
// ======================================

function listenBrokenTiles() {

    if (!roomId) {
        return;
    }

    const brokenTilesRef =
        ref(
            db,
            `rooms/${roomId}/brokenTiles`
        );

    onValue(
        brokenTilesRef,
        snapshot => {

            if (!snapshot.exists()) {
                return;
            }

            const tiles =
                snapshot.val();

            import("./bridge.js")
                .then(
                    ({
                        breakTile
                    }) => {

                        for (
                            const key in tiles
                        ) {

                            const tile =
                                tiles[key];

                            breakTile(
                                tile.side,
                                tile.index
                            );

                        }

                    }
                );

        }
    );

}
// ======================================
// ORTAK KÖPRÜ DESENİNİ AL
// ======================================

export function getBridgePattern() {

    return bridgePattern;

}
export function updateAllCharacterAnimations(delta) {

    for (const id in otherPlayers) {

        const character =
            otherPlayers[id];

        if (!character) {
            continue;
        }

        updateCharacterAnimation(
            character,
            character.userData.isMoving === true,
            delta
        );

    }

}
export function updateOtherPlayerMovement() {

    for (const id in otherPlayers) {

        const character =
            otherPlayers[id];

        // Karakter tamamen yoksa geç
        if (!character) {
            continue;
        }

        // Three.js objesi sahneden silinmişse geç
        if (!character.position) {
            continue;
        }

        if (
            character.userData.targetX === undefined ||
            character.userData.targetY === undefined ||
            character.userData.targetZ === undefined
        ) {
            continue;
        }

        character.position.x +=
            (
                character.userData.targetX -
                character.position.x
            ) * 0.15;

        character.position.y +=
            (
                character.userData.targetY -
                character.position.y
            ) * 0.15;

        character.position.z +=
            (
                character.userData.targetZ -
                character.position.z
            ) * 0.15;

        const targetRotation =
            character.userData.targetRotationY ?? 0;

        character.rotation.y +=
            (
                targetRotation -
                character.rotation.y
            ) * 0.15;
    }

}
// ======================================
// OYUNCU BİTİŞ PLATFORMUNA ULAŞTI
// ======================================

export async function setPlayerFinished() {

    if (!roomId) return;

    const playerName =
        players[playerId]?.name ||
        "Oyuncu";

    await set(
        ref(
            db,
            `rooms/${roomId}/finishedPlayers/${playerId}`
        ),
        {
            name: playerName,
            time: Date.now()
        }
    );

}
// ======================================
// YENİ TUR BAŞLAT
// ======================================

// ======================================
// YENİ TUR BAŞLAT
// ======================================

export async function restartRoom() {

    if (!roomId) return;

    try {

        const roomRef =
            ref(
                db,
                `rooms/${roomId}`
            );

        const snapshot =
            await get(roomRef);

        if (!snapshot.exists()) {
            return;
        }

        const room =
            snapshot.val();

        // Yeni 30 saniyelik bekleme
        const newStartTime =
            Date.now() + 30000;

        await update(
            roomRef,
            {
                started: false,
                startTime: newStartTime,
                finishedPlayers: null,
                brokenTiles: null
            }
        );

        // Oyuncuların durumunu sıfırla
        const currentPlayers =
            room.players || {};

        const updates = {};

        for (
            const id in currentPlayers
        ) {

            updates[
                `players/${id}/finished`
            ] = false;

            updates[
                `players/${id}/x`
            ] = 0;

            updates[
                `players/${id}/y`
            ] = 0.6;

            updates[
                `players/${id}/z`
            ] = 3;

            updates[
                `players/${id}/rotationY`
            ] = 0;

        }

        await update(
            roomRef,
            updates
        );

        console.log(
            "🔄 Yeni tur hazırlanıyor..."
        );

    }
    catch (error) {

        console.error(
            "❌ Yeni tur başlatılamadı:",
            error
        );

    }

}

// ======================================
// BİTİŞE ULAŞAN OYUNCULARI DİNLE
// ======================================

export function listenFinishedPlayers(
    callback = null
) {

    if (!roomId) return;

    const finishedRef =
        ref(
            db,
            `rooms/${roomId}/finishedPlayers`
        );

    onValue(
        finishedRef,
        snapshot => {

            finishedPlayers =
                snapshot.exists()
                    ? snapshot.val()
                    : {};

            // Callback verilmişse çalıştır
            if (typeof callback === "function") {

                callback(
                    finishedPlayers
                );

            }

            // Herkese tur sonu bilgisini gönder
            if (
                Object.keys(finishedPlayers).length > 0
            ) {

                window.dispatchEvent(
                    new CustomEvent(
                        "novabridge-round-finished",
                        {
                            detail: finishedPlayers
                        }
                    )
                );

            }

        }
    );

}
// ======================================
// YENİ TUR İÇİN HAZIR
// ======================================

export async function readyForNextRound() {

    if (!roomId) {
        return;
    }

    const playerRef =
        ref(
            db,
            `rooms/${roomId}/players/${playerId}`
        );

    try {

        await update(
            playerRef,
            {
                readyNextRound: true,
                finished: false,

                x: 0,
                y: 0.6,
                z: 3,

                rotationY: 0
            }
        );

        console.log(
            "🏠 Oyuncu yeni tur için odada kalıyor."
        );

    }
    catch (error) {

        console.error(
            "❌ Yeni tura hazırlanırken hata:",
            error
        );

    }

}