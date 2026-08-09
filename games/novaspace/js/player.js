import * as THREE from "https://unpkg.com/three@0.179.1/build/three.module.js";
import { keys } from "./controls.js";

export const player = {
    object: null,

    velocityY: 0,

    speed: 5,

    jumpPower: 8,

    height: 2,

    grounded: false
};

export function createPlayer(scene) {

    const group = new THREE.Group();

    // Gövde
    const bodyGeometry = new THREE.BoxGeometry(0.7, 1.2, 0.7);

    const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0x2196f3
    });

    const body = new THREE.Mesh(
        bodyGeometry,
        bodyMaterial
    );

    body.position.y = 0.6;

    group.add(body);

    // Kafa
    const headGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);

    const headMaterial = new THREE.MeshStandardMaterial({
        color: 0xffcc99
    });

    const head = new THREE.Mesh(
        headGeometry,
        headMaterial
    );

    head.position.y = 1.6;

    group.add(head);

    group.position.set(0, 0, 3);

    scene.add(group);

    player.object = group;

    return group;
}

export function updatePlayer(delta) {

    if (!player.object) return;

    let moveX = 0;
    let moveZ = 0;

    if (keys["KeyW"] || keys["ArrowUp"]) {
        moveZ -= 1;
    }

    if (keys["KeyS"] || keys["ArrowDown"]) {
        moveZ += 1;
    }

    if (keys["KeyA"] || keys["ArrowLeft"]) {
        moveX -= 1;
    }

    if (keys["KeyD"] || keys["ArrowRight"]) {
        moveX += 1;
    }

    // Çapraz hareket hızını düzelt
    const length = Math.sqrt(
        moveX * moveX +
        moveZ * moveZ
    );

    if (length > 0) {

        moveX /= length;
        moveZ /= length;

    }

    player.object.position.x +=
        moveX * player.speed * delta;

    player.object.position.z +=
        moveZ * player.speed * delta;

    // Yerçekimi
    player.velocityY -= 20 * delta;

    player.object.position.y +=
        player.velocityY * delta;

    // Zemin
    if (player.object.position.y <= 0) {

        player.object.position.y = 0;

        player.velocityY = 0;

        player.grounded = true;

    } else {

        player.grounded = false;

    }

    // Zıplama
    if (
        (keys["Space"]) &&
        player.grounded
    ) {

        player.velocityY = player.jumpPower;

        player.grounded = false;

    }
}