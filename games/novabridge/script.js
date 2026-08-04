import { getPlayer } from "./player.js";
import { updateCamera } from "./camera.js";
import {
    createPlayer,
    updatePlayer
} from "./player.js";
import { createBridge } from "./bridge.js";
import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x05070f);

const camera = new THREE.PerspectiveCamera(

75,

window.innerWidth/window.innerHeight,

0.1,

1000

);

camera.position.set(
    0,
    5,
    8
);

camera.lookAt(
    0,
    0,
    -8
);

const renderer = new THREE.WebGLRenderer({

antialias:true

});

renderer.setSize(

window.innerWidth,

window.innerHeight

);

renderer.shadowMap.enabled=true;

document.body.appendChild(renderer.domElement);



const ambient=new THREE.AmbientLight(

0xffffff,

0.8

);

scene.add(ambient);



const light=new THREE.DirectionalLight(

0xffffff,

2

);

light.position.set(5,12,5);

light.castShadow=true;

scene.add(light);





window.addEventListener("resize",()=>{

camera.aspect=

window.innerWidth/window.innerHeight;

camera.updateProjectionMatrix();

renderer.setSize(

window.innerWidth,

window.innerHeight

);

});





function animate(){

    requestAnimationFrame(animate);

    updatePlayer();

    updateCamera(camera, getPlayer());

    renderer.render(scene, camera);

}



export{

scene,

camera,

renderer

};
createBridge(scene);
createPlayer(scene);
animate();