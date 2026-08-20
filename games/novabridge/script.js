import * as THREE from "https://unpkg.com/three@0.179.1/build/three.module.js";
import {
    playWaitingMusic,
    playGameMusic,
    stopWaitingMusic,
    stopGameMusic,
    playSound
} from "./sound.js";
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

// ======================================
// GİRİŞ KAPISI
// ======================================

let entranceDoor = null;
let entranceDoorLeft = null;
let entranceDoorRight = null;
let entranceDoorLights = [];
let entranceDoorOpening = false;
let entranceDoorOpen = false;

function createEntranceDoor() {

    // Daha önce oluşturulduysa tekrar oluşturma
    if (entranceDoor) return;

    entranceDoor = new THREE.Group();

    // ----------------------------------
    // KAPI ÇERÇEVESİ
    // ----------------------------------

    const frameMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x111111,
            metalness: 0.8,
            roughness: 0.3
        });

    const frameLeft =
        new THREE.Mesh(
            new THREE.BoxGeometry(0.35, 4.5, 0.5),
            frameMaterial
        );

    frameLeft.position.set(
        -3.1,
        2.25,
        0
    );

    entranceDoor.add(frameLeft);

    const frameRight =
        new THREE.Mesh(
            new THREE.BoxGeometry(0.35, 4.5, 0.5),
            frameMaterial
        );

    frameRight.position.set(
        3.1,
        2.25,
        0
    );

    entranceDoor.add(frameRight);

    const frameTop =
        new THREE.Mesh(
            new THREE.BoxGeometry(6.5, 0.35, 0.5),
            frameMaterial
        );

    frameTop.position.set(
        0,
        4.5,
        0
    );

    entranceDoor.add(frameTop);

    // ----------------------------------
    // KAPI PANELLERİ
    // ----------------------------------

    const doorMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x222222,
            metalness: 0.7,
            roughness: 0.35,
            emissive: 0x220000,
            emissiveIntensity: 0.5
        });

    entranceDoorLeft =
        new THREE.Mesh(
            new THREE.BoxGeometry(3, 4.1, 0.3),
            doorMaterial
        );

    entranceDoorLeft.position.set(
        -1.5,
        2.05,
        0
    );

    entranceDoor.add(
        entranceDoorLeft
    );

    entranceDoorRight =
        new THREE.Mesh(
            new THREE.BoxGeometry(3, 4.1, 0.3),
            doorMaterial.clone()
        );

    entranceDoorRight.position.set(
        1.5,
        2.05,
        0
    );

    entranceDoor.add(
        entranceDoorRight
    );

    // ----------------------------------
    // KAPI ÜZERİNDEKİ KIRMIZI IŞIKLAR
    // ----------------------------------

    const lightMaterial =
        new THREE.MeshStandardMaterial({
            color: 0xff0000,
            emissive: 0xff0000,
            emissiveIntensity: 5
        });

    for (let i = 0; i < 5; i++) {

        const lamp =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    0.12,
                    12,
                    12
                ),
                lightMaterial
            );

        lamp.position.set(
            -2 + i,
            4.05,
            -0.3
        );

        entranceDoor.add(lamp);

        const pointLight =
            new THREE.PointLight(
                0xff0000,
                8,
                8
            );

        pointLight.position.copy(
            lamp.position
        );

        entranceDoor.add(pointLight);

        entranceDoorLights.push(
            pointLight
        );
    }

    // ----------------------------------
    // KAPIYI SAHNEYE EKLE
    // ----------------------------------

    entranceDoor.position.set(
        0,
        0,
        1.2
    );

    scene.add(
        entranceDoor
    );

    console.log(
        "🚪 Giriş kapısı oluşturuldu."
    );
}


// ======================================
// KAPIYI AÇ
// ======================================

function openEntranceDoor() {

    if (
        entranceDoorOpening ||
        entranceDoorOpen
    ) {
        return;
    }

    entranceDoorOpening = true;
    doorCameraMode = true;

    // Oyuncunun normal kamera yönünü sakla
    savedDoorYaw = yaw;
    savedDoorPitch = pitch;
    playSound("doorOpen");
    console.log(
        "🚪 Giriş kapısı yavaşça açılıyor..."
    );

    const startLeftX =
        entranceDoorLeft.position.x;

    const startRightX =
        entranceDoorRight.position.x;

    const targetLeftX = -3;
    const targetRightX = 3;

    // Kapı daha yavaş açılıyor
    const duration = 4500;

    const startTime =
        performance.now();

    function animateDoor(currentTime) {

        const elapsed =
            currentTime - startTime;

        const progress =
            Math.min(
                elapsed / duration,
                1
            );
        doorAnimationProgress = progress;
        // Yumuşak hareket
        const eased =
            progress < 0.5
                ? 4 * progress * progress * progress
                : 1 -
                  Math.pow(
                      -2 * progress + 2,
                      3
                  ) / 2;
// ==================================
// KIRMIZI IŞIK ANİMASYONU
// ==================================

const lightCycle =
    Math.floor(
        elapsed / 180
    );

entranceDoorLights.forEach(
    (light, index) => {

        const active =
            (lightCycle + index) % 5 === 0;

        light.intensity =
            active ? 18 : 2;

    }
);
        entranceDoorLeft.position.x =
            THREE.MathUtils.lerp(
                startLeftX,
                targetLeftX,
                eased
            );

        entranceDoorRight.position.x =
            THREE.MathUtils.lerp(
                startRightX,
                targetRightX,
                eased
            );

        if (progress < 1) {

            requestAnimationFrame(
                animateDoor
            );

        }
        else {

           entranceDoorOpening = false;
           entranceDoorOpen = true;
           doorAnimationProgress = 1;
            // Kapı açıldıktan sonra tüm ışıklar sabit
           entranceDoorLights.forEach(
              light => {

               light.intensity = 10;
  
            }
         );

            console.log(
                "🚪 Giriş kapısı tamamen açıldı!"
            );

            // Kamerayı kısa süre daha tut
            setTimeout(() => {

                doorCameraMode = false;

                // Oyuncunun normal görüşünü geri getir
                yaw = savedDoorYaw;
                pitch = savedDoorPitch;

            }, 500);
            doorAnimationProgress = 0;
        }
    }

    requestAnimationFrame(
        animateDoor
    );
}
function startGame() {

    if (gameStarted) return;

    gameStarted = true;
    createEntranceDoor();
    openEntranceDoor();
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
        playWaitingMusic();

    }
);
window.addEventListener(
    "novabridge-game-start",
    () => {

        playGameMusic();
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
        entranceDoorOpen = false;
entranceDoorOpening = false;

if (entranceDoor) {
    scene.remove(entranceDoor);
    entranceDoor = null;
    entranceDoorLeft = null;
    entranceDoorRight = null;
    entranceDoorLights = [];
}
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
// ======================================
// MOBİL KONTROLLER

let mobileForward = 0;
let mobileRight = 0;

let joystickTouchId = null;
let lookTouchId = null;

let lastLookX = 0;
let lastLookY = 0;
//=======================================

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
let doorCameraMode = false;
let savedDoorYaw = 0;
let savedDoorPitch = 0;
let doorAnimationProgress = 0;
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
// CAM SINIR KONTROLÜ
// ======================================

function getGlassAtPosition(x, z) {

    const tileIndex =
        Math.round(-z / 3);

    if (
        tileIndex < 0 ||
        tileIndex >= 20
    ) {
        return null;
    }

    const tileZ =
        -tileIndex * 3;

    // Camın gerçek Z alanı
    if (
        z < tileZ - 1 ||
        z > tileZ + 1
    ) {
        return null;
    }

    // SOL CAM
    if (
        x >= -2.5 &&
        x <= -0.5
    ) {
        return {
            side: "left",
            index: tileIndex
        };
    }

    // SAĞ CAM
    if (
        x >= 0.5 &&
        x <= 2.5
    ) {
        return {
            side: "right",
            index: tileIndex
        };
    }

    return null;
}
// ======================================
// OYUNCU HAREKETİ
// ======================================

function updateMovement() {

    if (window.chatTyping) return;

    if (!gameStarted) return;
    if (!entranceDoorOpen) return;

    if (gameOver && !spectatorMode) return;
    if (!player) return;

    const speed = 0.08;

    let forward = mobileForward;
    let right = mobileRight;

    if (keys["w"] || keys["arrowup"]) {
        forward += 1;
    }

    if (keys["s"] || keys["arrowdown"]) {
        forward -= 1;
    }

    if (keys["d"] || keys["arrowright"]) {
        right += 1;
    }

    if (keys["a"] || keys["arrowleft"]) {
        right -= 1;
    }

    if (
        forward === 0 &&
        right === 0
    ) {
        return;
    }

    // ==================================
    // HAREKET YÖNLERİ
    // ==================================

    const direction =
        new THREE.Vector3(0, 0, -1);

    direction.applyAxisAngle(
        new THREE.Vector3(0, 1, 0),
        yaw
    );

    const rightDirection =
        new THREE.Vector3(1, 0, 0);

    rightDirection.applyAxisAngle(
        new THREE.Vector3(0, 1, 0),
        yaw
    );

    let moveX =
        direction.x * forward * speed +
        rightDirection.x * right * speed;

    let moveZ =
        direction.z * forward * speed +
        rightDirection.z * right * speed;

    // ==================================
    // NORMALİZE ET
    // ÇAPRAZ HAREKET ÇOK HIZLI OLMASIN
    // ==================================

    const moveLength =
        Math.sqrt(
            moveX * moveX +
            moveZ * moveZ
        );

    if (moveLength > speed) {

        moveX =
            (moveX / moveLength) * speed;

        moveZ =
            (moveZ / moveLength) * speed;

    }

    const oldX = player.position.x;
    const oldZ = player.position.z;

    const testX = oldX + moveX;
    const testZ = oldZ + moveZ;

    // ==================================
    // HAVADAYKEN
    // ==================================
    //
    // Oyuncu zıplıyorsa cam sınırlarına
    // takılmasına izin vermiyoruz.
    //
    // Böylece:
    //
    //     ↗
    //   oyuncu
    //      ↗
    //   diğer cam
    //
    // şeklinde çapraz zıplayabilir.
    // ==================================

    if (!grounded) {

        // Köprü alanının dışına tamamen
        // çıkmasını engelle.

        const minX = -2.9;
        const maxX = 2.9;

        const minZ = -61.5;
        const maxZ = 5.5;

        player.position.x =
            THREE.MathUtils.clamp(
                testX,
                minX,
                maxX
            );

        player.position.z =
            THREE.MathUtils.clamp(
                testZ,
                minZ,
                maxZ
            );

    }

    // ==================================
    // YERDEYKEN
    // ==================================

    else {

        // ------------------------------
        // X HAREKETİ
        // ------------------------------

        const currentTile =
            getGlassAtPosition(
                oldX,
                oldZ
            );

        const nextTileX =
            getGlassAtPosition(
                testX,
                oldZ
            );

        let finalX = oldX;

        // Aynı cam üzerinde
        if (nextTileX) {

            finalX = testX;

        }

        // İki cam arasındaki orta boşluk
        else if (
            testX > -0.5 &&
            testX < 0.5
        ) {

            finalX = testX;

        }

        // Başlangıç / bitiş platformu
        else if (
            oldZ > 0.5 ||
            oldZ < -57
        ) {

            finalX = testX;

        }

        // ------------------------------
        // Z HAREKETİ
        // ------------------------------

        const nextTileZ =
            getGlassAtPosition(
                finalX,
                testZ
            );

        let finalZ = oldZ;

        if (nextTileZ) {

            finalZ = testZ;

        }

        // Başlangıç platformu
        else if (
            finalZ > 0.5
        ) {

            finalZ = testZ;

        }

        // Bitiş platformu
        else if (
            finalZ < -57
        ) {

            finalZ = testZ;

        }

        player.position.x =
            finalX;

        player.position.z =
            finalZ;
    }

    // ==================================
    // FIREBASE
    // ==================================

    updatePlayerPosition(
        player.position.x,
        player.position.y,
        player.position.z,
        player.rotation.y
    );
}
function getCurrentTile() {

    if (!player) return null;

    const x = player.position.x;
    const z = player.position.z;

    const playerHalfWidth = 0.45;

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
    // CAMIN Z SINIRLARI
    // ==================================

    const tileCenterZ =
        -index * 3;

    const tileMinZ =
        tileCenterZ - 1;

    const tileMaxZ =
        tileCenterZ + 1;

    // Oyuncunun camın Z alanına
    // gerçekten temas edip etmediğini kontrol et
    const playerMinZ =
        z - 0.45;

    const playerMaxZ =
        z + 0.45;

    if (
        playerMaxZ < tileMinZ ||
        playerMinZ > tileMaxZ
    ) {
        return null;
    }

    // ==================================
    // SOL CAM
    // ==================================

    const leftMinX = -2.5;
    const leftMaxX = -0.5;

    if (
        x + playerHalfWidth >= leftMinX &&
        x - playerHalfWidth <= leftMaxX
    ) {

        return {
            index,
            side: "left"
        };

    }

    // ==================================
    // SAĞ CAM
    // ==================================

    const rightMinX = 0.5;
    const rightMaxX = 2.5;

    if (
        x + playerHalfWidth >= rightMinX &&
        x - playerHalfWidth <= rightMaxX
    ) {

        return {
            index,
            side: "right"
        };

    }

    return null;
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

    // ==================================
// CAMLAR
// ==================================

else {

    const tile =
        getCurrentTile();

    if (tile) {

const groundY = 0.1;

const playerBottom =
    player.position.y - 1;

// Oyuncu cama yeterince yaklaştıysa
// doğrudan camın üzerine oturt.
const standingOnGlass =
    playerBottom <= groundY + 0.15;
        // Havada geçiyorsa camı kontrol etme
        if (!standingOnGlass) {

            grounded = false;

        }

        else {

            const safe =
                isSafeTile(
                    tile.side,
                    tile.index
                );

            // ------------------------------
            // GÜVENLİ CAM
            // ------------------------------

            if (safe) {

                player.position.y = 1.1
                   

                velocityY = 0;
                grounded = true;

            }

            // ------------------------------
            // KIRILAN CAM
            // ------------------------------

            else {

                const tileKey =
                    `${tile.side}-${tile.index}`;

                if (
                    !brokenTiles.has(tileKey)
                ) {

                    brokenTiles.add(
                        tileKey
                    );

                    sendBrokenTile(
                        tile.side,
                        tile.index
                    );

                    breakTile(
                        tile.side,
                        tile.index
                    );

                    playSound(
                        "glassBreak"
                    );
                }

                grounded = false;
            }
        }

    }

    else {

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
    // KAPI AÇILIŞ KAMERASI
    // ==================================

if (doorCameraMode) {

    camera.rotation.order = "YXZ";

    // Kamera kapının köprü tarafında başlar
    // ve yavaşça köprünün sonuna doğru ilerler.

    const cameraStartZ = 0.3;
    const cameraEndZ = -55;

    const cameraProgress =
        Math.min(
            doorAnimationProgress,
            1
        );

    const easedCameraProgress =
        1 -
        Math.pow(
            1 - cameraProgress,
            2
        );

    const currentZ =
        THREE.MathUtils.lerp(
            cameraStartZ,
            cameraEndZ,
            easedCameraProgress
        );

    camera.position.set(
        0,
        2.5,
        currentZ
    );

    // Her zaman köprünün ilerisine bak
    camera.rotation.y = Math.PI;
    camera.rotation.x = 0;

    return;
}
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
    playSound("finish")
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
const chatInput = document.getElementById("chatInput");

if (chatInput) {

    chatInput.addEventListener("focus", () => {

        window.chatTyping = true;

    });

    chatInput.addEventListener("blur", () => {

        window.chatTyping = false;

    });

}
// ======================================
// MOBİL JOYSTICK
// ======================================

const joystick =
    document.getElementById("joystick");

const joystickKnob =
    document.getElementById("joystick-knob");

if (joystick && joystickKnob) {

    joystick.addEventListener(
        "touchstart",
        event => {

            if (!gameStarted) return;
            if (!entranceDoorOpen) return;

            const touch = event.changedTouches[0];

            joystickTouchId =
                touch.identifier;

            updateJoystick(touch);

            event.preventDefault();

        },
        { passive: false }
    );

    joystick.addEventListener(
        "touchmove",
        event => {

            if (joystickTouchId === null) {
                return;
            }

            for (const touch of event.changedTouches) {

                if (
                    touch.identifier ===
                    joystickTouchId
                ) {

                    updateJoystick(touch);

                    break;
                }
            }

            event.preventDefault();

        },
        { passive: false }
    );

    joystick.addEventListener(
        "touchend",
        event => {

            for (const touch of event.changedTouches) {

                if (
                    touch.identifier ===
                    joystickTouchId
                ) {

                    joystickTouchId = null;

                    mobileForward = 0;
                    mobileRight = 0;

                    joystickKnob.style.left = "35px";
                    joystickKnob.style.top = "35px";

                    break;
                }
            }

            event.preventDefault();

        },
        { passive: false }
    );
}

function updateJoystick(touch) {

    const rect =
        joystick.getBoundingClientRect();

    const centerX =
        rect.left + rect.width / 2;

    const centerY =
        rect.top + rect.height / 2;

    let dx =
        touch.clientX - centerX;

    let dy =
        touch.clientY - centerY;

    const maxDistance = 35;

    const distance =
        Math.sqrt(
            dx * dx +
            dy * dy
        );

    if (distance > maxDistance) {

        dx =
            dx / distance *
            maxDistance;

        dy =
            dy / distance *
            maxDistance;

    }

    joystickKnob.style.left =
        `${35 + dx}px`;

    joystickKnob.style.top =
        `${35 + dy}px`;

    mobileRight =
        dx / maxDistance;

    mobileForward =
        -dy / maxDistance;

}
// ======================================
// MOBİL KAMERA
// ======================================

gameCanvas.addEventListener(
    "touchstart",
    event => {

        if (!gameStarted) return;
        if (!entranceDoorOpen) return;
        if (gameOver) return;
        if (spectatorMode) return;

        for (const touch of event.changedTouches) {

            // Sol taraf joysticke ait
            if (
                touch.clientX <
                window.innerWidth * 0.4
            ) {
                continue;
            }

            lookTouchId =
                touch.identifier;

            lastLookX =
                touch.clientX;

            lastLookY =
                touch.clientY;
        }

        event.preventDefault();

    },
    { passive: false }
);

gameCanvas.addEventListener(
    "touchmove",
    event => {

        if (lookTouchId === null) {
            return;
        }

        for (const touch of event.changedTouches) {

            if (
                touch.identifier !==
                lookTouchId
            ) {
                continue;
            }

            const dx =
                touch.clientX -
                lastLookX;

            const dy =
                touch.clientY -
                lastLookY;

            yaw -=
                dx * 0.008;

            pitch -=
                dy * 0.008;

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

            lastLookX =
                touch.clientX;

            lastLookY =
                touch.clientY;

            break;
        }

        event.preventDefault();

    },
    { passive: false }
);

gameCanvas.addEventListener(
    "touchend",
    event => {

        for (const touch of event.changedTouches) {

            if (
                touch.identifier ===
                lookTouchId
            ) {

                lookTouchId = null;

                break;
            }
        }

        event.preventDefault();

    },
    { passive: false }
);
// ======================================
// MOBİL ZIPLAMA
// ======================================

const jumpButton =
    document.getElementById("jump-button");

if (jumpButton) {

    jumpButton.addEventListener(
        "touchstart",
        event => {

            if (!gameStarted) return;
            if (!entranceDoorOpen) return;
            if (gameOver) return;
            if (spectatorMode) return;

            if (grounded) {

                velocityY =
                    jumpPower;

                grounded = false;

            }

            event.preventDefault();

        },
        { passive: false }
    );
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