import * as THREE from "https://unpkg.com/three@0.179.1/build/three.module.js";

export class Weather {

    constructor(scene){

        this.scene = scene;

        this.mode = "auto";

        this.createRain();

    }

    createRain(){

        const geometry = new THREE.BufferGeometry();

        const vertices = [];

        for(let i = 0; i < 2500; i++){

            vertices.push(

                (Math.random() - 0.5) * 120,
                Math.random() * 80,
                (Math.random() - 0.5) * 120

            );

        }

        geometry.setAttribute(

            "position",

            new THREE.Float32BufferAttribute(vertices,3)

        );

        const material = new THREE.PointsMaterial({

            color:0xffffff,
            size:0.15,
            transparent:true,
            opacity:0.9

        });

        this.rain = new THREE.Points(
            geometry,
            material
        );

        this.scene.add(this.rain);

        this.rain.visible = false;

    }

    enableRain(){

        this.rain.visible = true;

    }

    disableRain(){

        this.rain.visible = false;

    }

    enableFog(){

        this.scene.fog = new THREE.Fog(
            0xb8c3cf,
            10,
            70
        );

    }

    disableFog(){

    if(this.scene.fog){

        this.scene.fog.near = 500;

        this.scene.fog.far = 1000;

    }

}

    setMode(mode){

        this.mode = mode;

        this.disableRain();
        this.disableFog();

        switch(mode){

            case "sun":

                break;

            case "rain":

                this.enableRain();

                break;

            case "fog":

                this.enableFog();

                break;

            case "night":

                this.enableRain();

                break;

            case "auto":

                break;

        }

    }

    update(speed){

        if(!this.rain.visible){
            return;
        }

        const positions =
        this.rain.geometry.attributes.position.array;

        for(let i=1;i<positions.length;i+=3){

    positions[i]-=
    2+speed*5;

    positions[i-1]-=
    speed*0.15;

    if(positions[i]<0){

        positions[i]=80;

        positions[i-1]=
        (Math.random()-0.5)*120;

        positions[i+1]=
        (Math.random()-0.5)*120;

    }

}

}
}