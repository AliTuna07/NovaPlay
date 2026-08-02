import * as THREE from "https://unpkg.com/three@0.179.1/build/three.module.js";

export class Environment {

    constructor(scene){

        this.scene = scene;
        this.time = 0;

       this.dayDuration = 90;      // 1 dakika 30 saniye
this.sunsetDuration = 15;   // Gün batımı
this.nightDuration = 120;   // 2 dakika
this.sunriseDuration = 15;  // Gün doğumu
        this.totalCycle =
            this.dayDuration +
            this.sunsetDuration +
            this.nightDuration +
            this.sunriseDuration;

        this.dayColor = new THREE.Color(0x87CEEB);
        this.sunsetColor = new THREE.Color(0xFF8844);
        this.nightColor = new THREE.Color(0x061321);

        scene.background = this.dayColor.clone();

        scene.fog = new THREE.Fog(
            this.dayColor.clone(),
            40,
            140
        );

        this.ambient = new THREE.AmbientLight(0xffffff,1.4);
        scene.add(this.ambient);

        this.sun = new THREE.DirectionalLight(0xffffff,3);
        scene.add(this.sun);

        this.moon = new THREE.Mesh(

            new THREE.SphereGeometry(2,32,32),

            new THREE.MeshBasicMaterial({
                color:0xf5f5ff
            })

        );

        scene.add(this.moon);

        this.createStars();

    }

    createStars(){
this.starMaterial =
new THREE.PointsMaterial({

color:0xffffff,

size:1.2,

transparent:true,

opacity:0

});

        const geometry = new THREE.BufferGeometry();

        const vertices=[];

        for(let i=0;i<500;i++){

            vertices.push(
                (Math.random()-0.5)*500,
                Math.random()*180+30,
                (Math.random()-0.5)*500
            );

        }

        geometry.setAttribute(

            "position",

            new THREE.Float32BufferAttribute(vertices,3)

        );

        this.stars = new THREE.Points(
    geometry,
    this.starMaterial
);

        this.scene.add(this.stars);

    }

    update(delta){
        this.time += delta;
        const brightness = this.getBrightness();
        this.starMaterial.opacity =
(1-brightness) *
(
0.8 +
Math.sin(
this.time*2
)
*0.2
);

        this.time+=delta;

        let t=this.time%this.totalCycle;

        let blend=0;

        let currentSky=this.dayColor.clone();

        if(t<this.dayDuration){

            currentSky.copy(this.dayColor);

            blend=1;

        }
        

        else if(t<this.dayDuration+this.sunsetDuration){

            blend=
            (t-this.dayDuration)/
            this.sunsetDuration;

            currentSky.lerpColors(

                this.dayColor,
                this.nightColor,
                blend

            );

        }

        else if(

            t<
            this.dayDuration+
            this.sunsetDuration+
            this.nightDuration

        ){

            currentSky.copy(this.nightColor);

            blend=0;

        }

        else{

    blend = (
        t -
        this.dayDuration -
        this.sunsetDuration -
        this.nightDuration
    ) / this.sunriseDuration;

    currentSky.lerpColors(
        this.nightColor,
        this.dayColor,
        blend
    );

}

this.scene.background.copy(currentSky);
        this.scene.fog.color.copy(currentSky);

        const sunAngle=
        (this.time/this.totalCycle)
        *Math.PI*2;

        this.sun.position.set(

            Math.cos(sunAngle)*80,

            Math.sin(sunAngle)*80,

            20

        );

        this.moon.position.set(

            -Math.cos(sunAngle)*80,

            -Math.sin(sunAngle)*80,

            -20

        );

        

// Ortam ışığı
this.ambient.intensity =
    0.15 + brightness * 1.25;

// Güneş ışığı
this.sun.intensity =
    0.05 + brightness * 2.95;

// Yıldızlar
this.stars.visible = brightness < 0.45;

// Ay
this.moon.visible = brightness < 0.45;

    }
    isNight() {

    const t = this.time % this.totalCycle;

    return (
        t >= this.dayDuration + this.sunsetDuration &&
        t <= this.dayDuration +
             this.sunsetDuration +
             this.nightDuration
    );

}
getBrightness(){

    const t = this.time % this.totalCycle;

    if(t < this.dayDuration){

        return 1;

    }

    if(t < this.dayDuration + this.sunsetDuration){

        return 1 -
        ((t - this.dayDuration) /
        this.sunsetDuration);

    }

    if(t < this.dayDuration +
          this.sunsetDuration +
          this.nightDuration){

        return 0.08;

    }
return 0.08 +
((t -
this.dayDuration -
this.sunsetDuration -
this.nightDuration)
/
this.sunriseDuration) * 0.92;
}
}

