import * as THREE from "https://unpkg.com/three@0.179.1/build/three.module.js";

export class FogEffect {

    constructor(scene){

        this.scene = scene;

        this.targetNear = 40;
        this.targetFar = 140;

        scene.fog = new THREE.Fog(
            scene.background.clone(),
            this.targetNear,
            this.targetFar
        );

    }

    update(brightness){

        // Gece sis yoğunlaşır
        this.targetNear = 20 + brightness * 30;
        this.targetFar  = 60 + brightness * 120;

        this.scene.fog.near +=
            (this.targetNear - this.scene.fog.near) * 0.02;

        this.scene.fog.far +=
            (this.targetFar - this.scene.fog.far) * 0.02;

        this.scene.fog.color.copy(this.scene.background);

    }

}