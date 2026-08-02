import { FogEffect } from "./fog.js";
import { Weather } from "./weather.js";
import { Headlights } from "./headlights.js";
import { scene, camera, renderer, clock } from "./scene.js";
import { Environment } from "./environment.js";
import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";
import { Traffic } from "./traffic.js";
import "./controls.js";
import { createRoad } from "./road.js";
import { createPlayer, getCarStats } from "./player.js";

document.getElementById("loading").remove();


const distanceValue = document.getElementById("distanceValue");

const environment = new Environment(scene);
const fog = new FogEffect(scene);
const weather = new Weather(scene);


const weatherMode =
localStorage.getItem("weather") || "auto";

weather.setMode(weatherMode);

function updateDistance(){

    if(distanceValue){

        distanceValue.textContent =
        distance.toFixed(2);

    }

}
document.getElementById("settingsButton")
.onclick = () => {

    location.href = "settings.html";

};
const engineSound = new Audio("assets/sounds/engine.mp3");

const audioContext = new AudioContext();
const engineSource = audioContext.createMediaElementSource(engineSound);

const engineGain = audioContext.createGain();

engineGain.gain.value = 0.25;

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
const headlights = new Headlights(car);

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
const carStats = getCarStats();

let speed = 0.35;

let carKmh = 20; // <-- bunu buraya ekle

const maxSpeed = carStats.maxSpeed;

const acceleration = carStats.acceleration;

const minSpeed = 0.35;



let score = 0;
let raceRewardGiven = false;
let novaRaceBest = Number(localStorage.getItem("novaRaceBest")) || 0;
let gameEnded = false;
let distance = 0;


function animate() {
    const delta = clock.getDelta();

environment.update(delta);

weather.update(speed);
fog.update(speed);

const brightness = environment.getBrightness();

const b = 0.20 + brightness * 0.80;

road.roadMaterial.color.setRGB(
    0.16 * b,
    0.16 * b,
    0.16 * b
);
headlights.setNight(
    environment.isNight()
);
const targetCameraZ = 8 + speed * 2.5;
const targetCameraY = 6 + speed * 0.6;

camera.position.z += (targetCameraZ - camera.position.z) * 0.05;
camera.position.y += (targetCameraY - camera.position.y) * 0.05;

camera.lookAt(0, 0, -15);

    if(gameEnded){
        return;
    }
    if(window.accelerating){

    speed += acceleration;

}
else if(window.braking){

    speed -= 0.04;

}
else{

    speed -= 0.01;

}

  
    speed = Math.max(minSpeed, Math.min(maxSpeed, speed));
    const power =
(speed - minSpeed) / (maxSpeed - minSpeed);

carKmh =
20 + power * (carStats.topSpeed - 20);

    score += speed;
    distance += speed * 0.02;

    updateDistance();
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

    const power =
    (speed - minSpeed) / (maxSpeed - minSpeed);

    // Ses seviyesi (%15 - %45)
    engineGain.gain.value =
0.10 + power * 0.50;
    // Motor devri
    engineSound.playbackRate =
    0.9 + power * 0.4;

}
const speedValue = document.getElementById("speedValue");

function updateSpeedometer(){

    if(speedValue){

        speedValue.innerHTML =
        Math.floor(carKmh);

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

    gameEnded = true;

    engineSound.pause();


    let finalScoreNumber = Math.floor(score);


    const finalScoreText = document.getElementById("finalScore");


    if(finalScoreText){

        finalScoreText.innerHTML =
        `
        Skor: ${finalScoreNumber}<br>
        📏 Mesafe: ${distance.toFixed(2)} KM
        `;

    }


    document.getElementById("gameOver")
    .style.display="flex";

}
const menuButton = document.getElementById("menuButton");

if (menuButton) {
    menuButton.addEventListener("click", () => {
        window.location.href = "../index.html";
    });
}
function goMainMenu() {
    window.location.href = "../../index.html";
}

window.goMainMenu = goMainMenu;
