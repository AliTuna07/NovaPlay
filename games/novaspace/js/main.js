import {
    startBackgroundMusic
} from "./sound.js";
import {
    inventory,
    updateHotbar
} from "./inventory.js";

import {
    initInteraction,
    updateInteraction
} from "./interaction.js";

import { createHand } from "./hand.js";

import * as THREE from "https://unpkg.com/three@0.179.1/build/three.module.js";

import {
    createWorld,
    updateWorld
} from "./world.js";
import {
    createPlayer,
    updatePlayer,
    player
} from "./player.js";

import { updateCamera } from "./camera.js";


// =====================================
// SAHNE
// =====================================

const scene = new THREE.Scene();

scene.background =
    new THREE.Color(0x87ceeb);


// =====================================
// KAMERA
// =====================================

const camera =
    new THREE.PerspectiveCamera(
        75,
        window.innerWidth /
        window.innerHeight,
        0.1,
        1000
    );

scene.add(camera);

camera.position.set(
    0,
    4,
    8
);


// =====================================
// RENDERER
// =====================================

const renderer =
    new THREE.WebGLRenderer({
        antialias: false
    });

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 1.5)
);

renderer.shadowMap.enabled = true;

renderer.shadowMap.type =
    THREE.PCFShadowMap;
document.body.appendChild(
    renderer.domElement
);


// =====================================
// IŞIK
// =====================================

const ambientLight =
    new THREE.AmbientLight(
        0xffffff,
        0.7
    );

scene.add(ambientLight);


const sun =
    new THREE.DirectionalLight(
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


// =====================================
// DÜNYA
// =====================================

createWorld(scene);


// =====================================
// OYUNCU
// =====================================

createPlayer(scene);


// Güvenli başlangıç noktası
player.object.position.set(
    0,
    12,
    0
);


// =====================================
// EL
// =====================================

createHand(camera);


// =====================================
// ETKİLEŞİM
// =====================================

initInteraction(
    camera,
    scene
);


// =====================================
// ENVANTER
// =====================================

updateHotbar();


// =====================================
// SAAT
// =====================================

const clock =
    new THREE.Clock();


// =====================================
// OYUN DÖNGÜSÜ
// =====================================

function animate() {

    requestAnimationFrame(
        animate
    );


    const delta =
        Math.min(
            clock.getDelta(),
            0.05
        );


    // Oyuncu
    updatePlayer(delta);
    updateWorld(
    player.object.position.x,
    player.object.position.z
);


    // Kamera
    updateCamera(
        camera,
        player
    );


    // Hedeflenen blok
    updateInteraction(delta);


    // Çiz
    renderer.render(
        scene,
        camera
    );

}

// =====================================
// 🎵 İLK ETKİLEŞİMDE MÜZİĞİ BAŞLAT
// =====================================

let musicStarted = false;

function startMusicOnce() {

    if (musicStarted) {
        return;
    }

    musicStarted = true;

    startBackgroundMusic();

    window.removeEventListener(
        "keydown",
        startMusicOnce
    );

    window.removeEventListener(
        "mousedown",
        startMusicOnce
    );
}

window.addEventListener(
    "keydown",
    startMusicOnce
);

window.addEventListener(
    "mousedown",
    startMusicOnce
);
animate();


// =====================================
// EKRAN BOYUTU
// =====================================

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