import * as THREE from
"https://unpkg.com/three@0.179.1/build/three.module.js";

import {
    blocks
} from "./world.js";
import {
    player
} from "./player.js";
import {
    addItem
} from "./inventory.js";
// =====================================
// 🐄 NOVACRAFT HAYVAN SİSTEMİ
// =====================================

export const animals = [];

let animalScene = null;

const animalDrops = [];

let activeScene = null;
// =====================================
// 🎨 MATERYALLER
// =====================================

const whiteMaterial =
    new THREE.MeshStandardMaterial({
        color: 0xe8e4d8
    });

const brownMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x4a2c1b
    });

const darkBrownMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x24150e
    });

const pinkMaterial =
    new THREE.MeshStandardMaterial({
        color: 0xc98282
    });

const hornMaterial =
    new THREE.MeshStandardMaterial({
        color: 0xd8c99b
    });

const blackMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x111111
    });
    const meatMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x9b3d32
    });

// =====================================
// 🌱 ARAZİ YÜKSEKLİĞİ
// =====================================

function getTerrainHeight(x, z) {

    const blockX =
        Math.floor(x);

    const blockZ =
        Math.floor(z);


    let highestY = -3;


    for (const block of blocks) {

        const bx =
            Math.floor(block.position.x);

        const bz =
            Math.floor(block.position.z);


        if (
            bx === blockX &&
            bz === blockZ
        ) {

            if (
                !block.userData.isWater
            ) {

                highestY =
                    Math.max(
                        highestY,
                        block.position.y
                    );

            }

        }

    }


    return highestY + 0.5;
}

// =====================================
// 🐄 İNEK OLUŞTUR
// =====================================

// =====================================
// 🐄 NOVACRAFT İNEK MODELİ
// =====================================

export function createCow(
    scene,
    x,
    y,
    z
) {

    animalScene = scene;
    activeScene = scene;

    // =================================
    // 🐄 ANA GRUP
    // =================================

    const cow =
        new THREE.Group();

    cow.position.set(
        x,
        y,
        z
    );

    // =================================
    // ❤️ HAYVAN VERİLERİ
    // =================================

    cow.userData.type = "cow";

    cow.userData.health = 3;

    cow.userData.maxHealth = 3;

    cow.userData.direction =
        Math.random() * Math.PI * 2;

    cow.userData.speed =
        0.35 +
        Math.random() * 0.35;

    cow.userData.moveTimer =
        1 +
        Math.random() * 3;

    cow.userData.walkTime =
        Math.random() * 10;

    cow.userData.legs = [];

    // =================================
    // 🟫 GÖVDE
    // =================================

    const body =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.9,
                0.9,
                1.55
            ),
            whiteMaterial
        );

    body.position.set(
        0,
        1.05,
        0
    );

    cow.add(body);

    // =================================
    // 🟤 GÖVDE LEKELERİ
    // =================================

    const spot1 =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.28,
                0.30,
                0.025
            ),
            brownMaterial
        );

    spot1.position.set(
        -0.25,
        1.12,
        0.78
    );

    cow.add(spot1);


    const spot2 =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.30,
                0.25,
                0.025
            ),
            brownMaterial
        );

    spot2.position.set(
        0.22,
        0.92,
        -0.78
    );

    cow.add(spot2);


    // =================================
    // 🐄 KAFA
    // =================================

    const head =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.82,
                0.72,
                0.72
            ),
            whiteMaterial
        );

    head.position.set(
        0,
        1.35,
        0.88
    );

    cow.add(head);


    // =================================
    // 🟤 KAFA LEKESİ
    // =================================

    const faceSpot =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.30,
                0.28,
                0.025
            ),
            brownMaterial
        );

    faceSpot.position.set(
        0,
        1.45,
        1.245
    );

    cow.add(faceSpot);


    // =================================
    // 👃 BURUN
    // =================================

    const nose =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.52,
                0.30,
                0.18
            ),
            pinkMaterial
        );

    nose.position.set(
        0,
        1.18,
        1.27
    );

    cow.add(nose);


    // =================================
    // 🐽 BURUN DELİKLERİ
    // =================================

    const nostrilGeometry =
        new THREE.BoxGeometry(
            0.08,
            0.08,
            0.025
        );


    const nostrilLeft =
        new THREE.Mesh(
            nostrilGeometry,
            blackMaterial
        );

    nostrilLeft.position.set(
        -0.15,
        1.19,
        1.365
    );

    cow.add(nostrilLeft);


    const nostrilRight =
        new THREE.Mesh(
            nostrilGeometry,
            blackMaterial
        );

    nostrilRight.position.set(
        0.15,
        1.19,
        1.365
    );

    cow.add(nostrilRight);


    // =================================
    // 👀 GÖZLER
    // =================================

    const eyeGeometry =
        new THREE.BoxGeometry(
            0.10,
            0.10,
            0.04
        );


    const eyeLeft =
        new THREE.Mesh(
            eyeGeometry,
            blackMaterial
        );

    eyeLeft.position.set(
        -0.30,
        1.46,
        1.25
    );

    cow.add(eyeLeft);


    const eyeRight =
        new THREE.Mesh(
            eyeGeometry,
            blackMaterial
        );

    eyeRight.position.set(
        0.30,
        1.46,
        1.25
    );

    cow.add(eyeRight);


    // =================================
    // 👂 KULAKLAR
    // =================================

    const earGeometry =
        new THREE.BoxGeometry(
            0.20,
            0.12,
            0.30
        );


    const earLeft =
        new THREE.Mesh(
            earGeometry,
            brownMaterial
        );

    earLeft.position.set(
        -0.48,
        1.58,
        0.83
    );

    earLeft.rotation.y =
        -0.35;

    cow.add(earLeft);


    const earRight =
        new THREE.Mesh(
            earGeometry,
            brownMaterial
        );

    earRight.position.set(
        0.48,
        1.58,
        0.83
    );

    earRight.rotation.y =
        0.35;

    cow.add(earRight);


    // =================================
    // 🐄 BOYNUZLAR
    // =================================

    const hornGeometry =
        new THREE.BoxGeometry(
            0.12,
            0.22,
            0.12
        );


    const hornLeft =
        new THREE.Mesh(
            hornGeometry,
            hornMaterial
        );

    hornLeft.position.set(
        -0.27,
        1.78,
        0.82
    );

    cow.add(hornLeft);


    const hornRight =
        new THREE.Mesh(
            hornGeometry,
            hornMaterial
        );

    hornRight.position.set(
        0.27,
        1.78,
        0.82
    );

    cow.add(hornRight);


    // =================================
    // 🦵 BACAKLAR
    // =================================

    const legGeometry =
        new THREE.BoxGeometry(
            0.24,
            0.78,
            0.24
        );


    const legPositions = [

        [-0.30, 0.45,  0.52],
        [ 0.30, 0.45,  0.52],
        [-0.30, 0.45, -0.52],
        [ 0.30, 0.45, -0.52]

    ];


    for (
        const position of legPositions
    ) {

        const leg =
            new THREE.Mesh(
                legGeometry,
                darkBrownMaterial
            );

        leg.position.set(
            position[0],
            position[1],
            position[2]
        );

        cow.add(leg);

        cow.userData.legs.push(
            leg
        );

    }


    // =================================
    // 🐄 KUYRUK
    // =================================

    const tail =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.10,
                0.10,
                0.50
            ),
            darkBrownMaterial
        );

    tail.position.set(
        0,
        1.18,
        -0.92
    );

    tail.rotation.x =
        -0.35;

    cow.add(tail);


    // =================================
    // 🟤 KUYRUK PÜSKÜLÜ
    // =================================

    const tailTip =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.18,
                0.25,
                0.18
            ),
            darkBrownMaterial
        );

    tailTip.position.set(
        0,
        0.98,
        -1.14
    );

    cow.add(tailTip);


    // =================================
    // 🌍 SAHNEYE EKLE
    // =================================

    scene.add(cow);

    animals.push(cow);

    return cow;
}


// =====================================
// 🐄 HAYVANLARI GÜNCELLE
// =====================================

export function updateAnimals(delta) {

    for (const animal of animals) {

        if (!animal.userData) {
            continue;
        }

        const data =
            animal.userData;


        // =================================
        // ⏱️ YÖN DEĞİŞTİR
        // =================================

        data.moveTimer -= delta;

        if (data.moveTimer <= 0) {

            data.direction =
                Math.random() *
                Math.PI * 2;

            data.speed =
                0.35 +
                Math.random() * 0.35;

            data.moveTimer =
                2 +
                Math.random() * 4;
        }


        // =================================
        // 📍 HAREKET YÖNÜ
        // =================================

        const dx =
            Math.sin(data.direction) *
            data.speed *
            delta;

        const dz =
            Math.cos(data.direction) *
            data.speed *
            delta;


        const nextX =
            animal.position.x + dx;

        const nextZ =
            animal.position.z + dz;


        // =================================
        // 🌊 SUYU KONTROL ET
        // =================================

        const nextHeight =
            getTerrainHeight(
                nextX,
                nextZ
            );

        const currentHeight =
            getTerrainHeight(
                animal.position.x,
                animal.position.z
            );


        // =================================
        // 🏔️ ÇOK YÜKSEK FARK VARSA DUR
        // =================================

        if (
            Math.abs(
                nextHeight -
                currentHeight
            ) > 1
        ) {

            data.direction +=
                Math.PI;

            data.moveTimer = 1;

            continue;
        }


        // =================================
        // 🌊 SUYA GİRME
        // =================================

        if (
            isWaterPosition(
                nextX,
                nextZ
            )
        ) {

            data.direction +=
                Math.PI;

            data.moveTimer = 1;

            continue;
        }


        // =================================
        // 🚶 HAREKET
        // =================================

        animal.position.x =
            nextX;

        animal.position.z =
            nextZ;

// =================================
// 🐄 YÜRÜYÜŞ ANİMASYONU
// =================================

if (data.speed > 0) {

    data.walkTime +=
        delta * 8;

    const walk =
        Math.sin(
            data.walkTime
        ) * 0.35;

    if (data.legs) {

        // Ön sol + arka sağ
        data.legs[0].rotation.x =
            walk;

        data.legs[3].rotation.x =
            walk;

        // Ön sağ + arka sol
        data.legs[1].rotation.x =
            -walk;

        data.legs[2].rotation.x =
            -walk;

    }

}
        // =================================
        // 🌱 ZEMİNE OTUR
        // =================================

        const targetY =
            nextHeight - 0.05;

        animal.position.y +=
    (
        targetY -
        animal.position.y
    ) * Math.min(
        delta * 12,
        1
    );


        // =================================
        // 🔄 BAKIŞ YÖNÜ
        // =================================

        animal.rotation.y =
            data.direction;


        // =================================
        // 🐄 YÜRÜME ANİMASYONU
        // =================================

        const walk =
            Math.sin(
                performance.now() * 0.01
            );

        animal.position.y +=
            walk * 0.001;

    }

}
// =====================================
// 🌊 SU KONTROLÜ
// =====================================

function isWaterPosition(x, z) {

    const blockX =
        Math.floor(x);

    const blockZ =
        Math.floor(z);


    for (const block of blocks) {

        if (
            !block.userData.isWater
        ) {
            continue;
        }


        const bx =
            Math.floor(
                block.position.x
            );

        const bz =
            Math.floor(
                block.position.z
            );


        if (
            bx === blockX &&
            bz === blockZ
        ) {

            return true;

        }

    }


    return false;
}
// =====================================
// 🐄 CHUNK'A İNEK EKLE
// =====================================

export function spawnCowsInChunk(
    scene,
    chunkX,
    chunkZ,
    chunkSize = 16
) {

    const cowCount =
        Math.random() < 0.5 ? 1 : 2;

    const startX =
        chunkX * chunkSize;

    const startZ =
        chunkZ * chunkSize;


    for (
        let i = 0;
        i < cowCount;
        i++
    ) {

        const x =
            startX +
            Math.floor(
                Math.random() * chunkSize
            );

        const z =
            startZ +
            Math.floor(
                Math.random() * chunkSize
            );


        // Suya doğmasın
        if (
            isWaterPosition(x, z)
        ) {
            continue;
        }


        const y =
            getTerrainHeight(x, z);


        const cow =
            createCow(
                scene,
                x,
                y,
                z
            );


        cow.userData.chunkX =
            chunkX;

        cow.userData.chunkZ =
            chunkZ;

    }

}
// =====================================
// 🐄 CHUNK HAYVANLARINI SİL
// =====================================

export function removeCowsFromChunk(
    chunkX,
    chunkZ
) {

    for (
        let i = animals.length - 1;
        i >= 0;
        i--
    ) {

        const animal =
            animals[i];

        if (
            animal.userData?.type !==
            "cow"
        ) {
            continue;
        }

        if (
            animal.userData.chunkX === chunkX &&
            animal.userData.chunkZ === chunkZ
        ) {

            if (animal.parent) {
                animal.parent.remove(
                    animal
                );
            }

            animals.splice(
                i,
                1
            );
        }
    }
}



// =====================================
// 🐄 HAYVANA VUR
// =====================================

// =====================================
// 🐄 HAYVANA VUR
// =====================================

export function hitAnimal(
    animal,
    damage = 1
) {

    if (
        !animal ||
        animal.userData?.type !== "cow"
    ) {
        return false;
    }

    // ❤️ 1 can azalt
    animal.userData.health -= damage;

    console.log(
        "İnek canı:",
        animal.userData.health
    );


    // 🐄 Vurulma animasyonu
    animal.scale.set(
        1.08,
        0.94,
        1.08
    );

    setTimeout(() => {

        if (animal.parent) {

            animal.scale.set(
                1,
                1,
                1
            );

        }

    }, 100);


    // ☠️ Can 0'a ulaştıysa kaldır
    if (
    animal.userData.health <= 0
) {

    createMeatDrop(animal);

    removeAnimal(animal);

}

    return true;
}


// =====================================
// 🐄 HAYVANI KALDIR
// =====================================

function removeAnimal(animal) {

    const index =
        animals.indexOf(
            animal
        );


    if (
        index !== -1
    ) {

        animals.splice(
            index,
            1
        );

    }


    if (
        animal.parent
    ) {

        animal.parent.remove(
            animal
        );

    }

}
// =====================================
// 🥩 NOVACRAFT ET EŞYASI
// =====================================

function createMeatDrop(animal) {

    if (!animal.parent || !activeScene) {
        return;
    }

    const meatGroup =
        new THREE.Group();

    meatGroup.position.copy(
        animal.position
    );

    meatGroup.position.y += 0.55;

    // =================================
    // 🥩 ANA ET
    // =================================

    const meatGeometry =
        new THREE.BoxGeometry(
            0.42,
            0.28,
            0.30
        );

    const meatMaterial =
        new THREE.MeshStandardMaterial({

            color: 0x9b3028,

            roughness: 0.65,

            metalness: 0.0

        });

    const meat =
        new THREE.Mesh(
            meatGeometry,
            meatMaterial
        );

    meat.rotation.z =
        -0.15;

    meatGroup.add(meat);


    // =================================
    // 🥩 ETİN İKİNCİ PARÇASI
    // =================================

    const meat2Geometry =
        new THREE.BoxGeometry(
            0.28,
            0.20,
            0.24
        );

    const meat2 =
        new THREE.Mesh(
            meat2Geometry,
            meatMaterial.clone()
        );

    meat2.position.x =
        0.12;

    meat2.position.y =
        0.08;

    meat2.rotation.z =
        0.25;

    meatGroup.add(meat2);


    // =================================
    // 🧈 YAĞ PARÇALARI
    // =================================

    const fatMaterial =
        new THREE.MeshStandardMaterial({

            color: 0xf0d6a0,

            roughness: 0.7

        });


    const fatGeometry =
        new THREE.BoxGeometry(
            0.08,
            0.06,
            0.08
        );


    const fat1 =
        new THREE.Mesh(
            fatGeometry,
            fatMaterial
        );

    fat1.position.set(
        -0.10,
        0.15,
        0.10
    );

    meatGroup.add(fat1);


    const fat2 =
        new THREE.Mesh(
            fatGeometry,
            fatMaterial.clone()
        );

    fat2.position.set(
        0.13,
        0.10,
        -0.08
    );

    meatGroup.add(fat2);


    const fat3 =
        new THREE.Mesh(
            fatGeometry,
            fatMaterial.clone()
        );

    fat3.position.set(
        -0.05,
        -0.02,
        -0.13
    );

    meatGroup.add(fat3);


    // =================================
    // 🥩 EŞYA BİLGİLERİ
    // =================================

    meatGroup.userData.type =
        "raw_meat";

    meatGroup.userData.lifeTime =
        300;


    // =================================
    // 💨 FIRLAMA
    // =================================

    meatGroup.userData.velocity =
        new THREE.Vector3(

            (Math.random() - 0.5) * 1.2,

            1.5,

            (Math.random() - 0.5) * 1.2

        );


    // =================================
    // 🔄 DÖNME
    // =================================

    meatGroup.userData.rotationSpeed =
        new THREE.Vector3(

            (Math.random() - 0.5) * 3,

            (Math.random() - 0.5) * 3,

            (Math.random() - 0.5) * 3

        );


    activeScene.add(
        meatGroup
    );

    animalDrops.push(
        meatGroup
    );

}
// =====================================
// 🥩 EŞYA GÜNCELLE
// =====================================

// =====================================
// 🥩 EŞYA GÜNCELLE + TOPLAMA
// =====================================

export function updateAnimalDrops(delta) {

    for (
        let i = animalDrops.length - 1;
        i >= 0;
        i--
    ) {

        const drop =
            animalDrops[i];

        if (!drop.parent) {

            animalDrops.splice(i, 1);

            continue;
        }


        // =================================
        // ⏱️ ÖMÜR
        // =================================

        drop.userData.lifeTime -=
            delta;


        if (
            drop.userData.lifeTime <= 0
        ) {

            activeScene.remove(drop);

            drop.traverse((object) => {

                if (object.geometry) {
                    object.geometry.dispose();
                }

                if (object.material) {
                    object.material.dispose();
                }

            });

            animalDrops.splice(i, 1);

            continue;
        }


        // =================================
        // 💨 YERÇEKİMİ
        // =================================

        drop.userData.velocity.y -=
            9.8 * delta;


        drop.position.x +=
            drop.userData.velocity.x *
            delta;

        drop.position.y +=
            drop.userData.velocity.y *
            delta;

        drop.position.z +=
            drop.userData.velocity.z *
            delta;


        // =================================
        // 🔄 DÖNME
        // =================================

        if (
            drop.userData.rotationSpeed
        ) {

            drop.rotation.x +=
                drop.userData.rotationSpeed.x *
                delta;

            drop.rotation.y +=
                drop.userData.rotationSpeed.y *
                delta;

            drop.rotation.z +=
                drop.userData.rotationSpeed.z *
                delta;

        }


        // =================================
        // 🌱 ZEMİN
        // =================================

        const groundY =
            getTerrainHeight(
                drop.position.x,
                drop.position.z
            );

        if (
            drop.position.y < groundY + 0.18
        ) {

            drop.position.y =
                groundY + 0.18;

            drop.userData.velocity.y =
                0;

            drop.userData.velocity.x *=
                0.8;

            drop.userData.velocity.z *=
                0.8;

        }


        // =================================
        // 🧲 OYUNCUYA YAKLAŞINCA TOPLA
        // =================================

        if (
            player &&
            player.object
        ) {

            // =================================
// 🧲 OYUNCUYA YAKLAŞINCA TOPLA
// =================================

if (
    player &&
    player.object
) {

    const dx =
        drop.position.x -
        player.object.position.x;

    const dz =
        drop.position.z -
        player.object.position.z;


    // Sadece yatay mesafeyi hesapla
    const distance =
        Math.sqrt(
            dx * dx +
            dz * dz
        );


    if (
        distance <= 2.0
    ) {

        collectAnimalDrop(
            drop,
            i
        );

    }

}

        }

    }

}
// =====================================
// 🧲 ET TOPLA
// =====================================

// =====================================
// 🧲 EŞYA TOPLA
// =====================================

// =====================================
// 🧲 EŞYA TOPLA
// =====================================

function collectAnimalDrop(
    drop,
    index
) {

    const type =
        drop.userData.type;

    console.log(
        "🧲 Toplama denemesi:",
        type
    );


    // =================================
    // 🎒 ENVANTERE EKLE
    // =================================

    const added =
        addItem(
            type,
            1
        );


    // Envanter doluysa yerde bırak
    if (!added) {

        console.log(
            "🎒 Envanter dolu!"
        );

        return;

    }


    console.log(
        "🥩 Çiğ et envantere eklendi!"
    );


    // =================================
    // 🌍 DÜNYADAN SİL
    // =================================

    if (drop.parent) {

        drop.parent.remove(
            drop
        );

    }


    // =================================
    // 🧹 TEMİZLE
    // =================================

    drop.traverse(
        (object) => {

            if (object.geometry) {

                object.geometry.dispose();

            }


            if (object.material) {

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


    // =================================
    // 📦 DROP LİSTESİNDEN SİL
    // =================================

    animalDrops.splice(
        index,
        1
    );

}