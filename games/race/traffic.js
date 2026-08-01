import * as THREE from "https://unpkg.com/three@0.179.1/build/three.module.js";

const lanePositions = [-3, -1, 1, 3];

export class Traffic {

    constructor(scene) {

        this.scene = scene;

        this.cars = [];

        this.spawnTimer = 0;
        this.spawnDelay = 90;

    }

    createCar(color = 0xff3030) {

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

    spawn() {

        const lane = Math.floor(Math.random()*4);

        const blue = Math.random()<0.25;

        const mesh = this.createCar(

            blue ? 0x3399ff : 0xff3030

        );

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

            car.mesh.position.z+=speed;

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