import * as THREE from "https://unpkg.com/three@0.179.1/build/three.module.js";

export let hand = null;

export function createHand(camera) {

    hand = new THREE.Group();

    // =========================
    // MAVİ KOL
    // =========================

    const sleeve = new THREE.Mesh(
        new THREE.BoxGeometry(
            0.42,
            0.75,
            0.42
        ),
        new THREE.MeshStandardMaterial({
            color: 0x08a9d1,
            roughness: 0.8
        })
    );

    // Daha aşağıda
    sleeve.position.set(
        0.48,
        -0.95,
        -0.72
    );

    sleeve.rotation.z = -0.12;

    hand.add(sleeve);


    // =========================
    // TEN RENGİ EL
    // =========================

    const skinMaterial = new THREE.MeshStandardMaterial({
        color: 0xd99568,
        roughness: 0.85
    });

    const palm = new THREE.Mesh(
        new THREE.BoxGeometry(
            0.52,
            0.58,
            0.46
        ),
        skinMaterial
    );

    // El kolun ÜSTÜNDE
    palm.position.set(
        0.47,
        -0.52,
        -0.82
    );

    palm.rotation.z = -0.08;

    hand.add(palm);


    


    // =========================
    // GÖLGELER
    // =========================

    hand.traverse((object) => {

        if (object.isMesh) {
            object.castShadow = true;
            object.receiveShadow = true;
        }

    });


    // Kameraya bağla
    camera.add(hand);

}