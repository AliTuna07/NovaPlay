import * as THREE from "https://unpkg.com/three@0.179.1/build/three.module.js";

const lanePositions = [-3, -1, 1, 3];

export class Traffic {

    constructor(scene) {

        this.scene = scene;

        this.cars = [];

        this.spawnTimer = 0;
        this.spawnDelay = 50;

    }

    createCar(color = 0xff3030) {

        const lane = Math.floor(Math.random() * 4);

        // Aynı şeritte çok yakın araç varsa yeni araç oluşturma
        const occupied = this.cars.some(car => {

            return car.lane === lane &&
                   car.mesh.position.z < -95;

        });

        if (occupied) {
            return;
        }

        const car = new THREE.Group();

        const body = new THREE.Mesh(

            new THREE.BoxGeometry(1,0.45,2),

            new THREE.MeshStandardMaterial({

                color

            })

        );

        body.position.y = 0.3;

        car.add(body);

        const cabin = new THREE.Mesh(

            new THREE.BoxGeometry(0.7,0.3,1),

            new THREE.MeshStandardMaterial({

                color:0xdddddd

            })

        );

        cabin.position.set(0,0.65,-0.1);

        car.add(cabin);

        return car;

    }
createTruck(){

    const truck = new THREE.Group();


    const cabin = new THREE.Mesh(

        new THREE.BoxGeometry(
            1.2,
            0.9,
            1
        ),

        new THREE.MeshStandardMaterial({

            color:0xffffff

        })

    );


   cabin.position.y = 0.55;
cabin.position.z = -0.9;
    truck.add(cabin);



    const trailer = new THREE.Mesh(

        new THREE.BoxGeometry(
            1.4,
            1.1,
            2.8
        ),

        new THREE.MeshStandardMaterial({

            color:0xcc2222

        })

    );


   trailer.position.y = 0.65;
trailer.position.z = 1;
    truck.add(trailer);


// Tekerlekler

const wheelGeometry =
new THREE.CylinderGeometry(
    0.25,
    0.25,
    0.18,
    24
);


const wheelMaterial =
new THREE.MeshStandardMaterial({

    color:0x111111

});


function addWheel(x,z){

    const wheel =
    new THREE.Mesh(
        wheelGeometry,
        wheelMaterial
    );


    wheel.rotation.z =
    Math.PI / 2;


    wheel.position.set(
        x,
        0.25,
        z
    );


    truck.add(wheel);

}


// Ön tekerler

addWheel(-0.65,0.9);
addWheel(0.65,0.9);


// Arka çift teker

addWheel(-0.65,-1.5);
addWheel(0.65,-1.5);

addWheel(-0.65,-2);
addWheel(0.65,-2);



// Arka lambalar

const tailLightMaterial =
new THREE.MeshBasicMaterial({

    color:0xff0000

});


const leftTail =
new THREE.Mesh(

    new THREE.BoxGeometry(
        0.15,
        0.12,
        0.05
    ),

    tailLightMaterial

);


leftTail.position.set(
-0.45,
0.45,
-2.65
);


truck.add(leftTail);



const rightTail =
leftTail.clone();

rightTail.position.x = 0.45;

truck.add(rightTail);






return truck;
}

    spawn() {

        const lane = Math.floor(Math.random()*4);

const type =
Math.random() < 0.15
?
"truck"
:
"car";


const blue = Math.random()<0.25;


let mesh;


if(type === "truck"){

    mesh = this.createTruck();

}
else{

    mesh = this.createCar(

        blue ? 0x3399ff : 0xff3030

    );
    if (!mesh) {
    return;
}

}

        mesh.position.set(

            lanePositions[lane],

            0,

            -120

        );

        this.scene.add(mesh);

       this.cars.push({

    mesh,

    lane,

    targetLane:lane,

    blue,

    type,

    trafficSpeed:
    type === "truck"
    ?
    0.5
    :
    0.7,

    timer:0

});
    }

    update(speed=0.35){

        this.spawnTimer++;

        if(this.spawnTimer>=this.spawnDelay){

            this.spawn();

            this.spawnTimer=0;

        }

        for(let i=this.cars.length-1;i>=0;i--){

            const car=this.cars[i];

            car.mesh.position.z += speed - car.trafficSpeed;
            if(car.blue){

                car.timer++;

                if(car.timer>120){

                    car.timer=0;

                    const dir=Math.random()<0.5?-1:1;

                    car.targetLane=Math.max(

                        0,

                        Math.min(3,

                        car.targetLane+dir)

                    );

                }

                const tx=lanePositions[car.targetLane];

                car.mesh.position.x+=

                (tx-car.mesh.position.x)*0.03;

            }

            if(car.mesh.position.z>15){

                this.scene.remove(car.mesh);

                this.cars.splice(i,1);

            }

        }

    }

}