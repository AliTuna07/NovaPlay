import * as THREE from "https://unpkg.com/three@0.179.1/build/three.module.js";

import { scene } from "./script.js";
import { updatePlayerPosition } from "./multiplayer.js";

export let player;

export function createPlayer() {

    player = new THREE.Mesh(
        new THREE.BoxGeometry(
            1,
            2,
            1
        ),

        new THREE.MeshStandardMaterial({
            color: 0xffffff
        })
    );

    // Oyuncunun başlangıç konumu
    player.position.set(
        0,
        1,
        3
    );

    // FPS kamerada kendi gövdemizi görmeyelim
    player.visible = false;

    scene.add(player);

    sendPlayerPosition();
}


// ======================================
// KONUMU FIREBASE'E GÖNDER
// ======================================

export function sendPlayerPosition() {

    if (!player) return;

    updatePlayerPosition(
        player.position.x,
        player.position.y,
        player.position.z,
        player.rotation.y
    );
}