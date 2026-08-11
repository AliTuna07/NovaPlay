import * as THREE from "https://unpkg.com/three@0.179.1/build/three.module.js";

import { getMouseDelta } from "./controls.js";

export const cameraController = {

yaw: 0,

pitch: 0,

sensitivity: 0.002

};

export function updateCamera(camera, player) {

if (!player.object) return;

const mouse = getMouseDelta();

cameraController.yaw -=
    mouse.x * cameraController.sensitivity;

cameraController.pitch -=
    mouse.y * cameraController.sensitivity;


const limit =
    Math.PI / 2 - 0.05;

cameraController.pitch =
    THREE.MathUtils.clamp(
        cameraController.pitch,
        -limit,
        limit
    );


const target =
    player.object.position.clone();

// Kamera göz hizası
target.y += 1.6;


camera.position.copy(target);


camera.rotation.order = "YXZ";

camera.rotation.y =
    cameraController.yaw;

camera.rotation.x =
    cameraController.pitch;

}