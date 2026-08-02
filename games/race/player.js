import * as THREE from "https://unpkg.com/three@0.179.1/build/three.module.js";

export function createPlayer() {

    const car = new THREE.Group();

    // Ana gövde
    const body = new THREE.Mesh(
        new THREE.BoxGeometry(1.0, 0.45, 2.0),
        new THREE.MeshStandardMaterial({
            color: 0x00ff55,
            metalness: 0.35,
            roughness: 0.45
        })
    );

    body.position.y = 0.35;
    car.add(body);

    // Tavan
    const cabin = new THREE.Mesh(
        new THREE.BoxGeometry(0.72, 0.35, 1.0),
        new THREE.MeshStandardMaterial({
            color: 0x22ff77,
            metalness: 0.35,
            roughness: 0.4
        })
    );

    cabin.position.set(0, 0.72, -0.1);

    car.add(cabin);

    // Ön cam

    const windshield = new THREE.Mesh(

        new THREE.BoxGeometry(0.68,0.25,0.08),

        new THREE.MeshStandardMaterial({

            color:0x88ddff,

            transparent:true,

            opacity:0.8

        })

    );

    windshield.rotation.x=-0.45;

    windshield.position.set(0,0.78,0.42);

    car.add(windshield);

    // Arka cam

    const rearWindow=windshield.clone();

    rearWindow.rotation.x=0.45;

    rearWindow.position.z=-0.62;

    car.add(rearWindow);

    // Farlar

    const lightMat=new THREE.MeshBasicMaterial({

        color:0xffffcc

    });

    const head1=new THREE.Mesh(

        new THREE.BoxGeometry(0.15,0.07,0.05),

        lightMat

    );

    head1.position.set(-0.25,0.32,1.03);

    car.add(head1);

    const head2=head1.clone();

    head2.position.x=0.25;

    car.add(head2);

    // Tekerlekler

    const wheelGeometry=new THREE.CylinderGeometry(
        0.18,
        0.18,
        0.12,
        24
    );

    const wheelMaterial=new THREE.MeshStandardMaterial({

        color:0x222222

    });

    function wheel(x,z){

        const w=new THREE.Mesh(
            wheelGeometry,
            wheelMaterial
        );

        w.rotation.z=Math.PI/2;

        w.position.set(x,0.18,z);

        car.add(w);

    }

    wheel(-0.48,0.65);
    wheel( 0.48,0.65);
    wheel(-0.48,-0.65);
    wheel( 0.48,-0.65);

    return car;
const leftLight = new THREE.Mesh(

new THREE.BoxGeometry(
0.12,
0.08,
0.03
),

new THREE.MeshBasicMaterial({

color:0xff0000

})

);

leftLight.position.set(
-0.28,
0.18,
0.62
);

car.add(leftLight);
const rightLight =
leftLight.clone();

rightLight.position.x = 0.28;

car.add(rightLight);
}