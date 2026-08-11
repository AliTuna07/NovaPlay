import * as THREE from "https://unpkg.com/three@0.179.1/build/three.module.js";

import { keys } from "./controls.js";

import { blocks } from "./world.js";

import { cameraController } from "./camera.js";


// =====================================
// OYUNCU
// =====================================

export const player = {

    object: null,

    velocityY: 0,

    speed: 5,

    jumpPower: 8,

    width: 0.7,

    height: 2,

    grounded: false,

    // ❤️ CAN SİSTEMİ
    maxHealth: 10,

    health: 10,
    
    fallStartY: null,

};

// =====================================
// OYUNCU OLUŞTUR
// =====================================

export function createPlayer(scene) {

    const group =
        new THREE.Group();

    // Oyuncunun kendi modeli
    // Çarpışmada kullanılmıyor
    group.visible = false;


    // Gövde
    const body =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.7,
                1.1,
                0.7
            ),
            new THREE.MeshStandardMaterial({
                color: 0x2196f3
            })
        );

    body.position.y = 0.55;

    group.add(body);


    // Kafa
    const head =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.7,
                0.7,
                0.7
            ),
            new THREE.MeshStandardMaterial({
                color: 0xffcc99
            })
        );

    head.position.y = 1.45;

    group.add(head);


    // Başlangıç
    group.position.set(
        0,
        12,
        0
    );


    scene.add(group);

    player.object = group;

    

updateHealthHUD();

return group;
}


// =====================================
// OYUNCU KUTUSU
// =====================================

function getPlayerBox(position) {

    const collisionHeight =
        player.height - 0.05;

    return new THREE.Box3(

        new THREE.Vector3(
            position.x - player.width / 2,
            position.y,
            position.z - player.width / 2
        ),

        new THREE.Vector3(
            position.x + player.width / 2,
            position.y + collisionHeight,
            position.z + player.width / 2
        )

    );

}


// =====================================
// BLOK KUTUSU
// =====================================

function getBlockBox(block) {

    // Blokların tamamı 1x1x1 olduğu için
    // setFromObject kullanmak yerine doğrudan
    // pozisyondan hesaplıyoruz.

    return new THREE.Box3(

        new THREE.Vector3(
            block.position.x - 0.5,
            block.position.y - 0.5,
            block.position.z - 0.5
        ),

        new THREE.Vector3(
            block.position.x + 0.5,
            block.position.y + 0.5,
            block.position.z + 0.5
        )

    );

}


// =====================================
// ÇARPIŞMA
// =====================================

function collides(position) {

    const playerBox =
        getPlayerBox(position);


    for (const block of blocks) {

        const blockBox =
            getBlockBox(block);


        if (
            playerBox.intersectsBox(
                blockBox
            )
        ) {

            return true;

        }

    }


    return false;

}


// =====================================
// YATAY HAREKET
// =====================================

function moveHorizontal(dx, dz) {

    const current =
        player.object.position;

    // =================================
    // X HAREKETİ
    // =================================

    if (dx !== 0) {

        const test =
            current.clone();

        test.x += dx;

        if (!collides(test)) {

            current.x =
                test.x;

        } else {

            // Bloğun üstüne çıkmayı dene
            const stepUp =
                current.clone();

            stepUp.x += dx;
            stepUp.y += 1;

            if (!collides(stepUp)) {

                current.x =
                    stepUp.x;

                current.y =
                    stepUp.y;

                player.grounded = true;
                player.velocityY = 0;

            }

        }

    }

    // =================================
    // Z HAREKETİ
    // =================================

    if (dz !== 0) {

        const test =
            current.clone();

        test.z += dz;

        if (!collides(test)) {

            current.z =
                test.z;

        } else {

            // Bloğun üstüne çıkmayı dene
            const stepUp =
                current.clone();

            stepUp.z += dz;
            stepUp.y += 1;

            if (!collides(stepUp)) {

                current.z =
                    stepUp.z;

                current.y =
                    stepUp.y;

                player.grounded = true;
                player.velocityY = 0;

            }

        }

    }

}
// =====================================
// GÜNCELLE
// =====================================

export function updatePlayer(delta) {

    if (!player.object) {
        return;
    }


    // =================================
    // HAREKET
    // =================================

    let forward = 0;
    let right = 0;


    // W / ↑
    if (
        keys["KeyW"] ||
        keys["ArrowUp"]
    ) {

        forward += 1;

    }


    // S / ↓
    if (
        keys["KeyS"] ||
        keys["ArrowDown"]
    ) {

        forward -= 1;

    }


    // A / ←
    if (
        keys["KeyA"] ||
        keys["ArrowLeft"]
    ) {

        right -= 1;

    }


    // D / →
    if (
        keys["KeyD"] ||
        keys["ArrowRight"]
    ) {

        right += 1;

    }


    // Çapraz hız düzeltmesi
    const length =
        Math.sqrt(
            forward * forward +
            right * right
        );


    if (length > 0) {

        forward /= length;
        right /= length;

    }


    // =================================
    // KAMERA YÖNÜ
    // =================================

    const yaw =
        cameraController.yaw;


    const forwardX =
        -Math.sin(yaw);

    const forwardZ =
        -Math.cos(yaw);


    const rightX =
        Math.cos(yaw);

    const rightZ =
        -Math.sin(yaw);


    const moveX =
        forwardX * forward +
        rightX * right;


    const moveZ =
        forwardZ * forward +
        rightZ * right;


    const movement =
        player.speed * delta;


    moveHorizontal(
        moveX * movement,
        moveZ * movement
    );


   // =================================
// YERÇEKİMİ
// =================================

const current =
    player.object.position;

// Oyuncu zeminden ayrıldığında
// düşüş başlangıcını kaydet
if (
    player.grounded &&
    player.velocityY === 0
) {

    player.fallStartY =
        current.y;

    player.grounded = false;

}
// Oyuncu havadaysa ve daha önce düşüş başlamadıysa
if (
    !player.grounded &&
    player.velocityY < 0 &&
    player.fallStartY === null
) {

    player.fallStartY =
        current.y;

}
player.velocityY -=
    20 * delta;
    // =================================
    // DİKEY HAREKET
    // =================================

    const verticalMovement =
        player.velocityY * delta;

    const newPosition =
        current.clone();


    newPosition.y +=
        verticalMovement;


    // Aşağı doğru hareket
    if (player.velocityY <= 0) {

        if (!collides(newPosition)) {

            current.y =
                newPosition.y;

            player.grounded = false;

       } else {

    // Zemine çarptı
    // Yukarı doğru biraz tarama yapıp
    // doğru zemini buluyoruz.

    const step = 0.02;

    while (
        collides(current)
    ) {

        current.y += step;

    }

    // =================================
    // 💥 DÜŞME HASARI
    // =================================

    if (
        player.fallStartY !== null
    ) {

        const fallDistance =
            player.fallStartY -
            current.y;

        // İlk 3 blok güvenli
        if (fallDistance > 3) {

            const damage =
                Math.floor(
                    fallDistance - 3
                );

            damagePlayer(damage);

        }

        player.fallStartY = null;

    }

    player.velocityY = 0;

    player.grounded = true;

}
    }

    // Yukarı doğru hareket
    else {

        if (!collides(newPosition)) {

            current.y =
                newPosition.y;

        } else {

            player.velocityY = 0;

        }

    }


    // =================================
    // ZIPLAMA
    // =================================

    if (
    keys["Space"] &&
    player.grounded
) {

    player.velocityY =
        player.jumpPower;

    player.grounded = false;

    

}


    // =================================
    // DÜŞME KORUMASI
    // =================================

    if (
        current.y < -10
    ) {

        current.set(
            0,
            12,
            0
        );

        player.velocityY = 0;

        player.grounded = false;

    }

}
// =====================================
// ❤️ HASAR
// =====================================

export function damagePlayer(amount) {

    if (player.health <= 0) {
        return;
    }

    player.health -= amount;

    if (player.health < 0) {
        player.health = 0;
    }

    updateHealthHUD();

    // Öldü
    if (player.health <= 0) {

        respawnPlayer();
    }
}
// =====================================
// ❤️ CAN YENİLE
// =====================================

export function healPlayer(amount) {

    player.health += amount;

    if (
        player.health >
        player.maxHealth
    ) {

        player.health =
            player.maxHealth;
    }

    updateHealthHUD();
}
// =====================================
// 🔄 YENİDEN DOĞ
// =====================================

function respawnPlayer() {

    player.object.position.set(
        0,
        12,
        0
    );

    player.velocityY = 0;

    player.health =
        player.maxHealth;

    player.grounded = false;

    updateHealthHUD();
}
// =====================================
// ❤️ CAN HUD
// =====================================

function updateHealthHUD() {

    let hud =
        document.getElementById(
            "health"
        );

    if (!hud) {
        return;
    }

    hud.innerHTML = "";

    for (
        let i = 0;
        i < player.maxHealth;
        i++
    ) {

        const heart =
            document.createElement("span");

        heart.textContent =
            i < player.health
                ? "❤️"
                : "🖤";

        hud.appendChild(
            heart
        );
    }
}
