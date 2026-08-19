import * as THREE from "https://unpkg.com/three@0.179.1/build/three.module.js";

import { scene } from "./script.js";


// ======================================
// KÖPRÜ AYARLARI
// ======================================

const BRIDGE_LENGTH = 20;

const TILE_DISTANCE = 3;

const LEFT_X = -1.5;

const RIGHT_X = 1.5;


// ======================================
// KÖPRÜLER
// ======================================

export const solidPlatforms = [];

export const bridgeTiles = {};


// ======================================
// GÜVENLİ CAMLAR
// ======================================

const safeTiles = [];


// ======================================
// CAM MALZEMESİ
// ======================================

const glassMaterial =
    new THREE.MeshPhysicalMaterial({

        color: 0x66ddff,

        transparent: true,

        opacity: 0.7,

        roughness: 0.1,

        metalness: 0,

        transmission: 0.2

    });


// ======================================
// CAM GEOMETRİSİ
// ======================================

const glassGeometry =
    new THREE.BoxGeometry(
        2,
        0.2,
        2
    );


// ======================================
// KÖPRÜ OLUŞTUR
// ======================================

export function createBridge(pattern = null) {

    // Eski verileri temizle
    safeTiles.length = 0;

    for (const key in bridgeTiles) {

        const tile =
            bridgeTiles[key];

        scene.remove(tile);

    }

    for (
        let i = 0;
        i < solidPlatforms.length;
        i++
    ) {

        scene.remove(
            solidPlatforms[i]
        );

    }

    for (const key in bridgeTiles) {

        delete bridgeTiles[key];

    }

    solidPlatforms.length = 0;


    // ==================================
    // BAŞLANGIÇ PLATFORMU
    // ==================================

    const startMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x555555
        });

    const startGeometry =
        new THREE.BoxGeometry(
            5,
            0.5,
            5
        );

    const startPlatform =
        new THREE.Mesh(
            startGeometry,
            startMaterial
        );

    startPlatform.position.set(
        0,
        -0.25,
        3
    );

    scene.add(
        startPlatform
    );

    solidPlatforms.push(
        startPlatform
    );

// ======================================
// BİTİŞ PLATFORMU
// ======================================

const finishMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x444444
    });

const finishGeometry =
    new THREE.BoxGeometry(
        5,
        0.5,
        5
    );

const finishPlatform =
    new THREE.Mesh(
        finishGeometry,
        finishMaterial
    );

finishPlatform.position.set(
    0,
    -0.25,
    -BRIDGE_LENGTH * TILE_DISTANCE
);

finishPlatform.userData.isFinishPlatform = true;

scene.add(finishPlatform);

solidPlatforms.push(finishPlatform);
    // ==================================
    // KÖPRÜ CAMLARI
    // ==================================

    for (
        let i = 0;
        i < BRIDGE_LENGTH;
        i++
    ) {

        let safeSide;


        // ==================================
        // ORTAK DESEN VARSA ONU KULLAN
        // ==================================

        if (
            pattern &&
            pattern[i]
        ) {

            safeSide =
                pattern[i];

        }

        // ==================================
        // DESEN YOKSA RASTGELE
        // ==================================

        else {

            safeSide =
                Math.random() < 0.5
                    ? "left"
                    : "right";

        }


        safeTiles.push(
            safeSide
        );


        // ==================================
        // SOL CAM
        // ==================================

        const left =
            new THREE.Mesh(
                glassGeometry,
                glassMaterial.clone()
            );

        left.position.set(
            LEFT_X,
            0,
            -i * TILE_DISTANCE
        );

        scene.add(left);

        bridgeTiles[
            `left-${i}`
        ] = left;


        // ==================================
        // SAĞ CAM
        // ==================================

        const right =
            new THREE.Mesh(
                glassGeometry,
                glassMaterial.clone()
            );

        right.position.set(
            RIGHT_X,
            0,
            -i * TILE_DISTANCE
        );

        scene.add(right);

        bridgeTiles[
            `right-${i}`
        ] = right;

    }


    console.log(
        "🌉 Köprü oluşturuldu:",
        safeTiles
    );
function createLightBar(x, length) {

    const barGeometry =
        new THREE.BoxGeometry(
            0.1,
            0.1,
            length
        );

    const barMaterial =
        new THREE.MeshStandardMaterial({
            color: 0xff0000,
            emissive: 0xff0000,
            emissiveIntensity: 2
        });

    const bar =
        new THREE.Mesh(
            barGeometry,
            barMaterial
        );

    bar.position.set(
        x,
        0.03,
        -length / 2 + 1.5
    );

    scene.add(bar);


    // ==================================
    // AMPULLER
    // ==================================

    const bulbGeometry =
        new THREE.SphereGeometry(
            0.12,
            8,
            8
        );

    const bulbMaterial =
        new THREE.MeshStandardMaterial({
            color: 0xff0000,
            emissive: 0xff0000,
            emissiveIntensity: 4
        });


    for (
        let z = 0;
        z > -length;
        z -= 2
    ) {

        const bulb =
            new THREE.Mesh(
                bulbGeometry,
                bulbMaterial
            );

        bulb.position.set(
            x,
            0.2,
            z
        );

        scene.add(bulb);
    }
}
const bridgeLength = 60;

createLightBar(-3, bridgeLength);
createLightBar(-0.3, bridgeLength);
createLightBar(0.3, bridgeLength);
createLightBar(3, bridgeLength);
}


// ======================================
// CAM GÜVENLİ Mİ?
// ======================================

export function isSafeTile(
    side,
    index
) {

    if (
        index < 0 ||
        index >= safeTiles.length
    ) {

        return false;

    }

    return (
        safeTiles[index] === side
    );

}


// ======================================
// OYUNCUNUN CAMINI BUL
// ======================================

export function getTileInfo(
    x,
    z
) {

    const index =
        Math.round(
            -z / TILE_DISTANCE
        );

    const side =
        x < 0
            ? "left"
            : "right";

    return {

        index,

        side,

        safe:
            isSafeTile(
                side,
                index
            )

    };

}


// ======================================
// CAMI KIR
// ======================================

export function breakTile(
    side,
    index
) {

    const key =
        `${side}-${index}`;

    const tile =
        bridgeTiles[key];

    if (!tile) {
        return;
    }


    tile.material.opacity = 0.3;


    setTimeout(() => {

        let fallSpeed = 0;


        function animateBreak() {

            if (!bridgeTiles[key]) {
                return;
            }


            fallSpeed += 0.02;


            tile.position.y -=
                fallSpeed;


            tile.rotation.x +=
                0.05;


            tile.rotation.z +=
                0.03;


            if (
                tile.position.y > -20
            ) {

                requestAnimationFrame(
                    animateBreak
                );

            }

            else {

                scene.remove(
                    tile
                );

                tile.geometry.dispose();

                tile.material.dispose();

                delete bridgeTiles[key];

            }

        }


        animateBreak();

    }, 200);

}