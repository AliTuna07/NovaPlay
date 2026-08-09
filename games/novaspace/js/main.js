import * as THREE from "https://unpkg.com/three@0.179.1/build/three.module.js";

import { createWorld } from "./world.js";
import {
    createPlayer,
    updatePlayer,
    player
} from "./player.js";

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x87ceeb);


// Kamera
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camera.position.set(
    0,
    4,
    8
);


// Renderer
const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

renderer.shadowMap.enabled = true;

document.body.appendChild(
    renderer.domElement
);


// Işık
const ambientLight = new THREE.AmbientLight(
    0xffffff,
    0.7
);

scene.add(ambientLight);


const sun = new THREE.DirectionalLight(
    0xffffff,
    1.5
);

sun.position.set(
    10,
    20,
    10
);

sun.castShadow = true;

scene.add(sun);


// Dünya
createWorld(scene);


// Oyuncu
createPlayer(scene);


// Saat
const clock = new THREE.Clock();


// Oyun döngüsü
function animate() {

    requestAnimationFrame(animate);

    const delta = Math.min(
        clock.getDelta(),
        0.05
    );

    updatePlayer(delta);


    // Kamera oyuncuyu takip ediyor
    if (player.object) {

        const target = player.object.position;

        camera.position.x =
            target.x;

        camera.position.y =
            target.y + 4;

        camera.position.z =
            target.z + 8;

        camera.lookAt(
            target.x,
            target.y + 1,
            target.z
        );

    }


    renderer.render(
        scene,
        camera
    );
}

animate();


// Ekran boyutu
window.addEventListener(
    "resize",
    () => {

        camera.aspect =
            window.innerWidth /
            window.innerHeight;

        camera.updateProjectionMatrix();

        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );

    }
);