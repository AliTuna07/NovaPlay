import { isSafe } from "./bridge.js";
import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";

let player;

let row = 0;
let side = 0;

let jumpVelocity = 0;
let jumping = false;

export function createPlayer(scene){

    player = new THREE.Group();

    // Gövde
    const body = new THREE.Mesh(
        new THREE.BoxGeometry(0.7,1,0.45),
        new THREE.MeshStandardMaterial({
            color:0x00bfff
        })
    );

    body.position.y = 1.4;

    // Kafa
    const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.28,24,24),
        new THREE.MeshStandardMaterial({
            color:0xffddb3
        })
    );

    head.position.y = 2.15;

    // Sol bacak
    const leftLeg = new THREE.Mesh(
        new THREE.BoxGeometry(0.22,0.9,0.22),
        new THREE.MeshStandardMaterial({
            color:0x222222
        })
    );

    leftLeg.position.set(-0.18,0.45,0);

    // Sağ bacak
    const rightLeg = leftLeg.clone();
    rightLeg.position.x = 0.18;

    // Sol kol
    const leftArm = new THREE.Mesh(
        new THREE.BoxGeometry(0.18,0.8,0.18),
        new THREE.MeshStandardMaterial({
            color:0xffddb3
        })
    );

    leftArm.position.set(-0.48,1.45,0);

    // Sağ kol
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

    const targetX = side===0 ? -1.3 : 1.3;
    const targetZ = 2 - row*2;

    player.position.x += (targetX-player.position.x)*0.15;
    player.position.z += (targetZ-player.position.z)*0.15;

    if(jumping){

        jumpVelocity -= 0.012;
        player.position.y += jumpVelocity;

        if(player.position.y<=0){

            player.position.y=0;
            jumpVelocity=0;
            jumping=false;
        }

    }

}
document.addEventListener("keydown",(e)=>{

    switch(e.code){

        case "KeyA":
        case "ArrowLeft":
            side=0;
            break;

        case "KeyD":
        case "ArrowRight":
            side=1;
            break;

       case "KeyW":
case "ArrowUp":

    row++;

    if(!isSafe(row, side)){

        console.log("💥 Yanlış cam!");

    }

    break;
        case "Space":

            if(!jumping){

                jumping=true;
                jumpVelocity=0.22;

            }

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