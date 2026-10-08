import * as THREE from "https://unpkg.com/three@0.179.1/build/three.module.js";
import {
    playSound,
    playAmbience,
    stopAmbience
} from "./sound.js";
// =====================================
// SCENE
// =====================================

const scene = new THREE.Scene();

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

let currentWeapon = "automatic";

let gameStarted = false;

let ammo = 30;
const maxAmmo = 30;

let isReloading = false;
let lastShotTime = 0;
let mouseDown = false;
let scopeActive = false;

const fireRate = 100;


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
    
    if (!gameStarted) return;

    if (isReloading) return;

    if (ammo <= 0) {

        reloadWeapon();

        return;
    }


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
    playSound("shoot");

    createBulletEffect();
    
    checkBotHit();

    muzzleFlash.intensity = 5;

    setTimeout(() => {

        muzzleFlash.intensity = 0;

    }, 40);


    // Geri tepme
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


    bot.health -= 34;


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

document.addEventListener(
    "mousedown",
    event => {

        if (
            event.button === 2 &&
            gameStarted
        ) {

            scopeActive = true;

            document
                .getElementById("scopeOverlay")
                .style.display = "block";

            // Normal nişangahı gizle
            document
                .getElementById("crosshair")
                .style.display = "none";
        }

    }
);


document.addEventListener(
    "mouseup",
    event => {

        if (event.button === 2) {

            scopeActive = false;

            document
                .getElementById("scopeOverlay")
                .style.display = "none";

            // Normal nişangahı geri getir
            document
                .getElementById("crosshair")
                .style.display = "block";
        }

    }
);



document.addEventListener(
    "contextmenu",
    event => {
        event.preventDefault();
    }
);
// =====================================
// YENİDEN DOLDUR
// =====================================

function reloadWeapon() {

    if (isReloading) return;

    if (ammo === maxAmmo) return;


    isReloading = true;
    playSound("reload");
    updateWeaponHUD();


    setTimeout(() => {

        ammo = maxAmmo;

        isReloading = false;

        updateWeaponHUD();

    }, 1200);

}


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

    const weaponElement =
        document.getElementById(
            "weapon"
        );

    if (!weaponElement) return;


    if (isReloading) {

        weaponElement.textContent =
            "🔫 OTOMATİK | YENİDEN DOLDURULUYOR...";

        return;

    }


    weaponElement.textContent =
        `🔫 OTOMATİK | ${ammo}/${maxAmmo}`;

}
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

const ground =
    new THREE.Mesh(
        new THREE.PlaneGeometry(
            500,
            500
        ),
        new THREE.MeshStandardMaterial({
            color: 0x25282a,
            roughness: 1
        })
    );

ground.rotation.x =
    -Math.PI / 2;

ground.receiveShadow = true;

scene.add(ground);


// =====================================
// YOL
// =====================================

function createRoad(
    x,
    z,
    width,
    depth
) {

    const road =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                width,
                0.05,
                depth
            ),
            roadMaterial
        );

    road.position.set(
        x,
        0.025,
        z
    );

    road.receiveShadow = true;

    scene.add(road);
}


// Ana cadde
createRoad(
    0,
    -55,
    18,
    180
);


// Yan yollar
createRoad(
    -45,
    -55,
    80,
    10
);

createRoad(
    45,
    -55,
    80,
    10
);


// =====================================
// KALDIRIM
// =====================================

function createSidewalk(
    x,
    z,
    width,
    depth
) {

    const sidewalk =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                width,
                0.25,
                depth
            ),
            sidewalkMaterial
        );

    sidewalk.position.set(
        x,
        0.125,
        z
    );

    sidewalk.receiveShadow = true;

    scene.add(sidewalk);
}


createSidewalk(
    -11,
    -55,
    3,
    180
);

createSidewalk(
    11,
    -55,
    3,
    180
);


// =====================================
// YOL ÇİZGİLERİ
// =====================================

function createRoadLine(
    x,
    z
) {

    const line =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.18,
                0.02,
                5
            ),
            new THREE.MeshBasicMaterial({
                color: 0x777777
            })
        );

    line.position.set(
        x,
        0.06,
        z
    );

    scene.add(line);
}


for (
    let z = 30;
    z > -145;
    z -= 10
) {

    createRoadLine(
        0,
        z
    );

}

// =====================================
// BOT OLUŞTUR
// =====================================

function createBot(x, z) {

    const bot = new THREE.Group();

    // Gövde
    const body = new THREE.Mesh(
        new THREE.BoxGeometry(
            0.8,
            1.2,
            0.5
        ),
        new THREE.MeshStandardMaterial({
            color: 0x3b4650,
            roughness: 0.8
        })
    );

    body.position.y = 1.0;
    body.castShadow = true;

    bot.add(body);


    // Kafa
    const head = new THREE.Mesh(
        new THREE.BoxGeometry(
            0.55,
            0.55,
            0.55
        ),
        new THREE.MeshStandardMaterial({
            color: 0x707070,
            roughness: 0.8
        })
    );

    head.position.y = 1.9;
    head.castShadow = true;

    bot.add(head);


    // Gözler
    const eyeMaterial =
        new THREE.MeshBasicMaterial({
            color: 0xff3333
        });

    const leftEye = new THREE.Mesh(
        new THREE.BoxGeometry(
            0.08,
            0.08,
            0.04
        ),
        eyeMaterial
    );

    leftEye.position.set(
        -0.12,
        1.93,
        -0.28
    );

    bot.add(leftEye);


    const rightEye = leftEye.clone();

    rightEye.position.x = 0.12;

    bot.add(rightEye);


    // Silah
    const weapon = new THREE.Mesh(
        new THREE.BoxGeometry(
            0.15,
            0.15,
            0.8
        ),
        new THREE.MeshStandardMaterial({
            color: 0x181818,
            metalness: 0.6,
            roughness: 0.5
        })
    );

    weapon.position.set(
        0.45,
        1.15,
        -0.35
    );

    weapon.rotation.x = -0.15;

    bot.add(weapon);


    bot.position.set(
        x,
        0,
        z
    );


    scene.add(bot);


    const botData = {

    mesh: bot,

    health: 100,

    maxHealth: 100,

    alive: true,

    attackCooldown: 0,

    moveTimer: 0,

    targetPosition:
        new THREE.Vector3(
            x,
            0,
            z
        )

};


    bots.push(botData);

    return botData;
}
// =====================================
// BİNA
// =====================================

function createBuilding(
    x,
    z,
    width,
    height,
    depth
) {

    const building =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                width,
                height,
                depth
            ),
            concreteMaterial
        );

    building.position.set(
        x,
        height / 2,
        z
    );

    building.castShadow = true;
    building.receiveShadow = true;

    scene.add(building);


    const box =
        new THREE.Box3();

    box.setFromObject(
        building
    );

    obstacles.push({
        mesh: building,
        box: box
    });


    createWindows(
        x,
        z,
        width,
        height,
        depth
    );
}


// =====================================
// PENCERELER
// =====================================

function createWindows(
    x,
    z,
    width,
    height,
    depth
) {

    const floors =
        Math.max(
            2,
            Math.floor(height / 4)
        );

    const columns =
        Math.max(
            2,
            Math.floor(width / 3)
        );


    for (
        let floor = 0;
        floor < floors;
        floor++
    ) {

        for (
            let column = 0;
            column < columns;
            column++
        ) {

            const px =
                x -
                width / 2 +
                1.5 +
                column * 3;

            const py =
                2.2 +
                floor * 4;

            if (
                py > height - 1
            ) {
                continue;
            }


            // Ön cephe
            const frontWindow =
                new THREE.Mesh(
                    new THREE.BoxGeometry(
                        1.2,
                        1.5,
                        0.08
                    ),
                    Math.random() > 0.25
                        ? windowMaterial
                        : brokenWindowMaterial
                );

            frontWindow.position.set(
                px,
                py,
                z - depth / 2 - 0.05
            );

            scene.add(
                frontWindow
            );


            // Arka cephe
            const backWindow =
                new THREE.Mesh(
                    new THREE.BoxGeometry(
                        1.2,
                        1.5,
                        0.08
                    ),
                    brokenWindowMaterial
                );

            backWindow.position.set(
                px,
                py,
                z + depth / 2 + 0.05
            );

            scene.add(
                backWindow
            );

        }

    }
}


// =====================================
// BİNALAR
// =====================================

createBuilding(
    -20,
    -25,
    14,
    20,
    18
);

createBuilding(
    22,
    -30,
    16,
    28,
    16
);

createBuilding(
    -23,
    -65,
    18,
    25,
    20
);

createBuilding(
    23,
    -70,
    15,
    22,
    18
);

createBuilding(
    -22,
    -110,
    16,
    30,
    20
);

createBuilding(
    24,
    -115,
    20,
    26,
    18
);

createBuilding(
    -55,
    -60,
    18,
    18,
    18
);

createBuilding(
    55,
    -75,
    18,
    24,
    18
);


// =====================================
// SOKAK LAMBASI
// =====================================

function createStreetLight(
    x,
    z
) {

    const group =
        new THREE.Group();


    const pole =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.12,
                0.18,
                6
            ),
            metalMaterial
        );

    pole.position.y = 3;

    pole.castShadow = true;

    group.add(pole);


    const arm =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                1.2,
                0.12,
                0.12
            ),
            metalMaterial
        );

    arm.position.set(
        0.5,
        5.7,
        0
    );

    group.add(arm);


    const lamp =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.25,
                12,
                12
            ),
            new THREE.MeshStandardMaterial({
                color: 0xffbb66,
                emissive: 0xff7a22,
                emissiveIntensity: 2
            })
        );

    lamp.position.set(
        1,
        5.5,
        0
    );

    group.add(lamp);


    const light =
        new THREE.PointLight(
            0xff9944,
            3,
            25
        );

    light.position.set(
        1,
        5.4,
        0
    );

    group.add(light);


    group.position.set(
        x,
        0,
        z
    );

    scene.add(group);
}


// =====================================
// LAMBALAR
// =====================================

for (
    let z = 25;
    z > -145;
    z -= 20
) {

    createStreetLight(
        -9,
        z
    );

    createStreetLight(
        9,
        z
    );

}


// =====================================
// ARAÇ
// =====================================

function createCar(
    x,
    z,
    rotation = 0
) {

    const car =
        new THREE.Group();


    const body =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                2.4,
                0.75,
                4.5
            ),
            new THREE.MeshStandardMaterial({
                color: 0x3d3030,
                roughness: 0.9
            })
        );

    body.position.y =
        0.65;

    body.castShadow = true;

    car.add(body);


    const cabin =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                1.8,
                0.75,
                2.2
            ),
            brokenWindowMaterial
        );

    cabin.position.set(
        0,
        1.2,
        -0.15
    );

    car.add(cabin);


    // Tekerlekler
    const wheelPositions = [
        [-1.05, 0.4, -1.45],
        [1.05, 0.4, -1.45],
        [-1.05, 0.4, 1.45],
        [1.05, 0.4, 1.45]
    ];


    for (
        const position of wheelPositions
    ) {

        const wheel =
            new THREE.Mesh(
                new THREE.CylinderGeometry(
                    0.4,
                    0.4,
                    0.25,
                    12
                ),
                metalMaterial
            );

        wheel.rotation.z =
            Math.PI / 2;

        wheel.position.set(
            position[0],
            position[1],
            position[2]
        );

        car.add(wheel);

    }


    // Farlar
    const headLightMaterial =
        new THREE.MeshStandardMaterial({
            color: 0xb8c6c9,
            emissive: 0x667777,
            emissiveIntensity: 0.5
        });


    const leftLight =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.4,
                0.25,
                0.08
            ),
            headLightMaterial
        );

    leftLight.position.set(
        -0.65,
        0.8,
        -2.27
    );

    car.add(leftLight);


    const rightLight =
        leftLight.clone();

    rightLight.position.x =
        0.65;

    car.add(rightLight);


    car.position.set(
        x,
        0,
        z
    );

    car.rotation.y =
        rotation;


    scene.add(car);


    const box =
        new THREE.Box3();

    box.setFromObject(
        car
    );

    obstacles.push({
        mesh: car,
        box: box
    });
}


// =====================================
// ARAÇLAR
// =====================================

createCar(
    4,
    -15,
    0.1
);

createCar(
    -4,
    -42,
    -0.3
);

createCar(
    5,
    -75,
    0.2
);

createCar(
    -4,
    -105,
    -0.15
);


// =====================================
// ENKAZ
// =====================================

function createDebris(
    x,
    y,
    z,
    size,
    rotation
) {

    const debris =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                size,
                size * 0.7,
                size * 1.2
            ),
            darkConcreteMaterial
        );

    debris.position.set(
        x,
        y,
        z
    );

    debris.rotation.set(
        rotation.x,
        rotation.y,
        rotation.z
    );

    debris.castShadow = true;

    scene.add(debris);
}


// =====================================
// ENKAZLAR
// =====================================

createDebris(
    -7,
    0.3,
    -25,
    1.2,
    { x: 0.2, y: 0.5, z: 0.3 }
);

createDebris(
    7,
    0.25,
    -38,
    1,
    { x: 0.4, y: 0.2, z: 0.1 }
);

createDebris(
    -6,
    0.35,
    -62,
    1.4,
    { x: 0.1, y: 0.8, z: 0.4 }
);

createDebris(
    6,
    0.3,
    -90,
    1.1,
    { x: 0.3, y: 0.4, z: 0.2 }
);

createDebris(
    -6,
    0.3,
    -125,
    1.3,
    { x: 0.2, y: 0.7, z: 0.5 }
);


// =====================================
// BARİYER
// =====================================

function createBarrier(
    x,
    z,
    rotation = 0
) {

    const barrier =
        new THREE.Group();


    const left =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.15,
                1.2,
                0.15
            ),
            metalMaterial
        );

    left.position.set(
        -1.5,
        0.6,
        0
    );


    const right =
        left.clone();

    right.position.x =
        1.5;


    const bar =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                3.2,
                0.25,
                0.25
            ),
            new THREE.MeshStandardMaterial({
                color: 0x7d3b2c,
                roughness: 0.8
            })
        );

    bar.position.y =
        0.8;


    barrier.add(left);
    barrier.add(right);
    barrier.add(bar);


    barrier.position.set(
        x,
        0,
        z
    );

    barrier.rotation.y =
        rotation;


    scene.add(barrier);
}


createBarrier(
    -5,
    -52,
    0.2
);

createBarrier(
    5,
    -95,
    -0.3
);
// =====================================
// HARİTA SINIRLARI
// =====================================

function createMapBoundary(
    x,
    z,
    width,
    depth
) {

    const wall = new THREE.Mesh(
        new THREE.BoxGeometry(
            width,
            5,
            depth
        ),
        new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 0
        })
    );

    wall.position.set(
        x,
        2.5,
        z
    );

    scene.add(wall);

    const box = new THREE.Box3();

    box.setFromObject(wall);

    obstacles.push({
        mesh: wall,
        box: box
    });
}


// Sol sınır
createMapBoundary(
    -12,
    -55,
    1,
    180
);

// Sağ sınır
createMapBoundary(
    12,
    -55,
    1,
    180
);

// Arka sınır
createMapBoundary(
    0,
    -146,
    24,
    1
);

// Başlangıç tarafı sınırı
createMapBoundary(
    0,
    36,
    24,
    1
);
// =====================================
// BOTLAR
// =====================================

function spawnBots() {
    const BOT_COUNT = 12;
    const MIN_DISTANCE_FROM_PLAYER = 35;
    const MIN_DISTANCE_BETWEEN_BOTS = 12;

    let spawned = 0;
    let attempts = 0;

    while (spawned < BOT_COUNT && attempts < 500) {
        attempts++;

        // Ana yol üzerinde rastgele bir nokta
        // =====================================
        // BOT SPAWN ALANI
        // =====================================

        const x = Math.random() * 14 - 7;

        // Harita sınırları: z = -145 ile -35 arası
        const z = Math.random() * 110 - 145;
        const spawnPosition = new THREE.Vector3(x, 0, z);

        // Oyuncudan yeterince uzak mı?
        if (spawnPosition.distanceTo(camera.position) < MIN_DISTANCE_FROM_PLAYER) {
            continue;
        }

        // Bir engelin içinde mi?
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

        // Başka bir botun çok yakınına doğmasın
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
spawnBots();

function spawnOneBot() {
    const MIN_DISTANCE_FROM_PLAYER = 35;
    const MIN_DISTANCE_BETWEEN_BOTS = 12;

    let attempts = 0;

    while (attempts < 500) {
        attempts++;

        const x = THREE.MathUtils.randFloat(-7, 7);
        const z = THREE.MathUtils.randFloat(-180, -35);

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

const startButton =
    document.getElementById(
        "startButton"
    );


startButton.addEventListener(
    "click",
    () => {

        document
            .body
            .requestPointerLock();

    }
);


// =====================================
// POINTER LOCK
// =====================================

document.addEventListener(
    "pointerlockchange",
    () => {

        if (
            document.pointerLockElement ===
            document.body
        ) {

            gameStarted = true;
            playAmbience();
            document
                .getElementById(
                    "menu"
                )
                .style
                .display =
                "none";

        } else {

            gameStarted = false;
            stopAmbience();
            document
                .getElementById(
                    "menu"
                )
                .style
                .display =
                "flex";

        }

    }
);


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
const MAP_MIN_X = -70;
const MAP_MAX_X = 70;

const MAP_MIN_Z = -150;
const MAP_MAX_Z = 40;


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


    // =================================
    // YOL
    // =================================

    const roadTop =
        worldToMinimap(
            -9,
            40
        );

    const roadBottom =
        worldToMinimap(
            9,
            -150
        );

    ctx.fillStyle = "#292d30";

    ctx.fillRect(
        roadTop.x,
        roadTop.y,
        roadBottom.x - roadTop.x,
        roadBottom.y - roadTop.y
    );


    // =================================
    // BİNALAR / ENGELLER
    // =================================

    for (const obstacle of obstacles) {

        if (!obstacle.box) continue;

        const box =
            obstacle.box;


        const min =
            worldToMinimap(
                box.min.x,
                box.max.z
            );

        const max =
            worldToMinimap(
                box.max.x,
                box.min.z
            );


        ctx.fillStyle = "#555b5f";

        ctx.fillRect(
            min.x,
            min.y,
            max.x - min.x,
            max.y - min.y
        );

    }


    // =================================
    // YOL ÇİZGİSİ
    // =================================

    ctx.strokeStyle =
        "rgba(180,180,180,0.35)";

    ctx.lineWidth = 1;

    ctx.setLineDash([
        5,
        5
    ]);

    const centerTop =
        worldToMinimap(
            0,
            40
        );

    const centerBottom =
        worldToMinimap(
            0,
            -150
        );

    ctx.beginPath();

    ctx.moveTo(
        centerTop.x,
        centerTop.y
    );

    ctx.lineTo(
        centerBottom.x,
        centerBottom.y
    );

    ctx.stroke();

    ctx.setLineDash([]);


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
// =====================================
// ANIMATION
// =====================================

function animate() {

    requestAnimationFrame(
        animate
    );

    updatePlayer();

    updateBots();

    drawMinimap();

    if (
        mouseDown &&
        gameStarted
    ) {

        fireWeapon();

    }

    renderer.render(
        scene,
        camera
    );

}

animate();