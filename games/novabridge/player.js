import * as THREE from "https://unpkg.com/three@0.179.1/build/three.module.js";

import { scene } from "./script.js";
import { updatePlayerPosition } from "./multiplayer.js";

export let player;

export function createPlayer() {

    // Oyuncu zaten varsa yeni küp oluşturma
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

        sendPlayerPosition();

        return player;
    }

    // ==================================
    // OYUNCUYU İLK KEZ OLUŞTUR
    // ==================================

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

    player.position.set(
        0,
        0.6,
        3
    );

    // FPS kamerada kendi gövdemizi görmeyelim
    player.visible = false;

    player.hasFinished = false;

    scene.add(player);

    sendPlayerPosition();

    return player;
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