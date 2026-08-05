import { isSafe, breakGlass } from "./bridge.js";
import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";

let player;

let row = -1;          // Başlangıç platformu
let side = 0;
let falling = false;
let fallSpeed = 0;
let targetRow = -1;
let targetSide = 0;

let jumping = false;
let jumpVelocity = 0;

export function createPlayer(scene){

    player = new THREE.Group();

    // Gövde
    const body = new THREE.Mesh(
        new THREE.BoxGeometry(0.7,1,0.45),
        new THREE.MeshStandardMaterial({color:0x00bfff})
    );
    body.position.y = 1.4;

    // Kafa
    const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.28,24,24),
        new THREE.MeshStandardMaterial({color:0xffddb3})
    );
    head.position.y = 2.15;

    // Bacaklar
    const leftLeg = new THREE.Mesh(
        new THREE.BoxGeometry(0.22,0.9,0.22),
        new THREE.MeshStandardMaterial({color:0x222222})
    );
    leftLeg.position.set(-0.18,0.45,0);

    const rightLeg = leftLeg.clone();
    rightLeg.position.x = 0.18;

    // Kollar
    const leftArm = new THREE.Mesh(
        new THREE.BoxGeometry(0.18,0.8,0.18),
        new THREE.MeshStandardMaterial({color:0xffddb3})
    );
    leftArm.position.set(-0.48,1.45,0);

    const rightArm = leftArm.clone();
    rightArm.position.x = 0.48;

    player.add(body);
    player.add(head);
    player.add(leftLeg);
    player.add(rightLeg);
    player.add(leftArm);
    player.add(rightArm);

    player.position.set(-1.3,0,2);

    scene.add(player);
}

export function updatePlayer(){

    if(!player) return;
    if(falling){

    fallSpeed += 0.02;

    player.position.y -= fallSpeed;

    player.rotation.z += 0.08;
    if(player.position.y < -25){

    location.reload();

}

    return;

}

    const x = targetSide === 0 ? -1.3 : 1.3;
    const z = 2 - (targetRow + 1) * 2;

    player.position.x += (x - player.position.x) * 0.15;
    player.position.z += (z - player.position.z) * 0.15;

    if(jumping){

        jumpVelocity -= 0.012;
        player.position.y += jumpVelocity;

        if(player.position.y <= 0){

            player.position.y = 0;
            jumpVelocity = 0;
            jumping = false;

            row = targetRow;
            side = targetSide;

            if(!isSafe(row, side)){

                console.log("💥 Yanlış cam");
               breakGlass(row, side);

falling = true;
fallSpeed = 0;

            }else{

                console.log("✅ Doğru cam");

            }

        }

    }

}

document.addEventListener("keydown",(e)=>{

    if(jumping) return;

    switch(e.code){

        case "KeyA":
        case "ArrowLeft":
            targetSide = 0;
            break;

        case "KeyD":
        case "ArrowRight":
            targetSide = 1;
            break;

        case "KeyW":
        case "ArrowUp":

            targetRow = row + 1;

            jumping = true;
            jumpVelocity = 0.22;

            break;

    }

});

export function getPlayer(){
    return player;
}

export function getPlayerState(){
    return {
        row,
        side
    };
}