import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";

const desiredPosition = new THREE.Vector3();

export function updateCamera(camera, player){

    if(!player) return;

    // Oyuncunun arkasında ve yukarısında duracak
    desiredPosition.set(
        player.position.x,
        player.position.y + 4,
        player.position.z + 7
    );

    // Yumuşak takip
    camera.position.lerp(desiredPosition, 0.08);

    // Oyuncuya bak
    camera.lookAt(
        player.position.x,
        player.position.y + 1.5,
        player.position.z
    );

}