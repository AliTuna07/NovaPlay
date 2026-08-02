import * as THREE from "https://unpkg.com/three@0.179.1/build/three.module.js";

export function createRoad() {

    const road = new THREE.Group();

    // Asfalt
    const roadMaterial = new THREE.MeshStandardMaterial({
    color: 0x2a2a2a
});

const asphalt = new THREE.Mesh(
    new THREE.PlaneGeometry(8, 240),
    roadMaterial
);

    asphalt.rotation.x = -Math.PI / 2;
    asphalt.position.z = -110;

    road.add(asphalt);

    // Neon kenarlar
    const edgeGeometry = new THREE.BoxGeometry(0.08, 0.03, 240);
    const edgeMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ff55
    });

    const leftEdge = new THREE.Mesh(edgeGeometry, edgeMaterial);
    leftEdge.position.set(-4.04, 0.02, -110);

    const rightEdge = leftEdge.clone();
    rightEdge.position.x = 4.04;

    road.add(leftEdge);
    road.add(rightEdge);

    // Şerit çizgileri
    const laneGeometry = new THREE.BoxGeometry(0.08, 0.02, 2);
    const laneMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff
    });

    const dashes = [];

    for (let lane = 1; lane <= 3; lane++) {

        const x = -4 + lane * 2;

        for (let z = 5; z > -235; z -= 4) {

            const dash = new THREE.Mesh(
                laneGeometry,
                laneMaterial
            );

            dash.position.set(x, 0.02, z);

            road.add(dash);

            dashes.push(dash);

        }

    }

   return {
    group: road,
    dashes,
    roadMaterial
};

}