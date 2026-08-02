import * as THREE from
"https://unpkg.com/three@0.179.1/build/three.module.js";

export class Headlights{

    constructor(car){

        this.left =
        new THREE.SpotLight(
            0xffffff,
            0
        );

        this.right =
        new THREE.SpotLight(
            0xffffff,
            0
        );

        this.left.distance = 25;
        this.right.distance = 25;

        this.left.angle = Math.PI/7;
        this.right.angle = Math.PI/7;

        this.left.penumbra = 0.6;
        this.right.penumbra = 0.6;

        this.left.position.set(-0.35,0.25,-0.8);
        this.right.position.set(0.35,0.25,-0.8);

        this.left.target.position.set(-0.35,0,-20);
        this.right.target.position.set(0.35,0,-20);

        car.add(this.left);
        car.add(this.right);

        car.add(this.left.target);
        car.add(this.right.target);

    }

    setNight(state){

        this.left.intensity =
        state ? 18 : 0;

        this.right.intensity =
        state ? 18 : 0;

    }

}