import * as THREE from "https://unpkg.com/three@0.179.1/build/three.module.js";

import { showGameOver } from "./ui.js";

import {
    joinRandomRoom,
    updatePlayerPosition,
    leaveRoom,
    getOtherPlayerMeshes,
    sendBrokenTile,
    getBridgePattern,
    updateAllCharacterAnimations,
    updateOtherPlayerMovement,
    setPlayerFinished,
    restartRoom,
    readyForNextRound
} from "./multiplayer.js";

import {
    createBridge,
    isSafeTile,
    breakTile
} from "./bridge.js";

import {
    createPlayer,
    player
} from "./player.js";

let gameOver = false;
let spectatorMode = false;
let spectatorTarget = null;

let spectatorIndex = 0;
let gameStarted = false;
const brokenTiles = new Set();
const clock = new THREE.Clock();
// ======================================
// SAHNE
// ======================================

export const scene = new THREE.Scene();


// ======================================
// KAMERA
// ======================================

export const camera =
    new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );


// ======================================
// RENDERER
// ======================================

const gameCanvas =
    document.getElementById("game");

export const renderer =
    new THREE.WebGLRenderer({
        canvas: gameCanvas,
        antialias: true
    });

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);


// ======================================
// KIRMIZI ARENA
// ======================================

scene.background =
    new THREE.Color(0x220000);

scene.fog =
    new THREE.Fog(
        0x220000,
        10,
        80
    );


const ambientLight =
    new THREE.AmbientLight(
        0xff2222,
        1.5
    );

scene.add(ambientLight);

const light =
    new THREE.DirectionalLight(
        0xff4444,
        2
    );

light.position.set(
    10,
    20,
    10
);

scene.add(light);

const redLight1 =
    new THREE.PointLight(
        0xff0000,
        80,
        100
    );

redLight1.position.set(
    -8,
    8,
    20
);

scene.add(redLight1);

const redLight2 =
    new THREE.PointLight(
        0xff0000,
        80,
        100
    );

redLight2.position.set(
    8,
    8,
    20
);

scene.add(redLight2);


function startGame() {

    if (gameStarted) return;

    gameStarted = true;

    // ==================================
    // ORTAK KÖPRÜ DESENİ
    // ==================================

    const pattern =
        getBridgePattern();

    console.log(
        "🌉 Ortak köprü deseni:",
        pattern
    );

    createBridge(
        pattern
    );
const finishPlatform =
    new THREE.Mesh(
        new THREE.BoxGeometry(5, 0.5, 5),
        new THREE.MeshStandardMaterial({
            color: 0x333333,
            emissive: 0x220000,
            emissiveIntensity: 0.5
        })
    );

finishPlatform.position.set(
    0,
    -0.25,
    -61
);

finishPlatform.userData.isFinishPlatform = true;

scene.add(finishPlatform);

if (!player) {
    createPlayer();
}
   

    const gameInfo =
        document.getElementById(
            "game-info"
        );

    if (gameInfo) {
        gameInfo.style.display = "block";
    }

}

// ======================================
// FIREBASE
// ======================================
window.addEventListener(
    "novabridge-start",
    async () => {

        const menu =
            document.getElementById("menu");

        if (menu) {
            menu.style.display = "none";
        }

        await joinRandomRoom();

    }
);
window.addEventListener(
    "novabridge-game-start",
    () => {

        startGame();

    }
);
window.addEventListener(
    "novabridge-round-reset",
    () => {

        console.log("🔄 Script: yeni tur için sıfırlanıyor...");

        gameStarted = false;

        gameOver = false;

        spectatorMode = false;
        spectatorTarget = null;
        spectatorIndex = 0;

        velocityY = 0;
        grounded = true;

        brokenTiles.clear();

        if (player) {

            player.visible = true;

            player.position.set(
                0,
                0.6,
                3
            );

            player.rotation.set(
                0,
                0,
                0
            );

            player.hasFinished = false;

        }

        yaw = 0;
        pitch = 0;

    }
);
// ======================================
// KLAVYE
// ======================================

const keys = {};
let velocityY = 0;

const gravity = 0.02;

const jumpPower = 0.35;

let grounded = true;
window.addEventListener(
    "keydown",
    event => {

        const key =
            event.key.toLowerCase();


        // ==================================
        // İZLEYİCİ MODU
        // ==================================

        if (
            spectatorMode &&
            key === " "
        ) {

            event.preventDefault();

            changeSpectatorTarget();

            return;

        }


        keys[key] = true;


        // ==================================
        // NORMAL OYUNDA ZIPLAMA
        // ==================================

        if (
            key === " " &&
            grounded &&
            !gameOver
        ) {

            velocityY =
                jumpPower;

            grounded = false;

        }

    }
);

window.addEventListener(
    "keyup",
    event => {

        keys[
            event.key.toLowerCase()
        ] = false;

    }
);


// ======================================
// FPS KAMERA DEĞİŞKENLERİ
// ======================================

let yaw = 0;

let pitch = 0;

const mouseSensitivity = 0.002;


// ======================================
// FPS POINTER LOCK
// ======================================

document.addEventListener(
    "click",
    () => {

        if (!gameStarted) return;

        if (gameOver) return;

        if (spectatorMode) return;


        const canvas =
            document.getElementById("game");


        if (!canvas) {

            console.error(
                "❌ #game canvas bulunamadı"
            );

            return;

        }


        console.log(
            "🖱️ Oyun ekranına tıklandı"
        );


        try {

            canvas.requestPointerLock();

        }
        catch (error) {

            console.error(
                "❌ Mouse kilitlenemedi:",
                error
            );

        }

    }
);
document.addEventListener(
    "pointerlockchange",
    () => {

        const canvas =
            document.getElementById("game");


        if (
            document.pointerLockElement ===
            canvas
        ) {

            console.log(
                "🔒 MOUSE KİLİTLENDİ"
            );

        }
        else {

            console.log(
                "🔓 Mouse serbest"
            );

        }

    }
);
// ======================================
// MOUSE HAREKETİ
// ======================================

document.addEventListener(
    "mousemove",
    event => {

        if (
            document.pointerLockElement !==
            gameCanvas
        ) {
            return;
        }


        if (!gameStarted) return;

        if (gameOver) return;

        if (spectatorMode) return;


        yaw -=
            event.movementX *
            mouseSensitivity;


        pitch -=
            event.movementY *
            mouseSensitivity;


        const maxPitch =
            Math.PI / 2 - 0.05;


        pitch =
            Math.max(
                -maxPitch,
                Math.min(
                    maxPitch,
                    pitch
                )
            );


        if (player) {

            player.rotation.y =
                yaw;

        }

    }
);


// ======================================
// OYUNCU HAREKETİ
// ======================================

function updateMovement() {
    if (!gameStarted) return;
if (
    gameOver &&
    !spectatorMode
) {
    return;
}
    if (!player) return;


    const speed = 0.08;


    let forward = 0;

    let right = 0;


    // W
    if (
        keys["w"] ||
        keys["arrowup"]
    ) {

        forward += 1;

    }


    // S
    if (
        keys["s"] ||
        keys["arrowdown"]
    ) {

        forward -= 1;

    }


    // D
    if (
        keys["d"] ||
        keys["arrowright"]
    ) {

        right += 1;

    }


    // A
    if (
        keys["a"] ||
        keys["arrowleft"]
    ) {

        right -= 1;

    }


    if (
        forward !== 0 ||
        right !== 0
    ) {

        // Kameranın baktığı yön
        const direction =
            new THREE.Vector3(
                0,
                0,
                -1
            );


        direction.applyAxisAngle(
            new THREE.Vector3(0, 1, 0),
            yaw
        );


        // Sağ yön
        const rightDirection =
            new THREE.Vector3(
                1,
                0,
                0
            );


        rightDirection.applyAxisAngle(
            new THREE.Vector3(0, 1, 0),
            yaw
        );


        player.position.add(
            direction
                .multiplyScalar(
                    forward * speed
                )
        );


        player.position.add(
            rightDirection
                .multiplyScalar(
                    right * speed
                )
        );


        updatePlayerPosition(
    player.position.x,
    player.position.y,
    player.position.z,
    player.rotation.y
);

    }

}
function getCurrentTile() {

    if (!player) return null;

    const x = player.position.x;
    const z = player.position.z;


    // ==================================
    // HANGİ SIRA?
    // ==================================

    const index =
        Math.round(-z / 3);


    if (
        index < 0 ||
        index >= 20
    ) {

        return null;

    }


    // ==================================
    // HANGİ TARAF?
    // ==================================

    let side = null;


    if (
        x >= -2.5 &&
        x <= -0.5
    ) {

        side = "left";

    }


    if (
        x >= 0.5 &&
        x <= 2.5
    ) {

        side = "right";

    }


    if (!side) {

        return null;

    }


    return {
        index,
        side
    };

}


function updatePhysics() {

    if (!gameStarted) return;
    if (!player) return;

    velocityY -= gravity;
    player.position.y += velocityY;

    const playerBottom =
        player.position.y - 1;

    const platformTop = 0;

    const onStartPlatform =
        player.position.x >= -2.5 &&
        player.position.x <= 2.5 &&
        player.position.z >= 0.5 &&
        player.position.z <= 5.5;

    const onFinishPlatform =
        player.position.x >= -2.5 &&
        player.position.x <= 2.5 &&
        player.position.z <= -57 &&
        player.position.z >= -63;

    // BİTİŞ
    if (
        onFinishPlatform &&
        playerBottom <= platformTop
    ) {

        player.position.y =
            platformTop + 1;

        velocityY = 0;
        grounded = true;

        playerFinished();

    }

    // BAŞLANGIÇ
    else if (
        onStartPlatform &&
        playerBottom <= platformTop
    ) {

        player.position.y =
            platformTop + 1;

        velocityY = 0;
        grounded = true;

    }

    // CAMLAR
    else {

        const tile =
            getCurrentTile();

        if (tile) {

            const safe =
                isSafeTile(
                    tile.side,
                    tile.index
                );

            if (safe) {

                const groundY = 1.1;

                if (
                    player.position.y <= groundY
                ) {

                    player.position.y =
                        groundY;

                    velocityY = 0;
                    grounded = true;

                }

            } else {

                const tileKey =
                    `${tile.side}-${tile.index}`;

                if (!brokenTiles.has(tileKey)) {

                    brokenTiles.add(tileKey);

                    sendBrokenTile(
                        tile.side,
                        tile.index
                    );

                    breakTile(
                        tile.side,
                        tile.index
                    );

                }

                grounded = false;

            }

        } else {

            grounded = false;

        }

    }

    updatePlayerPosition(
        player.position.x,
        player.position.y,
        player.position.z,
        player.rotation.y
    );

    // DÜŞME
    if (
        player.position.y < -10 &&
        !gameOver
    ) {

        playerDied();

    }

}


function playerDied() {

    if (gameOver) return;
    if (!player) return;

    gameOver = true;

    velocityY = 0;

    console.log(
        "💥 Oyuncu düştü!"
    );


    updatePlayerPosition(
        player.position.x,
        player.position.y,
        player.position.z,
        player.rotation.y
    );


    showGameOver(

        // ==============================
        // İZLEYİCİ
        // ==============================

        () => {

            spectatorMode = true;

            console.log(
                "👁️ İzleyici modu aktif"
            );

            player.visible = false;

            startSpectatorMode();

        },


        // ==============================
        // OYUNDAN ÇIK
        // ==============================

        () => {

            leaveRoom();

            window.location.href =
                "../../index.html";

        }

    );

}
// ======================================
// SONRAKİ OYUNCUYU İZLE
// ======================================

function changeSpectatorTarget() {

    const players =
        getOtherPlayerMeshes();

    const ids =
        Object.keys(players);


    if (ids.length === 0) {

        spectatorTarget = null;

        return;

    }


    spectatorIndex++;


    if (
        spectatorIndex >= ids.length
    ) {

        spectatorIndex = 0;

    }


    spectatorTarget =
        ids[spectatorIndex];


    console.log(
        "👁️ Yeni izlenen oyuncu:",
        spectatorTarget
    );

}
// ======================================
// İZLEYİCİ MODUNU BAŞLAT
// ======================================

function startSpectatorMode() {

    const players =
        getOtherPlayerMeshes();

    const ids =
        Object.keys(players);


    if (ids.length === 0) {

        console.log(
            "👁️ İzlenecek başka oyuncu yok."
        );

        spectatorTarget = null;

        return;

    }


    spectatorIndex = 0;

    spectatorTarget =
        ids[spectatorIndex];


    console.log(
        "👁️ İzlenen oyuncu:",
        spectatorTarget
    );

}
// ======================================
// FPS KAMERA
// ======================================

function updateCamera() {
if (!gameStarted) return;
    // ==================================
    // İZLEYİCİ MODU
    // ==================================

    if (spectatorMode) {

        updateSpectatorCamera();

        return;

    }


    // ==================================
    // NORMAL FPS KAMERA
    // ==================================

    if (!player) return;


    camera.position.set(
        player.position.x,
        player.position.y + 0.7,
        player.position.z
    );


    camera.rotation.order =
        "YXZ";


    camera.rotation.y =
        yaw;


    camera.rotation.x =
        pitch;

}
function updateSpectatorCamera() {

    if (!spectatorTarget) {

        return;

    }


    const players =
        getOtherPlayerMeshes();


    const target =
        players[spectatorTarget];


    if (!target) {

        // İzlenen oyuncu oyundan çıktı
        changeSpectatorTarget();

        return;

    }


    // Oyuncunun biraz arkasından izle
    const offset =
        new THREE.Vector3(
            0,
            3,
            5
        );


    offset.applyAxisAngle(
        new THREE.Vector3(0, 1, 0),
        target.rotation.y
    );


    camera.position.copy(
        target.position
    );


    camera.position.add(
        offset
    );


    // Oyuncuya bak
    camera.lookAt(
        target.position.x,
        target.position.y + 1,
        target.position.z
    );

}


// ======================================
// PENCERE BOYUTU
// ======================================

window.addEventListener(
    "resize",
    () => {

        camera.aspect =
            window.innerWidth /
            window.innerHeight;


        camera.updateProjectionMatrix();


        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );

    }
);

function playerFinished() {

    if (player.hasFinished) {
        return;
    }

    player.hasFinished = true;

    console.log(
        "🏁 Oyuncu bitiş platformuna ulaştı!"
    );

    // Firebase'e bitiş bilgisini gönder
    setPlayerFinished();

    // Tur sonu menüsünü aç
    showRoundEndScreen();

}
// ======================================
// TUR SONU MENÜSÜ
// ======================================


function restartLocalGame() {

    console.log(
        "🔄 Yeni tur hazırlanıyor..."
    );

    gameOver = false;

    spectatorMode = false;

    spectatorTarget = null;

    spectatorIndex = 0;

    velocityY = 0;

    grounded = true;


    // Oyuncunun durumunu sıfırla
    if (player) {

        player.visible = true;

        player.position.set(
            0,
            0.6,
            3
        );

        player.rotation.set(
            0,
            0,
            0
        );

        player.hasFinished = false;

    }


    // Kamera
    yaw = 0;

    pitch = 0;


    // Eski kırılmış camları unut
    brokenTiles.clear();


    // Yeni köprü oluştur
    const pattern =
        getBridgePattern();

    createBridge(
        pattern
    );


    // Multiplayer tarafına
    // yeni tur sinyali gönder
    restartRoom();

}
function showFinishedPlayerName(name) {

    let list =
        document.getElementById(
            "finished-players"
        );

    if (!list) {

        list =
            document.createElement("div");

        list.id =
            "finished-players";

        list.style.position =
            "fixed";

        list.style.top =
            "20px";

        list.style.left =
            "50%";

        list.style.transform =
            "translateX(-50%)";

        list.style.padding =
            "12px 25px";

        list.style.background =
            "rgba(0,0,0,0.75)";

        list.style.color =
            "white";

        list.style.fontSize =
            "20px";

        list.style.fontWeight =
            "bold";

        list.style.borderRadius =
            "10px";

        list.style.zIndex =
            "1000";

        document.body.appendChild(
            list
        );

    }

    list.innerHTML =
        `🏁 Bitiş: ${name}`;

}
window.addEventListener(
    "novabridge-finished-players",
    event => {

        const finishedPlayers =
            event.detail || {};

        let box =
            document.getElementById(
                "finished-players"
            );

        if (!box) {

            box =
                document.createElement("div");

            box.id =
                "finished-players";

            box.style.position =
                "fixed";

            box.style.top =
                "20px";

            box.style.left =
                "50%";

            box.style.transform =
                "translateX(-50%)";

            box.style.padding =
                "12px 24px";

            box.style.background =
                "rgba(0, 0, 0, 0.8)";

            box.style.color =
                "#fff";

            box.style.fontSize =
                "20px";

            box.style.fontWeight =
                "bold";

            box.style.borderRadius =
                "10px";

            box.style.zIndex =
                "9999";

            document.body.appendChild(
                box
            );

        }

        const names =
            Object.values(
                finishedPlayers
            );

        if (names.length === 0) {

            box.style.display =
                "none";

            return;

        }

        box.style.display =
            "block";

        box.innerHTML =
            `
            🏁 Bitişe Ulaşanlar
            <br>
            ${names
                .map(
                    (data, index) =>
                        `${index + 1}. ${data.name || "Oyuncu"}`
                )
                .join("<br>")}
            `;

    }
);
window.addEventListener(
    "novabridge-round-finished",
    event => {

        console.log(
            "🏆 Tur bitti:",
            event.detail
        );

        showRoundEndScreen();

    }
);
// ======================================
// TUR SONU EKRANI
// ======================================

function showRoundEndScreen() {

    if (
        document.getElementById(
            "round-end-screen"
        )
    ) {
        return;
    }

    const screen =
        document.createElement("div");

    screen.id =
        "round-end-screen";

    screen.innerHTML = `

        <div id="round-end-box">

            <div class="round-end-title">
                🏆 TUR BİTTİ!
            </div>

            <div class="round-end-text">
                Bir oyuncu bitişe ulaştı!
            </div>

            <div class="round-end-buttons">

                <button id="stay-room-button">
                    🏠 Odada Kal
                </button>

                <button id="leave-room-button">
                    🚪 Oyundan Çık
                </button>

            </div>

        </div>

    `;

    document.body.appendChild(
        screen
    );

    // -----------------------------
    // ODADA KAL
    // -----------------------------

    document
        .getElementById(
            "stay-room-button"
        )
        .addEventListener(
            "click",
            async () => {

                await stayInRoom();

            }
        );

    // -----------------------------
    // OYUNDAN ÇIK
    // -----------------------------

    document
        .getElementById(
            "leave-room-button"
        )
        .addEventListener(
            "click",
            async () => {

                await leaveGame();

            }
        );

}
async function stayInRoom() {

    const screen =
        document.getElementById(
            "round-end-screen"
        );

    if (screen) {
        screen.remove();
    }

    if (player) {

        player.visible = true;

        player.hasFinished = false;

        player.position.set(
            0,
            0.6,
            3
        );

        player.rotation.y = 0;

    }

    gameOver = false;

    spectatorMode = false;

    spectatorTarget = null;

    spectatorIndex = 0;

    velocityY = 0;

    grounded = true;

    brokenTiles.clear();

    await readyForNextRound();

    await restartRoom();

}
async function leaveGame() {

    const screen =
        document.getElementById(
            "round-end-screen"
        );

    if (screen) {
        screen.remove();
    }

    await leaveRoom();

    window.location.href =
        "../../index.html";

}

// ======================================
// OYUN DÖNGÜSÜ
// ======================================

function animate() {

    requestAnimationFrame(
        animate
    );

    const delta =
        clock.getDelta();

    updateMovement();
    updatePhysics();
    updateCamera();

    updateOtherPlayerMovement();

     updateAllCharacterAnimations(
         delta
          );

    renderer.render(
        scene,
        camera
    );

}


animate();