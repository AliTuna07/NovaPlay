import * as THREE from 
"https://unpkg.com/three@0.160.0/build/three.module.js";
import { Traffic } from "./traffic.js";
import "./controls.js";
import { scene, camera, renderer } from "./scene.js";
import { createRoad } from "./road.js";
import { createPlayer } from "./player.js";

document.getElementById("loading").remove();
const engineSound = new Audio("assets/sounds/engine.mp3");

const audioContext = new AudioContext();
const engineSource = audioContext.createMediaElementSource(engineSound);

const engineGain = audioContext.createGain();

engineGain.gain.value = 3.0;

engineSource.connect(engineGain);
engineGain.connect(audioContext.destination);
engineSound.loop = true;

// Yol
const road = createRoad();

scene.add(road.group);

// Oyuncu
const car = createPlayer();
car.position.set(0, 0.25, 2);
scene.add(car);
window.playerLane = 1;

const lanePositions = [-3, -1, 1, 3];
const traffic = new Traffic(scene);
let engineStarted = false;


document.addEventListener("keydown", () => {

    if(!engineStarted){

        audioContext.resume();

        engineSound.play()
        .then(()=>{
            engineStarted = true;
        })
        .catch(err=>{
            console.log(err);
        });

    }

});

// Oyun döngüsü
const roadSpeed = 0.35;
let speed = 0.35;
const maxSpeed = 1.4;
const minSpeed = 0.35;
function animate() {
const targetCameraZ = 8 + speed * 2.5;
const targetCameraY = 6 + speed * 0.6;

camera.position.z += (targetCameraZ - camera.position.z) * 0.05;
camera.position.y += (targetCameraY - camera.position.y) * 0.05;

camera.lookAt(0, 0, -15);
    if (window.accelerating) {

    speed += 0.015;

} else {

    speed -= 0.01;

}

speed = Math.max(minSpeed, Math.min(maxSpeed, speed));
updateSpeedometer();
updateEngineSound();
    requestAnimationFrame(animate);

    // Şerit değiştirme
    const targetX = lanePositions[window.playerLane];

    car.position.x += (targetX - car.position.x) * 0.15;

    // Hareket eden yol çizgileri
    road.dashes.forEach(dash => {

       dash.position.z += speed;

        if (dash.position.z > 8) {

            dash.position.z = -232;

        }

    });
    traffic.update(speed);
    checkCollision();

    renderer.render(scene, camera);

}

function updateEngineSound(){

    let power = 
    (speed - minSpeed) / (maxSpeed - minSpeed);

    engineGain.gain.value =
    2 + power * 1.5;


    engineSound.playbackRate =
    0.8 + power * 1.2;

}
const speedValue = document.getElementById("speedValue");

function updateSpeedometer(){

    if(speedValue){

        const kmh =
        20 + ((speed - minSpeed) / (maxSpeed - minSpeed)) * 120;

        speedValue.innerHTML = Math.floor(kmh);

    }

}
animate();
function checkCollision(){

    const playerBox = new THREE.Box3()
        .setFromObject(car);


    traffic.cars.forEach(enemy => {


        const enemyMesh = enemy.mesh || enemy;


        if(!enemyMesh.updateWorldMatrix){
            return;
        }


        const enemyBox = new THREE.Box3()
            .setFromObject(enemyMesh);


        if(playerBox.intersectsBox(enemyBox)){

            gameOver();

        }


    });

}
function gameOver(){

    engineSound.pause();

    document.getElementById("gameOver").style.display="flex";

}