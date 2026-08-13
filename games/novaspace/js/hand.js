import * as THREE from "https://unpkg.com/three@0.179.1/build/three.module.js";

export let hand = null;

// ⚔️ Kılıç referansı
export let sword = null;
export let axe = null;
export let pickaxe = null;
// =====================================
// 🖐️ EL OLUŞTUR
// =====================================

export function createHand(camera) {

    hand = new THREE.Group();

    // =================================
    // 💪 MAVİ KOL
    // =================================

    const sleeve =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.28,
                0.68,
                0.28
            ),

            new THREE.MeshStandardMaterial({
                color: 0x08a9d1,
                roughness: 0.8
            })
        );

    sleeve.position.set(
        0.52,
        -0.78,
        -0.72
    );

    sleeve.rotation.z =
        -0.12;

    hand.add(
        sleeve
    );

    // =================================
    // 🖐️ EL
    // =================================

    const skinMaterial =
        new THREE.MeshStandardMaterial({
            color: 0xd99568,
            roughness: 0.85
        });

    const palm =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.36,
                0.42,
                0.32
            ),
            skinMaterial
        );

    palm.position.set(
        0.52,
        -0.48,
        -0.84
    );

    palm.rotation.z =
        -0.08;

    hand.add(
        palm
    );

    // =================================
    // ⚔️ KILIÇ
    // =================================

    sword =createSword();

    hand.add(sword);
    //===================================
    //BALTA
    //===================================
    axe = createAxe();

    hand.add(axe);
    //===================================
    //KAZMA
    //===================================
    pickaxe =createPickaxe();
    hand.add(pickaxe);

sword.visible = false
pickaxe.visible = false;
axe.visible = false;
    // =================================
    // 🌑 GÖLGELER
    // =================================

    hand.traverse(
        (object) => {

            if (
                object.isMesh
            ) {

                object.castShadow =
                    true;

                object.receiveShadow =
                    true;

            }

        }
    );

    // =================================
    // 🎥 KAMERAYA BAĞLA
    // =================================

    camera.add(
        hand
    );

    // Başlangıçta kılıç görünmesin
    sword.visible =
        false;
}


// =====================================
// ⚔️ KILIÇ OLUŞTUR
// =====================================

function createSword() {

    const group =
        new THREE.Group();

    // Bıçak
    const blade =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                0.12,
                0.82,
                0.06
            ),

            new THREE.MeshStandardMaterial({

                color: 0xd9e0e8,
                metalness: 0.8,
                roughness: 0.22

            })

        );

    blade.position.y = 0.45;

    group.add(blade);

    // Kabza

    const handle =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                0.11,
                0.36,
                0.11
            ),

            new THREE.MeshStandardMaterial({

                color: 0x5a321c

            })

        );

    handle.position.y = -0.18;

    group.add(handle);

    // Koruma

    const guard =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                0.40,
                0.07,
                0.10
            ),

            new THREE.MeshStandardMaterial({

                color: 0xd4a72c,
                metalness: 0.7

            })

        );

    guard.position.y = 0;

    group.add(guard);

    // Kabza ucu

    const pommel =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                0.13,
                0.11,
                0.13
            ),

            guard.material

        );

    pommel.position.y = -0.40;

    group.add(pommel);

    // Elde duruş

    group.position.set(
        0.42,
        -0.30,
        -0.92
    );

   group.rotation.set(
    -0.9,
    0.35,
    0.25
);

    return group;
}
function createAxe() {

    const group =
        new THREE.Group();

    // Sap

    const handle =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                0.12,
                0.9,
                0.12
            ),

            new THREE.MeshStandardMaterial({

                color: 0x5a321c

            })

        );

    handle.position.y =
        -0.1;

    group.add(handle);

    // Balta ağzı

    const blade =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                0.45,
                0.35,
                0.12
            ),

            new THREE.MeshStandardMaterial({

                color: 0x888888,

                metalness: 0.7,

                roughness: 0.3

            })

        );

    blade.position.set(
        0.18,
        0.25,
        0
    );

    group.add(blade);

    // Eldeki konumu

    group.position.set(
        0.55,
        -0.35,
        -0.15
    );

    group.rotation.set(
        0.3,
        0.4,
        -0.8
    );

    group.scale.set(
        0.8,
        0.8,
        0.8
    );

    return group;
}
function createPickaxe() {

    const group =
        new THREE.Group();

    const handle =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                0.12,
                0.9,
                0.12
            ),

            new THREE.MeshStandardMaterial({

                color: 0x5a321c

            })

        );

    handle.position.y = -0.1;

    group.add(handle);

    const head =
        new THREE.Mesh(

            new THREE.BoxGeometry(
                0.7,
                0.18,
                0.18
            ),

            new THREE.MeshStandardMaterial({

                color: 0x888888,

                metalness: 0.6

            })

        );

    head.position.y = 0.4;

    group.add(head);

    return group;

}
// =====================================
// ⚔️ KILIÇ SALDIRI SİSTEMİ
// =====================================

let attacking = false;
let attackTime = 0;

const ATTACK_DURATION = 0.28;


// =====================================
// ⚔️ SALDIRI BAŞLAT
// =====================================

export function attackSword() {

    if (!hand) {
        return;
    }

    if (!sword) {
        return;
    }

    if (!sword.visible) {
        return;
    }

    // Zaten saldırıyorsa tekrar başlatma
    if (attacking) {
        return;
    }

    attacking = true;
    attackTime = 0;
}


// =====================================
// ⚔️ SALDIRI ANİMASYONU
// =====================================

export function updateHandAnimation(delta) {

    if (!hand) {
        return;
    }

    // Normal pozisyon
    if (!attacking) {

        hand.rotation.x =
            THREE.MathUtils.lerp(
                hand.rotation.x,
                0,
                delta * 12
            );

        hand.rotation.y =
            THREE.MathUtils.lerp(
                hand.rotation.y,
                0,
                delta * 12
            );

        hand.rotation.z =
            THREE.MathUtils.lerp(
                hand.rotation.z,
                0,
                delta * 12
            );

        return;
    }


    attackTime += delta;

    let progress =
        attackTime /
        ATTACK_DURATION;


    progress =
        Math.min(
            progress,
            1
        );


    // =================================
    // 🗡️ HIZLI SALDIRI EĞRİSİ
    // =================================

    const swing =
        Math.sin(
            progress * Math.PI
        );


    // Kolu aşağı ve yana yatır
    hand.rotation.x =
        -swing * 0.95;


    hand.rotation.y =
        swing * 0.35;


    hand.rotation.z =
        -swing * 0.55;


    


    // =================================
    // 🛑 SALDIRI BİTTİ
    // =================================

    if (
        progress >= 1
    ) {

        attacking = false;

        hand.rotation.set(
            0,
            0,
            0
        );

        hand.position.set(
            0,
            0,
            0
        );
    }
}
export function updateHandItem(item) {

    if (!item) {

        sword.visible = false;
        axe.visible = false;
        pickaxe.visible = false;

        return;
    }

    sword.visible =
        item.type === "sword";

    axe.visible =
        item.type === "axe";

    pickaxe.visible =
        item.type === "pickaxe";
}