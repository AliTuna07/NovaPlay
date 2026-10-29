import * as THREE from "https://unpkg.com/three@0.179.1/build/three.module.js";
import {
    playSound,
    playAmbience,
    stopAmbience
} from "./sound.js";

import {
    isInRoom,
    getCurrentPlayerId,
    getCurrentTeam,
    onPlayersUpdate,
    updateMyPosition,
    updateMyStats,
    joinRandomRoom,
    damagePlayer,
    awardKill,
    getCurrentKillCount
} from "./multiplayer.js";
// =====================================
// SCENE
// =====================================

const scene = new THREE.Scene();

const remotePlayers = new Map();


function createRemotePlayer(player) {
    const character = new THREE.Group();

    const isBlue = player.team === "blue";

    const uniformMaterial = new THREE.MeshStandardMaterial({
        color: isBlue ? 0x1769aa : 0x9f2929,
        roughness: 0.88
    });

    const armorMaterial = new THREE.MeshStandardMaterial({
        color: 0x292f33,
        roughness: 0.8,
        metalness: 0.15
    });

    const skinMaterial = new THREE.MeshStandardMaterial({
        color: 0xb9825c,
        roughness: 0.9
    });

    const bootMaterial = new THREE.MeshStandardMaterial({
        color: 0x111416,
        roughness: 0.95
    });

    // Parça oluşturma yardımcı fonksiyonu
    function addPart(
        geometry,
        material,
        x, y, z
    ) {
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x, y, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        character.add(mesh);
        return mesh;
    }

    // GÖVDE
    addPart(
        new THREE.BoxGeometry(0.68, 0.78, 0.36),
        uniformMaterial,
        0, 1.22, 0
    );

    // Kurşun geçirmez yelek
    addPart(
        new THREE.BoxGeometry(0.72, 0.48, 0.39),
        armorMaterial,
        0, 1.28, -0.015
    );

    // Yelek cepleri
    for (const x of [-0.21, 0, 0.21]) {
        addPart(
            new THREE.BoxGeometry(0.13, 0.16, 0.045),
            armorMaterial,
            x, 1.25, -0.22
        );
    }

    // OMUZLAR VE KOLLAR
    for (const side of [-1, 1]) {
        addPart(
            new THREE.SphereGeometry(0.17, 10, 8),
            uniformMaterial,
            side * 0.43, 1.48, 0
        );

        const upperArm = addPart(
            new THREE.CylinderGeometry(0.105, 0.12, 0.42, 10),
            uniformMaterial,
            side * 0.46, 1.22, -0.015
        );

        upperArm.rotation.z = side * -0.10;

        addPart(
            new THREE.CylinderGeometry(0.085, 0.095, 0.34, 10),
            armorMaterial,
            side * 0.48, 0.89, -0.025
        );

        addPart(
            new THREE.SphereGeometry(0.085, 10, 8),
            bootMaterial,
            side * 0.48, 0.69, -0.07
        );
    }

    // KALÇA
    addPart(
        new THREE.BoxGeometry(0.52, 0.24, 0.34),
        armorMaterial,
        0, 0.72, 0
    );

    // BACAKLAR
    const legs = [];

    for (const side of [-1, 1]) {
        const legPivot = new THREE.Group();
        legPivot.position.set(side * 0.17, 0.66, 0);
        character.add(legPivot);

        const upperLeg = new THREE.Mesh(
            new THREE.CylinderGeometry(0.13, 0.105, 0.43, 10),
            uniformMaterial
        );

        upperLeg.position.y = -0.22;
        upperLeg.castShadow = true;
        legPivot.add(upperLeg);

        const lowerLeg = new THREE.Mesh(
            new THREE.CylinderGeometry(0.095, 0.08, 0.31, 10),
            armorMaterial
        );

        lowerLeg.position.set(0, -0.54, -0.015);
        lowerLeg.castShadow = true;
        legPivot.add(lowerLeg);

        const boot = new THREE.Mesh(
            new THREE.BoxGeometry(0.19, 0.13, 0.30),
            bootMaterial
        );

        boot.position.set(0, -0.72, -0.07);
        boot.castShadow = true;
        legPivot.add(boot);

        legs.push(legPivot);
    }

    // BOYUN
    addPart(
        new THREE.CylinderGeometry(0.09, 0.10, 0.14, 10),
        skinMaterial,
        0, 1.67, 0
    );

    // KAFA
    addPart(
        new THREE.SphereGeometry(0.22, 14, 12),
        skinMaterial,
        0, 1.91, 0
    );

    // KASK
    addPart(
        new THREE.SphereGeometry(
            0.235, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.58
        ),
        armorMaterial,
        0, 2.02, 0
    );

    // Kaskın ön siperliği
    addPart(
        new THREE.BoxGeometry(0.30, 0.045, 0.12),
        armorMaterial,
        0, 1.99, -0.19
    );

    // GÖĞÜS ARMASI
    addPart(
        new THREE.BoxGeometry(0.14, 0.10, 0.025),
        new THREE.MeshStandardMaterial({
            color: isBlue ? 0x46b9ff : 0xff5757,
            emissive: isBlue ? 0x073d66 : 0x660808,
            emissiveIntensity: 0.5
        }),
        0, 1.42, -0.22
    );

    // BASİT SİLAH
    const gun = new THREE.Group();

    const gunBody = new THREE.Mesh(
        new THREE.BoxGeometry(0.11, 0.12, 0.52),
        bootMaterial
    );

    gunBody.position.z = -0.20;
    gun.add(gunBody);

    const barrel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.025, 0.025, 0.30, 8),
        armorMaterial
    );

    barrel.rotation.x = Math.PI / 2;
    barrel.position.z = -0.59;
    gun.add(barrel);

    gun.position.set(0.28, 1.02, -0.28);
    gun.rotation.x = -0.08;
    character.add(gun);

    // Oyuncu etiketi için veri
    character.userData.playerName = player.name || "Oyuncu";
    character.userData.team = player.team || "blue";
    character.userData.legs = legs;
    character.userData.lastX = Number(player.x) || 0;
    character.userData.lastZ = Number(player.z) || 0;
    character.userData.moving = false;

    // Ayaklar zemin seviyesinden başlar
    character.position.set(
        Number(player.x) || 0,
        0,
        Number(player.z) || 0
    );

    character.rotation.y = Number(player.rotationY) || 0;

    scene.add(character);

    return character;
}



onPlayersUpdate((players) => {
    updateTeamScoreboard(players);
    renderScoreboard(players);
    const myId = getCurrentPlayerId();
    const activeIds = new Set();

    for (const [id, player] of Object.entries(players || {})) {
        // Önce kendi oyuncumuzun ölüm durumunu kontrol et.
if (id === myId) {
    const healthElement = document.getElementById("health");
    const playerHealth = Math.max(
        0,
        Number(player.health ?? 100)
    );

    currentHealth = playerHealth;

    if (healthElement) {
        healthElement.dataset.health = String(playerHealth);
        healthElement.textContent = `❤️ CAN: ${playerHealth}`;
    }

    if (player.alive === false && isLocalPlayerAlive) {
        isLocalPlayerAlive = false;

        // Ölüm sayısını yalnızca bir kez artır.
        updateMyStats({
            deaths: (Number(player.deaths) || 0) + 1
        });

        handleLocalDeath();
    }

    continue;
}

        activeIds.add(id);

        let character = remotePlayers.get(id);

        if (!character) {
            character = createRemotePlayer(player);
            remotePlayers.set(id, character);
        }

        // Oyuncunun yeni konumunu hesapla.
        const newX = Number(player.x) || 0;
        const newZ = Number(player.z) || 0;

        const dx = newX - character.position.x;
        const dz = newZ - character.position.z;

        character.userData.alive = player.alive !== false;
        character.visible = character.userData.alive;

        if (!character.userData.alive) {
            character.userData.moving = false;
}   
        // Yürüme animasyonu için hareket bilgisini güncelle.
        character.userData.moving =
            Math.hypot(dx, dz) > 0.03;

        // Oyuncunun konumunu ve baktığı yönü güncelle.
        character.position.set(newX, 0, newZ);
        character.rotation.y = Number(player.rotationY) || 0;

        // Oyuncu adı ve takımı değişmişse bilgileri güncelle.
        character.userData.playerName = player.name || "Oyuncu";
        character.userData.team = player.team || "blue";
    }

    // Odadan çıkan oyuncuların modellerini kaldır.
    for (const [id, character] of remotePlayers) {
        if (!activeIds.has(id)) {
            scene.remove(character);
            remotePlayers.delete(id);
        }
    }
});


scene.background = new THREE.Color(0x15191c);

scene.fog = new THREE.Fog(
    0x15191c,
    25,
    180
);


// =====================================
// CAMERA
// =====================================

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    600
);

camera.position.set(
    0,
    2,
    12
);

camera.rotation.order = "YXZ";

// =====================================
// SİLAH SİSTEMİ
// =====================================



let gameStarted = false;

let currentWeapon = "automatic";

let ammo = 30;
let maxAmmo = 30;

let isReloading = false;
let lastShotTime = 0;
let mouseDown = false;
let scopeActive = false;
let sniperBusy = false;
const SNIPER_COOLDOWN = 1200; // 1,2 saniye
let fireRate = 100;
let weaponDamage = 34;
let normalFov = 75;
let onlineMode = false;
let isLocalPlayerAlive = true;
let isRespawning = false;
let respawnTimer = null;
let currentHealth = 100;
// =====================================
// SİLAH MODELİ
// =====================================

const weaponGroup = new THREE.Group();

camera.add(weaponGroup);

scene.add(camera);


const weaponBody = new THREE.Mesh(
    new THREE.BoxGeometry(
        0.22,
        0.22,
        0.9
    ),
    new THREE.MeshStandardMaterial({
        color: 0x202020,
        roughness: 0.7,
        metalness: 0.5
    })
);

weaponBody.position.set(
    0.35,
    -0.28,
    -0.65
);

weaponGroup.add(weaponBody);


const weaponBarrel = new THREE.Mesh(
    new THREE.CylinderGeometry(
        0.055,
        0.055,
        0.55,
        12
    ),
    new THREE.MeshStandardMaterial({
        color: 0x111111,
        metalness: 0.8,
        roughness: 0.4
    })
);

weaponBarrel.rotation.x =
    Math.PI / 2;

weaponBarrel.position.set(
    0.35,
    -0.25,
    -1.15
);

weaponGroup.add(weaponBarrel);


// =====================================
// ATEŞ EFEKTİ
// =====================================

const muzzleFlash = new THREE.PointLight(
    0xffaa44,
    0,
    4
);

muzzleFlash.position.set(
    0.35,
    -0.25,
    -1.45
);

weaponGroup.add(muzzleFlash);


// =====================================
// MERMİ İZİ
// =====================================

function createBulletEffect() {

    const direction =
        new THREE.Vector3(
            0,
            0,
            -1
        );

    direction.applyQuaternion(
        camera.quaternion
    );

    const start =
        camera.position.clone();

    const end =
        start.clone().add(
            direction.multiplyScalar(100)
        );


    const geometry =
        new THREE.BufferGeometry()
            .setFromPoints([
                start,
                end
            ]);


    const material =
        new THREE.LineBasicMaterial({
            color: 0xffcc66,
            transparent: true,
            opacity: 0.45
        });


    const tracer =
        new THREE.Line(
            geometry,
            material
        );

    scene.add(tracer);


    setTimeout(() => {

        scene.remove(tracer);

        geometry.dispose();
        material.dispose();

    }, 40);
}


// =====================================
// ATEŞ ET
// =====================================

function fireWeapon() {
    
   if (
    !gameStarted ||
    isReloading ||
    ammo <= 0 ||
    (onlineMode && !isLocalPlayerAlive)
) {
    return;
}
    if (currentWeapon === "sniper" && sniperBusy) return;

    const now = performance.now();

    if (
        now - lastShotTime <
        fireRate
    ) {
        return;
    }

    lastShotTime = now;


    ammo--;

    updateWeaponHUD();
    
if (currentWeapon === "sniper") {
    playSound("snipershoot");
} else {
    playSound("shoot");
}
if (currentWeapon === "sniper") {
    sniperBusy = true;

    setTimeout(() => {
        sniperBusy = false;
    }, SNIPER_COOLDOWN);
}

    createBulletEffect();
    
    if (onlineMode) {
    checkRemotePlayerHit();
} else {
    checkBotHit();
}


    const flash = currentWeaponModel?.userData.muzzleFlash;
const flashLight = currentWeaponModel?.userData.muzzleLight;

if (flash) {
    flash.visible = true;
}

if (flashLight) {
    flashLight.intensity = 3;
}

setTimeout(() => {
    if (flash) {
        flash.visible = false;
    }

    if (flashLight) {
        flashLight.intensity = 0;
    }
}, 45);

    // Geri tepme
pitch += 0.012;

pitch = Math.max(
    -Math.PI / 2.2,
    Math.min(
        Math.PI / 2.2,
        pitch
    )
);

camera.rotation.x =
    pitch;
}
// =====================================
// ONLINE OYUNCUYA ATEŞ ET
// =====================================

let hitInProgress = false;

async function checkRemotePlayerHit() {
    if (!onlineMode || !isInRoom() || hitInProgress) return;

    const myTeam = getCurrentTeam();

    const direction = new THREE.Vector3(0, 0, -1);
    direction.applyQuaternion(camera.quaternion).normalize();

    raycaster.set(camera.position, direction);
    raycaster.far = 150;

    // Yalnızca rakiplerin canlı modellerini hedef al.
    const targets = [];

    for (const [id, character] of remotePlayers) {
        if (
    !character.visible ||
    character.userData.alive === false
) {
    continue;
}

        // Takım arkadaşlarına ateş etme.
        if (character.userData.team === myTeam) continue;

        character.traverse(object => {
            if (object.isMesh) {
                object.userData.remotePlayerId = id;
                targets.push(object);
            }
        });
    }

    const hits = raycaster.intersectObjects(targets, false);

    if (hits.length === 0) return;

    const targetId = hits[0].object.userData.remotePlayerId;

    if (!targetId) return;

    hitInProgress = true;

    try {
        const result = await damagePlayer(targetId, weaponDamage);

        
if (result.success && result.killed) {
    const awarded = await awardKill();

    if (awarded) {
        const kills = await getCurrentKillCount();

        const scoreElement = document.getElementById("score");

        if (scoreElement) {
            scoreElement.textContent = `💀 ÖLDÜRME: ${kills}`;
        }

        console.log(`💀 Öldürülen rakip sayısı: ${kills}`);
    }
}

    } catch (error) {
        console.error("Rakibe isabet işlenemedi:", error);
    } finally {
        hitInProgress = false;
    }
}
// =====================================
// BOT VURMA
// =====================================

function checkBotHit() {

    const direction =
        new THREE.Vector3(
            0,
            0,
            -1
        );

    direction.applyQuaternion(
        camera.quaternion
    );


    raycaster.set(
        camera.position,
        direction
    );


    const targets = [];


    for (
        const bot of bots
    ) {

        if (!bot.alive) continue;


        for (
            const child of bot.mesh.children
        ) {

            targets.push(child);

        }

    }


    const hits =
        raycaster.intersectObjects(
            targets,
            false
        );


    if (
        hits.length === 0
    ) {
        return;
    }


    const hitObject =
        hits[0].object;


    const bot =
        bots.find(
            b =>
                b.mesh.children.includes(
                    hitObject
                )
        );


    if (!bot) return;


    bot.health -= weaponDamage;


    if (
        bot.health <= 0
    ) {

        eliminateBot(bot);

    }

}
// =====================================
// BOT YENİLGİSİ
// =====================================

function eliminateBot(bot) {

    if (!bot.alive) return;

    bot.alive = false;

    playSound("botDeath");

    scene.remove(bot.mesh);

    score += 100;

    const scoreElement =
        document.getElementById("score");

    scoreElement.textContent =
        `🎯 SKOR: ${score}`;

    // Ölen botu bots listesinden kaldır
    const botIndex = bots.indexOf(bot);

    if (botIndex !== -1) {
        bots.splice(botIndex, 1);
    }

    // Sonsuz bot sistemi
    spawnOneBot();
}
// =====================================
// OYUNCU ÖLDÜ
// =====================================
function gameOver() {

    showGameOver(false);

}
// =====================================
// OYUN SONU EKRANI
// =====================================

function showGameOver(
    won = false
) {

    gameStarted = false;

    if (
        document.pointerLockElement
    ) {
        document.exitPointerLock();
    }


    const screen =
        document.getElementById(
            "gameOverScreen"
        );

    const title =
        document.getElementById(
            "gameOverTitle"
        );

    const message =
        document.getElementById(
            "gameOverMessage"
        );

    const finalScore =
        document.getElementById(
            "finalScore"
        );


    if (won) {
        playSound("win");
        title.textContent =
            "🏆 KAZANDIN";

        message.textContent =
            "Şehirdeki tüm botları etkisiz hale getirdin.";

    } else {
        playSound("lose");
        title.textContent =
            "OYUN BİTTİ";

        message.textContent =
            "Canın tükendi.";

    }


    finalScore.textContent =
        `SKOR: ${score}`;


    screen.style.display =
        "flex";
}
// =====================================
// OYUNCU KAZANDI
// =====================================

function playerWon() {

    showGameOver(true);

}
const playOnlineBtn = document.getElementById("playOnlineBtn");


if (playOnlineBtn) {
    playOnlineBtn.style.display = "none";

    playOnlineBtn.addEventListener("click", () => {
        if (!isInRoom()) {
            alert("Önce bir odaya katılmalısın!");
            return;
        }

        onlineMode = true;

        // Online maçta botları temizle.
        for (const bot of [...bots]) {
            scene.remove(bot.mesh);
        }

        bots.length = 0;

        // Oyuncu ve kamera başlangıç konumu.
        camera.position.set(0, 2, 12);
        yaw = 0;
        pitch = 0;
        camera.rotation.set(0, 0, 0);

        // Online maçta canı sıfırla.
        const healthElement = document.getElementById("health");

        if (healthElement) {
            healthElement.dataset.health = "100";
            healthElement.textContent = "❤️ CAN: 100";
        }

        document.body.requestPointerLock();
    });
}
// =====================================
// ATEŞ TUŞU
// =====================================

document.addEventListener(
    "mousedown",
    event => {

        if (
            event.button === 0 &&
            gameStarted
        ) {
            mouseDown = true;
            fireWeapon();
        }

    }
);
document.addEventListener(
    "mouseup",
    event => {

        if (event.button === 0) {
            mouseDown = false;
        }

    }
);

// =====================================
// DÜRBÜN
// =====================================


/* =====================================
   SNIPER DÜRBÜN SİSTEMİ
===================================== */

const scopeOverlay = document.getElementById("scopeOverlay");
const crosshair = document.getElementById("crosshair");

let automaticScopeActive = false;

function disableScope() {
    scopeActive = false;
    automaticScopeActive = false;

    camera.fov = normalFov;
    camera.updateProjectionMatrix();

    if (scopeOverlay) {
        scopeOverlay.style.display = "none";
    }

    if (crosshair) {
        crosshair.style.display =
            gameStarted ? "block" : "none";
    }
}

document.addEventListener("mousedown", (event) => {
    if (event.button !== 2 || !gameStarted) return;

    if (currentWeapon === "sniper") {
        scopeActive = true;
        automaticScopeActive = false;

        camera.fov = 25;

        if (scopeOverlay) {
            scopeOverlay.style.display = "block";
        }

        if (crosshair) {
            crosshair.style.display = "none";
        }
    } else if (currentWeapon === "automatic") {
        scopeActive = false;
        automaticScopeActive = true;

        camera.fov = 50;

        if (scopeOverlay) {
            scopeOverlay.style.display = "none";
        }

        if (crosshair) {
            crosshair.style.display = "block";
        }
    }

    camera.updateProjectionMatrix();
});

document.addEventListener("mouseup", (event) => {
    if (event.button === 2) {
        disableScope();
    }
});

document.addEventListener("pointerup", (event) => {
    if (event.button === 2) {
        disableScope();
    }
});

window.addEventListener("blur", disableScope);

document.addEventListener("contextmenu", (event) => {
    event.preventDefault();
});




document.addEventListener(
    "contextmenu",
    event => {
        event.preventDefault();
    }
);



// =====================================
// R TUŞU
// =====================================

document.addEventListener(
    "keydown",
    event => {

        if (event.code === "KeyR") {

            reloadWeapon();

        }

    }
);


// =====================================
// HUD
// =====================================

function updateWeaponHUD() {
    const weaponElement = document.getElementById("weapon");
    if (!weaponElement) return;

    const weaponName =
        currentWeapon === "sniper"
            ? "🎯 SNIPER"
            : "🔫 OTOMATİK";

    if (isReloading) {
        weaponElement.textContent =
            `${weaponName} | YENİDEN DOLDURULUYOR...`;
        return;
    }

    weaponElement.textContent =
        `${weaponName} | ${ammo}/${maxAmmo} | 1/2: SİLAH DEĞİŞTİR`;
}
// =====================================
// SNIPER MODELİ
// =====================================

const sniperBody = new THREE.Mesh(
    new THREE.BoxGeometry(0.2, 0.2, 1.15),
    new THREE.MeshStandardMaterial({
        color: 0x30352f,
        metalness: 0.45,
        roughness: 0.65
    })
);

sniperBody.position.set(0.35, -0.28, -0.8);
weaponGroup.add(sniperBody);

const sniperBarrel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035, 0.045, 0.95, 12),
    new THREE.MeshStandardMaterial({
        color: 0x111111,
        metalness: 0.8,
        roughness: 0.35
    })
);

sniperBarrel.rotation.x = Math.PI / 2;
sniperBarrel.position.set(0.35, -0.24, -1.75);
weaponGroup.add(sniperBarrel);

const sniperScope = new THREE.Mesh(
    new THREE.CylinderGeometry(0.065, 0.065, 0.38, 16),
    new THREE.MeshStandardMaterial({
        color: 0x080a0b,
        metalness: 0.8,
        roughness: 0.25
    })
);

sniperScope.rotation.x = Math.PI / 2;
sniperScope.position.set(0.35, -0.13, -0.85);
weaponGroup.add(sniperScope);

// Başlangıçta sniper gizli
sniperBody.visible = false;
sniperBarrel.visible = false;
sniperScope.visible = false;


// =====================================
// SİLAH DEĞİŞTİRME
// =====================================

function switchWeapon(type) {
    if (type !== "automatic" && type !== "sniper") return;

    currentWeapon = type;
    setWeaponModel(type);
    isReloading = false;
    scopeActive = false;

    if (type === "automatic") {
        ammo = 30;
        maxAmmo = 30;
        fireRate = 100;
        weaponDamage = 34;

        weaponBody.visible = true;
        weaponBarrel.visible = true;

        sniperBody.visible = false;
        sniperBarrel.visible = false;
        sniperScope.visible = false;
    } else {
        ammo = 5;
        maxAmmo = 5;
        fireRate = 900;
        weaponDamage = 100;

        weaponBody.visible = false;
        weaponBarrel.visible = false;

        sniperBody.visible = true;
        sniperBarrel.visible = true;
        sniperScope.visible = true;
    }

    camera.fov = normalFov;
    camera.updateProjectionMatrix();

    document.getElementById("scopeOverlay").style.display = "none";
    document.getElementById("crosshair").style.display = "block";

    updateWeaponHUD();
}


// 1 = Otomatik, 2 = Sniper
document.addEventListener("keydown", event => {
    if (event.code === "Digit1") switchWeapon("automatic");
    if (event.code === "Digit2") switchWeapon("sniper");
});
// =====================================
// RENDERER
// =====================================

const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
);

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

document.body.appendChild(
    renderer.domElement
);


// =====================================
// IŞIKLAR
// =====================================

const ambientLight =
    new THREE.AmbientLight(
        0x7a7a7a,
        1.1
    );

scene.add(ambientLight);


const moonLight =
    new THREE.DirectionalLight(
        0x9ba8b8,
        1.5
    );

moonLight.position.set(
    -50,
    80,
    30
);

moonLight.castShadow = true;

moonLight.shadow.mapSize.width = 2048;
moonLight.shadow.mapSize.height = 2048;

scene.add(moonLight);


// =====================================
// MALZEMELER
// =====================================

const roadMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x202326,
        roughness: 0.95
    });

const sidewalkMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x55585a,
        roughness: 0.9
    });

const concreteMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x56595b,
        roughness: 0.95
    });

const darkConcreteMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x37393b,
        roughness: 1
    });

const windowMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x26343a,
        roughness: 0.5,
        metalness: 0.1
    });

const brokenWindowMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x11181b,
        roughness: 1
    });

const metalMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x242628,
        roughness: 0.8,
        metalness: 0.6
    });


// =====================================
// ENGELLER
// =====================================

const obstacles = [];

// =====================================
// BOT SİSTEMİ
// =====================================

const bots = [];
const BOT_MIN_X = -7;
const BOT_MAX_X = 7;
const BOT_MIN_Z = -135;
const BOT_MAX_Z = -25;
let score = 0;

const botSpeed = 0.035;
const botDetectionRange = 45;
const botAttackRange = 22;
const botShootCooldown = 700;
const botDamage = 10;
const raycaster = new THREE.Raycaster();
// =====================================
// ZEMİN
// =====================================


 // =====================================
 // AFTERMATH: İKİ TAKIMLI ŞEHİR HARİTASI
 // =====================================

 // Harita sınırları
 
const MAP_LEFT = -32;
const MAP_RIGHT = 32;
const MAP_TOP = 35;
const MAP_BOTTOM = -145;


 // Materyaller
 const groundMaterial = new THREE.MeshStandardMaterial({
     color: 0x292c2e,
     roughness: 1
 });

 const blueMaterial = new THREE.MeshStandardMaterial({
     color: 0x087cff,
     emissive: 0x003366,
     emissiveIntensity: 0.5
 });

 const redMaterial = new THREE.MeshStandardMaterial({
     color: 0xff3030,
     emissive: 0x550000,
     emissiveIntensity: 0.5
 });

 const rubbleMaterial = new THREE.MeshStandardMaterial({
     color: 0x45494b,
     roughness: 1
 });

 // Zemin
 
const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(64, 180),
    groundMaterial
);

ground.rotation.x = -Math.PI / 2;
ground.position.set(0, -0.04, -55);
ground.receiveShadow = true;
scene.add(ground);

 // Yeni haritada bütün nesneler engel listesine kaydedilir.
 // Böylece oyuncu binaların ve büyük siperlerin içinden geçemez.
 function addMapBox(
     x, y, z,
     width, height, depth,
     material,
     solid = true
 ) {
     const mesh = new THREE.Mesh(
         new THREE.BoxGeometry(width, height, depth),
         material
     );

     mesh.position.set(x, y + height / 2, z);
     mesh.castShadow = true;
     mesh.receiveShadow = true;
     scene.add(mesh);

     if (solid) {
         const box = new THREE.Box3().setFromObject(mesh);
         obstacles.push({ mesh, box });
     }

     return mesh;
 }

 // Yol parçaları

function createRoad(x, z, width, depth) {
    const road = new THREE.Mesh(
        new THREE.BoxGeometry(width, 0.08, depth),
        roadMaterial
    );

    road.position.set(x, 0.005, z);
    road.receiveShadow = true;

    scene.add(road);
}

// ANA YOL
createRoad(0, -55, 12, 174);

// YAN YOLLAR
createRoad(-16, -55, 8, 174);
createRoad(16, -55, 8, 174);



 

 // Yol çizgileri
 const roadLineMaterial = new THREE.MeshBasicMaterial({
     color: 0x777777
 });

 for (let z = 25; z >= -140; z -= 10) {
     const line = new THREE.Mesh(
         new THREE.BoxGeometry(0.18, 0.025, 4),
         roadLineMaterial
     );

     line.position.set(0, 0.045, z);
     scene.add(line);
 }

 // Bina oluşturma
 function createBuilding(x, z, width, height, depth) {
     // Bina tabanı tam olarak y = 0 seviyesinde olsun.
addMapBox(
    x,
    0,
    z,
    width,
    height,
    depth,
    concreteMaterial
);
     // Kırık cam görünümlü cephe panelleri
     
    // Dört cepheye kırık cam görünümlü pencereler
    const floors = Math.max(2, Math.floor(height / 4));
    const frontColumns = Math.max(2, Math.floor(width / 3));
    const sideColumns = Math.max(2, Math.floor(depth / 3));

    function addWindow(wx, wy, wz, rotationY = 0) {
        const windowMesh = new THREE.Mesh(
            new THREE.BoxGeometry(1.1, 1.4, 0.06),
            Math.random() > 0.3
                ? windowMaterial
                : brokenWindowMaterial
        );

        windowMesh.position.set(wx, wy, wz);
        windowMesh.rotation.y = rotationY;
        scene.add(windowMesh);
    }

    for (let floor = 0; floor < floors; floor++) {
        const wy = 2.2 + floor * 4;

        if (wy > height - 1) continue;

        // Ön ve arka cephe
        for (let col = 0; col < frontColumns; col++) {
            const wx =
                x - width / 2 +
                (width / (frontColumns + 1)) * (col + 1);

            addWindow(wx, wy, z - depth / 2 - 0.035);
            addWindow(wx, wy, z + depth / 2 + 0.035);
        }

        // Sol ve sağ cephe
        for (let col = 0; col < sideColumns; col++) {
            const wz =
                z - depth / 2 +
                (depth / (sideColumns + 1)) * (col + 1);

            addWindow(x - width / 2 - 0.035, wy, wz, Math.PI / 2);
            addWindow(x + width / 2 + 0.035, wy, wz, Math.PI / 2);
        }
    }
 }
 
 // SOL BİNALAR
createBuilding(-26, 8,    9,  11, 14);
createBuilding(-26, -18,  9,  13, 16);
createBuilding(-26, -55,  9,  15, 16);
createBuilding(-26, -94,  9,  14, 18);
createBuilding(-26, -128, 9,  12, 14);

// SAĞ BİNALAR
createBuilding(26, 8,     9,  11, 14);
createBuilding(26, -20,   9,  13, 16);
createBuilding(26, -58,   9,  15, 16);
createBuilding(26, -96,   9,  14, 18);
createBuilding(26, -128,  9,  12, 14);


 // Beton siperler
 function createCover(x, z, rotation = 0, width = 4) {
     const cover = addMapBox(
         x, 0, z,
         width, 1.35, 0.65,
         rubbleMaterial
     );

     cover.rotation.y = rotation;

     // Döndürülmüş siperler için güncel çarpışma kutusu
     const obstacle = obstacles.find(item => item.mesh === cover);
     if (obstacle) {
         obstacle.box.setFromObject(cover);
     }
 }

 createCover(-7, 22, 0.1, 5);
 createCover(7, 22, -0.1, 5);

 createCover(-6, 3, 0.15, 4);
 createCover(6, 0, -0.2, 4);

 createCover(-8, -17, 0.2, 5);
 createCover(8, -30, -0.2, 5);

 createCover(-6, -48, -0.2, 5);
 createCover(6, -53, 0.2, 5);

 createCover(-8, -68, 0.15, 5);
 createCover(8, -83, -0.15, 5);

 createCover(-6, -101, 0.2, 5);
 createCover(6, -112, -0.2, 5);

 createCover(-7, -128, -0.1, 5);
 createCover(7, -128, 0.1, 5);

 // Terk edilmiş araçlar
 function createCar(x, z, rotation = 0, color = 0x493a36) {
     const car = new THREE.Group();

     const body = new THREE.Mesh(
         new THREE.BoxGeometry(2.2, 0.75, 4.2),
         new THREE.MeshStandardMaterial({
             color,
             roughness: 0.9
         })
     );

     body.position.y = 0.65;
     body.castShadow = true;
     car.add(body);

     const cabin = new THREE.Mesh(
         new THREE.BoxGeometry(1.65, 0.65, 2),
         brokenWindowMaterial
     );

     cabin.position.set(0, 1.2, -0.15);
     car.add(cabin);

     for (const p of [
         [-1, 0.4, -1.3],
         [1, 0.4, -1.3],
         [-1, 0.4, 1.3],
         [1, 0.4, 1.3]
     ]) {
         const wheel = new THREE.Mesh(
             new THREE.CylinderGeometry(0.36, 0.36, 0.22, 12),
             metalMaterial
         );

         wheel.rotation.z = Math.PI / 2;
         wheel.position.set(...p);
         car.add(wheel);
     }

     car.position.set(x, 0, z);
     car.rotation.y = rotation;
     scene.add(car);

     const box = new THREE.Box3().setFromObject(car);
     obstacles.push({ mesh: car, box });
 }

 createCar(-4, 10, 0.15, 0x353d42);
 createCar(4, -12, -0.2, 0x554038);
 createCar(-4, -43, 0.1, 0x393c40);
 createCar(4, -78, -0.15, 0x494038);
 createCar(-4, -105, 0.2, 0x343c40);
 createCar(4, -126, -0.1, 0x51403b);

 // Enkaz parçaları
 function createDebris(x, z, size, rotation = 0) {
     const debris = new THREE.Mesh(
         new THREE.BoxGeometry(size, size * 0.65, size * 1.2),
         rubbleMaterial
     );

     debris.position.set(x, size * 0.3, z);
     debris.rotation.y = rotation;
     debris.rotation.z = rotation * 0.3;
     debris.castShadow = true;
     scene.add(debris);
 }

 for (const p of [
     [-12, 12, 1.4, 0.3],
     [12, -8, 1.1, 0.7],
     [-12, -34, 1.5, 0.4],
     [12, -44, 1.3, 0.2],
     [-12, -64, 1.4, 0.8],
     [12, -90, 1.5, 0.5],
     [-12, -115, 1.2, 0.3],
     [12, -132, 1.4, 0.7]
 ]) {
     createDebris(...p);
 }

 // Takım üsleri
 function createTeamBase(z, material, label) {
     // Üssün renkli arka işareti
     const strip = new THREE.Mesh(
         new THREE.BoxGeometry(16, 0.08, 1.1),
         material
     );

     strip.position.set(0, 0.06, z);
     scene.add(strip);

     // Takım renginde işaret direkleri
     for (const x of [-7, 7]) {
         addMapBox(
             x, 0, z,
             0.35, 3.5, 0.35,
             material
         );
     }

     // Üs etiketi
     const canvas = document.createElement("canvas");
     canvas.width = 512;
     canvas.height = 128;

     const ctx = canvas.getContext("2d");
     ctx.fillStyle = "#101416";
     ctx.fillRect(0, 0, 512, 128);
     ctx.fillStyle = label === "MAVİ TAKIM" ? "#42a5ff" : "#ff4545";
     ctx.font = "bold 48px Arial";
     ctx.textAlign = "center";
     ctx.fillText(label, 256, 80);

     const texture = new THREE.CanvasTexture(canvas);
     const sign = new THREE.Mesh(
         new THREE.PlaneGeometry(8, 2),
         new THREE.MeshBasicMaterial({
             map: texture,
             transparent: true,
             side: THREE.DoubleSide
         })
     );

     sign.position.set(0, 4, z);
     scene.add(sign);
 }

 createTeamBase(25, blueMaterial, "MAVİ TAKIM");
 createTeamBase(-135, redMaterial, "KIRMIZI TAKIM");

 // Harita sınırları
 function createMapBoundary(x, z, width, depth) {
     const wall = new THREE.Mesh(
         new THREE.BoxGeometry(width, 8, depth),
         new THREE.MeshBasicMaterial({
             transparent: true,
             opacity: 0,
             depthWrite: false
         })
     );

     wall.position.set(x, 4, z);
     scene.add(wall);

     const box = new THREE.Box3().setFromObject(wall);
     obstacles.push({ mesh: wall, box });
 }

 // Yan sınırlar
 
createMapBoundary(MAP_LEFT, -55, 1, 184);
createMapBoundary(MAP_RIGHT, -55, 1, 184);
createMapBoundary(0, MAP_TOP, 64, 1);
createMapBoundary(0, MAP_BOTTOM, 64, 1);

 // Sokak lambaları
 function createStreetLight(x, z) {
     const group = new THREE.Group();

     const pole = new THREE.Mesh(
         new THREE.CylinderGeometry(0.1, 0.16, 5.5, 8),
         metalMaterial
     );

     pole.position.y = 2.75;
     group.add(pole);

     const arm = new THREE.Mesh(
         new THREE.BoxGeometry(1, 0.1, 0.1),
         metalMaterial
     );

     arm.position.set(0.4, 5.2, 0);
     group.add(arm);

     const lamp = new THREE.Mesh(
         new THREE.SphereGeometry(0.2, 10, 10),
         new THREE.MeshStandardMaterial({
             color: 0xffbb66,
             emissive: 0xff7a22,
             emissiveIntensity: 1.5
         })
     );

     lamp.position.set(0.8, 5.05, 0);
     group.add(lamp);

     const light = new THREE.PointLight(0xff9944, 1.5, 16);
     light.position.set(0.8, 5, 0);
     group.add(light);

     group.position.set(x, 0, z);
     scene.add(group);
 }

 for (let z = 20; z >= -135; z -= 25) {
     createStreetLight(-14, z);
     createStreetLight(14, z);
 }

// =====================================
// BOTLAR
// =====================================


function spawnBots() {
    const BOT_COUNT = 12;
    const MIN_DISTANCE_FROM_PLAYER = 35;
    const MIN_DISTANCE_BETWEEN_BOTS = 12;

    // Botların doğabileceği alan
    const MIN_X = -7;
    const MAX_X = 7;
    const MIN_Z = -135;
    const MAX_Z = -40;

    let spawned = 0;
    let attempts = 0;

    while (spawned < BOT_COUNT && attempts < 1000) {
        attempts++;

        const x = MIN_X + Math.random() * (MAX_X - MIN_X);
        const z = MIN_Z + Math.random() * (MAX_Z - MIN_Z);

        const spawnPosition = new THREE.Vector3(x, 0, z);

        // Oyuncuya çok yakın olmasın
        if (
            Math.hypot(
                camera.position.x - x,
                camera.position.z - z
            ) < MIN_DISTANCE_FROM_PLAYER
        ) {
            continue;
        }

        // Engel kontrolü
        let blocked = false;

        for (const obstacle of obstacles) {
            if (!obstacle.box) continue;

            const box = obstacle.box.clone();
            box.expandByScalar(1.5);

            if (box.containsPoint(spawnPosition)) {
                blocked = true;
                break;
            }
        }

        if (blocked) continue;

        // Diğer botlarla mesafe kontrolü
        let tooCloseToBot = false;

        for (const bot of bots) {
            const distance = Math.hypot(
                bot.mesh.position.x - x,
                bot.mesh.position.z - z
            );

            if (distance < MIN_DISTANCE_BETWEEN_BOTS) {
                tooCloseToBot = true;
                break;
            }
        }

        if (tooCloseToBot) continue;

        createBot(x, z);
        spawned++;
    }

    
}


function spawnOneBot() {
    const MIN_DISTANCE_FROM_PLAYER = 35;
    const MIN_DISTANCE_BETWEEN_BOTS = 12;

    let attempts = 0;

    while (attempts < 500) {
        attempts++;

       const x = THREE.MathUtils.randFloat(BOT_MIN_X, BOT_MAX_X);
       const z = THREE.MathUtils.randFloat(BOT_MIN_Z, BOT_MAX_Z);
        const spawnPosition = new THREE.Vector3(x, 0, z);

        // Oyuncuya çok yakınsa tekrar dene
        if (spawnPosition.distanceTo(camera.position) < MIN_DISTANCE_FROM_PLAYER) {
            continue;
        }

        // Binanın/engelin içine spawn olmasın
        let blocked = false;

        for (const obstacle of obstacles) {
            if (!obstacle.box) continue;

            const box = obstacle.box.clone();
            box.expandByScalar(1.5);

            if (box.containsPoint(spawnPosition)) {
                blocked = true;
                break;
            }
        }

        if (blocked) continue;

        // Diğer botlara çok yakın olmasın
        let tooCloseToBot = false;

        for (const bot of bots) {
            const distance = Math.hypot(
                bot.mesh.position.x - x,
                bot.mesh.position.z - z
            );

            if (distance < MIN_DISTANCE_BETWEEN_BOTS) {
                tooCloseToBot = true;
                break;
            }
        }

        if (tooCloseToBot) continue;

        createBot(x, z);
        return;
    }

    
}
// =====================================
// BOT OYUNCUYU GÖRÜYOR MU?
// =====================================

function botCanSeePlayer(bot) {

    const botPosition =
        bot.mesh.position.clone();

    botPosition.y = 1.5;


    const playerPosition =
        camera.position.clone();


    const direction =
        playerPosition
            .sub(botPosition)
            .normalize();


    const distance =
        botPosition.distanceTo(
            camera.position
        );


    if (
        distance >
        botDetectionRange
    ) {
        return false;
    }


    raycaster.set(
        botPosition,
        direction
    );


    const hits =
        raycaster.intersectObjects(
            scene.children,
            true
        );


    for (
        const hit of hits
    ) {

        if (
            hit.object === bot.mesh ||
            bot.mesh.children.includes(
                hit.object
            )
        ) {
            continue;
        }


        if (
            hit.distance <
            distance
        ) {
            return false;
        }

    }


    return true;
}
// =====================================
// BOT HAREKETİ
// =====================================

function updateBots() {

    if (!gameStarted) return;

    for (const bot of bots) {

        if (!bot.alive) continue;

        const botPosition =
            bot.mesh.position;

        const playerPosition =
            camera.position;

        const distance =
            botPosition.distanceTo(
                playerPosition
            );

        const seesPlayer =
            botCanSeePlayer(bot);

        // Oyuncuyu görüyorsa ona dön
        if (seesPlayer) {

            bot.mesh.lookAt(
                playerPosition.x,
                bot.mesh.position.y,
                playerPosition.z
            );

            // Çok yakındaysa biraz uzaklaş
            if (distance < 8) {
               bot.mesh.position.x = THREE.MathUtils.clamp(
               bot.mesh.position.x,
                  BOT_MIN_X,
                  BOT_MAX_X
                 );

            bot.mesh.position.z = THREE.MathUtils.clamp(
             bot.mesh.position.z,
             BOT_MIN_Z,
             BOT_MAX_Z
     );
                const direction =
                    new THREE.Vector3(
                        botPosition.x - playerPosition.x,
                        0,
                        botPosition.z - playerPosition.z
                    );

                if (direction.length() > 0) {

                    direction.normalize();

                    bot.mesh.position.x +=
                        direction.x * botSpeed;

                    bot.mesh.position.z +=
                        direction.z * botSpeed;

                }

            }

            // Menzildeyse ateş et
            if (distance <= botAttackRange) {

                botAttack(bot);

            }

        }

    }

}
// =====================================
// BOT SALDIRISI
// =====================================

function botAttack(bot) {

    const now =
        performance.now();


    if (
        now <
        bot.attackCooldown
    ) {
        return;
    }


    bot.attackCooldown =
        now + botShootCooldown;
    playSound("botAttack");

    const healthElement =
        document.getElementById(
            "health"
        );


    let currentHealth =
        parseInt(
            healthElement.dataset.health ||
            "100"
        );


    currentHealth -= botDamage;
    playSound("playerHurt");



    healthElement.dataset.health =
        currentHealth;


    healthElement.textContent =
        `❤️ CAN: ${currentHealth}`;


    if (
        currentHealth <= 0
    ) {

        currentHealth = 0;

        healthElement.textContent =
            "❤️ CAN: 0";


        gameOver();

    }

}
// =====================================
// FPS CONTROLLER
// =====================================

document
    .getElementById("scopeOverlay")
    .style.display = "none";

document
    .getElementById("crosshair")
    .style.display = "block";
let yaw = 0;

let pitch = 0;

const keys = {};


// =====================================
// KLAVYE
// =====================================

document.addEventListener(
    "keydown",
    event => {

        keys[event.code] = true;

    }
);


document.addEventListener(
    "keyup",
    event => {

        keys[event.code] = false;

    }
);


// =====================================
// MOUSE
// =====================================

document.addEventListener(
    "mousemove",
    event => {

        if (!gameStarted) return;


        const sensitivity = 0.002;


        yaw -=
            event.movementX *
            sensitivity;


        pitch -=
            event.movementY *
            sensitivity;


        pitch = Math.max(
            -Math.PI / 2.2,
            Math.min(
                Math.PI / 2.2,
                pitch
            )
        );


        camera.rotation.y =
            yaw;

        camera.rotation.x =
            pitch;

    }
);


// =====================================
// HAREKET
// =====================================

function updatePlayer() {

    if (!gameStarted) return;
    if (onlineMode && !isLocalPlayerAlive) return;


    let speed = 0.15;


    if (
        keys.ShiftLeft ||
        keys.ShiftRight
    ) {

        speed = 0.23;

    }


    const direction =
        new THREE.Vector3();


    if (keys.KeyW) {
        direction.z -= 1;
    }

    if (keys.KeyS) {
        direction.z += 1;
    }

    if (keys.KeyA) {
        direction.x -= 1;
    }

    if (keys.KeyD) {
        direction.x += 1;
    }


    if (
        direction.length() === 0
    ) {
        return;
    }


    direction.normalize();


    direction.applyAxisAngle(
        new THREE.Vector3(
            0,
            1,
            0
        ),
        yaw
    );


    const newPosition =
        camera.position.clone();


    newPosition.x +=
        direction.x *
        speed;

    newPosition.z +=
        direction.z *
        speed;


    if (
        !checkCollision(
            newPosition
        )
    ) {

        camera.position.x =
            newPosition.x;

        camera.position.z =
            newPosition.z;

    }

}


// =====================================
// ÇARPIŞMA
// =====================================

function checkCollision(
    position
) {

    const playerBox =
        new THREE.Box3(
            new THREE.Vector3(
                position.x - 0.4,
                0,
                position.z - 0.4
            ),
            new THREE.Vector3(
                position.x + 0.4,
                2,
                position.z + 0.4
            )
        );


    for (
        const obstacle of obstacles
    ) {

        if (
            playerBox.intersectsBox(
                obstacle.box
            )
        ) {

            return true;

        }

    }


    return false;
}


// =====================================
// OYUNU BAŞLAT
// =====================================

const startButton = document.getElementById("startButton");

let joiningMatch = false;

startButton.addEventListener("click", async () => {
    if (joiningMatch) return;

    joiningMatch = true;
    startButton.disabled = true;

    const buttonText = startButton.querySelector(".play-text strong");
    const originalText = buttonText?.textContent || "OYNA";

    if (buttonText) {
        buttonText.textContent = "MAÇ ARANIYOR...";
    }

    try {
        const name =
            document.getElementById("playerName")?.value?.trim()
            || "Oyuncu";

        await joinRandomRoom(name);

        onlineMode = true;

        // Online maçta tek oyunculu botları kaldır.
        for (const bot of [...bots]) {
            scene.remove(bot.mesh);
        }

        bots.length = 0;

        // Takıma göre başlangıç konumu.
        const team = getCurrentTeam();

        camera.position.set(
    team === "blue" ? 0 : 0,
    2,
    team === "blue" ? 19 : -129
);

yaw = team === "blue" ? 0 : Math.PI;
pitch = 0;
camera.rotation.set(0, yaw, 0);

        yaw = team === "blue" ? 0 : Math.PI;
        pitch = 0;
        camera.rotation.set(0, yaw, 0);

        updateMyStats({
            health: 100,
            score: 0,
            kills: 0,
            deaths: 0,
            alive: true
        });

        document.body.requestPointerLock();

    } catch (error) {
    console.error("Online maç başlatılamadı:", error);
    console.error("Hata kodu:", error.code);
    console.error("Hata mesajı:", error.message);

    alert(
        "MAÇA KATILINAMADI!\n\n" +
        "Hata kodu: " + (error.code || "Bilinmiyor") +
        "\nAçıklama: " + (error.message || String(error))
    );
}finally {
        joiningMatch = false;
        startButton.disabled = false;

        if (buttonText) {
            buttonText.textContent = originalText;
        }
    }
});


// =====================================
// POINTER LOCK
// =====================================


document.addEventListener("pointerlockchange", () => {
    const menu = document.getElementById("menu");
    const gameOver = document.getElementById("gameOverScreen");
    const hud = document.getElementById("hud");
    const crosshair = document.getElementById("crosshair");

    const locked = document.pointerLockElement === document.body;

    if (locked) {
        gameStarted = true;

        menu.style.display = "none";
        gameOver.style.display = "none";
        hud.style.display = "block";
        crosshair.style.display = scopeActive ? "none" : "block";

        playAmbience();
    } else {
        gameStarted = false;
        mouseDown = false;

        stopAmbience();

        hud.style.display = "none";
        crosshair.style.display = "none";

        // Oyun bittiyse menüyü sonuç ekranının önüne getirme.
        if (gameOver.style.display !== "flex") {
            menu.style.display = "flex";
        }
    }
});



// =====================================
// RESIZE
// =====================================

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
// =====================================
// TEKRAR OYNA
// =====================================

document
    .getElementById("restartButton")
    .addEventListener(
        "click",
        () => {

            location.reload();

        }
    );
// =====================================
// MİNİ HARİTA
// =====================================

const minimapCanvas =
    document.getElementById("minimapCanvas");

const minimapCtx =
    minimapCanvas.getContext("2d");


// Haritanın dünya koordinatları
const MAP_MIN_X = -32;
const MAP_MAX_X = 32;

const MAP_MIN_Z = -145;
const MAP_MAX_Z = 35;

function worldToMinimap(x, z) {

    const mapWidth =
        MAP_MAX_X - MAP_MIN_X;

    const mapHeight =
        MAP_MAX_Z - MAP_MIN_Z;

    const px =
        ((x - MAP_MIN_X) / mapWidth) *
        minimapCanvas.width;

    const pz =
        ((MAP_MAX_Z - z) / mapHeight) *
        minimapCanvas.height;

    return {
        x: px,
        y: pz
    };
}


function drawMinimap() {

    const ctx = minimapCtx;

    const width =
        minimapCanvas.width;

    const height =
        minimapCanvas.height;


    // Arka plan
    ctx.fillStyle = "#101416";
    ctx.fillRect(
        0,
        0,
        width,
        height
    );


    // Üç paralel savaş rotası
ctx.fillStyle = "#292d30";

for (const x of [-23, -5, 13]) {
    const top = worldToMinimap(x - 5, MAP_MAX_Z);
    const bottom = worldToMinimap(x + 5, MAP_MIN_Z);

    ctx.fillRect(
        top.x,
        top.y,
        bottom.x - top.x,
        bottom.y - top.y
    );
}

// Takım üsleri
const blueBase = worldToMinimap(0, 25);
const redBase = worldToMinimap(0, -135);

ctx.fillStyle = "#087cff";
ctx.fillRect(blueBase.x - 12, blueBase.y - 3, 24, 6);

ctx.fillStyle = "#ff3030";
ctx.fillRect(redBase.x - 12, redBase.y - 3, 24, 6);

    // =================================
    // BOTLAR
    // =================================

    for (const bot of bots) {

        if (!bot.alive) continue;

        const position =
            worldToMinimap(
                bot.mesh.position.x,
                bot.mesh.position.z
            );


        ctx.fillStyle =
            "#ff3030";

        ctx.beginPath();

        ctx.arc(
            position.x,
            position.y,
            4,
            0,
            Math.PI * 2
        );

        ctx.fill();

    }


    // =================================
    // OYUNCU
    // =================================

    const player =
        worldToMinimap(
            camera.position.x,
            camera.position.z
        );


    ctx.fillStyle =
        "#00ff88";

    ctx.beginPath();

    ctx.arc(
        player.x,
        player.y,
        5,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // Oyuncunun baktığı yön
    const direction =
        new THREE.Vector3(
            0,
            0,
            -1
        );

    direction.applyQuaternion(
        camera.quaternion
    );


    const lookLength = 10;

    ctx.strokeStyle =
        "#00ff88";

    ctx.lineWidth = 2;

    ctx.beginPath();

    ctx.moveTo(
        player.x,
        player.y
    );

    ctx.lineTo(
        player.x +
        direction.x *
        lookLength,

        player.y +
        direction.z *
        -lookLength
    );

    ctx.stroke();


    // =================================
    // ÇERÇEVE
    // =================================

    ctx.strokeStyle =
        "rgba(255,255,255,0.25)";

    ctx.lineWidth = 2;

    ctx.strokeRect(
        0,
        0,
        width,
        height
    );


    // Başlık
    ctx.fillStyle =
        "rgba(255,255,255,0.8)";

    ctx.font =
        "bold 12px Arial";

    ctx.fillText(
        "HARİTA",
        8,
        16
    );
}

/* =========================================
   AFTERMATH 3D WEAPON SYSTEM
   Procedural Three.js weapon models
========================================= */

let currentWeaponModel = null;
let weaponMuzzleFlash = null;
let weaponRecoil = 0;
let weaponBob = 0;

const weaponMaterials = {
    metal: new THREE.MeshStandardMaterial({
        color: 0x343a40,
        metalness: 0.85,
        roughness: 0.28
    }),
    darkMetal: new THREE.MeshStandardMaterial({
        color: 0x171b20,
        metalness: 0.75,
        roughness: 0.35
    }),
    polymer: new THREE.MeshStandardMaterial({
        color: 0x252a27,
        metalness: 0.12,
        roughness: 0.78
    }),
    grip: new THREE.MeshStandardMaterial({
        color: 0x111512,
        roughness: 0.95
    }),
    glass: new THREE.MeshStandardMaterial({
        color: 0x163d49,
        metalness: 0.6,
        roughness: 0.12,
        emissive: 0x06151a
    }),
    gold: new THREE.MeshStandardMaterial({
        color: 0xb6a16a,
        metalness: 0.85,
        roughness: 0.3
    }),
    orange: new THREE.MeshBasicMaterial({
        color: 0xffa52f
    })
};

function weaponBox(parent, size, position, material, rotation = null) {
    const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(size[0], size[1], size[2]),
        material
    );

    mesh.position.set(position[0], position[1], position[2]);

    if (rotation) {
        mesh.rotation.set(rotation[0], rotation[1], rotation[2]);
    }

    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);

    return mesh;
}

function weaponCylinder(
    parent,
    radiusTop,
    radiusBottom,
    length,
    position,
    material
) {
    const mesh = new THREE.Mesh(
        new THREE.CylinderGeometry(
            radiusTop,
            radiusBottom,
            length,
            16
        ),
        material
    );

    // Cylinder'ın uzun eksenini Z yönüne çevir.
    mesh.rotation.x = Math.PI / 2;
    mesh.position.set(position[0], position[1], position[2]);
    mesh.castShadow = true;
    parent.add(mesh);

    return mesh;
}

function weaponRing(parent, radius, tube, position, material) {
    const mesh = new THREE.Mesh(
        new THREE.TorusGeometry(radius, tube, 8, 20),
        material
    );

    mesh.position.set(position[0], position[1], position[2]);
    parent.add(mesh);

    return mesh;
}


function createWeaponModel(type = "automatic") {
    const gun = new THREE.Group();
    const M = weaponMaterials;
    const sniper = type === "sniper";

    // Silaha özel malzemeler
    const carbon = new THREE.MeshStandardMaterial({
        color: sniper ? 0x202b35 : 0x171c22,
        metalness: 0.55,
        roughness: 0.38
    });

    const edge = new THREE.MeshStandardMaterial({
        color: 0x59636a,
        metalness: 0.9,
        roughness: 0.25
    });

    const accent = new THREE.MeshStandardMaterial({
        color: sniper ? 0xb7a06a : 0x00e6bd,
        emissive: sniper ? 0x30200a : 0x003d32,
        emissiveIntensity: 0.7,
        metalness: 0.65,
        roughness: 0.3
    });

    const rubber = new THREE.MeshStandardMaterial({
        color: 0x101311,
        roughness: 0.96
    });

    const glass = new THREE.MeshStandardMaterial({
        color: 0x164d61,
        emissive: 0x082632,
        metalness: 0.85,
        roughness: 0.12
    });

    // Yardımcı parça oluşturucu
    function box(size, pos, mat, rot = [0, 0, 0]) {
        return weaponBox(gun, size, pos, mat, rot);
    }

    function cylinder(rt, rb, len, pos, mat) {
        return weaponCylinder(gun, rt, rb, len, pos, mat);
    }

    // =====================================
    // ANA GÖVDE
    // =====================================

    box(
        [0.19, 0.19, 0.53],
        [0, 0, -0.28],
        carbon
    );

    box(
        [0.17, 0.045, 0.47],
        [0, 0.115, -0.28],
        edge
    );

    box(
        [0.145, 0.025, 0.43],
        [0, 0.139, -0.28],
        carbon
    );

    // Gövde yan plakaları
    for (const side of [-1, 1]) {
        box(
            [0.014, 0.105, 0.35],
            [side * 0.099, 0, -0.28],
            edge
        );

        box(
            [0.016, 0.075, 0.30],
            [side * 0.108, 0, -0.28],
            carbon
        );

        // Metal gövde pimleri
        for (const z of [-0.12, -0.28, -0.43]) {
            cylinder(
                0.018, 0.018, 0.012,
                [side * 0.117, 0.025, z],
                accent
            );
        }
    }

    // =====================================
    // ÜST RAY VE NİŞANGÂH
    // =====================================

    box(
        [0.075, 0.035, 0.66],
        [0, 0.16, -0.47],
        rubber
    );

    for (let i = 0; i < 13; i++) {
        box(
            [0.085, 0.012, 0.022],
            [0, 0.183, -0.19 - i * 0.045],
            edge
        );
    }

    if (!sniper) {
        // Otomatik silahın kompakt holografik nişangâhı
        box(
            [0.09, 0.075, 0.12],
            [0, 0.235, -0.20],
            rubber
        );

        box(
            [0.065, 0.055, 0.012],
            [0, 0.25, -0.14],
            glass
        );

        box(
            [0.012, 0.018, 0.014],
            [0, 0.25, -0.13],
            accent
        );
    }

    // =====================================
    // ÖN EL KUNDAĞI
    // =====================================

    box(
        [0.155, 0.15, sniper ? 0.48 : 0.38],
        [0, -0.005, sniper ? -0.70 : -0.63],
        carbon
    );

    for (const side of [-1, 1]) {
        for (let i = 0; i < 7; i++) {
            box(
                [0.012, 0.019, 0.028],
                [
                    side * 0.082,
                    0.015,
                    (sniper ? -0.50 : -0.48) - i * 0.045
                ],
                edge
            );
        }

        // Yan raylar
        box(
            [0.025, 0.055, 0.32],
            [side * 0.085, -0.005, -0.68],
            rubber
        );

        for (let i = 0; i < 6; i++) {
            box(
                [0.012, 0.012, 0.035],
                [side * 0.101, 0.005, -0.54 - i * 0.045],
                accent
            );
        }
    }

    // =====================================
    // NAMLU
    // =====================================

    const barrelLength = sniper ? 0.92 : 0.60;
    const barrelZ = sniper ? -1.37 : -1.12;

    cylinder(
        0.032, 0.041, barrelLength,
        [0, 0.012, barrelZ],
        edge
    );

    cylinder(
        0.044, 0.044, 0.065,
        [0, 0.012, barrelZ - barrelLength / 2],
        carbon
    );

    cylinder(
        0.031, 0.031, 0.025,
        [0, 0.012, barrelZ - barrelLength / 2 - 0.04],
        rubber
    );

    // Namlu üzerindeki halka
    cylinder(
        0.046, 0.046, 0.035,
        [0, 0.012, barrelZ + 0.12],
        accent
    );

    // =====================================
    // KABZA VE TETİK
    // =====================================

    box(
        [0.105, 0.21, 0.14],
        [0, -0.17, -0.12],
        rubber,
        [-0.20, 0, 0]
    );

    for (let i = 0; i < 5; i++) {
        box(
            [0.108, 0.012, 0.015],
            [0, -0.12 - i * 0.026, -0.055],
            edge
        );
    }

    box(
        [0.075, 0.014, 0.105],
        [0, -0.105, -0.07],
        edge
    );

    // =====================================
    // ŞARJÖR
    // =====================================

    box(
        [0.115, sniper ? 0.17 : 0.24, 0.17],
        [0, sniper ? -0.17 : -0.19, -0.32],
        carbon,
        [0.10, 0, 0]
    );

    box(
        [0.12, 0.022, 0.18],
        [0, sniper ? -0.26 : -0.32, -0.32],
        rubber
    );

    for (let i = 0; i < 5; i++) {
        box(
            [0.008, 0.12, 0.012],
            [-0.061, -0.19, -0.37 + i * 0.024],
            edge
        );
    }

    // =====================================
    // DİPÇİK
    // =====================================

    box(
        [0.14, 0.14, sniper ? 0.36 : 0.30],
        [0, -0.015, 0.12],
        carbon
    );

    box(
        [0.15, 0.15, 0.045],
        [0, -0.015, sniper ? 0.31 : 0.28],
        rubber
    );

    box(
        [0.105, 0.035, 0.21],
        [0, 0.075, 0.12],
        edge
    );

    // =====================================
    // SNIPER ÖZEL TASARIMI
    // =====================================

    if (sniper) {
        // Uzun, ağır namlu üstü gövdesi
        box(
            [0.075, 0.065, 0.62],
            [0, 0.075, -0.78],
            carbon
        );

        // Büyük optik dürbün
        cylinder(
            0.062, 0.062, 0.34,
            [0, 0.265, -0.36],
            rubber
        );

        cylinder(
            0.079, 0.067, 0.055,
            [0, 0.265, -0.17],
            edge
        );

        cylinder(
            0.072, 0.072, 0.045,
            [0, 0.265, -0.55],
            edge
        );

        // Ön optik cam
        cylinder(
            0.055, 0.055, 0.014,
            [0, 0.265, -0.565],
            glass
        );

        // Dürbün ayar düğmeleri
        cylinder(
            0.036, 0.036, 0.065,
            [0, 0.33, -0.36],
            edge
        );

        cylinder(
            0.027, 0.027, 0.06,
            [0.075, 0.265, -0.36],
            accent
        );

        // Dürbün bağlantı ayakları
        box(
            [0.035, 0.07, 0.065],
            [0, 0.205, -0.27],
            edge
        );

        box(
            [0.035, 0.07, 0.065],
            [0, 0.205, -0.46],
            edge
        );

        // Bipod, katlanmış destek ayakları
        for (const side of [-1, 1]) {
            box(
                [0.025, 0.24, 0.035],
                [side * 0.075, -0.10, -0.83],
                edge,
                [0, 0, side * -0.12]
            );
        }

        // Sniper gövdesinde altın renkli ince detaylar
        for (let i = 0; i < 4; i++) {
            box(
                [0.012, 0.055, 0.018],
                [-0.101, 0.02, -0.20 - i * 0.07],
                accent
            );
        }
    } else {
        // Otomatik silah için yan şarjör mandalı
        box(
            [0.035, 0.035, 0.075],
            [0.125, -0.075, -0.31],
            accent
        );

        // Kompakt ön nişangâh
        box(
            [0.035, 0.075, 0.035],
            [0, 0.21, -0.88],
            edge
        );
    }

    // =====================================
    // ATEŞ PARLAMASI
    // =====================================

    const flash = new THREE.Group();

    const flashCore = new THREE.Mesh(
        new THREE.ConeGeometry(0.065, 0.23, 8),
        new THREE.MeshBasicMaterial({
            color: 0xffd27a
        })
    );

    flashCore.rotation.x = -Math.PI / 2;
    flash.add(flashCore);

    const flashLight = new THREE.PointLight(
        0xffa347,
        0,
        3
    );

    flash.add(flashLight);

    flash.position.set(
        0,
        0.012,
        barrelZ - barrelLength / 2 - 0.055
    );

    flash.visible = false;
    gun.add(flash);

    gun.userData.muzzleFlash = flash;
    gun.userData.muzzleLight = flashLight;

    // Silahın ekrandaki konumu
    gun.position.set(
        0.34,
        -0.33,
        sniper ? -0.48 : -0.48
    );

    gun.rotation.set(-0.035, -0.045, -0.015);

    gun.traverse((obj) => {
        if (obj.isMesh) {
            obj.castShadow = false;
            obj.receiveShadow = false;
        }
    });

    camera.add(gun);

    return gun;
}


// Silah modelini oluştur veya değiştir
function setWeaponModel(type) {
    if (currentWeaponModel) {
        camera.remove(currentWeaponModel);

        currentWeaponModel.traverse((obj) => {
            if (obj.geometry) obj.geometry.dispose();
        });
    }

    currentWeaponModel = createWeaponModel(type);
}

// Başlangıç silahı
setWeaponModel("automatic");
// Eski modelleri gizle, yeni 3D modeller kullanılacak.
weaponGroup.visible = false;
/* =====================================
   AFTERMATH - RELOAD ANIMATION
===================================== */

let reloadAnimationId = null;

function reloadWeapon() {
    if (!gameStarted || isReloading) return;
    if (ammo >= maxAmmo) return;

    isReloading = true;

    // Yeniden doldurma sesini çal
    playSound("reload");

    const gun = currentWeaponModel;

    if (!gun) {
        isReloading = false;
        return;
    }

    // Animasyon sırasında silahın başlangıç pozisyonu
    const startPosition = gun.position.clone();
    const startRotation = gun.rotation.clone();

    // Şarjörün görünür modeli
    const magazine = new THREE.Group();

    const magazineBody = new THREE.Mesh(
        new THREE.BoxGeometry(0.105, 0.22, 0.16),
        weaponMaterials.darkMetal
    );

    magazineBody.castShadow = true;
    magazine.add(magazineBody);

    const magazineBase = new THREE.Mesh(
        new THREE.BoxGeometry(0.11, 0.018, 0.165),
        weaponMaterials.polymer
    );

    magazineBase.position.y = -0.11;
    magazine.add(magazineBase);

    // Silahın koordinat sisteminde şarjörü oluştur.
    gun.add(magazine);

    magazine.position.set(0, -0.19, -0.31);
    magazine.rotation.x = 0.12;

    // Mevcut şarjörün model üzerindeki parçasını gizle.
    const oldMagazineParts = [];

    gun.children.forEach((child) => {
        if (
            child !== magazine &&
            child.geometry &&
            child.geometry.type === "BoxGeometry" &&
            Math.abs(child.position.y + 0.19) < 0.025 &&
            Math.abs(child.position.z + 0.31) < 0.04
        ) {
            oldMagazineParts.push({
                object: child,
                visible: child.visible
            });

            child.visible = false;
        }
    });

    const duration = 1900;
    const startTime = performance.now();

    function easeInOut(t) {
        return t < 0.5
            ? 4 * t * t * t
            : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function animateReload(now) {
        if (!isReloading || currentWeaponModel !== gun) {
            gun.remove(magazine);

            oldMagazineParts.forEach((item) => {
                item.object.visible = item.visible;
            });

            isReloading = false;
            reloadAnimationId = null;
            return;
        }

        const t = Math.min((now - startTime) / duration, 1);
        const smooth = easeInOut(t);

        // Silah aşağı iner ve hafifçe yana döner.
        gun.position.y = startPosition.y - 0.20 * Math.sin(Math.PI * t);
        gun.position.x = startPosition.x + 0.045 * Math.sin(Math.PI * t);
        gun.rotation.x = startRotation.x + 0.18 * Math.sin(Math.PI * t);
        gun.rotation.z = startRotation.z - 0.10 * Math.sin(Math.PI * t);

        // 0-35%: eski şarjör çıkarılır.
        if (t < 0.35) {
            const p = t / 0.35;

            magazine.position.y = -0.19 - p * 0.40;
            magazine.rotation.x = 0.12 + p * 0.5;
        }

        // 35-65%: yeni şarjör elde tutuluyormuş gibi bekler.
        else if (t < 0.65) {
            magazine.position.y = -0.59;
            magazine.rotation.x = 0.62;
        }

        // 65-100%: şarjör yuvasına takılır.
        else {
            const p = (t - 0.65) / 0.35;

            magazine.position.y = -0.59 + easeInOut(p) * 0.40;
            magazine.rotation.x = 0.62 - easeInOut(p) * 0.50;
        }

        if (t < 1) {
            reloadAnimationId = requestAnimationFrame(animateReload);
            return;
        }

        // Animasyon bitti.
        gun.position.copy(startPosition);
        gun.rotation.copy(startRotation);

        gun.remove(magazine);

        oldMagazineParts.forEach((item) => {
            item.object.visible = item.visible;
        });

        ammo = maxAmmo;

        updateWeaponHUD();

        isReloading = false;
        reloadAnimationId = null;
    }

    reloadAnimationId = requestAnimationFrame(animateReload);
}

function updateWeaponADS() {
    if (!currentWeaponModel) return;

    // Sniper için silahı hareket ettirme.
    if (currentWeapon === "sniper") return;

    const aiming =
        gameStarted &&
        currentWeapon === "automatic" &&
        automaticScopeActive;

    const normalPosition = new THREE.Vector3(0.34, -0.33, -0.48);
    const aimPosition = new THREE.Vector3(0.02, -0.38, -0.30);

    const normalRotation = new THREE.Euler(-0.035, -0.045, -0.015);
    const aimRotation = new THREE.Euler(0, 0, 0);

    const targetPosition = aiming ? aimPosition : normalPosition;
    const targetRotation = aiming ? aimRotation : normalRotation;

    currentWeaponModel.position.lerp(targetPosition, 0.22);

    currentWeaponModel.rotation.x +=
        (targetRotation.x - currentWeaponModel.rotation.x) * 0.22;

    currentWeaponModel.rotation.y +=
        (targetRotation.y - currentWeaponModel.rotation.y) * 0.22;

    currentWeaponModel.rotation.z +=
        (targetRotation.z - currentWeaponModel.rotation.z) * 0.22;
}
function handleLocalDeath() {
    if (isRespawning || !onlineMode) return;

    isLocalPlayerAlive = false;
    isRespawning = true;

    

    console.log("💀 Öldün! 3 saniye sonra yeniden doğacaksın.");

    if (respawnTimer) {
        clearTimeout(respawnTimer);
    }

    respawnTimer = setTimeout(() => {
        respawnOnlinePlayer();
    }, 3000);
}

async function respawnOnlinePlayer() {
    const team = getCurrentTeam();

    // Takıma göre başlangıç noktası
    camera.position.set(
        0,
        2,
        team === "red" ? -129 : 19
    );

    yaw = team === "red" ? Math.PI : 0;
    pitch = 0;

    camera.rotation.order = "YXZ";
    camera.rotation.set(pitch, yaw, 0);

    currentHealth = 100;
    isLocalPlayerAlive = true;
    isRespawning = false;

    const healthElement = document.getElementById("health");

    if (healthElement) {
        healthElement.dataset.health = "100";
        healthElement.textContent = "❤️ CAN: 100";
    }

    try {
        await updateMyStats({
            health: 100,
            alive: true
        });

        await updateMyPosition({
            x: camera.position.x,
            y: camera.position.y,
            z: camera.position.z,
            rotationY: yaw
        });
    } catch (error) {
        console.error("Yeniden doğma güncellenemedi:", error);
    }

    console.log("🟢 Yeniden doğdun!");

    if (gameStarted) {
        document.body.requestPointerLock?.();
    }
}

const scoreboard = document.getElementById("scoreboard");
const blueScoreboardPlayers = document.getElementById("blue-scoreboard-players");
const redScoreboardPlayers = document.getElementById("red-scoreboard-players");

function renderScoreboard(players) {
    if (!blueScoreboardPlayers || !redScoreboardPlayers) return;

    const bluePlayers = [];
    const redPlayers = [];

    for (const [id, player] of Object.entries(players || {})) {
        const entry = {
            id,
            name: player.name || "Oyuncu",
            kills: Number(player.kills) || 0,
            deaths: Number(player.deaths) || 0,
            score: Number(player.score) || 0
        };

        if (player.team === "red") {
            redPlayers.push(entry);
        } else {
            bluePlayers.push(entry);
        }
    }

    const sortPlayers = (a, b) =>
        b.score - a.score || b.kills - a.kills || a.deaths - b.deaths;

    bluePlayers.sort(sortPlayers);
    redPlayers.sort(sortPlayers);

    function createRows(teamPlayers) {
        if (teamPlayers.length === 0) {
            return '<div class="scoreboard-empty">Henüz oyuncu yok</div>';
        }

        return teamPlayers.map(player => `
            <div class="scoreboard-player">
                <span class="scoreboard-name"></span>
                <span class="scoreboard-number">${player.kills}</span>
                <span class="scoreboard-number">${player.deaths}</span>
                <span class="scoreboard-number">${player.score}</span>
            </div>
        `).join("");
    }

    blueScoreboardPlayers.innerHTML = createRows(bluePlayers);
    redScoreboardPlayers.innerHTML = createRows(redPlayers);

    // Oyuncu adlarını HTML olarak yorumlatmadan ekle.
    const rowContainers = [
        [blueScoreboardPlayers, bluePlayers],
        [redScoreboardPlayers, redPlayers]
    ];

    for (const [container, teamPlayers] of rowContainers) {
        const names = container.querySelectorAll(".scoreboard-name");

        teamPlayers.forEach((player, index) => {
            if (names[index]) names[index].textContent = player.name;
        });
    }
}

// Tab tuşunu basılı tutunca tabloyu göster.
document.addEventListener("keydown", event => {
    if (event.code !== "Tab" || !onlineMode || !gameStarted) return;

    event.preventDefault();

    if (scoreboard) scoreboard.classList.remove("hidden");
});

document.addEventListener("keyup", event => {
    if (event.code !== "Tab") return;

    if (scoreboard) scoreboard.classList.add("hidden");
});

window.addEventListener("blur", () => {
    if (scoreboard) scoreboard.classList.add("hidden");
});

function updateTeamScoreboard(players) {
    let blueScore = 0;
    let redScore = 0;

    for (const player of Object.values(players || {})) {
        const score = Math.max(0, Number(player.score) || 0);

        if (player.team === "blue") {
            blueScore += score;
        } else if (player.team === "red") {
            redScore += score;
        }
    }

    const blueElement = document.getElementById("blue-team-score");
    const redElement = document.getElementById("red-team-score");

    if (blueElement) blueElement.textContent = blueScore;
    if (redElement) redElement.textContent = redScore;
}

// =====================================
// ANIMATION
// =====================================

function animate() {

    requestAnimationFrame(
        animate
    );

    updatePlayer();
    
    if (isInRoom()) {
    updateMyPosition({
        x: camera.position.x,
        y: camera.position.y,
        z: camera.position.z,
        rotationY: yaw
      });
    }

const walkTime = performance.now() * 0.008;

for (const character of remotePlayers.values()) {
    const legs = character.userData.legs;
    if (!legs) continue;

    const moving = character.userData.moving;

    for (let i = 0; i < legs.length; i++) {
        legs[i].rotation.x = moving
            ? Math.sin(walkTime + i * Math.PI) * 0.45
            : 0;
    }
}

    updateWeaponADS();

    if (!onlineMode) {
    updateBots();
      }
    drawMinimap();

   if (
    mouseDown &&
    gameStarted &&
    currentWeapon === "automatic"
) {
    fireWeapon();
}

    renderer.render(
        scene,
        camera
    );

}

animate();