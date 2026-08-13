import * as THREE from "https://unpkg.com/three@0.179.1/build/three.module.js";
import {
    attackSword
} from "./hand.js";
import {playDamageSound
} from "./sound.js";
import {
    playBlockPlaceSound
} from "./sound.js";
import {
    blocks,
    createBlock,
    removeBlock as deleteWorldBlock,
    grassMaterial,
    dirtMaterial,
    stoneMaterial,
    woodMaterial,
    leavesMaterial,
    sandMaterial
} from "./world.js";

import {
    player
} from "./player.js";
import {
    animals,
    hitAnimal
} from "./animals.js";

import {
    addBlock,
    removeBlock as removeInventoryBlock,
    getSelectedBlock
} from "./inventory.js";

import {
    eatRawMeat
} from "./hunger.js";
// =====================================
// MOUSE LOCK
// =====================================

function lockMouse() {

    const canvas =
        document.querySelector("canvas");

    if (
        canvas &&
        document.pointerLockElement !== canvas
    ) {

        canvas.requestPointerLock();

    }

}


document.addEventListener(
    "pointerlockchange",
    () => {

        const canvas =
            document.querySelector("canvas");

        if (
            document.pointerLockElement !== canvas
        ) {

            const inventory =
                document.getElementById(
                    "inventory"
                );

            if (
                inventory &&
                inventory.style.display === "block"
            ) {

                return;

            }

            setTimeout(() => {

                lockMouse();

            }, 50);

        }

    }
);


// =====================================
// RAYCASTER
// =====================================

const raycaster =
    new THREE.Raycaster();

const MAX_DISTANCE = 6;


// =====================================
// AKTİF SAHNE / KAMERA
// =====================================

let activeCamera = null;
let activeScene = null;


// =====================================
// HEDEF KUTUSU
// =====================================

const selectionBox =
    new THREE.Mesh(

        new THREE.BoxGeometry(
            1.03,
            1.03,
            1.03
        ),

        new THREE.MeshBasicMaterial({

            color: 0xffffff,

            wireframe: true,

            transparent: true,

            opacity: 0.9

        })

    );

selectionBox.visible = false;


// =====================================
// KIRMA
// =====================================

let breaking = false;

let breakingBlock = null;

let breakTimer = 0;


// =====================================
// BLOK DAYANIKLILIĞI
// =====================================

const blockHardness = {

    grass: 0.35,

    dirt: 0.35,

    sand: 0.25,

    leaves: 0.20,

    wood: 1.00,

    stone: 1.50

};


// =====================================
// ÇATLAK ANİMASYONU
// =====================================

let crackGroup = null;

let crackLines = [];
// =====================================
// YERE DÜŞEN BLOKLAR
// =====================================

const droppedBlocks = [];

const DROP_SIZE = 0.32;
const DROP_GRAVITY = 9.8;
const DROP_BOUNCE = 0.35;
const DROP_PICKUP_DISTANCE = 1.5;
const DROP_LIFETIME = 300; // 5 dakika
function createDroppedBlock(position, type, material) {

    const geometry = new THREE.BoxGeometry(
        DROP_SIZE,
        DROP_SIZE,
        DROP_SIZE
    );

    let dropMaterial;

    // Çim / odun gibi çok yüzeyli materyaller
    if (Array.isArray(material)) {

        dropMaterial = material.map(
            (mat) => mat.clone()
        );

    }

    // Normal tek materyalli bloklar
    else {

        dropMaterial = material.clone();

    }

    const drop = new THREE.Mesh(
        geometry,
        dropMaterial
    );

    drop.position.copy(position);

    drop.position.y += 0.35;

    drop.userData.velocity =
        new THREE.Vector3(
            (Math.random() - 0.5) * 1.5,
            1.5 + Math.random() * 1.2,
            (Math.random() - 0.5) * 1.5
        );

    drop.userData.rotationSpeed =
        new THREE.Vector3(
            (Math.random() - 0.5) * 5,
            (Math.random() - 0.5) * 5,
            (Math.random() - 0.5) * 5
        );

    drop.userData.grounded = false;

    drop.userData.bounces = 0;

    drop.userData.type = type;
    // 5 dakika sonra kaybolacak
drop.userData.lifeTime = DROP_LIFETIME;

    activeScene.add(drop);

    droppedBlocks.push(drop);

    return drop;
}
function updateDroppedBlocks(delta) {

    for (let i = droppedBlocks.length - 1; i >= 0; i--) {

        const drop = droppedBlocks[i];
        // Item ömrü
drop.userData.lifeTime -= delta;

if (drop.userData.lifeTime <= 0) {

    activeScene.remove(drop);

    drop.geometry.dispose();

    if (Array.isArray(drop.material)) {

        drop.material.forEach(material => {
            material.dispose();
        });

    } else {

        drop.material.dispose();

    }

    droppedBlocks.splice(i, 1);

    continue;
}

        if (!drop.parent) {

            droppedBlocks.splice(i, 1);

            continue;
        }

        const velocity =
            drop.userData.velocity;

        // Yerçekimi
        velocity.y -=
            DROP_GRAVITY * delta;

        // Hareket
        drop.position.x +=
            velocity.x * delta;

        drop.position.y +=
            velocity.y * delta;

        drop.position.z +=
            velocity.z * delta;

        // Dönme
        drop.rotation.x +=
            drop.userData.rotationSpeed.x * delta;

        drop.rotation.y +=
            drop.userData.rotationSpeed.y * delta;

        drop.rotation.z +=
            drop.userData.rotationSpeed.z * delta;

        // Zemin kontrolü
        const groundY =
            findGroundHeight(drop);

        if (
            drop.position.y <= groundY
        ) {

            drop.position.y =
                groundY;

            // İlk çarpışmada zıpla
            if (
                !drop.userData.grounded
            ) {

                velocity.y =
                    DROP_BOUNCE;

                velocity.x *= 0.65;
                velocity.z *= 0.65;

                drop.userData.bounces++;

            } else {

                velocity.x *= 0.85;
                velocity.z *= 0.85;

            }

            drop.userData.grounded =
                true;
        }

        // Çok küçük hızları sıfırla
        if (
            Math.abs(velocity.x) < 0.02
        ) {
            velocity.x = 0;
        }

        if (
            Math.abs(velocity.z) < 0.02
        ) {
            velocity.z = 0;
        }
    }
}
// =====================================
// BLOK TOPLAMA
// =====================================

function updateDroppedBlockPickup() {

    if (!player.object) {
        return;
    }

    const playerPosition =
        player.object.position;

    for (
        let i = droppedBlocks.length - 1;
        i >= 0;
        i--
    ) {

        const drop =
            droppedBlocks[i];

        if (!drop.parent) {
            droppedBlocks.splice(i, 1);
            continue;
        }

        const distance =
            drop.position.distanceTo(
                playerPosition
            );

        // Oyuncu yeterince yaklaştıysa
        if (
            distance <=
            DROP_PICKUP_DISTANCE
        ) {

            const type =
                drop.userData.type;

            // Envantere ekle
            const added =
                addBlock(
                    type,
                    1
                );

            // Envanter başarılıysa
            if (added) {

                // Mini bloğu kaldır
                activeScene.remove(
                    drop
                );

                drop.geometry.dispose();

                if (
                    Array.isArray(
                        drop.material
                    )
                ) {

                    drop.material.forEach(
                        material => {
                            material.dispose();
                        }
                    );

                }

                else {

                    drop.material.dispose();

                }

                droppedBlocks.splice(
                    i,
                    1
                );
            }
        }
    }
}
function findGroundHeight(drop) {

    let highestGround = -Infinity;

    const half =
        DROP_SIZE / 2;

    for (const block of blocks) {

        if (
            Math.abs(
                block.position.x -
                drop.position.x
            ) > 0.7
        ) {
            continue;
        }

        if (
            Math.abs(
                block.position.z -
                drop.position.z
            ) > 0.7
        ) {
            continue;
        }

        const blockTop =
            block.position.y + 0.5;

        if (
            blockTop <= drop.position.y + 0.5
        ) {

            if (
                blockTop > highestGround
            ) {

                highestGround =
                    blockTop;
            }
        }
    }

    // Hiç blok bulunamazsa dünya tabanı
    if (
        highestGround === -Infinity
    ) {

        highestGround = -5;
    }

    return (
        highestGround +
        half
    );
}
// =====================================
// KIRILMA EFEKTLERİ
// =====================================

let breakParticles = [];
let breakShake = 0;

function createBreakParticles(block) {

    if (!activeScene || !block) return;

    const particleGroup = new THREE.Group();

    const material = new THREE.MeshLambertMaterial({
        color: block.material.color,
        transparent: true,
        opacity: 1
    });

    for (let i = 0; i < 14; i++) {

        const size =
            0.07 +
            Math.random() * 0.09;

        const geometry =
            new THREE.BoxGeometry(
                size,
                size,
                size
            );

        const particle =
            new THREE.Mesh(
                geometry,
                material.clone()
            );

        particle.position.copy(
            block.position
        );

        particle.position.x +=
            (Math.random() - 0.5) * 0.65;

        particle.position.y +=
            (Math.random() - 0.5) * 0.65;

        particle.position.z +=
            (Math.random() - 0.5) * 0.65;

        particle.userData.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 2.5,
            Math.random() * 2.5,
            (Math.random() - 0.5) * 2.5
        );

        particle.userData.rotationSpeed = new THREE.Vector3(
            (Math.random() - 0.5) * 8,
            (Math.random() - 0.5) * 8,
            (Math.random() - 0.5) * 8
        );

        particleGroup.add(particle);
        breakParticles.push(particle);
    }

    activeScene.add(particleGroup);

    breakShake = 0.12;
}
function updateBreakParticles(delta) {

    for (let i = breakParticles.length - 1; i >= 0; i--) {

        const particle = breakParticles[i];

        if (!particle.parent) {
            breakParticles.splice(i, 1);
            continue;
        }

        const velocity =
            particle.userData.velocity;

        velocity.y -= 6 * delta;

        particle.position.x +=
            velocity.x * delta;

        particle.position.y +=
            velocity.y * delta;

        particle.position.z +=
            velocity.z * delta;

        particle.rotation.x +=
            particle.userData.rotationSpeed.x * delta;

        particle.rotation.y +=
            particle.userData.rotationSpeed.y * delta;

        particle.rotation.z +=
            particle.userData.rotationSpeed.z * delta;

        particle.material.opacity -=
            delta * 1.8;

        if (
            particle.material.opacity <= 0 ||
            particle.position.y < -20
        ) {

            const parent =
                particle.parent;

            parent.remove(particle);

            particle.geometry.dispose();
            particle.material.dispose();

            if (parent.children.length === 0) {
                activeScene.remove(parent);
            }

            breakParticles.splice(i, 1);
        }
    }

    if (breakShake > 0) {
        breakShake -= delta;
    }
}

// =====================================
// BAŞLAT
// =====================================

export function initInteraction(
    camera,
    scene
) {

    activeCamera = camera;

    activeScene = scene;

    scene.add(
        selectionBox
    );

}


// =====================================
// HEDEF BLOĞU BUL
// =====================================

function getTarget() {

    if (!activeCamera) {

        return null;

    }


    raycaster.setFromCamera(
        new THREE.Vector2(0, 0),
        activeCamera
    );


    const hits =
        raycaster.intersectObjects(
            blocks,
            false
        );


    if (
        hits.length === 0
    ) {

        return null;

    }


    const hit =
        hits[0];


    if (
        hit.distance >
        MAX_DISTANCE
    ) {

        return null;

    }


    return hit;

}
// =====================================
// 🐄 HEDEF HAYVANI BUL
// =====================================

function getTargetAnimal() {

    if (!activeCamera) {
        return null;
    }

    raycaster.setFromCamera(
        new THREE.Vector2(0, 0),
        activeCamera
    );


    const animalObjects = [];


    for (const animal of animals) {

        animal.traverse(
            (child) => {

                if (child.isMesh) {

                    animalObjects.push(
                        child
                    );

                }

            }
        );

    }


    if (
        animalObjects.length === 0
    ) {
        return null;
    }


    const hits =
        raycaster.intersectObjects(
            animalObjects,
            false
        );


    if (
        hits.length === 0
    ) {
        return null;
    }


    for (const hit of hits) {

        if (
            hit.distance >
            MAX_DISTANCE
        ) {
            continue;
        }


        let animal =
            hit.object;


        while (
            animal.parent &&
            !animal.userData?.type
        ) {

            animal =
                animal.parent;

        }


        if (
            animal.userData?.type ===
            "cow"
        ) {

            return animal;

        }

    }


    return null;
}

// =====================================
// BLOK TÜRÜ
// =====================================

function getBlockType(block) {

    if (
        block.material ===
        grassMaterial
    ) {

        return "grass";

    }


    if (
        block.material ===
        dirtMaterial
    ) {

        return "dirt";

    }


    if (
        block.material ===
        stoneMaterial
    ) {

        return "stone";

    }


    if (
        block.material ===
        woodMaterial
    ) {

        return "wood";

    }


    if (
        block.material ===
        leavesMaterial
    ) {

        return "leaves";

    }


    if (
        block.material ===
        sandMaterial
    ) {

        return "sand";

    }


    return "grass";

}


// =====================================
// GELİŞMİŞ ÇATLAK OLUŞTUR
// =====================================

function createCrackAnimation() {

    removeCrackAnimation();


    crackGroup =
        new THREE.Group();


    crackLines = [];


    const faces = [

        "front",

        "back",

        "left",

        "right",

        "top",

        "bottom"

    ];


    for (
        const face of faces
    ) {

        // Her yüzeyde 3 ana çatlak

        for (
            let branch = 0;
            branch < 3;
            branch++
        ) {

            const geometry =
                new THREE.BufferGeometry();


            const positions = [];


            let startX =
                Math.random() * 0.45 - 0.225;


            let startY =
                Math.random() * 0.45 - 0.225;


            const segments =
                3 +
                Math.floor(
                    Math.random() * 3
                );


            for (
                let i = 0;
                i < segments;
                i++
            ) {

                const offsetX =
                    (
                        Math.random() - 0.5
                    ) * 0.25;


                const offsetY =
                    (
                        Math.random() - 0.5
                    ) * 0.25;


                const endX =
                    startX + offsetX;


                const endY =
                    startY + offsetY;


                let p1;

                let p2;


                // FRONT

                if (
                    face === "front"
                ) {

                    p1 = [

                        startX,

                        startY,

                        0.506

                    ];


                    p2 = [

                        endX,

                        endY,

                        0.506

                    ];

                }


                // BACK

                else if (
                    face === "back"
                ) {

                    p1 = [

                        startX,

                        startY,

                        -0.506

                    ];


                    p2 = [

                        endX,

                        endY,

                        -0.506

                    ];

                }


                // LEFT

                else if (
                    face === "left"
                ) {

                    p1 = [

                        -0.506,

                        startX,

                        startY

                    ];


                    p2 = [

                        -0.506,

                        endX,

                        endY

                    ];

                }


                // RIGHT

                else if (
                    face === "right"
                ) {

                    p1 = [

                        0.506,

                        startX,

                        startY

                    ];


                    p2 = [

                        0.506,

                        endX,

                        endY

                    ];

                }


                // TOP

                else if (
                    face === "top"
                ) {

                    p1 = [

                        startX,

                        0.506,

                        startY

                    ];


                    p2 = [

                        endX,

                        0.506,

                        endY

                    ];

                }


                // BOTTOM

                else {

                    p1 = [

                        startX,

                        -0.506,

                        startY

                    ];


                    p2 = [

                        endX,

                        -0.506,

                        endY

                    ];

                }


                positions.push(
                    ...p1,
                    ...p2
                );


                startX =
                    endX;

                startY =
                    endY;

            }


            geometry.setAttribute(

                "position",

                new THREE.Float32BufferAttribute(

                    positions,

                    3

                )

            );


            const material =
                new THREE.LineBasicMaterial({

                    color: 0x111111,

                    transparent: true,

                    opacity: 0

                });


            const line =
                new THREE.LineSegments(

                    geometry,

                    material

                );


            line.visible = false;


            crackGroup.add(
                line
            );


            crackLines.push(
                line
            );

        }

    }


    activeScene.add(
        crackGroup
    );

}


// =====================================
// ÇATLAK GÜNCELLE
// =====================================

function updateCrackAnimation(
    progress
) {

    if (!crackGroup) {

        return;

    }


    progress =
        Math.max(
            0,
            Math.min(
                progress,
                1
            )
        );


    const visibleCount =
        Math.floor(
            progress *
            crackLines.length
        );


    for (
        let i = 0;
        i < crackLines.length;
        i++
    ) {

        const line =
            crackLines[i];


        if (
            i < visibleCount
        ) {

            line.visible = true;


            const fade =
                Math.min(
                    1,
                    progress * 1.5
                );


            line.material.opacity =
                0.25 +
                fade * 0.65;

        }

        else {

            line.visible = false;

        }

    }


    // Son aşamada çatlakları güçlendir

    if (
        progress > 0.85
    ) {

        const finalFade =
            (
                progress - 0.85
            ) / 0.15;


        for (
            const line of crackLines
        ) {

            if (
                line.visible
            ) {

                line.material.opacity =
                    0.9 +
                    finalFade * 0.1;

            }

        }

    }

}


// =====================================
// ÇATLAĞI TEMİZLE
// =====================================

function removeCrackAnimation() {

    if (!crackGroup) {

        return;

    }


    activeScene.remove(
        crackGroup
    );


    crackGroup.traverse(
        (object) => {

            if (
                object.geometry
            ) {

                object.geometry.dispose();

            }


            if (
                object.material
            ) {

                object.material.dispose();

            }

        }
    );


    crackGroup = null;

    crackLines = [];

}


// =====================================
// SOL TIK
// =====================================

window.addEventListener(
    "mousedown",
    (event) => {
    // =================================
    // ⚔️ KILIÇ SALDIRISI
    // =================================

    const selected =
        getSelectedBlock();

if (
    selected &&
    selected.type === "sword"
) {

    attackSword();

    const animal =
        getTargetAnimal();

    if (animal) {

        hitAnimal(
            animal,
            3
        );

    }

    return;
}
        if (
            event.button !== 0
        ) {
            return;
        }


        // =================================
        // 🐄 ÖNCE HAYVAN KONTROLÜ
        // =================================

        const animal =
    getTargetAnimal();

if (animal) {

    const selected =
        getSelectedBlock();

    // ⚔️ Kılıç seçiliyse güçlü saldırı
    if (
        selected &&
        selected.type === "sword"
    ) {

        hitAnimal(
            animal,
            3
        );

    }

    // ✋ El ile saldırı
    else {

        hitAnimal(
            animal,
            1
        );

    }

    return;
}

        // =================================
        // 🧱 NORMAL BLOK KIRMA
        // =================================

        const hit =
            getTarget();


        if (!hit) {
            return;
        }


        breaking = true;

        breakingBlock =
            hit.object;

        breakTimer = 0;


        createCrackAnimation();


        crackGroup.position.copy(
            breakingBlock.position
        );

    }
);
// =====================================
// SOL TIK BIRAK
// =====================================

window.addEventListener(
    "mouseup",
    (event) => {

        if (
            event.button !== 0
        ) {

            return;

        }


        stopBreaking();

    }
);


// =====================================
// KIRMA DURDUR
// =====================================

function stopBreaking() {

    breaking = false;

    breakingBlock = null;

    breakTimer = 0;

    removeCrackAnimation();

}


// =====================================
// SAĞ TIK
// =====================================

window.addEventListener(
    "contextmenu",
    (event) => {

        event.preventDefault();

    }
);


// =====================================
// 🥩 SAĞ TIK BASILI TUTMA
// =====================================

let eating = false;
let eatingTimer = 0;

const EAT_TIME = 1.2;


// =====================================
// SAĞ TIK BASILDI
// =====================================

window.addEventListener(
    "mousedown",
    (event) => {

        if (
            event.button !== 2
        ) {

            return;

        }


        const selected =
            getSelectedBlock();


        // 🥩 ET SEÇİLİYSE YEME
        if (
            selected &&
            selected.type === "raw_meat"
        ) {

            eating = true;
            eatingTimer = 0;

            return;

        }


        // 🧱 Diğer eşyalar blok koysun
        placeBlock();

    }
);


// =====================================
// SAĞ TIK BIRAKILDI
// =====================================

window.addEventListener(
    "mouseup",
    (event) => {

        if (
            event.button !== 2
        ) {

            return;

        }


        eating = false;
        eatingTimer = 0;

    }
);

// =====================================
// BLOK KOY
// =====================================

// =====================================
// 🧱 BLOK KOY
// =====================================

function placeBlock() {

    const hit =
        getTarget();


    if (
        !hit ||
        !hit.face
    ) {

        return;

    }


    const selected =
        getSelectedBlock();


    if (!selected) {

        return;

    }


    if (
        selected.amount <= 0
    ) {

        return;

    }


    // =================================
    // 🚫 BLOK OLMAYAN EŞYALAR
    // =================================

    const placeableBlocks = [

        "grass",
        "dirt",
        "stone",
        "wood",
        "leaves",
        "sand"

    ];


    if (
        !placeableBlocks.includes(
            selected.type
        )
    ) {

        console.log(
            "🚫 Bu eşya blok olarak yerleştirilemez:",
            selected.type
        );

        return;

    }


    // =================================
    // 📍 YERLEŞTİRME KONUMU
    // =================================

    const normal =
        hit.face.normal;


    const position =
        hit.object.position.clone();


    position.x +=
        normal.x;

    position.y +=
        normal.y;

    position.z +=
        normal.z;


    // =================================
    // 🧱 BLOK VAR MI?
    // =================================

    if (
        hasBlockAt(position)
    ) {

        return;

    }


    // =================================
    // 🧍 OYUNCUNUN İÇİNE KOYMA
    // =================================

    if (
        isInsidePlayer(position)
    ) {

        return;

    }


    // =================================
    // 🎨 MATERYAL
    // =================================

    let material;


    if (
        selected.type === "grass"
    ) {

        material =
            grassMaterial;

    }

    else if (
        selected.type === "dirt"
    ) {

        material =
            dirtMaterial;

    }

    else if (
        selected.type === "stone"
    ) {

        material =
            stoneMaterial;

    }

    else if (
        selected.type === "wood"
    ) {

        material =
            woodMaterial;

    }

    else if (
        selected.type === "leaves"
    ) {

        material =
            leavesMaterial;

    }

    else if (
        selected.type === "sand"
    ) {

        material =
            sandMaterial;

    }


    // =================================
    // 🧱 BLOĞU OLUŞTUR
    // =================================

    createBlock(
        activeScene,
        position.x,
        position.y,
        position.z,
        material
    );


    // =================================
    // 🎒 ENVANTERDEN ÇIKAR
    // =================================

    removeInventoryBlock(
        selected.type,
        1
    );


    // =================================
    // 🔊 SES
    // =================================

    playBlockPlaceSound();

}


// =====================================
// BLOK VAR MI?
// =====================================

function hasBlockAt(
    position
) {

    for (
        const block of blocks
    ) {

        if (

            block.position.x ===
            position.x &&

            block.position.y ===
            position.y &&

            block.position.z ===
            position.z

        ) {

            return true;

        }

    }


    return false;

}


// =====================================
// OYUNCUNUN İÇİNE KOYMA
// =====================================

function isInsidePlayer(
    position
) {

    if (
        !player.object
    ) {

        return false;

    }


    const px =
        player.object.position.x;


    const py =
        player.object.position.y;


    const pz =
        player.object.position.z;


    const playerMinX =
        px -
        player.width / 2;


    const playerMaxX =
        px +
        player.width / 2;


    const playerMinY =
        py;


    const playerMaxY =
        py +
        player.height;


    const playerMinZ =
        pz -
        player.width / 2;


    const playerMaxZ =
        pz +
        player.width / 2;


    const blockMinX =
        position.x -
        0.5;


    const blockMaxX =
        position.x +
        0.5;


    const blockMinY =
        position.y -
        0.5;


    const blockMaxY =
        position.y +
        0.5;


    const blockMinZ =
        position.z -
        0.5;


    const blockMaxZ =
        position.z +
        0.5;


    return (

        blockMinX < playerMaxX &&

        blockMaxX > playerMinX &&

        blockMinY < playerMaxY &&

        blockMaxY > playerMinY &&

        blockMinZ < playerMaxZ &&

        blockMaxZ > playerMinZ

    );

}

// =====================================
// 🥩 ET YEME GÜNCELLE
// =====================================

function updateEating(delta) {

    if (!eating) {
        return;
    }


    const selected =
        getSelectedBlock();


    // Et artık seçili değilse dur
    if (
        !selected ||
        selected.type !== "raw_meat"
    ) {

        eating = false;
        eatingTimer = 0;

        return;

    }


    eatingTimer += delta;


    // 1.2 saniye boyunca basılı tutuldu
    if (
        eatingTimer >= EAT_TIME
    ) {

        eatingTimer = 0;


        // Açlığı artır
        eatRawMeat();


        // Envanterden 1 et çıkar
        removeInventoryBlock(
            "raw_meat",
            1
        );


        // Et bittiyse dur
        const remaining =
            getSelectedBlock();


        if (
            !remaining ||
            remaining.type !== "raw_meat"
        ) {

            eating = false;

        }

    }

}
// =====================================
// ETKİLEŞİM GÜNCELLE
// =====================================

export function updateInteraction(
    delta
) {

    if (
        !activeCamera
    ) {

        return;

    }


    const hit =
        getTarget();


    // Hedef kutusu

    if (!hit) {

        selectionBox.visible =
            false;

    }

    else {

        selectionBox.position.copy(
            hit.object.position
        );

        selectionBox.visible =
            true;

    }


    // Kırma

    updateBreaking(
        delta
    );
    updateEating(
        delta
    );
    updateDroppedBlocks(
    delta
);
    updateBreakParticles(
    delta
);
updateDroppedBlockPickup();
}


// =====================================
// KIRMA GÜNCELLE
// =====================================

function updateBreaking(
    delta
) {

    if (
        !breaking ||
        !breakingBlock
    ) {

        return;

    }


    const hit =
        getTarget();


    // Başka bloğa bakılıyorsa kırmayı bırak

    if (
        !hit ||
        hit.object !==
        breakingBlock
    ) {

        stopBreaking();

        return;

    }


    const type =
        getBlockType(
            breakingBlock
        );


    const hardness =
    blockHardness[type] ||
    0.5;

const selected =
    getSelectedBlock();

let toolSpeed = 1;

// ⛏️ Kazma

if (
    selected &&
    selected.type === "pickaxe"
) {

    if (type === "stone") {

        toolSpeed = 3;

    }
}

// 🪓 Balta

if (
    selected &&
    selected.type === "axe"
) {

    if (
        type === "wood" ||
        type === "leaves"
    ) {

        toolSpeed = 3;

    }
}

breakTimer +=
    delta * toolSpeed;


    const progress =
        Math.min(
            breakTimer / hardness,
            1
        );


    // Çatlak animasyonu

    updateCrackAnimation(
        progress
    );


    // Tamamlandı

   if (progress >= 1) {

    // =================================
    // 🧱 BLOK YERE DÜŞSÜN
    // =================================

    createDroppedBlock(
        breakingBlock.position,
        type,
        breakingBlock.material
    );

    // Dünyadaki gerçek bloğu sil
    deleteWorldBlock(
        activeScene,
        breakingBlock
    );

    stopBreaking();

}
}