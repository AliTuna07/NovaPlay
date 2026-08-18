import * as THREE from "https://unpkg.com/three@0.179.1/build/three.module.js";

import { scene } from "./script.js";


// ======================================
// KÖPRÜ AYARLARI
// ======================================

const BRIDGE_LENGTH = 20;

const TILE_DISTANCE = 3;

const LEFT_X = -1.5;

const RIGHT_X = 1.5;

export const solidPlatforms = [];
export const bridgeTiles = [];
//=======================================
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
// GÜVENLİ CAMLAR
// ======================================

const safeTiles = [];


// ======================================
// KÖPRÜ OLUŞTUR
// ======================================

export function createBridge() {

  
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
    bridgeTiles.length = 0;
solidPlatforms.length = 0;

solidPlatforms.push(startPlatform);

    for (
        let i = 0;
        i < BRIDGE_LENGTH;
        i++
    ) {

        const safeSide =
            Math.random() < 0.5
                ? "left"
                : "right";


        safeTiles.push(
            safeSide
        );


        // ==================================
        // SOL CAM
        // ==================================

        const left =
            new THREE.Mesh(
                glassGeometry,
                glassMaterial
            );

        left.position.set(
            LEFT_X,
            0,
            -i * TILE_DISTANCE
        );

        
scene.add(left);

bridgeTiles.push({
    mesh: left,
    side: "left",
    index: i
});

        // ==================================
        // SAĞ CAM
        // ==================================

        const right =
            new THREE.Mesh(
                glassGeometry,
                glassMaterial
            );

        right.position.set(
            RIGHT_X,
            0,
            -i * TILE_DISTANCE
        );

       scene.add(right);

bridgeTiles.push({
    mesh: right,
    side: "right",
    index: i
});

    }

}


// ======================================
// BİR CAMIN GÜVENLİ Mİ OLDUĞUNU KONTROL ET
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
// OYUNCUNUN BULUNDUĞU CAMI BUL
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
        safe: isSafeTile(
            side,
            index
        )
    };

}